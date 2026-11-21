"""Typed models for GitHub ingestion."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class IngestRequest(BaseModel):
    url: str = Field(..., min_length=1, description="Public GitHub repository URL")


class ParsedRepoRef(BaseModel):
    owner: str
    name: str


class RepositoryInfo(BaseModel):
    owner: str
    name: str
    full_name: str = Field(serialization_alias="fullName")
    default_branch: str = Field(serialization_alias="defaultBranch")
    commit_sha: str = Field(serialization_alias="commitSha")
    tree_sha: str = Field(serialization_alias="treeSha")
    open_issues: int = Field(default=0, serialization_alias="openIssues")

    model_config = {"populate_by_name": True}


class SnapshotInfo(BaseModel):
    id: str
    status: Literal["ready"] = "ready"


class FileInfo(BaseModel):
    path: str
    language: str
    blob_sha: str = Field(serialization_alias="blobSha")
    size: int

    model_config = {"populate_by_name": True}


class IngestStats(BaseModel):
    files_discovered: int = Field(serialization_alias="filesDiscovered")
    files_selected: int = Field(serialization_alias="filesSelected")
    files_fetched: int = Field(serialization_alias="filesFetched")
    bytes_fetched: int = Field(serialization_alias="bytesFetched")

    model_config = {"populate_by_name": True}


class IngestResponse(BaseModel):
    repository: RepositoryInfo
    snapshot: SnapshotInfo
    files: list[FileInfo]
    stats: IngestStats


class RepoMetadata(BaseModel):
    name: str
    full_name: str
    private: bool
    default_branch: str
    size: int  # kilobytes
    language: str | None = None
    # GitHub counts open pull requests as issues here.
    open_issues: int = 0


class CommitResolution(BaseModel):
    commit_sha: str
    tree_sha: str


class ManifestFileEntry(BaseModel):
    path: str
    language: str
    blob_sha: str
    size: int


class SnapshotManifest(BaseModel):
    snapshot_id: str
    created_at: str
    repository: dict
    commit_sha: str
    tree_sha: str
    files: list[ManifestFileEntry]
    stats: dict


class GraveyardRequest(BaseModel):
    url: str = Field(
        ..., min_length=1, max_length=300, description="Public GitHub repository URL"
    )


GraveSeverity = Literal["critical", "high", "medium", "low", "info"]
GraveConfidence = Literal["confirmed", "likely", "possible"]
GraveCategory = Literal[
    "vulnerable-dependency",
    "secret",
    "injection",
    "access-control",
    "crypto",
    "authentication",
    "misconfiguration",
    "supply-chain",
    "exposure",
    "code-note",
]


class RepoReference(BaseModel):
    label: str
    url: str


class RepoPackage(BaseModel):
    """The package a vulnerable-dependency grave is about."""

    ecosystem: str
    name: str
    version: str
    fixed_in: str | None = Field(default=None, serialization_alias="fixedIn")
    dev: bool = False

    model_config = {"populate_by_name": True}


class RepoGrave(BaseModel):
    """One finding in the repo (docs/REPO_SCAN_DESIGN.md §4). Secrets in the snippet are redacted."""

    id: str
    rule: str
    category: GraveCategory
    severity: GraveSeverity
    confidence: GraveConfidence
    title: str
    detail: str
    fix: str
    path: str | None
    line: int | None
    snippet: str | None
    owasp: str | None
    cwe: str | None
    references: list[RepoReference]
    package: RepoPackage | None = None


class GraveyardSummary(BaseModel):
    total: int = Field(description="Every finding, before the cap.")
    by_severity: dict[str, int] = Field(serialization_alias="bySeverity")
    by_category: dict[str, int] = Field(serialization_alias="byCategory")

    model_config = {"populate_by_name": True}


class ScanCheck(BaseModel):
    id: Literal["dependencies", "secrets", "code", "config", "project", "markers"]
    name: str
    status: Literal["ran", "partial", "skipped", "failed"]
    detail: str


class GraveyardStats(BaseModel):
    files_read: int = Field(serialization_alias="filesRead")
    files_discovered: int = Field(serialization_alias="filesDiscovered")
    files_skipped: int = Field(default=0, serialization_alias="filesSkipped")
    languages: list[str]
    lockfiles: list[str] = Field(default_factory=list)
    packages_checked: int = Field(default=0, serialization_alias="packagesChecked")
    marker_count: int = Field(serialization_alias="markerCount")

    model_config = {"populate_by_name": True}


class GraveyardResponse(BaseModel):
    schema_version: Literal[2] = Field(default=2, serialization_alias="schemaVersion")
    repository: RepositoryInfo
    graves: list[RepoGrave]
    summary: GraveyardSummary
    stats: GraveyardStats
    checks: list[ScanCheck]
    truncated: bool = Field(
        description="True when there were more findings than the graves returned."
    )

    model_config = {"populate_by_name": True}