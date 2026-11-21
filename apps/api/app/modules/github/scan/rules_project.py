"""Protections the whole project is missing (docs/REPO_SCAN_DESIGN.md §5.5): rate limiting, security headers, lockfiles."""
from __future__ import annotations

import json
import re
import tomllib
from collections.abc import Iterable, Iterator
from dataclasses import dataclass, field
from pathlib import PurePosixPath

from app.modules.github.scan.catalog import finding
from app.modules.github.scan.files import OTHER_LOCKFILE_NAMES, TREE_SITTER_LANGUAGES, ScanFile, is_lockfile, is_test_path
from app.modules.github.scan.findings import Finding

# Web frameworks that serve requests, by ecosystem.
NODE_FRAMEWORKS: frozenset[str] = frozenset(
    {"express", "fastify", "koa", "@nestjs/core", "@hapi/hapi", "hapi", "hono", "restify"}
)
PYTHON_FRAMEWORKS: frozenset[str] = frozenset(
    {"flask", "fastapi", "django", "starlette", "sanic", "aiohttp", "tornado"}
)
# Packages that limit how often a client may call.
RATE_LIMITERS: frozenset[str] = frozenset(
    {
        "express-rate-limit",
        "express-slow-down",
        "express-brute",
        "rate-limiter-flexible",
        "@nestjs/throttler",
        "koa-ratelimit",
        "koa2-ratelimit",
        "@fastify/rate-limit",
        "fastify-rate-limit",
        "hono-rate-limiter",
        "@hapi/rate-limit",
        "hapi-rate-limit",
        "@upstash/ratelimit",
        "slowapi",
        "flask-limiter",
        "django-ratelimit",
        "django-axes",
        "fastapi-limiter",
        "limits",
        "aiohttp-ratelimiter",
    }
)
# Node frameworks whose security headers the rule checks, and the packages that set them.
HEADER_FRAMEWORKS: frozenset[str] = frozenset({"express", "koa", "fastify"})
HEADER_PACKAGES: frozenset[str] = frozenset({"helmet", "koa-helmet", "@fastify/helmet", "fastify-helmet", "lusca"})
NPM_LOCKFILES: frozenset[str] = frozenset(
    {"package-lock.json", "npm-shrinkwrap.json", "yarn.lock", "pnpm-lock.yaml", "bun.lock", "bun.lockb"}
)
PYTHON_LOCKFILES: frozenset[str] = frozenset({"poetry.lock", "uv.lock", "Pipfile.lock", "pdm.lock"})

_RATE_LIMIT_MENTION = re.compile(r"(?i)rate[\s_-]?limit|throttl")
_HEADER_MENTION = re.compile(r"(?i)content-security-policy|x-frame-options")
_REQUIREMENT_NAME = re.compile(r"^\s*([A-Za-z0-9][A-Za-z0-9._-]*)")


def _normal(name: str) -> str:
    return name.strip().lower().replace("_", "-")


@dataclass
class _Manifest:
    """One file that declares dependencies."""

    file: ScanFile
    ecosystem: str  # "npm" or "PyPI"
    names: set[str] = field(default_factory=set)
    # Whether it declares any dependency at all (for dep.no-lockfile); requirements files are lockfiles themselves.
    needs_lockfile: bool = False


def _pep508_names(entries: object) -> set[str]:
    out: set[str] = set()
    if isinstance(entries, list):
        for entry in entries:
            match = _REQUIREMENT_NAME.match(str(entry))
            if match:
                out.add(_normal(match.group(1)))
    return out


def _package_json(file: ScanFile) -> _Manifest | None:
    try:
        data = json.loads(file.text)
    except ValueError:
        return None
    if not isinstance(data, dict):
        return None
    names: set[str] = set()
    for key in ("dependencies", "devDependencies", "peerDependencies", "optionalDependencies"):
        deps = data.get(key)
        if isinstance(deps, dict):
            names |= {str(n) for n in deps}
    return _Manifest(file, "npm", names, needs_lockfile=bool(names))


def _pyproject(file: ScanFile) -> _Manifest | None:
    try:
        data = tomllib.loads(file.text)
    except tomllib.TOMLDecodeError:
        return None
    names: set[str] = set()
    project = data.get("project")
    if isinstance(project, dict):
        names |= _pep508_names(project.get("dependencies"))
        optional = project.get("optional-dependencies")
        if isinstance(optional, dict):
            for group in optional.values():
                names |= _pep508_names(group)
    groups = data.get("dependency-groups")
    if isinstance(groups, dict):
        for group in groups.values():
            names |= _pep508_names(group)
    poetry = (data.get("tool") or {}).get("poetry") if isinstance(data.get("tool"), dict) else None
    if isinstance(poetry, dict):
        for key in ("dependencies", "dev-dependencies"):
            deps = poetry.get(key)
            if isinstance(deps, dict):
                names |= {_normal(str(n)) for n in deps if str(n).lower() != "python"}
        poetry_groups = poetry.get("group")
        if isinstance(poetry_groups, dict):
            for group in poetry_groups.values():
                deps = group.get("dependencies") if isinstance(group, dict) else None
                if isinstance(deps, dict):
                    names |= {_normal(str(n)) for n in deps if str(n).lower() != "python"}
    return _Manifest(file, "PyPI", names, needs_lockfile=bool(names))


def _requirements(file: ScanFile) -> _Manifest:
    names: set[str] = set()
    for raw in file.lines:
        line = raw.split("#", 1)[0].strip()
        if not line or line.startswith("-"):
            continue
        match = _REQUIREMENT_NAME.match(line)
        if match:
            names.add(_normal(match.group(1)))
    return _Manifest(file, "PyPI", names, needs_lockfile=False)


def _manifests(files: Iterable[ScanFile]) -> list[_Manifest]:
    out: list[_Manifest] = []
    for file in files:
        name = file.name
        manifest: _Manifest | None = None
        if name == "package.json":
            manifest = _package_json(file)
        elif name == "pyproject.toml":
            manifest = _pyproject(file)
        elif file.kind == "lockfile" and name.lower().startswith("requirements"):
            manifest = _requirements(file)
        if manifest is not None:
            out.append(manifest)
    return out


def _has_lockfile(manifest: _Manifest, paths: set[str]) -> bool:
    """A lockfile in the manifest's folder or a folder above it (workspaces keep one lockfile at the root)."""
    wanted = NPM_LOCKFILES if manifest.ecosystem == "npm" else PYTHON_LOCKFILES
    folder = PurePosixPath(manifest.file.path).parent
    for directory in (folder, *folder.parents):
        prefix = "" if str(directory) == "." else f"{directory}/"
        for path in paths:
            if not path.startswith(prefix):
                continue
            rest = path[len(prefix) :]
            if "/" in rest:
                continue
            if rest in wanted or (manifest.ecosystem == "PyPI" and is_lockfile(rest) and rest.lower().startswith("requirements")):
                return True
            if rest in OTHER_LOCKFILE_NAMES and manifest.ecosystem == "npm" and rest.startswith("bun"):
                return True
    return False


def _line_of(file: ScanFile, name: str) -> int | None:
    for needle in (f'"{name}"', f"{name}=", f"{name} ", name):
        found = file.find_line(needle)
        if found:
            return found
    return None


def _mentions(files: Iterable[ScanFile], pattern: re.Pattern[str]) -> bool:
    """Whether a Python, JavaScript or TypeScript file outside test code mentions the pattern.

    Reports (sarif.json), manifests and tests that check a header is missing don't count.
    """
    for file in files:
        if file.kind != "code" or PurePosixPath(file.path).suffix.lower() not in TREE_SITTER_LANGUAGES or is_test_path(file.path):
            continue
        if pattern.search(file.text):
            return True
    return False


def project_findings(files: list[ScanFile], all_paths: Iterable[str]) -> Iterator[Finding]:
    """The project-wide rules. Each looks across every manifest and source file at once."""
    manifests = [m for m in _manifests(files) if not is_test_path(m.file.path)]
    paths = set(all_paths)

    for manifest in manifests:
        if manifest.needs_lockfile and not _has_lockfile(manifest, paths):
            yield finding("dep.no-lockfile", path=manifest.file.path, line=None)

    names = {n for m in manifests for n in m.names}
    normal_names = {_normal(n) for n in names}

    serving = [
        (m, n)
        for m in manifests
        for n in sorted(m.names)
        if (m.ecosystem == "npm" and n in NODE_FRAMEWORKS) or (m.ecosystem == "PyPI" and _normal(n) in PYTHON_FRAMEWORKS)
    ]
    if serving and not (normal_names & RATE_LIMITERS) and not _mentions(files, _RATE_LIMIT_MENTION):
        manifest, framework = serving[0]
        line = _line_of(manifest.file, framework)
        yield finding(
            "prj.no-rate-limiting",
            path=manifest.file.path,
            line=line,
            snippet=manifest.file.line_text(line) if line else None,
        )

    header_servers = [(m, n) for m in manifests if m.ecosystem == "npm" for n in sorted(m.names) if n in HEADER_FRAMEWORKS]
    if header_servers and not (names & HEADER_PACKAGES) and not _mentions(files, _HEADER_MENTION):
        manifest, framework = header_servers[0]
        line = _line_of(manifest.file, framework)
        yield finding(
            "prj.no-security-headers",
            path=manifest.file.path,
            line=line,
            snippet=manifest.file.line_text(line) if line else None,
        )
