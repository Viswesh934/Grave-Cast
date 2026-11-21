"""Runs every check over one repo and turns the findings into graves (docs/REPO_SCAN_DESIGN.md §7 and §8)."""
from __future__ import annotations

import asyncio
import logging
import re
import time
from collections import Counter
from dataclasses import dataclass, field

from app.config import Settings
from app.modules.github.markers import find_markers
from app.modules.github.scan.catalog import CREDENTIAL, finding
from app.modules.github.scan.files import ScanArchive, ScanFile, is_test_path
from app.modules.github.scan.findings import (
    CATEGORIES,
    CONFIDENCES,
    SEVERITIES,
    CheckReport,
    Finding,
    ScanStats,
    lower,
)
from app.modules.github.scan.lockfiles import LockfileReport, read_lockfiles
from app.modules.github.scan.osv import DependencyResult, OsvClient, OsvUnavailable, dependency_findings
from app.modules.github.scan.rules_config import config_findings, path_findings
from app.modules.github.scan.rules_js import js_findings
from app.modules.github.scan.rules_project import project_findings
from app.modules.github.scan.rules_python import python_findings
from app.modules.github.scan.secrets import find_secrets
from app.modules.github.scan.syntax import Node, grammar_for, nodes_of, parse
from app.modules.github.scan.syntax import text as node_text

logger = logging.getLogger(__name__)

_MARKER_SEVERITY = {"FIXME": "low", "XXX": "low", "HACK": "info", "TODO": "info"}
_CONFIG_LANGUAGES = frozenset({"dockerfile", "yaml", "terraform"})
_TEST_NOTE = " It is in test, example or documentation code, so it is shown one step lower."
_HIDDEN_NOTE = "The note is not shown, because the same line holds a secret."
# Quoted values given to something (after =, :, a comma or an opening bracket), hidden when a rule says the value is a secret.
# Keys such as config['SECRET_KEY'] stay readable.
_QUOTED = re.compile(r"([=:,(]\s*)(['\"`])([^'\"`\n]+)\2")
# A marker counts in files without a syntax tree only after a comment sign on its line.
_COMMENT_SIGN = re.compile(r"(#|//|/\*|<!--|--|^\s*\*)[^\n]*?\b(TODO|FIXME|HACK|XXX)\b")
_SERIOUS = frozenset({"critical", "high"})


@dataclass
class ScanResult:
    graves: list[Finding]
    total: int
    by_severity: dict[str, int]
    by_category: dict[str, int]
    stats: ScanStats
    checks: list[CheckReport]
    truncated: bool


@dataclass
class _Local:
    """What the per-file checks found, and how far they got."""

    findings: list[Finding] = field(default_factory=list)
    secret_files: int = 0
    code_files: int = 0
    code_errors: int = 0
    config_files: int = 0
    marker_count: int = 0
    manifests_checked: bool = False
    files_done: int = 0
    out_of_time: bool = False


def _hide_values(line: str) -> str:
    """The line with every quoted value replaced by its length."""
    return _QUOTED.sub(lambda m: f"{m.group(1)}{m.group(2)}\u2026 ({len(m.group(3))} characters){m.group(2)}", line)


def _comments_by_line(root: Node, grammar: str) -> dict[int, str]:
    """The comment text on each line, from the syntax tree. Python docstrings count as comments."""
    lines: dict[int, str] = {}
    for node in nodes_of(root, grammar, ("comment", "string") if grammar == "python" else ("comment",)):
        docstring = grammar == "python" and node.type == "string" and node.parent is not None and node.parent.type == "expression_statement"
        if node.type != "comment" and not docstring:
            continue
        for offset, part in enumerate(node_text(node).splitlines() or [""]):
            number = node.start_point[0] + 1 + offset
            lines[number] = f"{lines.get(number, '')} {part}"
    return lines


def _markers(file: ScanFile, root: Node | None, grammar: str | None) -> list[Finding]:
    """Code notes inside comments only: a TODO in a string, such as a page's text, is not a grave."""
    # Most files hold no marker word at all; they skip the line-by-line search.
    markers = find_markers(file.path, file.text) if any(word in file.text for word in _MARKER_SEVERITY) else []
    if not markers:
        return []
    comments = _comments_by_line(root, grammar or "") if root is not None else None
    out: list[Finding] = []
    for marker in markers:
        if comments is not None:
            if not re.search(rf"\b{marker.kind}\b", comments.get(marker.line, "")):
                continue
        elif not _COMMENT_SIGN.search(file.line_text(marker.line)):
            continue
        out.append(
            finding(
                "note.marker",
                path=file.path,
                line=marker.line,
                snippet=file.line_text(marker.line),
                severity=_MARKER_SEVERITY[marker.kind],  # type: ignore[arg-type]
                title=marker.kind,
                detail=marker.note or "No note was left with it.",
            )
        )
    return out


def _local_checks(archive: ScanArchive, settings: Settings, deadline: float) -> _Local:
    """Secrets, code, config and marker checks over every file, then the project-wide rules. Runs in a worker thread."""
    local = _Local()
    for file in archive.files:
        if time.monotonic() > deadline:
            local.out_of_time = True
            break
        local.files_done += 1
        if file.kind != "lockfile" or file.name.lower().startswith("requirements"):
            local.secret_files += 1
            local.findings.extend(find_secrets(file, settings.secret_min_entropy))
        if file.kind != "code":
            continue
        grammar = grammar_for(file.path)
        root: Node | None = None
        if grammar is not None:
            local.code_files += 1
            try:
                root = parse(file.path, file.text)
                if root is not None:
                    rules = python_findings if grammar == "python" else js_findings
                    local.findings.extend(rules(file, root))
            except Exception:  # A rule tripping on odd syntax must not stop the scan; the file is counted.
                logger.warning("Code rules failed on one file", exc_info=True)
                local.code_errors += 1
        if file.language in _CONFIG_LANGUAGES:
            local.config_files += 1
            try:
                local.findings.extend(config_findings(file))
            except Exception:
                logger.warning("Config rules failed on one file", exc_info=True)
        markers = _markers(file, root, grammar)
        local.marker_count += len(markers)
        local.findings.extend(markers)
    local.findings.extend(path_findings(archive.all_paths))
    if not local.out_of_time:
        local.findings.extend(project_findings(archive.files, archive.all_paths))
        local.manifests_checked = True
    return local


def _rank(f: Finding) -> tuple[int, int, int, str, int]:
    """Severity, then confidence, then category, then path and line (§8)."""
    return (
        SEVERITIES.index(f.severity),
        CONFIDENCES.index(f.confidence),
        CATEGORIES.index(f.category),
        f.path or "",
        f.line or 0,
    )


def finalise(found: list[Finding]) -> list[Finding]:
    """Lower test code, hide secrets on every line that holds one, de-duplicate and sort (§3, §8)."""
    adjusted: list[Finding] = []
    for f in found:
        if f.lower_in_tests and f.path and is_test_path(f.path) and f.severity != "info":
            f = f.with_(severity=lower(f.severity), detail=f.detail + _TEST_NOTE)
        if f.family == CREDENTIAL and f.category != "secret" and f.snippet:
            f = f.with_(snippet=_hide_values(f.snippet))
        adjusted.append(f)

    # A line that holds a secret shows only its redacted form, whichever rule's grave it is on.
    redacted: dict[tuple[str, int], str] = {}
    for f in adjusted:
        if f.category == "secret" and f.path and f.line and f.snippet:
            redacted.setdefault((f.path, f.line), f.snippet)
    hidden: list[Finding] = []
    for f in adjusted:
        key = (f.path or "", f.line or 0)
        if key in redacted and f.category != "secret":
            changes: dict[str, object] = {"snippet": redacted[key]}
            if f.rule == "note.marker":
                changes["detail"] = _HIDDEN_NOTE
            f = f.with_(**changes)
        hidden.append(f)

    hidden.sort(key=_rank)
    # One credential grave per line: the most specific rule, and among equals the most serious.
    credential_lines: dict[tuple[str, int], Finding] = {}
    for f in hidden:
        if f.family == CREDENTIAL and f.path and f.line:
            kept = credential_lines.get((f.path, f.line))
            if kept is None or f.specificity > kept.specificity:
                credential_lines[(f.path, f.line)] = f
    seen: set[str] = set()
    out: list[Finding] = []
    for f in hidden:
        if f.id in seen:
            continue
        if f.family == CREDENTIAL and f.path and f.line and credential_lines[(f.path, f.line)] is not f:
            continue
        seen.add(f.id)
        out.append(f)
    return _group_test_credentials(out)


def _group_test_credentials(found: list[Finding]) -> list[Finding]:
    """One grave per test file for generic credentials: throwaway test passwords would otherwise fill the yard (§3)."""
    first: dict[str, int] = {}
    extra: Counter[str] = Counter()
    out: list[Finding] = []
    for f in found:
        if f.rule == "secret.hardcoded-credential" and f.path and is_test_path(f.path):
            if f.path in first:
                extra[f.path] += 1
                continue
            first[f.path] = len(out)
        out.append(f)
    for path, count in extra.items():
        index = first[path]
        more = f"{count} more {'line' if count == 1 else 'lines'}"
        out[index] = out[index].with_(detail=f"{out[index].detail} The file has {more} like it, not shown as separate graves.")
    return out


def cap(found: list[Finding], per_rule: int, total: int) -> list[Finding]:
    """At most `per_rule` graves from one rule and `total` in all, keeping the order."""
    counts: Counter[str] = Counter()
    out: list[Finding] = []
    for f in found:
        if len(out) >= total:
            break
        # The per-rule cap never leaves out a critical or high grave (§8).
        if counts[f.rule] >= per_rule and f.severity not in _SERIOUS:
            continue
        counts[f.rule] += 1
        out.append(f)
    return out


def _plural(count: int, word: str) -> str:
    return f"{count} {word if count == 1 else word + 's'}"


def _dependency_check(report: LockfileReport, result: DependencyResult | None, failure: str | None) -> CheckReport:
    check = CheckReport("dependencies", "Known vulnerable dependencies")
    if not report.read and not report.notes:
        check.status, check.detail = "skipped", "No lockfiles were found, so dependency versions could not be checked."
        return check
    notes = [*report.notes, *(result.partial_reasons if result else [])]
    if failure:
        check.status, check.detail = "failed", failure
    elif not report.packages:
        check.status = "skipped"
        check.detail = f"Read {_plural(len(report.read), 'lockfile')}; none pinned an exact package version, so none could be checked."
        if not report.read:
            check.status, check.detail = "failed", "No lockfile could be read."
    elif result is not None:
        check.detail = f"Checked {_plural(result.checked, 'package version')} from {_plural(len(report.read), 'lockfile')} against OSV.dev."
        if result.partial_reasons or any("could not be read" in n for n in report.notes):
            check.status = "partial"
    if notes:
        check.detail += " " + "; ".join(n[0].upper() + n[1:] for n in notes) + "."
    return check


def _local_reports(local: _Local, archive: ScanArchive) -> list[CheckReport]:
    timed_out = f" Time ran out after {local.files_done} of {len(archive.files)} files." if local.out_of_time else ""
    status = "partial" if local.out_of_time else "ran"

    secrets = CheckReport("secrets", "Leaked keys and passwords", status, f"Read {_plural(local.secret_files, 'file')}.{timed_out}")

    code = CheckReport("code", "Dangerous code (Python, JavaScript, TypeScript)", status)
    if local.code_files == 0 and not local.out_of_time:
        code.status, code.detail = "skipped", "No Python, JavaScript or TypeScript files were found."
    else:
        code.detail = (
            f"Read {_plural(local.code_files, 'file')}. Values are followed through variables inside one function, "
            "not between functions or files. Files in other languages are read only for secrets and code notes."
        )
        if local.code_errors:
            code.status = "partial"
            code.detail += f" {_plural(local.code_errors, 'file')} could not be read by the code rules."
        code.detail += timed_out

    config = CheckReport("config", "Docker, CI workflows, Kubernetes and Terraform", status)
    if local.config_files == 0 and not local.out_of_time:
        config.status, config.detail = "skipped", "No Dockerfiles, YAML or Terraform files were found."
    else:
        config.detail = f"Read {_plural(local.config_files, 'file')}.{timed_out}"

    project = CheckReport("project", "Missing protections")
    if local.manifests_checked:
        project.detail = "Looked for rate limiting, security headers and lockfiles across the project's package manifests."
    else:
        project.status, project.detail = "skipped", "Time ran out before the project-wide checks."

    markers = CheckReport("markers", "Code notes (TODO, FIXME, HACK, XXX)", status, f"Found {_plural(local.marker_count, 'note')}.{timed_out}")
    return [secrets, code, config, project, markers]


async def run_scan(archive: ScanArchive, settings: Settings, osv_client: OsvClient) -> ScanResult:
    """Every check over the read archive. The dependency lookups run while the files are read."""
    deadline = time.monotonic() + settings.graveyard_time_budget_seconds
    lockfile_files = [f for f in archive.files if f.kind == "lockfile"]
    report = read_lockfiles(lockfile_files)

    osv_task: asyncio.Task[DependencyResult] | None = None
    if report.packages:
        osv_task = asyncio.create_task(dependency_findings(report.packages, lockfile_files, osv_client, settings))

    dependencies: DependencyResult | None = None
    failure: str | None = None
    try:
        local = await asyncio.to_thread(_local_checks, archive, settings, deadline)
        if osv_task is not None:
            try:
                dependencies = await asyncio.wait_for(osv_task, timeout=max(deadline - time.monotonic(), 0.1))
            except OsvUnavailable:
                failure = "OSV.dev could not be reached, so dependency versions were not checked."
            except asyncio.TimeoutError:
                failure = "OSV.dev did not answer in time, so dependency versions were not checked."
    finally:
        if osv_task is not None and not osv_task.done():
            osv_task.cancel()

    ordered = finalise([*(dependencies.findings if dependencies else []), *local.findings])
    graves = cap(ordered, settings.graveyard_max_per_rule, settings.graveyard_max_graves)

    by_severity = {s: 0 for s in SEVERITIES}
    by_category = {c: 0 for c in CATEGORIES}
    for f in ordered:
        by_severity[f.severity] += 1
        by_category[f.category] += 1

    stats = ScanStats(
        files_read=len(archive.files),
        files_discovered=archive.discovered,
        files_skipped=archive.skipped,
        languages=sorted({f.language for f in archive.files if f.language}),
        lockfiles=report.read,
        packages_checked=dependencies.checked if dependencies else 0,
        marker_count=local.marker_count,
    )
    checks = [_dependency_check(report, dependencies, failure), *_local_reports(local, archive)]
    return ScanResult(
        graves=graves,
        total=len(ordered),
        by_severity=by_severity,
        by_category=by_category,
        stats=stats,
        checks=checks,
        truncated=len(graves) < len(ordered),
    )
