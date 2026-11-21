"""Reading lockfiles into exact package versions (docs/REPO_SCAN_DESIGN.md §5.1). Nothing is installed or run."""
from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import PurePosixPath

import yaml

from app.common.toml_compat import tomllib
from app.modules.github.scan.files import ScanFile


@dataclass(frozen=True)
class Package:
    """One exact package version, as a lockfile pins it."""

    ecosystem: str  # OSV.dev's name: npm, PyPI, Go, crates.io, RubyGems, Packagist
    name: str
    version: str
    dev: bool
    lockfile: str


@dataclass
class LockfileReport:
    packages: list[Package] = field(default_factory=list)
    read: list[str] = field(default_factory=list)
    # Plain-words notes about what could not be read, for the check's detail.
    notes: list[str] = field(default_factory=list)
    unpinned: int = 0


_SKIPPED_VERSION = re.compile(r"^(file:|link:|git|github:|http|workspace:|portal:|patch:)")
_LOCAL_SOURCES = frozenset({"git", "directory", "file", "url", "path", "editable", "virtual"})


def _npm_package_lock(file: ScanFile, data: dict[str, object]) -> list[Package]:
    out: list[Package] = []
    packages = data.get("packages")
    if isinstance(packages, dict):  # lockfile v2 and v3
        for key, info in packages.items():
            if not key or not isinstance(info, dict) or info.get("link"):
                continue
            version = info.get("version")
            name = info.get("name") or str(key).rsplit("node_modules/", 1)[-1]
            if isinstance(version, str) and not _SKIPPED_VERSION.match(version):
                out.append(Package("npm", str(name), version, bool(info.get("dev")), file.path))
        return out

    def walk(deps: object) -> None:  # lockfile v1
        if not isinstance(deps, dict):
            return
        for name, info in deps.items():
            if isinstance(info, dict):
                version = info.get("version")
                if isinstance(version, str) and not _SKIPPED_VERSION.match(version):
                    out.append(Package("npm", str(name), version, bool(info.get("dev")), file.path))
                walk(info.get("dependencies"))

    walk(data.get("dependencies"))
    return out


_YARN_VERSION = re.compile(r'^\s+version:?\s+"?([^"\s]+)"?\s*$')
_YARN_LOCAL = re.compile(r"@(workspace|patch|link|file|portal):")


def _yarn_lock(file: ScanFile) -> list[Package]:
    """Classic (v1) and Berry yarn.lock: a header of specs, then an indented version line."""
    out: list[Package] = []
    name: str | None = None
    for raw in file.lines:
        if not raw.strip() or raw.lstrip().startswith("#"):
            continue
        if not raw.startswith((" ", "\t")) and raw.rstrip().endswith(":"):
            spec = raw.rstrip()[:-1].split(",")[0].strip().strip('"')
            at = spec.rfind("@")
            name = spec[:at] if at > 0 and not _YARN_LOCAL.search(spec) else None
            continue
        match = _YARN_VERSION.match(raw)
        if match and name and name != "__metadata":
            out.append(Package("npm", name, match.group(1), False, file.path))
            name = None
    return out


def _pnpm_lock(file: ScanFile) -> list[Package]:
    data = yaml.safe_load(file.text)
    if not isinstance(data, dict) or not isinstance(data.get("packages"), dict):
        return []
    old_format = str(data.get("lockfileVersion", "")).startswith("5")
    out: list[Package] = []
    for key, info in data["packages"].items():
        spec = re.sub(r"\(.*$", "", str(key).lstrip("/"))
        if old_format:
            name, _, version = spec.rpartition("/")
        else:
            at = spec.rfind("@")
            name, version = (spec[:at], spec[at + 1 :]) if at > 0 else ("", "")
        if name and version and not _SKIPPED_VERSION.match(version):
            dev = isinstance(info, dict) and bool(info.get("dev"))
            out.append(Package("npm", name, version.split("_", 1)[0], dev, file.path))
    return out


# `name==1.2.3` only: the version must end there, so a range such as `==1.2.*` is not taken as the exact version `1.2.`.
_REQUIREMENT = re.compile(r"^([A-Za-z0-9][A-Za-z0-9._-]*)(\[[^\]]*\])?\s*===?\s*([A-Za-z0-9._+!-]+)(?=[\s;\\]|$)")


def _requirements(file: ScanFile, report: LockfileReport) -> list[Package]:
    dev = bool(re.search(r"(dev|test|lint|doc)", file.name, re.IGNORECASE))
    out: list[Package] = []
    for raw in file.lines:
        line = raw.split("#", 1)[0].strip()
        if not line or line.startswith(("-", "git+", "http")):
            continue
        match = _REQUIREMENT.match(line)
        if match:
            out.append(Package("PyPI", match.group(1), match.group(3), dev, file.path))
        elif re.match(r"^[A-Za-z0-9]", line):
            report.unpinned += 1
    return out


def _from_registry(ecosystem: str, source: object) -> bool:
    """Whether a TOML lockfile entry came from the package registry (local and git packages have no advisories)."""
    if ecosystem == "crates.io":
        return str(source or "").startswith("registry+")
    if isinstance(source, dict):
        if source.get("type") in _LOCAL_SOURCES:  # poetry.lock
            return False
        if "type" not in source and "registry" not in source:  # uv.lock
            return not (set(source) & _LOCAL_SOURCES)
    return True


def _toml_packages(file: ScanFile, ecosystem: str) -> list[Package]:
    data = tomllib.loads(file.text)
    out: list[Package] = []
    for item in data.get("package", []):
        if not isinstance(item, dict) or not item.get("name") or not item.get("version"):
            continue
        if _from_registry(ecosystem, item.get("source")):
            out.append(Package(ecosystem, str(item["name"]), str(item["version"]), item.get("category") == "dev", file.path))
    return out


def _pipfile_lock(file: ScanFile) -> list[Package]:
    data = json.loads(file.text)
    out: list[Package] = []
    for section, dev in (("default", False), ("develop", True)):
        for name, info in (data.get(section) or {}).items():
            version = str(info.get("version", "")) if isinstance(info, dict) else ""
            if version.startswith("=="):
                out.append(Package("PyPI", name, version[2:], dev, file.path))
    return out


_GO_REQUIRE = re.compile(r"^\s*(?:require\s+)?([\w.\-~/]+\.[\w.\-~/]+)\s+(v[\w.+\-]+)")


def _go_mod(file: ScanFile) -> list[Package]:
    out: list[Package] = []
    in_block = False
    for raw in file.lines:
        line = raw.split("//", 1)[0].rstrip()
        if line.strip().startswith("require ("):
            in_block = True
            continue
        if in_block and line.strip() == ")":
            in_block = False
            continue
        if in_block or line.strip().startswith("require "):
            match = _GO_REQUIRE.match(line)
            if match:
                # OSV.dev lists Go versions without the leading "v".
                out.append(Package("Go", match.group(1), match.group(2).removeprefix("v"), False, file.path))
    return out


_GEM = re.compile(r"^    ([A-Za-z0-9_.\-]+) \(([^)]+)\)$")
_GEM_PLATFORM = re.compile(r"-(x86|x64|arm|aarch|universal|java|mingw|darwin|linux)[\w.-]*$")


def _gemfile_lock(file: ScanFile) -> list[Package]:
    out: list[Package] = []
    in_gems = in_specs = False
    for raw in file.lines:
        if raw and not raw.startswith(" "):
            in_gems, in_specs = raw.strip() == "GEM", False
            continue
        if in_gems and raw.strip() == "specs:":
            in_specs = True
            continue
        match = _GEM.match(raw) if in_specs else None
        if match:
            out.append(Package("RubyGems", match.group(1), _GEM_PLATFORM.sub("", match.group(2)), False, file.path))
    return out


def _composer_lock(file: ScanFile) -> list[Package]:
    data = json.loads(file.text)
    out: list[Package] = []
    for section, dev in (("packages", False), ("packages-dev", True)):
        for item in data.get(section) or []:
            if isinstance(item, dict) and item.get("name") and item.get("version"):
                version = str(item["version"]).removeprefix("v")
                if not version.startswith("dev-"):
                    out.append(Package("Packagist", str(item["name"]), version, dev, file.path))
    return out


def _parse(file: ScanFile, report: LockfileReport) -> list[Package]:
    name = PurePosixPath(file.path).name
    if name in {"package-lock.json", "npm-shrinkwrap.json"}:
        return _npm_package_lock(file, json.loads(file.text))
    if name == "yarn.lock":
        return _yarn_lock(file)
    if name == "pnpm-lock.yaml":
        return _pnpm_lock(file)
    if name in {"poetry.lock", "uv.lock"}:
        return _toml_packages(file, "PyPI")
    if name == "Cargo.lock":
        return _toml_packages(file, "crates.io")
    if name == "Pipfile.lock":
        return _pipfile_lock(file)
    if name == "go.mod":
        return _go_mod(file)
    if name == "Gemfile.lock":
        return _gemfile_lock(file)
    if name == "composer.lock":
        return _composer_lock(file)
    return _requirements(file, report)


def package_key(package: Package) -> tuple[str, str, str]:
    """One key per package version. PyPI names are case-insensitive."""
    name = package.name.lower().replace("_", "-") if package.ecosystem == "PyPI" else package.name
    return package.ecosystem, name, package.version


def read_lockfiles(files: list[ScanFile]) -> LockfileReport:
    """Every exact package version from the repo's lockfiles, each once (dev only when every copy is dev)."""
    report = LockfileReport()
    seen: dict[tuple[str, str, str], Package] = {}
    for file in files:
        try:
            packages = _parse(file, report)
        except (ValueError, yaml.YAMLError, tomllib.TOMLDecodeError, AttributeError, TypeError):
            report.notes.append(f"{file.path} could not be read")
            continue
        report.read.append(file.path)
        for package in packages:
            key = package_key(package)
            if key not in seen or (seen[key].dev and not package.dev):
                seen[key] = package
    report.packages = list(seen.values())
    if report.unpinned:
        report.notes.append(f"{report.unpinned} requirements without an exact version were not checked")
    return report
