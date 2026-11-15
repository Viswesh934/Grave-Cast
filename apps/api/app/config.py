
"""Application configuration with configurable ingestion safety limits."""

from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()


def _env_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None or raw.strip() == "":
        return default
    return int(raw)


def _env_float(name: str, default: float) -> float:
    raw = os.getenv(name)
    if raw is None or raw.strip() == "":
        return default
    return float(raw)


@dataclass(frozen=True)
class Settings:
    """Runtime settings for the API and GitHub ingestion."""

    github_api_base_url: str = "https://api.github.com"
    github_token: str | None = None
    github_user_agent: str = (
        "Gravecast/0.1 (+https://github.com/gravecast)"
    )

    # GitHub reports repository size in kilobytes.
    max_repo_size_kb: int = 100_000
    max_files: int = 400
    max_file_size_bytes: int = 512_000
    max_total_bytes: int = 25_000_000
    max_concurrency: int = 8

    request_timeout_seconds: float = 30.0
    max_retries: int = 2
    retry_backoff_seconds: float = 0.5

    workspace_root: Path = Path("storage/repositories")
    workspace_ttl_seconds: int = 3600

    # Repo graveyard: how many graves one scan returns at most.
    graveyard_max_graves: int = 300

    # Link scan: one passive request per hop, never reading the page body.
    link_max_redirects: int = 5
    link_connect_timeout_seconds: float = 8.0
    link_total_timeout_seconds: float = 15.0
    link_user_agent: str = "Gravecast-LinkCheck/0.1"

    # Scans per client address per minute.
    link_scans_per_minute: int = 20
    repo_scans_per_minute: int = 4

    @classmethod
    def from_env(cls) -> Settings:
        token = os.getenv("GITHUB_TOKEN") or os.getenv("GH_TOKEN")
        # Default outside apps/api so uvicorn --reload does not restart on writes.
        default_root = (
            Path(__file__).resolve().parents[3] / "storage" / "repositories"
        )
        root = os.getenv("GRAVECAST_WORKSPACE_ROOT", str(default_root))

        return cls(
            github_api_base_url=os.getenv(
                "GITHUB_API_BASE_URL", "https://api.github.com"
            ).rstrip("/"),
            github_token=token.strip() if token else None,
            github_user_agent=os.getenv(
                "GITHUB_USER_AGENT",
                "Gravecast/0.1 (+https://github.com/gravecast)",
            ),
            max_repo_size_kb=_env_int("GRAVECAST_MAX_REPO_SIZE_KB", 100_000),
            max_files=_env_int("GRAVECAST_MAX_FILES", 400),
            max_file_size_bytes=_env_int(
                "GRAVECAST_MAX_FILE_SIZE_BYTES", 512_000
            ),
            max_total_bytes=_env_int("GRAVECAST_MAX_TOTAL_BYTES", 25_000_000),
            max_concurrency=_env_int("GRAVECAST_MAX_CONCURRENCY", 8),
            request_timeout_seconds=_env_float(
                "GRAVECAST_REQUEST_TIMEOUT_SECONDS", 30.0
            ),
            max_retries=_env_int("GRAVECAST_MAX_RETRIES", 2),
            retry_backoff_seconds=_env_float(
                "GRAVECAST_RETRY_BACKOFF_SECONDS", 0.5
            ),
            workspace_root=Path(root),
            workspace_ttl_seconds=_env_int(
                "GRAVECAST_WORKSPACE_TTL_SECONDS", 3600
            ),
            graveyard_max_graves=_env_int("GRAVECAST_GRAVEYARD_MAX_GRAVES", 300),
            link_max_redirects=_env_int("GRAVECAST_LINK_MAX_REDIRECTS", 5),
            link_connect_timeout_seconds=_env_float(
                "GRAVECAST_LINK_CONNECT_TIMEOUT_SECONDS", 8.0
            ),
            link_total_timeout_seconds=_env_float(
                "GRAVECAST_LINK_TOTAL_TIMEOUT_SECONDS", 15.0
            ),
            link_user_agent=os.getenv(
                "GRAVECAST_LINK_USER_AGENT", "Gravecast-LinkCheck/0.1"
            ),
            link_scans_per_minute=_env_int("GRAVECAST_LINK_SCANS_PER_MINUTE", 20),
            repo_scans_per_minute=_env_int("GRAVECAST_REPO_SCANS_PER_MINUTE", 4),
        )


@lru_cache
def get_settings() -> Settings:
    return Settings.from_env()
