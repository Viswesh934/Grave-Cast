"""Coordinate GitHub repository ingestion into a temporary snapshot workspace."""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from app.common.errors import (
    AppError,
    PrivateRepositoryError,
    RepositoryTooLargeError,
)
from app.config import Settings, get_settings
from app.modules.github.archive import extract_filtered_source
from app.modules.github.client import GitHubClient
from app.modules.github.markers import find_markers, sort_markers
from app.modules.github.parser import parse_github_repo_url
from app.modules.github.types import (
    CommitResolution,
    FileInfo,
    GraveyardResponse,
    GraveyardStats,
    IngestResponse,
    IngestStats,
    ManifestFileEntry,
    RepoMetadata,
    RepoGrave,
    RepositoryInfo,
    SnapshotInfo,
    SnapshotManifest,
)
from app.modules.github.workspace import WorkspaceManager, WorkspacePaths

logger = logging.getLogger(__name__)


class GitHubIngestionService:
    def __init__(
        self,
        settings: Settings | None = None,
        client: GitHubClient | None = None,
        workspaces: WorkspaceManager | None = None,
    ) -> None:
        self._settings = settings or get_settings()
        self._client = client
        self._workspaces = workspaces or WorkspaceManager(self._settings)

    async def ingest(self, url: str) -> IngestResponse:
        """Ingest a public repo via commit-pinned zipball + local filtering.

        GitHub calls:
          1) repository metadata
          2) resolve default branch -> commit/tree SHAs
          3) download zipball for that commit

        All file selection happens locally after the archive is downloaded.
        """
        ref = parse_github_repo_url(url)
        owns_client = self._client is None
        client = self._client or GitHubClient(self._settings)
        workspace: WorkspacePaths | None = None

        try:
            metadata = await client.get_repository(ref.owner, ref.name)
            self._validate_metadata(metadata)

            resolution = await client.resolve_commit(
                ref.owner, ref.name, metadata.default_branch
            )

            archive_bytes = await client.download_zipball(
                ref.owner, ref.name, resolution.commit_sha
            )

            workspace = self._workspaces.create()
            archive_result = extract_filtered_source(
                archive_bytes,
                destination=workspace.source_root,
                settings=self._settings,
            )

            stats = IngestStats(
                files_discovered=archive_result.files_discovered,
                files_selected=archive_result.files_selected,
                files_fetched=len(archive_result.files),
                bytes_fetched=archive_result.bytes_fetched,
            )

            repository = RepositoryInfo(
                owner=ref.owner,
                name=metadata.name,
                full_name=metadata.full_name,
                default_branch=metadata.default_branch,
                commit_sha=resolution.commit_sha,
                tree_sha=resolution.tree_sha,
                open_issues=metadata.open_issues,
            )

            self._write_manifest(
                workspace=workspace,
                repository=repository,
                resolution=resolution,
                files=archive_result.files,
                stats=stats,
            )

            return IngestResponse(
                repository=repository,
                snapshot=SnapshotInfo(id=workspace.snapshot_id, status="ready"),
                files=archive_result.files,
                stats=stats,
            )
        except AppError:
            if workspace is not None:
                self._safe_delete(workspace.snapshot_id)
            raise
        except Exception:
            if workspace is not None:
                self._safe_delete(workspace.snapshot_id)
            raise
        finally:
            if owns_client:
                await client.aclose()

    async def graveyard(self, url: str) -> GraveyardResponse:
        """Ingest a repo, collect its marker comments as graves, then delete the snapshot."""
        ingested = await self.ingest(url)
        snapshot_id = ingested.snapshot.id
        try:
            markers = []
            for file in ingested.files:
                text = self._workspaces.read_source_text(snapshot_id, file.path)
                markers.extend(find_markers(file.path, text))
        finally:
            self._safe_delete(snapshot_id)

        ordered = sort_markers(markers)
        limit = self._settings.graveyard_max_graves
        graves = [
            RepoGrave(id=f"{m.path}:{m.line}", kind=m.kind, path=m.path, line=m.line, note=m.note)
            for m in ordered[:limit]
        ]
        return GraveyardResponse(
            repository=ingested.repository,
            graves=graves,
            stats=GraveyardStats(
                files_read=len(ingested.files),
                files_discovered=ingested.stats.files_discovered,
                marker_count=len(ordered),
                languages=sorted({f.language for f in ingested.files}),
            ),
            truncated=len(ordered) > limit,
        )

    def cleanup_snapshot(self, snapshot_id: str) -> None:
        """Delete a snapshot workspace after analysis no longer needs it."""
        self._workspaces.delete(snapshot_id)

    def cleanup_abandoned(self) -> int:
        return self._workspaces.cleanup_abandoned()

    def _validate_metadata(self, metadata: RepoMetadata) -> None:
        if metadata.private:
            raise PrivateRepositoryError()
        if metadata.size > self._settings.max_repo_size_kb:
            raise RepositoryTooLargeError(
                "Repository exceeds the configured size limit for ingestion."
            )

    def _write_manifest(
        self,
        *,
        workspace: WorkspacePaths,
        repository: RepositoryInfo,
        resolution: CommitResolution,
        files: list[FileInfo],
        stats: IngestStats,
    ) -> None:
        manifest = SnapshotManifest(
            snapshot_id=workspace.snapshot_id,
            created_at=datetime.now(timezone.utc).isoformat(),
            repository=repository.model_dump(by_alias=True),
            commit_sha=resolution.commit_sha,
            tree_sha=resolution.tree_sha,
            files=[
                ManifestFileEntry(
                    path=f.path,
                    language=f.language,
                    blob_sha=f.blob_sha,
                    size=f.size,
                )
                for f in files
            ],
            stats=stats.model_dump(by_alias=True),
        )
        self._workspaces.write_manifest(workspace, manifest)

    def _safe_delete(self, snapshot_id: str) -> None:
        try:
            self._workspaces.delete(snapshot_id)
        except Exception:
            logger.exception("Failed to clean workspace %s", snapshot_id)
