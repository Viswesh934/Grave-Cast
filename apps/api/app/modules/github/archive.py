"""Extract and filter a commit-pinned GitHub zipball locally."""

from __future__ import annotations

import hashlib
import io
import zipfile
from dataclasses import dataclass
from pathlib import Path

from app.common.errors import (
    ArchiveError,
    FileLimitExceededError,
    PathValidationError,
)
from app.config import Settings
from app.modules.github.filters import should_include_blob
from app.modules.github.types import FileInfo


@dataclass(frozen=True)
class ArchiveIngestResult:
    files: list[FileInfo]
    files_discovered: int
    files_selected: int
    bytes_fetched: int


def git_blob_sha(content: bytes) -> str:
    """Compute the Git blob object SHA-1 for file content."""
    header = f"blob {len(content)}\0".encode("utf-8")
    return hashlib.sha1(header + content).hexdigest()


def extract_filtered_source(
    archive_bytes: bytes,
    *,
    destination: Path,
    settings: Settings,
) -> ArchiveIngestResult:
    """Unpack a GitHub zipball and keep only allowlisted source files.

    GitHub zipballs contain a single top-level folder such as
    ``owner-repo-shortsha/``. That prefix is stripped so workspace paths match
    repository-relative paths.
    """
    destination.mkdir(parents=True, exist_ok=True)

    try:
        zf = zipfile.ZipFile(io.BytesIO(archive_bytes))
    except zipfile.BadZipFile as exc:
        raise ArchiveError("Repository archive was not a valid zip file.") from exc

    with zf:
        names = [n for n in zf.namelist() if n and not n.endswith("/")]
        if not names:
            return ArchiveIngestResult(
                files=[],
                files_discovered=0,
                files_selected=0,
                bytes_fetched=0,
            )

        prefix = _common_root_prefix(names)
        kept: list[FileInfo] = []
        selected = 0
        total_bytes = 0
        discovered = 0

        for name in names:
            info = zf.getinfo(name)
            if info.is_dir():
                continue

            relative = _strip_prefix(name, prefix)
            if relative is None:
                continue

            discovered += 1
            size = int(info.file_size)
            include, language = should_include_blob(
                path=relative, size=size, settings=settings
            )
            if not include or language is None:
                continue

            if selected + 1 > settings.max_files:
                raise FileLimitExceededError(
                    "Repository has too many supported source files to ingest."
                )
            if total_bytes + size > settings.max_total_bytes:
                raise FileLimitExceededError(
                    "Selected source files exceed the total byte limit."
                )

            try:
                raw = zf.read(name)
            except Exception as exc:  # noqa: BLE001
                raise ArchiveError(
                    f"Failed to read '{relative}' from the repository archive."
                ) from exc

            if len(raw) > settings.max_file_size_bytes:
                continue
            if b"\x00" in raw:
                continue
            try:
                raw.decode("utf-8")
            except UnicodeDecodeError:
                continue

            target = _safe_join(destination, relative)
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(raw)

            selected += 1
            total_bytes += len(raw)
            kept.append(
                FileInfo(
                    path=relative,
                    language=language,
                    blob_sha=git_blob_sha(raw),
                    size=len(raw),
                )
            )

    return ArchiveIngestResult(
        files=kept,
        files_discovered=discovered,
        files_selected=selected,
        bytes_fetched=total_bytes,
    )


def _common_root_prefix(names: list[str]) -> str:
    """Return the GitHub zipball top-level directory prefix, if present."""
    first = names[0]
    if "/" not in first:
        return ""
    root = first.split("/", 1)[0] + "/"
    if all(
        name.startswith(root) or name.rstrip("/") == root.rstrip("/")
        for name in names
    ):
        return root
    return ""


def _strip_prefix(name: str, prefix: str) -> str | None:
    relative = name[len(prefix) :] if prefix and name.startswith(prefix) else name
    relative = relative.replace("\\", "/").lstrip("/")
    if not relative or relative.endswith("/"):
        return None
    if ".." in relative.split("/"):
        raise PathValidationError(
            f"Repository archive contained an unsafe path: {name}"
        )
    return relative


def _safe_join(root: Path, relative: str) -> Path:
    candidate = (root / relative).resolve()
    root_resolved = root.resolve()
    if not candidate.is_relative_to(root_resolved):
        raise PathValidationError(
            f"Repository archive contained an unsafe path: {relative}"
        )
    return candidate
