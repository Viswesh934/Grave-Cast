"""Ingestion API and service tests with a mocked GitHub API."""

from __future__ import annotations

import base64
import io
import json
import zipfile
from pathlib import Path

import httpx
import pytest
from httpx import ASGITransport, AsyncClient

from app.common.errors import (
    FileLimitExceededError,
    PrivateRepositoryError,
    RateLimitExceededError,
    RepositoryNotFoundError,
    RepositoryTooLargeError,
)
from app.config import Settings
from app.main import app
from app.modules.github.client import GitHubClient
from app.modules.github.service import GitHubIngestionService
from app.modules.github.workspace import WorkspaceManager


def _repo_payload(*, private: bool = False, size: int = 10) -> dict:
    return {
        "name": "demo",
        "full_name": "acme/demo",
        "private": private,
        "default_branch": "main",
        "size": size,
        "language": "TypeScript",
    }


def _commit_payload(
    commit_sha: str = "commitsha1", tree_sha: str = "treesha1"
) -> dict:
    return {
        "sha": commit_sha,
        "commit": {"tree": {"sha": tree_sha}},
    }


def _make_zipball(files: dict[str, str]) -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for path, content in files.items():
            full_path = f"acme-demo-commitsha1/{path}"
            zf.writestr(full_path, content)
    return buf.getvalue()


def _make_handler(routes: dict[tuple[str, str], httpx.Response]):
    def handler(request: httpx.Request) -> httpx.Response:
        key = (request.method, request.url.path)
        if key in routes:
            return routes[key]
        for (method, path), response in routes.items():
            if method == request.method and request.url.path == path:
                return response
        return httpx.Response(404, json={"message": "Not Found"})

    return handler


def _settings(tmp_path: Path, **overrides) -> Settings:
    base = dict(
        workspace_root=tmp_path / "repositories",
        max_repo_size_kb=1_000,
        max_files=50,
        max_file_size_bytes=10_000,
        max_total_bytes=50_000,
        max_concurrency=4,
        request_timeout_seconds=5.0,
        max_retries=0,
        github_token=None,
    )
    base.update(overrides)
    return Settings(**base)


@pytest.fixture
def ingest_env(tmp_path: Path):
    settings = _settings(tmp_path)
    zip_bytes = _make_zipball(
        {
            "src/index.ts": "export const n = 1;\n",
            "scripts/main.py": "print('hi')\n",
            "node_modules/pkg/index.js": "console.log('skip');\n",
            "assets/logo.png": "binarycontent",
        }
    )
    routes = {
        ("GET", "/repos/acme/demo"): httpx.Response(
            200, json=_repo_payload()
        ),
        ("GET", "/repos/acme/demo/commits/main"): httpx.Response(
            200, json=_commit_payload()
        ),
        ("GET", "/repos/acme/demo/zipball/commitsha1"): httpx.Response(
            200, content=zip_bytes
        ),
    }
    transport = httpx.MockTransport(_make_handler(routes))
    http_client = httpx.AsyncClient(
        transport=transport,
        base_url="https://api.github.com",
    )
    gh = GitHubClient(settings, client=http_client)
    service = GitHubIngestionService(
        settings=settings,
        client=gh,
        workspaces=WorkspaceManager(settings),
    )
    return settings, service, routes


@pytest.mark.asyncio
async def test_ingest_valid_public_repo(ingest_env) -> None:
    settings, service, _ = ingest_env
    result = await service.ingest("https://github.com/acme/demo")

    assert result.repository.full_name == "acme/demo"
    assert result.repository.commit_sha == "commitsha1"
    assert result.repository.tree_sha == "treesha1"
    assert result.snapshot.status == "ready"
    assert result.snapshot.id.startswith("snapshot-")
    assert {f.path for f in result.files} == {
        "src/index.ts",
        "scripts/main.py",
    }
    assert result.stats.files_discovered == 4  # src/index.ts, scripts/main.py, node_modules/pkg/index.js, assets/logo.png
    assert result.stats.files_selected == 2
    assert result.stats.files_fetched == 2

    # Response contract: no source contents, no absolute paths
    dumped = result.model_dump(by_alias=True)
    payload = json.dumps(dumped)
    assert "export const" not in payload
    assert "print(" not in payload
    assert str(settings.workspace_root.resolve()) not in payload
    for file_info in dumped["files"]:
        assert ".." not in file_info["path"]
        assert not file_info["path"].startswith("/")

    root = settings.workspace_root / result.snapshot.id
    assert (root / "metadata.json").is_file()
    assert (root / "source" / "src" / "index.ts").read_text(
        encoding="utf-8"
    ) == "export const n = 1;\n"
    assert (root / "source" / "scripts" / "main.py").read_text(
        encoding="utf-8"
    ) == "print('hi')\n"

    manifest = json.loads((root / "metadata.json").read_text(encoding="utf-8"))
    assert "content" not in json.dumps(manifest)
    assert manifest["commit_sha"] == "commitsha1"


@pytest.mark.asyncio
async def test_ingest_accepts_git_suffix(ingest_env) -> None:
    _, service, _ = ingest_env
    result = await service.ingest("https://github.com/acme/demo.git")
    assert result.repository.name == "demo"


@pytest.mark.asyncio
async def test_ingest_rejects_private_repo(tmp_path: Path) -> None:
    settings = _settings(tmp_path)
    routes = {
        ("GET", "/repos/acme/secret"): httpx.Response(
            200, json=_repo_payload(private=True)
        ),
    }
    transport = httpx.MockTransport(_make_handler(routes))
    client = GitHubClient(
        settings,
        client=httpx.AsyncClient(
            transport=transport, base_url="https://api.github.com"
        ),
    )
    service = GitHubIngestionService(settings=settings, client=client)
    with pytest.raises(PrivateRepositoryError):
        await service.ingest("https://github.com/acme/secret")


@pytest.mark.asyncio
async def test_ingest_rejects_missing_repo(tmp_path: Path) -> None:
    settings = _settings(tmp_path)
    routes = {
        ("GET", "/repos/acme/missing"): httpx.Response(
            404, json={"message": "Not Found"}
        ),
    }
    transport = httpx.MockTransport(_make_handler(routes))
    client = GitHubClient(
        settings,
        client=httpx.AsyncClient(
            transport=transport, base_url="https://api.github.com"
        ),
    )
    service = GitHubIngestionService(settings=settings, client=client)
    with pytest.raises(RepositoryNotFoundError):
        await service.ingest("https://github.com/acme/missing")


@pytest.mark.asyncio
async def test_ingest_rejects_oversized_repo(tmp_path: Path) -> None:
    settings = _settings(tmp_path, max_repo_size_kb=5)
    routes = {
        ("GET", "/repos/acme/huge"): httpx.Response(
            200, json=_repo_payload(size=100)
        ),
    }
    transport = httpx.MockTransport(_make_handler(routes))
    client = GitHubClient(
        settings,
        client=httpx.AsyncClient(
            transport=transport, base_url="https://api.github.com"
        ),
    )
    service = GitHubIngestionService(settings=settings, client=client)
    with pytest.raises(RepositoryTooLargeError):
        await service.ingest("https://github.com/acme/huge")


@pytest.mark.asyncio
async def test_ingest_rejects_too_many_files(tmp_path: Path) -> None:
    settings = _settings(tmp_path, max_files=1)
    zip_bytes = _make_zipball(
        {
            "a.py": "a = 1\n",
            "b.py": "b = 2\n",
        }
    )
    routes = {
        ("GET", "/repos/acme/demo"): httpx.Response(
            200, json=_repo_payload()
        ),
        ("GET", "/repos/acme/demo/commits/main"): httpx.Response(
            200, json=_commit_payload()
        ),
        ("GET", "/repos/acme/demo/zipball/commitsha1"): httpx.Response(
            200, content=zip_bytes
        ),
    }
    transport = httpx.MockTransport(_make_handler(routes))
    client = GitHubClient(
        settings,
        client=httpx.AsyncClient(
            transport=transport, base_url="https://api.github.com"
        ),
    )
    service = GitHubIngestionService(settings=settings, client=client)
    with pytest.raises(FileLimitExceededError):
        await service.ingest("https://github.com/acme/demo")


@pytest.mark.asyncio
async def test_ingest_rate_limit(tmp_path: Path) -> None:
    settings = _settings(tmp_path)
    routes = {
        ("GET", "/repos/acme/demo"): httpx.Response(
            403,
            json={"message": "API rate limit exceeded"},
            headers={"X-RateLimit-Remaining": "0"},
        ),
    }
    transport = httpx.MockTransport(_make_handler(routes))
    client = GitHubClient(
        settings,
        client=httpx.AsyncClient(
            transport=transport, base_url="https://api.github.com"
        ),
    )
    service = GitHubIngestionService(settings=settings, client=client)
    with pytest.raises(RateLimitExceededError):
        await service.ingest("https://github.com/acme/demo")


@pytest.mark.asyncio
async def test_ingest_skips_oversized_individual_files(tmp_path: Path) -> None:
    settings = _settings(tmp_path, max_file_size_bytes=10)
    zip_bytes = _make_zipball(
        {
            "small.py": "hi\n",
            "big.py": "this is a very long string exceeding ten bytes\n",
        }
    )
    routes = {
        ("GET", "/repos/acme/demo"): httpx.Response(
            200, json=_repo_payload()
        ),
        ("GET", "/repos/acme/demo/commits/main"): httpx.Response(
            200, json=_commit_payload()
        ),
        ("GET", "/repos/acme/demo/zipball/commitsha1"): httpx.Response(
            200, content=zip_bytes
        ),
    }
    transport = httpx.MockTransport(_make_handler(routes))
    client = GitHubClient(
        settings,
        client=httpx.AsyncClient(
            transport=transport, base_url="https://api.github.com"
        ),
    )
    service = GitHubIngestionService(settings=settings, client=client)
    result = await service.ingest("https://github.com/acme/demo")
    assert [f.path for f in result.files] == ["small.py"]


@pytest.mark.asyncio
async def test_ingest_empty_supported_files(tmp_path: Path) -> None:
    settings = _settings(tmp_path)
    zip_bytes = _make_zipball(
        {
            "readme.md": "hello\n",
        }
    )
    routes = {
        ("GET", "/repos/acme/demo"): httpx.Response(
            200, json=_repo_payload()
        ),
        ("GET", "/repos/acme/demo/commits/main"): httpx.Response(
            200, json=_commit_payload()
        ),
        ("GET", "/repos/acme/demo/zipball/commitsha1"): httpx.Response(
            200, content=zip_bytes
        ),
    }
    transport = httpx.MockTransport(_make_handler(routes))
    client = GitHubClient(
        settings,
        client=httpx.AsyncClient(
            transport=transport, base_url="https://api.github.com"
        ),
    )
    service = GitHubIngestionService(settings=settings, client=client)
    result = await service.ingest("https://github.com/acme/demo")
    assert result.files == []
    assert result.stats.files_fetched == 0
    assert result.snapshot.status == "ready"


@pytest.mark.asyncio
async def test_api_ingest_endpoint(tmp_path: Path) -> None:
    settings = _settings(tmp_path)
    zip_bytes = _make_zipball(
        {
            "main.go": "package main\n",
        }
    )
    routes = {
        ("GET", "/repos/acme/demo"): httpx.Response(
            200, json=_repo_payload()
        ),
        ("GET", "/repos/acme/demo/commits/main"): httpx.Response(
            200, json=_commit_payload()
        ),
        ("GET", "/repos/acme/demo/zipball/commitsha1"): httpx.Response(
            200, content=zip_bytes
        ),
    }
    transport = httpx.MockTransport(_make_handler(routes))
    http_client = httpx.AsyncClient(
        transport=transport, base_url="https://api.github.com"
    )
    gh = GitHubClient(settings, client=http_client)
    service = GitHubIngestionService(
        settings=settings,
        client=gh,
        workspaces=WorkspaceManager(settings),
    )

    app.state.ingestion_service = service
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        ok = await client.post(
            "/api/repositories/ingest",
            json={"url": "https://github.com/acme/demo"},
        )
        bad = await client.post(
            "/api/repositories/ingest",
            json={"url": "https://gitlab.com/acme/demo"},
        )

    assert ok.status_code == 200
    body = ok.json()
    assert body["repository"]["fullName"] == "acme/demo"
    assert body["files"][0]["path"] == "main.go"
    assert body["files"][0]["language"] == "go"
    assert "blobSha" in body["files"][0]
    assert bad.status_code == 400
    assert bad.json()["error"]["code"] == "UNSUPPORTED_HOST"


@pytest.mark.asyncio
async def test_workspace_cleanup(tmp_path: Path) -> None:
    settings = _settings(tmp_path, workspace_ttl_seconds=0)
    manager = WorkspaceManager(settings)
    ws = manager.create()
    manager.write_source_file(ws, "a.py", b"x = 1\n")
    assert ws.root.exists()
    manager.delete(ws.snapshot_id)
    assert not ws.root.exists()

    ws2 = manager.create()
    deleted = manager.cleanup_abandoned()
    assert deleted >= 1
    assert not ws2.root.exists()
