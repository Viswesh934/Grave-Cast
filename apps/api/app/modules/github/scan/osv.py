"""Known vulnerable dependencies, from OSV.dev (docs/REPO_SCAN_DESIGN.md §5.1)."""
from __future__ import annotations

import asyncio
import re
from dataclasses import dataclass, field

import httpx

from app.config import Settings
from app.modules.github.scan.catalog import finding
from app.modules.github.scan.cvss import base_score, severity_of
from app.modules.github.scan.files import ScanFile
from app.modules.github.scan.findings import SEVERITIES, Finding, PackageRef, Reference, Severity, lower, worst
from app.modules.github.scan.lockfiles import Package, package_key

OSV_ADVISORY_URL = "https://osv.dev/vulnerability"
_GITHUB_RATINGS: dict[str, Severity] = {"CRITICAL": "critical", "HIGH": "high", "MODERATE": "medium", "MEDIUM": "medium", "LOW": "low"}
# When several advisories are aliases of one another, these are shown first.
_PREFERRED_PREFIXES = ("GHSA-", "CVE-")
# Advisory ids named in a grave's detail; all of them are in its references.
_IDS_IN_DETAIL = 3
_RETRY_STATUSES = frozenset({429, 500, 502, 503, 504})


class OsvUnavailable(Exception):
    """OSV.dev could not be reached, or answered with an error."""


class OsvClient:
    """Asks OSV.dev which package versions have advisories, and fetches each advisory once."""

    def __init__(self, settings: Settings, client: httpx.AsyncClient | None = None) -> None:
        self._settings = settings
        self._owns = client is None
        self._client = client or httpx.AsyncClient(
            base_url=settings.osv_api_base_url,
            timeout=httpx.Timeout(settings.osv_timeout_seconds),
            headers={"User-Agent": settings.github_user_agent, "Accept": "application/json"},
        )

    async def aclose(self) -> None:
        if self._owns:
            await self._client.aclose()

    async def _request(self, method: str, path: str, json: object | None = None) -> dict[str, object]:
        """One request, retried on network and server errors. Both endpoints only read, so repeating is safe."""
        attempts = self._settings.osv_retries + 1
        for attempt in range(attempts):
            last = attempt + 1 >= attempts
            try:
                response = await self._client.request(method, path, json=json)
            except httpx.HTTPError as exc:
                if last:
                    raise OsvUnavailable() from exc
            else:
                if response.status_code < 400:
                    body = response.json()
                    if not isinstance(body, dict):
                        raise OsvUnavailable()
                    return body
                if last or response.status_code not in _RETRY_STATUSES:
                    raise OsvUnavailable()
            await asyncio.sleep(self._settings.retry_backoff_seconds * (attempt + 1))
        raise OsvUnavailable()

    async def query(self, packages: list[Package]) -> dict[tuple[str, str, str], list[str]]:
        """The advisory ids that apply to each package version."""
        found: dict[tuple[str, str, str], list[str]] = {}
        size = self._settings.osv_batch_size
        for start in range(0, len(packages), size):
            batch = packages[start : start + size]
            body = await self._request(
                "POST",
                "/v1/querybatch",
                {"queries": [{"package": {"ecosystem": p.ecosystem, "name": p.name}, "version": p.version} for p in batch]},
            )
            results = body.get("results")
            if not isinstance(results, list):
                raise OsvUnavailable()
            for package, result in zip(batch, results):
                vulns = result.get("vulns") if isinstance(result, dict) else None
                ids = [str(v["id"]) for v in vulns or [] if isinstance(v, dict) and v.get("id")]
                if ids:
                    found[package_key(package)] = ids
        return found

    async def advisories(self, ids: list[str]) -> dict[str, dict[str, object]]:
        """Each advisory's full record, fetched a few at a time. Ones that fail are left out."""
        gate = asyncio.Semaphore(self._settings.osv_concurrency)

        async def one(advisory_id: str) -> tuple[str, dict[str, object] | None]:
            async with gate:
                try:
                    return advisory_id, await self._request("GET", f"/v1/vulns/{advisory_id}")
                except OsvUnavailable:
                    return advisory_id, None

        pairs = await asyncio.gather(*(one(i) for i in ids))
        return {i: record for i, record in pairs if record is not None}


def advisory_severity(record: dict[str, object]) -> Severity | None:
    """GitHub's reviewed rating when there is one, else the CVSS 3.x base score, else None."""
    database = record.get("database_specific")
    if isinstance(database, dict):
        rating = _GITHUB_RATINGS.get(str(database.get("severity", "")).upper())
        if rating:
            return rating
    for entry in record.get("severity") or []:
        if isinstance(entry, dict) and str(entry.get("type", "")).startswith("CVSS_V3"):
            score = base_score(str(entry.get("score", "")))
            if score is not None:
                return severity_of(score)
    return None


def _version_key(version: str) -> tuple[tuple[int, int | str], ...]:
    """A sortable form of a version: numbers compare as numbers, words as words, and words sort first."""
    parts = re.split(r"[.\-+_]", version.lstrip("vV"))
    return tuple((1, int(part)) if part.isdigit() else (0, part) for part in parts if part)


def _record_fix(package: Package, record: dict[str, object]) -> str | None:
    """The lowest fixed version above the installed one in one advisory's ranges for this package."""
    installed = _version_key(package.version)
    wanted = package_key(package)[:2]
    fixes: set[str] = set()
    for affected in record.get("affected") or []:
        pkg = affected.get("package") if isinstance(affected, dict) else None
        if not isinstance(pkg, dict):
            continue
        candidate = Package(str(pkg.get("ecosystem", "")), str(pkg.get("name", "")), package.version, package.dev, package.lockfile)
        if package_key(candidate)[:2] != wanted:
            continue
        for version_range in affected.get("ranges") or []:
            for event in (version_range or {}).get("events") or []:
                if isinstance(event, dict) and event.get("fixed"):
                    fixes.add(str(event["fixed"]))
    above = [fix for fix in fixes if _version_key(fix) > installed]
    return min(above, key=_version_key) if above else None


def fixed_version(package: Package, records: list[dict[str, object]]) -> str | None:
    """The lowest version that fixes every listed advisory that has a fix: each advisory's lowest fix, then the highest of those."""
    fixes = [fix for fix in (_record_fix(package, record) for record in records) if fix]
    return max(fixes, key=_version_key) if fixes else None


def merge_aliases(ids: list[str], records: dict[str, dict[str, object]]) -> list[str]:
    """One id per advisory, merging the ones that are aliases of each other (the same CVE as GHSA and PYSEC)."""
    groups: list[set[str]] = []
    for advisory_id in ids:
        record = records.get(advisory_id) or {}
        names = {advisory_id, *[str(alias) for alias in record.get("aliases") or []]}
        for group in [g for g in groups if g & names]:
            groups.remove(group)
            names |= group
        groups.append(names)
    chosen: list[str] = []
    for group in groups:
        present = sorted(i for i in group if i in ids)
        preferred = next((i for prefix in _PREFERRED_PREFIXES for i in present if i.startswith(prefix)), present[0])
        chosen.append(preferred)
    return sorted(chosen)


@dataclass
class DependencyResult:
    findings: list[Finding] = field(default_factory=list)
    checked: int = 0
    partial_reasons: list[str] = field(default_factory=list)


def _line_of(lockfile: ScanFile | None, name: str, version: str) -> int | None:
    """Where this package version's own entry is in its lockfile, so the grave links to that line.

    Matched by name and version, so nested copies of one package at different
    versions each point at their own entry, and `authlib` never matches `oauthlib`.
    """
    if lockfile is None:
        return None
    lines = lockfile.lines
    name_at = re.compile(rf"(^|[\"'/\s]){re.escape(name)}([\"'@\s:=(<>~!/\[]|$)", re.IGNORECASE)
    # The entry and its version on one line: requirements (name==1.0), pnpm (name@1.0:, /name/1.0:), Gemfile.lock (name (1.0)), go.mod (name v1.0).
    same_line = re.compile(rf"{re.escape(name)}(\[[^\]]*\])?\s*(===?\s*|@|/|\s+\(|\s+v?){re.escape(version)}(?![\w.])", re.IGNORECASE)
    # Or the version on one of the next lines: package-lock ("version": "1.0"), yarn (version "1.0"), TOML (version = "1.0").
    version_line = re.compile(rf"\bversion\b\W*v?{re.escape(version)}(?![\w.])")
    first_name: int | None = None
    for index, text in enumerate(lines):
        if not name_at.search(text):
            continue
        first_name = first_name or index + 1
        if same_line.search(text):
            return index + 1
        if any(version_line.search(following) for following in lines[index + 1 : index + 4]):
            return index + 1
    return first_name


async def dependency_findings(packages: list[Package], lockfiles: list[ScanFile], client: OsvClient, settings: Settings) -> DependencyResult:
    """One grave per vulnerable package version (§5.1)."""
    result = DependencyResult()
    # Production dependencies first, so the cap leaves out development ones.
    ordered = sorted(packages, key=lambda p: (p.dev, p.ecosystem, p.name))
    if len(ordered) > settings.osv_max_packages:
        result.partial_reasons.append(f"only the first {settings.osv_max_packages} of {len(ordered)} package versions were checked")
        ordered = ordered[: settings.osv_max_packages]
    result.checked = len(ordered)
    hits = await client.query(ordered)
    all_ids = sorted({i for ids in hits.values() for i in ids})
    # One advisory for every vulnerable package first, so every grave gets a rating; then the rest fill the room.
    first_ids = [sorted(hits[package_key(p)])[0] for p in ordered if hits.get(package_key(p))]
    wanted = list(dict.fromkeys([*first_ids, *all_ids]))[: settings.osv_max_advisories]
    if len(all_ids) > len(wanted):
        result.partial_reasons.append(f"details were fetched for {len(wanted)} of {len(all_ids)} advisories")
    records = await client.advisories(wanted)
    by_path = {f.path: f for f in lockfiles}
    for package in ordered:
        ids = hits.get(package_key(package))
        if not ids:
            continue
        shown = merge_aliases(ids, records)
        known = [records[i] for i in ids if i in records]
        ratings = [s for s in (advisory_severity(r) for r in known) if s is not None]
        severity: Severity = worst(ratings) if ratings else "medium"
        if package.dev:
            severity = lower(severity)
        fixed = fixed_version(package, known)
        summary = next((str(r["summary"]).strip().rstrip(".") for r in known if r.get("summary")), "")
        count = len(shown)
        detail = f"{package.name} {package.version} has {count} published security {'advisory' if count == 1 else 'advisories'}"
        detail += f": {', '.join(shown[:_IDS_IN_DETAIL])}{' and more' if count > _IDS_IN_DETAIL else ''}."
        if summary:
            detail += f" {summary}."
        if not known:
            detail += f" Its advisory details were not fetched (a scan reads at most {settings.osv_max_advisories}), so it is shown as medium."
        elif not ratings:
            detail += " The advisories give no severity rating, so it is shown as medium."
        if package.dev:
            detail += " It is a development dependency, so it is shown one step lower."
        unfixed = sum(1 for record in known if _record_fix(package, record) is None)
        if fixed:
            fix = f"Upgrade {package.name} to {fixed} or later, then update the lockfile."
            if unfixed:
                fix += f" {unfixed} of its advisories list no fix yet; check them for a workaround."
        else:
            fix = "No fixed version is listed yet. Check the advisories for a workaround, or replace the package."
        lockfile = by_path.get(package.lockfile)
        line = _line_of(lockfile, package.name, package.version)
        result.findings.append(
            finding(
                "dep.vulnerable",
                path=package.lockfile,
                line=line,
                snippet=lockfile.line_text(line) if lockfile and line else None,
                severity=severity,
                title=f"Vulnerable {package.name}",
                detail=detail,
                fix=fix,
                references=tuple(Reference(label=i, url=f"{OSV_ADVISORY_URL}/{i}") for i in shown),
                package=PackageRef(ecosystem=package.ecosystem, name=package.name, version=package.version, fixed_in=fixed, dev=package.dev),
            )
        )
    result.findings.sort(key=lambda f: SEVERITIES.index(f.severity))
    return result
