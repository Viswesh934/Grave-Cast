"""Temporary per-snapshot workspace for ingested source files."""

from __future__ import annotations

import json
import logging
import shutil
import time
import uuid
from dataclasses import dataclass
from pathlib import Path

from app.config import Settings
from app.modules.github.types import SnapshotManifest

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class WorkspacePaths:
    snapshot_id: str
    root: Path
    source_root: Path
    manifest_path: Path


class WorkspaceManager:
    """Create, write, and clean up repository snapshot workspaces."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._root = settings.workspace_root

    def create(self) -> WorkspacePaths:
        self._root.mkdir(parents=True, exist_ok=True)
        snapshot_id = f"snapshot-{uuid.uuid4().hex}"
        root = self._root / snapshot_id
        source_root = root / "source"
        source_root.mkdir(parents=True, exist_ok=False)
        return WorkspacePaths(
            snapshot_id=snapshot_id,
            root=root,
            source_root=source_root,
            manifest_path=root / "metadata.json",
        )

    def write_source_file(
        self, workspace: WorkspacePaths, relative_path: str, content: bytes
    ) -> None:
        """Write a file under source/, preserving relative directories.

        Rejects path traversal. Never exposes absolute paths to callers' API layer.
        """
        target = self._resolve_under_source(workspace, relative_path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(content)

    def write_manifest(
        self, workspace: WorkspacePaths, manifest: SnapshotManifest
    ) -> None:
        payload = manifest.model_dump(mode="json")
        workspace.manifest_path.write_text(
            json.dumps(payload, indent=2, sort_keys=True),
            encoding="utf-8",
        )

    def delete(self, snapshot_id: str) -> None:
        path = self._root / snapshot_id
        if path.exists():
            shutil.rmtree(path, ignore_errors=False)
            logger.info("Deleted workspace %s", snapshot_id)

    def cleanup_abandoned(self) -> int:
        """Remove workspaces older than the configured TTL. Returns count deleted."""
        if not self._root.exists():
            return 0

        ttl = self._settings.workspace_ttl_seconds
        now = time.time()
        deleted = 0
        for child in self._root.iterdir():
            if not child.is_dir() or not child.name.startswith("snapshot-"):
                continue
            try:
                age = now - child.stat().st_mtime
            except OSError:
                continue
            if age >= ttl:
                shutil.rmtree(child, ignore_errors=True)
                deleted += 1
                logger.info("Cleaned abandoned workspace %s", child.name)
        return deleted

    def _resolve_under_source(
        self, workspace: WorkspacePaths, relative_path: str
    ) -> Path:
        candidate = (workspace.source_root / relative_path).resolve()
        source_root = workspace.source_root.resolve()
        if not candidate.is_relative_to(source_root):
            raise ValueError(f"Unsafe path escapes workspace: {relative_path}")
        return candidate
