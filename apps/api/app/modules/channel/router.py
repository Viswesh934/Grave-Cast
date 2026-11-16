"""HTTP endpoints for Chat: the mail run a phone makes, and a read-only view of an echo."""

from __future__ import annotations

from fastapi import APIRouter, Query, Request
from fastapi.responses import JSONResponse

from app.common.errors import AppError
from app.common.rate_limit import RateLimiter, client_key
from app.modules.channel.service import ChannelService
from app.modules.channel.types import (
    CreateEchoRequest,
    EchoInfo,
    EchoListResponse,
    EchoResponse,
    MailRunRequest,
    MailRunResponse,
)

router = APIRouter(prefix="/api/channel", tags=["channel"])

# Larger than any seq the server could reach.
_MAX_CURSOR = 2**53


def _error(exc: AppError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"error": {"code": exc.code, "message": exc.message}})


@router.post("/mailrun", response_model=MailRunResponse, response_model_by_alias=True)
async def mail_run(body: MailRunRequest, request: Request) -> MailRunResponse | JSONResponse:
    """Send a phone's outbox and fetch everything new in one small request."""
    service: ChannelService = request.app.state.channel_service
    limiter: RateLimiter = request.app.state.channel_run_limiter
    try:
        limiter.check(client_key(request))
        return await service.mail_run(body)
    except AppError as exc:
        return _error(exc)


@router.get("/echoes", response_model=EchoListResponse, response_model_by_alias=True)
async def list_echoes(request: Request) -> EchoListResponse | JSONResponse:
    """Every channel: the built-in echoes, then the ones people created."""
    service: ChannelService = request.app.state.channel_service
    limiter: RateLimiter = request.app.state.channel_read_limiter
    try:
        limiter.check(client_key(request))
        return await service.list_echoes()
    except AppError as exc:
        return _error(exc)


@router.post("/echoes", response_model=EchoInfo, response_model_by_alias=True, status_code=201)
async def create_echo(body: CreateEchoRequest, request: Request) -> EchoInfo | JSONResponse:
    """Create a public channel. Names are checked, and the number of channels is capped."""
    service: ChannelService = request.app.state.channel_service
    limiter: RateLimiter = request.app.state.channel_create_limiter
    try:
        limiter.check(client_key(request))
        return await service.create_echo(body.name, body.about)
    except AppError as exc:
        return _error(exc)


@router.get("/echoes/{area}", response_model=EchoResponse, response_model_by_alias=True)
async def read_echo(area: str, request: Request, since: int = Query(0, ge=0, le=_MAX_CURSOR)) -> EchoResponse | JSONResponse:
    """Read one echo without sending anything. This is what the demo screen watches."""
    service: ChannelService = request.app.state.channel_service
    limiter: RateLimiter = request.app.state.channel_read_limiter
    try:
        limiter.check(client_key(request))
        return await service.read_echo(area.upper(), since)
    except AppError as exc:
        return _error(exc)