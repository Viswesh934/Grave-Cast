"""Infrastructure and CI: Dockerfiles, container YAML, Terraform, GitHub Actions, and committed secret files (docs/REPO_SCAN_DESIGN.md §5.4)."""
from __future__ import annotations

import re
from collections.abc import Iterable, Iterator
from dataclasses import dataclass
from pathlib import PurePosixPath

import yaml

from app.modules.github.filters import IGNORED_DIRECTORIES
from app.modules.github.scan.catalog import finding
from app.modules.github.scan.files import ScanFile
from app.modules.github.scan.findings import Finding

_ENV_FILE = re.compile(r"^\.env(\.[\w.-]+)?$", re.IGNORECASE)
_ENV_TEMPLATE = re.compile(r"\.(example|sample|template|dist|defaults?|schema|tpl)$", re.IGNORECASE)
_KEY_STORES = frozenset({".p12", ".pfx", ".jks", ".keystore"})
_SECRET_ENV_NAME = re.compile(r"(?i)(password|passwd|secret|token|api_?key|access_?key|private_?key|credentials?)")
# A Dockerfile value shorter than this is a flag or a placeholder, not a secret.
_MIN_SECRET_CHARS = 4

# Ports that should never face the whole internet: SSH, Telnet, RPC, SMB, databases, caches, search, Docker.
_SENSITIVE_PORTS = frozenset({22, 23, 135, 445, 1433, 1521, 2375, 2376, 3306, 3389, 5432, 5601, 5984, 6379, 7000, 9042, 9200, 9300, 11211, 27017})
_ALL_PORTS = 65535
_OPEN_CIDR = re.compile(r"""["'](0\.0\.0\.0/0|::/0)["']""")
_INGRESS = re.compile(
    r"\bingress\s*\{|resource\s+\"aws_security_group_rule\"\s+\"[^\"]+\"\s*\{|resource\s+\"aws_vpc_security_group_ingress_rule\"\s+\"[^\"]+\"\s*\{"
)

# Text anyone can write into an event, which must never go straight into a run: script.
_UNTRUSTED = re.compile(
    r"\$\{\{\s*(github\.head_ref|github\.event\.(issue\.(title|body)|pull_request\.(title|body|head\.ref|head\.label|head\.repo\.default_branch)"
    r"|comment\.body|review\.body|review_comment\.body|discussion\.(title|body)|pages\.[^}]*\.page_name|commits\.[^}]*\.(message|author\.(email|name))"
    r"|head_commit\.(message|author\.(email|name))|workflow_run\.(head_branch|head_commit\.message|display_title)))\s*\}\}"
)
_TRUSTED_ACTION_OWNERS = frozenset({"actions", "github"})
_FULL_SHA = re.compile(r"^[0-9a-f]{40}$")
_PR_HEAD = re.compile(r"github\.event\.pull_request\.head\.(sha|ref)|github\.head_ref|refs/pull/")
_WORKFLOW = re.compile(r"(^|/)\.github/workflows/[^/]+\.ya?ml$")
_PRIVILEGED = re.compile(r"^\s*-?\s*privileged:\s*true\b", re.IGNORECASE)
_HOST_ACCESS = re.compile(r"^\s*-?\s*(hostNetwork|hostPID|hostIPC|allowPrivilegeEscalation):\s*true\b")


def _ignored(path: str) -> bool:
    return any(part in IGNORED_DIRECTORIES for part in PurePosixPath(path).parts[:-1])


def path_findings(paths: Iterable[str]) -> Iterator[Finding]:
    """Rules that need only a file's name: committed .env files and key stores."""
    for path in paths:
        if _ignored(path):
            continue
        posix = PurePosixPath(path)
        if _ENV_FILE.match(posix.name) and not _ENV_TEMPLATE.search(posix.name):
            yield finding("cfg.env-file-committed", path=path, line=None, snippet=posix.name)
        elif posix.suffix.lower() in _KEY_STORES:
            yield finding("cfg.key-store-committed", path=path, line=None, snippet=posix.name)


def _instructions(file: ScanFile) -> list[tuple[int, str, str]]:
    """Dockerfile instructions as (line, keyword, arguments), with continued lines joined."""
    out: list[tuple[int, str, str]] = []
    pending: tuple[int, str] | None = None
    for number, raw in enumerate(file.lines, start=1):
        stripped = raw.strip()
        if pending is None and (not stripped or stripped.startswith("#")):
            continue
        continued = stripped.endswith("\\")
        start, body = pending if pending else (number, "")
        body = f"{body} {stripped[:-1] if continued else stripped}".strip()
        if continued:
            pending = (start, body)
            continue
        pending = None
        keyword, _, rest = body.partition(" ")
        out.append((start, keyword.upper(), rest.strip()))
    return out


@dataclass
class _Stage:
    line: int
    image: str
    alias: str | None
    user: str
    user_line: int | None = None


def dockerfile_findings(file: ScanFile) -> Iterator[Finding]:
    stages: list[_Stage] = []
    for number, keyword, rest in _instructions(file):
        if keyword == "FROM":
            words = [w for w in rest.split() if not w.startswith("--")]
            image = words[0] if words else ""
            alias = words[2].lower() if len(words) >= 3 and words[1].lower() == "as" else None
            parent = next((s for s in stages if s.alias == image.lower()), None)
            stages.append(_Stage(line=number, image=image, alias=alias, user=parent.user if parent else ""))
            name, _, digest = image.partition("@")
            last_part = name.rsplit("/", 1)[-1]
            tag = last_part.rsplit(":", 1)[1] if ":" in last_part else ""
            if parent is None and image.lower() != "scratch" and "$" not in image and not digest and tag in {"", "latest"}:
                yield finding("cfg.docker-unpinned-base", path=file.path, line=number, snippet=file.line_text(number))
        elif keyword == "USER" and stages:
            stages[-1].user = rest.split(":", 1)[0].strip()
            stages[-1].user_line = number
        elif keyword in {"ENV", "ARG"}:
            pairs = re.findall(r"([A-Za-z_]\w*)\s*=\s*(\"[^\"]*\"|'[^']*'|\S+)", rest)
            if not pairs and keyword == "ENV" and len(rest.split(None, 1)) == 2:
                pairs = [tuple(rest.split(None, 1))]
            for name, value in pairs:
                value = value.strip("'\"")
                if _SECRET_ENV_NAME.search(name) and len(value) >= _MIN_SECRET_CHARS and not value.startswith("$"):
                    yield finding("cfg.docker-secret-in-image", path=file.path, line=number, snippet=f"{keyword} {name}=\u2026 ({len(value)} characters)")
    if not stages:
        return
    last = stages[-1]
    image = last.image.lower()
    if image == "scratch" or "nonroot" in image:
        return
    if last.user in {"", "root", "0"}:
        at = last.user_line or last.line
        yield finding("cfg.docker-runs-as-root", path=file.path, line=at, snippet=file.line_text(at))


def container_yaml_findings(file: ScanFile) -> Iterator[Finding]:
    """Kubernetes manifests, Helm templates and Compose files."""
    for number, raw in enumerate(file.lines, start=1):
        if raw.lstrip().startswith("#"):
            continue
        if _PRIVILEGED.search(raw):
            yield finding("cfg.container-privileged", path=file.path, line=number, snippet=raw)
        elif _HOST_ACCESS.search(raw):
            yield finding("cfg.container-privileged", path=file.path, line=number, snippet=raw, severity="medium")


def _blocks(text: str, opener: re.Pattern[str]) -> Iterator[tuple[int, str]]:
    """Each { ... } block that starts where `opener` matches, as (offset, text), with braces balanced."""
    for match in opener.finditer(text):
        start = text.find("{", match.start())
        if start < 0:
            continue
        depth = 0
        for index in range(start, len(text)):
            if text[index] == "{":
                depth += 1
            elif text[index] == "}":
                depth -= 1
                if depth == 0:
                    yield match.start(), text[start : index + 1]
                    break


def _port(block: str, key: str) -> int | None:
    match = re.search(rf"\b{key}\s*=\s*(-?\d+)", block)
    return int(match.group(1)) if match else None


def _exposes_sensitive(block: str) -> bool:
    """Open to the whole internet on an administration, database or cache port, or on every port."""
    if not _OPEN_CIDR.search(block):
        return False
    if re.search(r"\b(ip_)?protocol\s*=\s*\"?(-1|all)\"?", block):
        return True
    low, high = _port(block, "from_port"), _port(block, "to_port")
    if low is None or high is None:
        return False
    if low <= 0 and high >= _ALL_PORTS:
        return True
    return any(low <= port <= high for port in _SENSITIVE_PORTS)


def terraform_findings(file: ScanFile) -> Iterator[Finding]:
    for offset, block in _blocks(file.text, _INGRESS):
        header = file.text[offset : file.text.find("{", offset)]
        if "aws_security_group_rule" in header and not re.search(r"\btype\s*=\s*\"ingress\"", block):
            continue
        if _exposes_sensitive(block.replace("cidr_ipv4", "cidr_blocks")):
            at = file.line_at(offset)
            yield finding("cfg.terraform-open-ingress", path=file.path, line=at, snippet=file.line_text(at))
    for number, raw in enumerate(file.lines, start=1):
        code = raw.split("#", 1)[0]
        if re.search(r"\bacl\s*=\s*\"public-read(-write)?\"", code) or re.search(r"\bpublicly_accessible\s*=\s*true\b", code):
            yield finding("cfg.terraform-public-storage", path=file.path, line=number, snippet=raw)
        elif re.search(r"\b(storage_)?encrypted\s*=\s*false\b", code):
            yield finding("cfg.terraform-unencrypted", path=file.path, line=number, snippet=raw)


def _triggers(document: dict[object, object]) -> set[str]:
    # YAML 1.1 reads a bare `on:` key as True.
    on = document.get("on", document.get(True))
    if isinstance(on, str):
        return {on}
    if isinstance(on, list):
        return {str(item) for item in on}
    if isinstance(on, dict):
        return {str(key) for key in on}
    return set()


def _steps(document: dict[object, object]) -> Iterator[dict[object, object]]:
    jobs = document.get("jobs")
    if not isinstance(jobs, dict):
        return
    for job in jobs.values():
        if isinstance(job, dict):
            for step in job.get("steps") or []:
                if isinstance(step, dict):
                    yield step


def workflow_findings(file: ScanFile) -> Iterator[Finding]:
    """GitHub Actions workflows (.github/workflows/*.yml)."""
    try:
        document = yaml.safe_load(file.text)
    except yaml.YAMLError:
        return
    if not isinstance(document, dict):
        return
    pull_request_target = "pull_request_target" in _triggers(document)
    seen_actions: set[str] = set()
    for step in _steps(document):
        uses = str(step.get("uses") or "")
        settings = step.get("with")
        ref = str(settings.get("ref", "")) if isinstance(settings, dict) else ""
        if pull_request_target and uses.startswith("actions/checkout") and _PR_HEAD.search(ref):
            at = file.find_line("ref:", file.find_line(uses) or 1) or file.find_line(uses)
            yield finding("cfg.gha-untrusted-checkout", path=file.path, line=at, snippet=file.line_text(at or 0))
        if uses and not uses.startswith(("./", "docker://")) and "@" in uses and uses not in seen_actions:
            seen_actions.add(uses)
            action, _, version = uses.partition("@")
            if action.split("/", 1)[0].lower() not in _TRUSTED_ACTION_OWNERS and not _FULL_SHA.match(version):
                at = file.find_line(uses)
                yield finding("cfg.gha-unpinned-action", path=file.path, line=at, snippet=file.line_text(at or 0))
    # Script injection and write-all are read from the text, so each run: block and permissions key keeps its line.
    in_run = False
    run_indent = 0
    for number, raw in enumerate(file.lines, start=1):
        stripped = raw.lstrip()
        indent = len(raw) - len(stripped)
        step_key = re.match(r"(-\s+)?run:", stripped)
        if step_key:
            body = stripped.split("run:", 1)[1]
            # The step's keys sit after any "- ", so a sibling such as env: is never read as script.
            run_indent = indent + len(step_key.group(1) or "")
            # Only a block scalar (run: | or run: >) carries on to the lines below.
            in_run = body.strip()[:1] in {"|", ">", ""}
        elif in_run and (not stripped or indent > run_indent):
            body = stripped
        else:
            in_run = False
            body = ""
        if body and _UNTRUSTED.search(body):
            yield finding("cfg.gha-script-injection", path=file.path, line=number, snippet=raw)
        if re.match(r"permissions:\s*write-all\b", stripped):
            yield finding("cfg.gha-write-all", path=file.path, line=number, snippet=raw)


def config_findings(file: ScanFile) -> list[Finding]:
    """Every config rule that applies to this file. Suppressed lines are skipped."""
    name = file.name.lower()
    found: list[Finding] = []
    if name.startswith("dockerfile") or name.endswith(".dockerfile"):
        found = list(dockerfile_findings(file))
    elif _WORKFLOW.search(file.path):
        found = list(workflow_findings(file))
    elif name.endswith((".yml", ".yaml")):
        found = list(container_yaml_findings(file))
    elif name.endswith(".tf"):
        found = list(terraform_findings(file))
    return [f for f in found if f.line is None or not file.suppressed(f.line)]
