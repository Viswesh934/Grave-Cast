"""HTTP endpoints for GitHub repository ingestion."""

from __future__ import annotations

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.common.errors import AppError
from app.modules.github.service import GitHubIngestionService
from app.modules.github.types import IngestRequest, IngestResponse

router = APIRouter(prefix="/api/repositories", tags=["repositories"])


@router.post(
    "/ingest",
    response_model=IngestResponse,
    response_model_by_alias=True,
)
async def ingest_repository(
    body: IngestRequest, request: Request
) -> IngestResponse | JSONResponse:
    """Accept a public GitHub URL and ingest a bounded source snapshot."""
    service: GitHubIngestionService = request.app.state.ingestion_service
    try:
        return await service.ingest(body.url)
    except AppError as exc:
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": {"code": exc.code, "message": exc.message}},
        )
