"""Which files the scan reads and how (docs/REPO_SCAN_DESIGN.md §6), plus small helpers over their text."""
from __future__ import annotations

import bisect
import io
import re
import zipfile
from dataclasses import dataclass, field
from pathlib import PurePosixPath
from typing import Literal

from app.common.errors import ArchiveError
from app.config import Settings
from app.modules.github.filters import IGNORED_DIRECTORIES, detect_language, is_safe_repo_relative_path

FileKind = Literal["code", "secret", "lockfile"]

# Lockfiles the dependency check parses (§5.1). requirements*.txt is matched by pattern.
LOCKFILE_NAMES: frozenset[str] = frozenset(
    {
        "package-lock.json",
        "npm-shrinkwrap.json",
        "yarn.lock",
        "pnpm-lock.yaml",
        "poetry.lock",
        "uv.lock",
        "Pipfile.lock",
        "go.mod",
        "Cargo.lock",
        "Gemfile.lock",
        "composer.lock",
    }
)
# Lockfiles that count as present for `dep.no-lockfile`, though they are not parsed.
OTHER_LOCKFILE_NAMES: frozenset[str] = frozenset({"bun.lock", "bun.lockb", "pdm.lock", "go.sum"})
_REQUIREMENTS = re.compile(r"^requirements[\w.-]*\.txt$", re.IGNORECASE)

# Read for secrets only (§6). Markdown is left out on purpose: its examples would flood the yard.
SECRET_EXTENSIONS: frozenset[str] = frozenset(
    {".properties", ".ini", ".cfg", ".conf", ".config", ".xml", ".sh", ".bash", ".zsh", ".ps1", ".tfvars", ".pem", ".key", ".env"}
)
SECRET_NAMES: frozenset[str] = frozenset(
    {".npmrc", ".pypirc", ".netrc", ".htpasswd", "credentials", "id_rsa", "id_dsa", "id_ecdsa", "id_ed25519", "pipfile"}
)

# Code the tree-sitter rules read (§5.3), by extension.
TREE_SITTER_LANGUAGES: dict[str, str] = {
    ".py": "python",
    ".js": "javascript",
    ".jsx": "javascript",
    ".mjs": "javascript",
    ".cjs": "javascript",
    ".ts": "typescript",
    ".mts": "typescript",
    ".cts": "typescript",
    ".tsx": "tsx",
}

# Test, example and documentation code (§3): one step lower.
_TEST_DIRS = frozenset(
    {
        "test",
        "tests",
        "__tests__",
        "spec",
        "specs",
        "testing",
        "fixtures",
        "fixture",
        "__fixtures__",
        "__mocks__",
        "mocks",
        "examples",
        "example",
        "samples",
        "sample",
        "demo",
        "demos",
        "docs",
        "doc",
        "testdata",
        "e2e",
        "cypress",
        "exploits",
        "exploit",
    }
)
_TEST_FILE = re.compile(r"(^test_.*\.py$|_test\.(py|go)$|\.(test|spec)\.[cm]?[jt]sx?$|^conftest\.py$)", re.IGNORECASE)
# Marks a reviewed line (§3): on the line itself or the line above it.
_SUPPRESS = re.compile(r"gravecast:\s*ignore|\bnosec\b", re.IGNORECASE)


def is_lockfile(name: str) -> bool:
    return name in LOCKFILE_NAMES or bool(_REQUIREMENTS.match(name))


def is_test_path(path: str) -> bool:
    parts = PurePosixPath(path).parts
    return any(part.lower() in _TEST_DIRS for part in parts[:-1]) or bool(_TEST_FILE.search(parts[-1]))


def classify(path: str) -> FileKind | None:
    """How the scan reads a file, or None when it doesn't read it."""
    if not is_safe_repo_relative_path(path):
        return None
    posix = PurePosixPath(path)
    if any(part in IGNORED_DIRECTORIES for part in posix.parts[:-1]):
        return None
    name = posix.name
    if is_lockfile(name):
        return "lockfile"
    lower = name.lower()
    if lower.startswith("dockerfile") or detect_language(path) is not None:
        return "code"
    if lower.startswith(".env") or lower in SECRET_NAMES or posix.suffix.lower() in SECRET_EXTENSIONS:
        return "secret"
    return None


def language_of(path: str) -> str | None:
    """The language name for the stats line."""
    if PurePosixPath(path).name.lower().startswith("dockerfile"):
        return "dockerfile"
    return detect_language(path)


@dataclass
class ScanFile:
    path: str
    text: str
    kind: FileKind
    language: str | None
    _lines: list[str] | None = field(default=None, repr=False)
    _starts: list[int] | None = field(default=None, repr=False)

    @property
    def name(self) -> str:
        return PurePosixPath(self.path).name

    @property
    def lines(self) -> list[str]:
        if self._lines is None:
            self._lines = self.text.splitlines()
        return self._lines

    def line_at(self, offset: int) -> int:
        """The 1-based line of a character offset."""
        if self._starts is None:
            self._starts = [0] + [m.end() for m in re.finditer(r"\n", self.text)]
        return bisect.bisect_right(self._starts, offset)

    def line_text(self, line: int) -> str:
        return self.lines[line - 1] if 0 < line <= len(self.lines) else ""

    def suppressed(self, line: int) -> bool:
        """Whether the line, or the line above it, carries `gravecast: ignore` or `nosec`."""
        return bool(_SUPPRESS.search(self.line_text(line)) or _SUPPRESS.search(self.line_text(line - 1)))

    def find_line(self, needle: str, start: int = 1) -> int | None:
        """The first line at or after `start` that contains `needle`."""
        for index in range(max(start, 1) - 1, len(self.lines)):
            if needle in self.lines[index]:
                return index + 1
        return None


@dataclass
class ScanArchive:
    """What the scan read from the repo's zipball."""

    files: list[ScanFile]
    # Every file path in the archive, read or not, for the rules that need only names.
    all_paths: list[str]
    discovered: int
    skipped: int


def _common_prefix(names: list[str]) -> str:
    first = names[0]
    if "/" not in first:
        return ""
    root = first.split("/", 1)[0] + "/"
    return root if all(name.startswith(root) for name in names) else ""


# Lockfiles first (so dependencies are always checked), then code, then secret-only files.
_PRIORITY: dict[FileKind, int] = {"lockfile": 0, "code": 1, "secret": 2}


def read_archive(archive_bytes: bytes, settings: Settings) -> ScanArchive:
    """Read a GitHub zipball in memory for the scan.

    Files past the size, count or byte limits are skipped and counted; the scan
    carries on. Binary and non-UTF-8 files are left out.
    """
    try:
        zf = zipfile.ZipFile(io.BytesIO(archive_bytes))
    except zipfile.BadZipFile as exc:
        raise ArchiveError("Repository archive was not a valid zip file.") from exc
    with zf:
        infos = [info for info in zf.infolist() if not info.is_dir()]
        if not infos:
            return ScanArchive(files=[], all_paths=[], discovered=0, skipped=0)
        prefix = _common_prefix([info.filename for info in infos])
        candidates: list[tuple[int, str, zipfile.ZipInfo, FileKind]] = []
        all_paths: list[str] = []
        skipped = 0
        for info in infos:
            relative = info.filename[len(prefix) :].replace("\\", "/").lstrip("/")
            if not relative or ".." in relative.split("/"):
                continue
            all_paths.append(relative)
            kind = classify(relative)
            if kind is None:
                continue
            limit = settings.lockfile_max_bytes if kind == "lockfile" else settings.max_file_size_bytes
            if info.file_size > limit:
                skipped += 1
                continue
            candidates.append((_PRIORITY[kind], relative, info, kind))
        candidates.sort(key=lambda c: (c[0], c[1]))
        files: list[ScanFile] = []
        total = 0
        for _, relative, info, kind in candidates:
            if len(files) >= settings.graveyard_max_files or total + info.file_size > settings.graveyard_max_total_bytes:
                skipped += 1
                continue
            raw = zf.read(info)
            if b"\x00" in raw:
                continue
            try:
                text = raw.decode("utf-8")
            except UnicodeDecodeError:
                continue
            total += len(raw)
            files.append(ScanFile(path=relative, text=text, kind=kind, language=language_of(relative) if kind == "code" else None))
    return ScanArchive(files=files, all_paths=all_paths, discovered=len(all_paths), skipped=skipped)
