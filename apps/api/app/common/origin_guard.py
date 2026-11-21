"""Refuses requests that did not come through our website's proxy."""
from __future__ import annotations

import hmac
import json
from collections.abc import Iterable

from starlette.types import ASGIApp, Message, Receive, Scope, Send

from app.common.errors import AppError, OriginNotAllowedError

HEADER_NAME = b"x-origin-secret"
# The only path answered without the secret: the deploy's health check and the
# adapter's readiness check call it directly.
OPEN_PATHS: frozenset[str] = frozenset({"/health"})
# 1008 is the WebSocket "policy violation" close code.
_WEBSOCKET_POLICY_CLOSE = 1008


def check_origin_config(secrets: Iterable[str], *, required: bool, min_chars: int) -> None:
    """Stops startup when the guard is required but has no usable secret.

    The messages never contain a secret.
    """
    values = tuple(secrets)
    if not values:
        if required:
            raise RuntimeError("GRAVECAST_ORIGIN_SECRET is required here but is not set.")
        return
    if any(len(value) < min_chars for value in values):
        raise RuntimeError(f"Every GRAVECAST_ORIGIN_SECRET value must be at least {min_chars} characters.")


class OriginGuard:
    """ASGI middleware: everything except the open paths needs `x-origin-secret`.

    Several secrets are accepted at once, so one can be rotated without a gap.
    The comparison takes the same time whichever secret matches, or none.
    """

    def __init__(self, app: ASGIApp, secrets: Iterable[str]) -> None:
        self.app = app
        self._secrets = tuple(value.encode("utf-8") for value in secrets if value)

    def _allowed(self, scope: Scope) -> bool:
        if scope["path"] in OPEN_PATHS:
            return True
        supplied = next((value for name, value in scope["headers"] if name == HEADER_NAME), b"")
        matched = False
        for secret in self._secrets:
            matched |= hmac.compare_digest(supplied, secret)
        return matched

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] not in ("http", "websocket") or self._allowed(scope):
            await self.app(scope, receive, send)
            return
        if scope["type"] == "websocket":
            await send({"type": "websocket.close", "code": _WEBSOCKET_POLICY_CLOSE})
            return
        await _send_error(send, OriginNotAllowedError())


async def _send_error(send: Send, error: AppError) -> None:
    body = json.dumps({"error": {"code": error.code, "message": error.message}}).encode("utf-8")
    start: Message = {
        "type": "http.response.start",
        "status": error.status_code,
        "headers": [(b"content-type", b"application/json"), (b"content-length", str(len(body)).encode("ascii"))],
    }
    await send(start)
    await send({"type": "http.response.body", "body": body})
