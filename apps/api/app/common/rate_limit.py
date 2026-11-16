"""A small in-memory, per-client rate limit for scan endpoints."""

from __future__ import annotations

import time
from collections import deque
from collections.abc import Callable

from fastapi import Request

from app.common.errors import AppError, ScanRateLimitedError

_WINDOW_SECONDS = 60.0
_MAX_TRACKED_CLIENTS = 10_000


class RateLimiter:
    """Allows `per_minute` calls per client key in any rolling 60-second window.

    State lives in this process only, which is enough for a prototype with one
    server. Behind a proxy every visitor may share one address; that only makes
    the limit stricter.
    """

    def __init__(
        self,
        per_minute: int,
        clock: Callable[[], float] = time.monotonic,
        error: Callable[[], AppError] = ScanRateLimitedError,
    ) -> None:
        self._per_minute = per_minute
        self._clock = clock
        self._error = error
        self._calls: dict[str, deque[float]] = {}

    def check(self, key: str) -> None:
        """Records one call for `key`, or raises if the limit is reached."""
        now = self._clock()
        calls = self._calls.setdefault(key, deque())
        while calls and now - calls[0] >= _WINDOW_SECONDS:
            calls.popleft()
        if len(calls) >= self._per_minute:
            raise self._error()
        calls.append(now)
        # Forget clients that have gone quiet, so the table stays small.
        if len(self._calls) > _MAX_TRACKED_CLIENTS:
            stale = [k for k, v in self._calls.items() if not v or now - v[-1] >= _WINDOW_SECONDS]
            for k in stale:
                del self._calls[k]


def client_key(request: Request) -> str:
    """The caller's address as the server sees it."""
    return request.client.host if request.client else "unknown"
