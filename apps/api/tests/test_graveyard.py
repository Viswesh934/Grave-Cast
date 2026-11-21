"""Repo graveyard tests: marker parsing and the endpoint, with a mocked GitHub API."""

from __future__ import annotations

import json
from pathlib import Path

import httpx
from httpx import ASGITransport, AsyncClient

from app.common.rate_limit import RateLimiter
from app.main import app
from app.modules.github.client import GitHubClient
from app.modules.github.markers import NOTE_MAX_CHARS, find_markers, sort_markers
from app.modules.github.scan.osv import OsvClient
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


def _osv_handler(request: httpx.Request) -> httpx.Response:
    if request.url.path == "/v1/querybatch":
        queries = json.loads(request.content)["queries"]
        results = [
            {"vulns": [{"id": "GHSA-test-0001"}]} if q["package"]["name"] == "lodash" else {}
            for q in queries
        ]
        return httpx.Response(200, json={"results": results})
    if request.url.path == "/v1/vulns/GHSA-test-0001":
        return httpx.Response(
            200,
            json={
                "id": "GHSA-test-0001",
                "summary": "Prototype pollution in lodash",
                "database_specific": {"severity": "HIGH"},
                "affected": [
                    {
                        "package": {"ecosystem": "npm", "name": "lodash"},
                        "ranges": [{"type": "SEMVER", "events": [{"introduced": "0"}, {"fixed": "4.17.21"}]}],
                    }
                ],
            },
        )
    return httpx.Response(404)


_AWS_KEY = "AKIA" + "Q3EGRCDPKVLMNWTZ"  # built in two parts so the test file itself holds no key


async def test_graveyard_endpoint_returns_graves(tmp_path: Path) -> None:
    settings = _settings(tmp_path)
    package_lock = {
        "lockfileVersion": 3,
        "packages": {
            "": {"name": "demo"},
            "node_modules/lodash": {"version": "4.17.20"},
            "node_modules/left-pad": {"version": "1.3.0"},
        },
    }
    zip_bytes = _make_zipball(
        {
            "src/index.ts": "// TODO: cache this\nexport const n = 1;\n",
            "app/main.py": (
                "import os\n"
                "def f(request):\n"
                "    os.system('ls ' + request.args['dir'])  # FIXME: wrong on empty lists\n"
            ),
            "config.py": f'KEY = "{_AWS_KEY}"\n',
            "package.json": json.dumps({"dependencies": {"express": "^4.21.0", "lodash": "^4.17.20"}}),
            "package-lock.json": json.dumps(package_lock),
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
    osv_http = httpx.AsyncClient(transport=httpx.MockTransport(_osv_handler), base_url="https://api.osv.dev")
    app.state.ingestion_service = GitHubIngestionService(
        settings=settings,
        client=GitHubClient(settings, client=http_client),
        workspaces=WorkspaceManager(settings),
        osv=OsvClient(settings, client=osv_http),
    )
    app.state.repo_rate_limiter = RateLimiter(10)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/repositories/graveyard", json={"url": "https://github.com/acme/demo"}
        )

    assert response.status_code == 200
    assert _AWS_KEY not in response.text
    body = response.json()
    assert body["schemaVersion"] == 2
    assert body["repository"]["fullName"] == "acme/demo"
    assert body["repository"]["openIssues"] == 42
    rules = [g["rule"] for g in body["graves"]]
    assert rules == [
        "secret.aws-access-key",
        "py.command-injection",
        "dep.vulnerable",
        "prj.no-rate-limiting",
        "note.marker",
        "prj.no-security-headers",
        "note.marker",
    ]
    by_rule = {g["rule"]: g for g in body["graves"]}
    command = by_rule["py.command-injection"]
    assert command["severity"] == "critical"
    assert command["confidence"] == "confirmed"
    assert command["path"] == "app/main.py" and command["line"] == 3
    assert command["cwe"] == "CWE-78"
    assert command["owasp"] == "A05:2025 Injection"
    dep = by_rule["dep.vulnerable"]
    assert dep["severity"] == "high"
    assert dep["package"] == {"ecosystem": "npm", "name": "lodash", "version": "4.17.20", "fixedIn": "4.17.21", "dev": False}
    assert dep["path"] == "package-lock.json"
    assert {"label": "GHSA-test-0001", "url": "https://osv.dev/vulnerability/GHSA-test-0001"} in dep["references"]
    assert by_rule["secret.aws-access-key"]["snippet"] == 'KEY = "AKIA\u2026 (20 characters)"'
    notes = [g for g in body["graves"] if g["rule"] == "note.marker"]
    assert [(n["title"], n["path"], n["detail"]) for n in notes] == [
        ("FIXME", "app/main.py", "wrong on empty lists"),
        ("TODO", "src/index.ts", "cache this"),
    ]
    assert body["summary"]["total"] == 7
    assert body["summary"]["bySeverity"] == {"critical": 2, "high": 1, "medium": 1, "low": 2, "info": 1}
    assert [c["id"] for c in body["checks"]] == ["dependencies", "secrets", "code", "config", "project", "markers"]
    assert {c["id"]: c["status"] for c in body["checks"]}["dependencies"] == "ran"
    assert {c["id"]: c["status"] for c in body["checks"]}["config"] == "skipped"
    assert body["stats"]["lockfiles"] == ["package-lock.json"]
    assert body["stats"]["packagesChecked"] == 2
    assert body["stats"]["markerCount"] == 2
    assert body["stats"]["languages"] == ["json", "python", "typescript"]
    assert body["truncated"] is False
    root = settings.workspace_root
    assert not root.exists() or not any(root.iterdir())


async def test_graveyard_reports_osv_outage_without_failing(tmp_path: Path) -> None:
    settings = _settings(tmp_path)
    zip_bytes = _make_zipball(
        {"package-lock.json": json.dumps({"lockfileVersion": 3, "packages": {"node_modules/lodash": {"version": "4.17.20"}}})}
    )
    routes = {
        ("GET", "/repos/acme/demo"): httpx.Response(200, json=_repo_payload()),
        ("GET", "/repos/acme/demo/commits/main"): httpx.Response(200, json=_commit_payload()),
        ("GET", "/repos/acme/demo/zipball/commitsha1"): httpx.Response(200, content=zip_bytes),
    }
    http_client = httpx.AsyncClient(transport=httpx.MockTransport(_make_handler(routes)), base_url="https://api.github.com")
    osv_http = httpx.AsyncClient(
        transport=httpx.MockTransport(lambda request: httpx.Response(503)), base_url="https://api.osv.dev"
    )
    service = GitHubIngestionService(
        settings=settings,
        client=GitHubClient(settings, client=http_client),
        workspaces=WorkspaceManager(settings),
        osv=OsvClient(settings, client=osv_http),
    )
    result = await service.graveyard("https://github.com/acme/demo")
    dependencies = next(c for c in result.checks if c.id == "dependencies")
    assert dependencies.status == "failed"
    assert "OSV.dev" in dependencies.detail
    assert result.graves == []


async def test_graveyard_endpoint_is_rate_limited(tmp_path: Path) -> None:
    app.state.repo_rate_limiter = RateLimiter(0)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/repositories/graveyard", json={"url": "https://github.com/acme/demo"}
        )
    assert response.status_code == 429
    assert response.json()["error"]["code"] == "SCAN_RATE_LIMITED"
