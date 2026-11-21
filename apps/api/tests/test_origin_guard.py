"""Tests for the origin secret guard and its settings."""
from __future__ import annotations

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from app.common.origin_guard import OriginGuard, check_origin_config
from app.config import Settings

SECRET = "a" * 40
OLD_SECRET = "b" * 40


def _app(*secrets: str) -> FastAPI:
    app = FastAPI()
    app.add_middleware(OriginGuard, secrets=secrets)

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/api/thing")
    async def thing() -> dict[str, str]:
        return {"thing": "yes"}

    @app.get("/other")
    async def other() -> dict[str, str]:
        return {"other": "yes"}

    return app


async def _get(app: FastAPI, path: str, headers: dict[str, str] | None = None):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        return await client.get(path, headers=headers)


async def test_health_needs_no_secret() -> None:
    response = await _get(_app(SECRET), "/health")
    assert response.status_code == 200


@pytest.mark.parametrize("headers", [None, {"x-origin-secret": ""}, {"x-origin-secret": "wrong"}, {"x-origin-secret": SECRET[:-1]}])
async def test_api_refuses_a_missing_or_wrong_secret(headers: dict[str, str] | None) -> None:
    response = await _get(_app(SECRET), "/api/thing", headers)
    assert response.status_code == 403
    assert response.json() == {"error": {"code": "ORIGIN_NOT_ALLOWED", "message": "This request is not allowed."}}


async def test_api_accepts_the_right_secret() -> None:
    response = await _get(_app(SECRET), "/api/thing", {"x-origin-secret": SECRET})
    assert response.status_code == 200
    assert response.json() == {"thing": "yes"}


async def test_other_paths_are_refused_too() -> None:
    # Default deny: /docs and /openapi.json are not left open either.
    response = await _get(_app(SECRET), "/other")
    assert response.status_code == 403


async def test_either_secret_works_while_one_is_being_rotated() -> None:
    app = _app(SECRET, OLD_SECRET)
    assert (await _get(app, "/api/thing", {"x-origin-secret": SECRET})).status_code == 200
    assert (await _get(app, "/api/thing", {"x-origin-secret": OLD_SECRET})).status_code == 200
    assert (await _get(app, "/api/thing", {"x-origin-secret": "c" * 40})).status_code == 403


async def test_the_refusal_never_repeats_the_secret() -> None:
    response = await _get(_app(SECRET), "/api/thing", {"x-origin-secret": "guess"})
    assert SECRET not in response.text
    assert "guess" not in response.text


def test_startup_stops_when_required_and_missing() -> None:
    with pytest.raises(RuntimeError, match="GRAVECAST_ORIGIN_SECRET is required"):
        check_origin_config((), required=True, min_chars=32)


def test_startup_stops_on_a_short_secret_without_printing_it() -> None:
    with pytest.raises(RuntimeError) as caught:
        check_origin_config(("short",), required=False, min_chars=32)
    assert "short" not in str(caught.value)


def test_startup_allows_no_secret_when_not_required() -> None:
    check_origin_config((), required=False, min_chars=32)


def test_startup_allows_long_secrets() -> None:
    check_origin_config((SECRET, OLD_SECRET), required=True, min_chars=32)


def test_settings_read_several_secrets_and_the_required_flag(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("GRAVECAST_ORIGIN_SECRET", f"{SECRET}, {OLD_SECRET}")
    monkeypatch.setenv("GRAVECAST_REQUIRE_ORIGIN_SECRET", "true")
    settings = Settings.from_env()
    assert settings.origin_secrets == (SECRET, OLD_SECRET)
    assert settings.require_origin_secret is True


def test_settings_default_to_no_guard(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("GRAVECAST_ORIGIN_SECRET", raising=False)
    monkeypatch.delenv("GRAVECAST_REQUIRE_ORIGIN_SECRET", raising=False)
    settings = Settings.from_env()
    assert settings.origin_secrets == ()
    assert settings.require_origin_secret is False
