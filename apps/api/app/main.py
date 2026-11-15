"""Gravecast API entrypoint."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.common.rate_limit import RateLimiter
from app.config import get_settings
from app.modules.github import router as github_router
from app.modules.github.service import GitHubIngestionService
from app.modules.linkscan import router as linkscan_router
from app.modules.linkscan.service import LinkScanService

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    service = GitHubIngestionService(settings=settings)
    app.state.ingestion_service = service
    app.state.link_scan_service = LinkScanService(settings=settings)
    # Fallback cleanup for abandoned snapshot workspaces.
    try:
        deleted = service.cleanup_abandoned()
        if deleted:
            logger.info("Removed %s abandoned workspace(s) on startup", deleted)
    except Exception:
        logger.exception("Abandoned workspace cleanup failed")
    yield


app = FastAPI(
    title="Gravecast API",
    description=(
        "Repository graveyard scanner — turns real code problems "
        "into a place you can explore."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(github_router)
app.include_router(linkscan_router)

# Rate limits exist before any request, so they also hold when lifespan is skipped.
_settings = get_settings()
app.state.repo_rate_limiter = RateLimiter(_settings.repo_scans_per_minute)
app.state.link_rate_limiter = RateLimiter(_settings.link_scans_per_minute)


class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: str


@app.get("/health", response_model=HealthResponse, tags=["meta"])
async def health() -> HealthResponse:
    """Returns API liveness status."""
    return HealthResponse(
        status="ok",
        version="0.1.0",
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
