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
