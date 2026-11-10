
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
        )


@lru_cache
def get_settings() -> Settings:
    return Settings.from_env()
