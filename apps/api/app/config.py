
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


def _env_list(name: str, default: tuple[str, ...], *, upper: bool = False) -> tuple[str, ...]:
    """A comma-separated environment variable as a tuple, or `default` when unset."""
    raw = os.getenv(name)
    if raw is None or raw.strip() == "":
        return default
    items = tuple(part.strip() for part in raw.split(",") if part.strip())
    return tuple(item.upper() for item in items) if upper else items


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

    # Chat (the Emergency Channel): public echoes, small messages, mail runs.
    channel_db_path: Path = Path("storage/channel.sqlite3")
    channel_echoes: tuple[str, ...] = ("EMERGENCY", "DEMO")
    channel_max_nick_chars: int = 24
    channel_max_body_chars: int = 500
    # Messages one mail run may send, and how many one read may return.
    channel_max_run_messages: int = 20
    channel_page_size: int = 100
    # Older messages in an echo are dropped past this many.
    channel_keep_per_echo: int = 500
    channel_runs_per_minute: int = 60
    channel_reads_per_minute: int = 90

    # Which websites may call the API from a browser.
    cors_origins: tuple[str, ...] = ("http://localhost:5173", "http://127.0.0.1:5173")

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
            channel_db_path=Path(
                os.getenv(
                    "GRAVECAST_CHANNEL_DB_PATH",
                    str(Path(__file__).resolve().parents[3] / "storage" / "channel.sqlite3"),
                )
            ),
            channel_echoes=_env_list("GRAVECAST_CHANNEL_ECHOES", ("EMERGENCY", "DEMO"), upper=True),
            channel_max_nick_chars=_env_int("GRAVECAST_CHANNEL_MAX_NICK_CHARS", 24),
            channel_max_body_chars=_env_int("GRAVECAST_CHANNEL_MAX_BODY_CHARS", 500),
            channel_max_run_messages=_env_int("GRAVECAST_CHANNEL_MAX_RUN_MESSAGES", 20),
            channel_page_size=_env_int("GRAVECAST_CHANNEL_PAGE_SIZE", 100),
            channel_keep_per_echo=_env_int("GRAVECAST_CHANNEL_KEEP_PER_ECHO", 500),
            channel_runs_per_minute=_env_int("GRAVECAST_CHANNEL_RUNS_PER_MINUTE", 60),
            channel_reads_per_minute=_env_int("GRAVECAST_CHANNEL_READS_PER_MINUTE", 90),
            cors_origins=_env_list(
                "GRAVECAST_CORS_ORIGINS", ("http://localhost:5173", "http://127.0.0.1:5173")
            ),
        )


@lru_cache
def get_settings() -> Settings:
    return Settings.from_env()
