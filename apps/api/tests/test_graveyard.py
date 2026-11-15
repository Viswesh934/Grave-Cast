"""Repo graveyard tests: marker parsing and the endpoint, with a mocked GitHub API."""

from __future__ import annotations

from pathlib import Path

import httpx
from httpx import ASGITransport, AsyncClient

from app.common.rate_limit import RateLimiter
from app.main import app
from app.modules.github.client import GitHubClient
from app.modules.github.markers import NOTE_MAX_CHARS, find_markers, sort_markers
from app.modules.github.service import GitHubIngestionService
from app.modules.github.workspace import WorkspaceManager
from tests.test_ingest import (
    _commit_payload,
    _make_handler,
    _make_zipball,
    _repo_payload,
    _settings,
)


def test_find_markers_reads_common_comment_styles() -> None:
    text = "\n".join(
        [
            "const a = 1 // TODO: handle empty input",
            "# FIXME(bob) - breaks on Windows",
            "/* HACK */",
            "<!-- XXX remove before release -->",
            "todo in lower case does not count",
            "TODOS is not a marker",
            "nothing here",
        ]
    )
    found = find_markers("src/a.ts", text)
    assert [(m.kind, m.line, m.note) for m in found] == [
        ("TODO", 1, "handle empty input"),
        ("FIXME", 2, "breaks on Windows"),
        ("HACK", 3, ""),
        ("XXX", 4, "remove before release"),
    ]


def test_find_markers_trims_long_notes() -> None:
    (marker,) = find_markers("a.py", "# TODO " + "x" * 500)
    assert len(marker.note) == NOTE_MAX_CHARS


def test_punctuation_only_note_is_blank() -> None:
    (marker,) = find_markers("t.py", 'assert x == "XXX"')
    assert marker.note == ""


def test_sort_markers_puts_fixme_first() -> None:
    markers = find_markers("b.py", "# TODO later\n# FIXME now") + find_markers("a.py", "# HACK")
    assert [m.kind for m in sort_markers(markers)] == ["FIXME", "HACK", "TODO"]


async def test_graveyard_endpoint_returns_graves_and_deletes_snapshot(tmp_path: Path) -> None:
    settings = _settings(tmp_path)
    zip_bytes = _make_zipball(
        {
            "src/index.ts": "// TODO: cache this\nexport const n = 1;\n",
            "app/main.py": "def f():\n    pass  # FIXME: wrong on empty lists\n",
            "node_modules/pkg/index.js": "// TODO: not ours\n",
            "README.md": "TODO: docs are not read\n",
        }
    )
    routes = {
        ("GET", "/repos/acme/demo"): httpx.Response(200, json=_repo_payload()),
        ("GET", "/repos/acme/demo/commits/main"): httpx.Response(200, json=_commit_payload()),
        ("GET", "/repos/acme/demo/zipball/commitsha1"): httpx.Response(200, content=zip_bytes),
    }
    http_client = httpx.AsyncClient(
        transport=httpx.MockTransport(_make_handler(routes)), base_url="https://api.github.com"
    )
    app.state.ingestion_service = GitHubIngestionService(
        settings=settings,
        client=GitHubClient(settings, client=http_client),
        workspaces=WorkspaceManager(settings),
    )
    app.state.repo_rate_limiter = RateLimiter(10)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/repositories/graveyard", json={"url": "https://github.com/acme/demo"}
        )

    assert response.status_code == 200
    body = response.json()
    assert body["repository"]["fullName"] == "acme/demo"
    assert body["graves"] == [
        {"id": "app/main.py:2", "kind": "FIXME", "path": "app/main.py", "line": 2, "note": "wrong on empty lists"},
        {"id": "src/index.ts:1", "kind": "TODO", "path": "src/index.ts", "line": 1, "note": "cache this"},
    ]
    assert body["stats"]["filesRead"] == 2
    assert body["stats"]["markerCount"] == 2
    assert body["stats"]["languages"] == ["python", "typescript"]
    assert body["truncated"] is False
    root = settings.workspace_root
    assert not root.exists() or not any(root.iterdir())


async def test_graveyard_endpoint_is_rate_limited(tmp_path: Path) -> None:
    app.state.repo_rate_limiter = RateLimiter(0)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/repositories/graveyard", json={"url": "https://github.com/acme/demo"}
        )
    assert response.status_code == 429
    assert response.json()["error"]["code"] == "SCAN_RATE_LIMITED"
