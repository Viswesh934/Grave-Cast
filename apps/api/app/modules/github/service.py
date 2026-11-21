"""Coordinate GitHub repository ingestion into a temporary snapshot workspace."""

from __future__ import annotations

import asyncio
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
from app.modules.github.parser import parse_github_repo_url
from app.modules.github.scan.files import read_archive
from app.modules.github.scan.findings import Finding
from app.modules.github.scan.osv import OsvClient
from app.modules.github.scan.runner import run_scan
from app.modules.github.types import (
    CommitResolution,
    FileInfo,
    GraveyardResponse,
    GraveyardStats,
    GraveyardSummary,
    IngestResponse,
    IngestStats,
    ManifestFileEntry,
    RepoGrave,
    RepoMetadata,
    RepoPackage,
    RepoReference,
    RepositoryInfo,
    ScanCheck,
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
        osv: OsvClient | None = None,
    ) -> None:
        self._settings = settings or get_settings()
        self._client = client
        self._osv = osv
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
        """Scan a repo for security problems and code notes (docs/REPO_SCAN_DESIGN.md).

        The zipball is pinned to the commit and read in memory; nothing from the
        repo is run. Each finding becomes one grave.
        """
        ref = parse_github_repo_url(url)
        owns_client = self._client is None
        client = self._client or GitHubClient(self._settings)
        owns_osv = self._osv is None
        osv = self._osv or OsvClient(self._settings)
        try:
            metadata = await client.get_repository(ref.owner, ref.name)
            self._validate_metadata(metadata)
            resolution = await client.resolve_commit(ref.owner, ref.name, metadata.default_branch)
            archive_bytes = await client.download_zipball(ref.owner, ref.name, resolution.commit_sha)
            archive = await asyncio.to_thread(read_archive, archive_bytes, self._settings)
            result = await run_scan(archive, self._settings, osv)
        finally:
            if owns_client:
                await client.aclose()
            if owns_osv:
                await osv.aclose()

        repository = RepositoryInfo(
            owner=ref.owner,
            name=metadata.name,
            full_name=metadata.full_name,
            default_branch=metadata.default_branch,
            commit_sha=resolution.commit_sha,
            tree_sha=resolution.tree_sha,
            open_issues=metadata.open_issues,
        )
        return GraveyardResponse(
            repository=repository,
            graves=[_grave(f) for f in result.graves],
            summary=GraveyardSummary(
                total=result.total,
                by_severity=result.by_severity,
                by_category=result.by_category,
            ),
            stats=GraveyardStats(
                files_read=result.stats.files_read,
                files_discovered=result.stats.files_discovered,
                files_skipped=result.stats.files_skipped,
                languages=result.stats.languages,
                lockfiles=result.stats.lockfiles,
                packages_checked=result.stats.packages_checked,
                marker_count=result.stats.marker_count,
            ),
            checks=[ScanCheck(id=c.id, name=c.name, status=c.status, detail=c.detail) for c in result.checks],
            truncated=result.truncated,
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


def _grave(f: Finding) -> RepoGrave:
    """A scan finding as the response's grave."""
    package = None
    if f.package is not None:
        p = f.package
        package = RepoPackage(ecosystem=p.ecosystem, name=p.name, version=p.version, fixed_in=p.fixed_in, dev=p.dev)
    return RepoGrave(
        id=f.id,
        rule=f.rule,
        category=f.category,
        severity=f.severity,
        confidence=f.confidence,
        title=f.title,
        detail=f.detail,
        fix=f.fix,
        path=f.path,
        line=f.line,
        snippet=f.snippet,
        owasp=f.owasp,
        cwe=f.cwe,
        references=[RepoReference(label=r.label, url=r.url) for r in f.references],
        package=package,
    )
