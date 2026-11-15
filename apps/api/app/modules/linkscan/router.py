"""HTTP endpoint for the server side of the link scan."""

from __future__ import annotations

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.common.errors import AppError
from app.common.rate_limit import RateLimiter, client_key
from app.modules.linkscan.service import LinkScanService
from app.modules.linkscan.types import LinkScanRequest, LinkScanResponse

router = APIRouter(prefix="/api/linkscan", tags=["linkscan"])


@router.post(
    "/scan",
    response_model=LinkScanResponse,
    response_model_by_alias=True,
)
async def scan_link(
    body: LinkScanRequest, request: Request
) -> LinkScanResponse | JSONResponse:
    """Open a link once, passively, and report where it leads and its missing headers."""
    service: LinkScanService = request.app.state.link_scan_service
    limiter: RateLimiter = request.app.state.link_rate_limiter
    try:
        limiter.check(client_key(request))
        return await service.scan(body.url)
    except AppError as exc:
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": {"code": exc.code, "message": exc.message}},
        )