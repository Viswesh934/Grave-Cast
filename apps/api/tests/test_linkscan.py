"""Link scan tests: address blocking, safe redirects, header graves. No live network."""

from __future__ import annotations

import ipaddress
from pathlib import Path

import httpx
import pytest
from httpx import ASGITransport, AsyncClient

from app.common.errors import (
    BlockedAddressError,
    InvalidLinkError,
    TooManyRedirectsError,
)
from app.common.rate_limit import RateLimiter
from app.config import Settings
from app.main import app
from app.modules.linkscan.address import is_public_address, parse_link
from app.modules.linkscan.client import LinkFetcher
from app.modules.linkscan.headers import MISSING_PROTECTION, audit_headers
from app.modules.linkscan.service import LinkScanService

PUBLIC = "93.184.215.14"
PUBLIC_2 = "93.184.215.15"

STRONG_HEADERS = {
    "strict-transport-security": "max-age=63072000; includeSubDomains",
    "content-security-policy": "default-src 'self'; frame-ancestors 'none'",
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy": "camera=()",
}


def _settings(tmp_path: Path, **overrides) -> Settings:
    base = dict(workspace_root=tmp_path / "repositories", link_max_redirects=3)
    base.update(overrides)
    return Settings(**base)


def _resolver(table: dict[str, list[str]]):
    async def resolve(host: str, port: int):
        if host not in table:
            raise OSError("no such host")
        return [ipaddress.ip_address(a) for a in table[host]]

    return resolve


class _ExplodingStream(httpx.AsyncByteStream):
    """A body that fails the test if anyone reads it."""

    async def __aiter__(self):
        raise AssertionError("the page body must never be read")
        yield b""  # pragma: no cover


def _site(routes: dict[str, httpx.Response], seen: list[httpx.Request]):
    def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request)
        host = request.headers["host"]
        key = f"{request.url.scheme}://{host}{request.url.path}"
        return routes.get(key, httpx.Response(404, stream=_ExplodingStream()))

    return httpx.MockTransport(handler)


# Address blocking


@pytest.mark.parametrize(
    ("address", "public"),
    [
        ("8.8.8.8", True),
        ("2606:4700::1111", True),
        ("10.0.0.1", False),
        ("172.16.5.4", False),
        ("192.168.1.1", False),
        ("127.0.0.1", False),
        ("0.0.0.0", False),
        ("100.64.0.1", False),
        ("169.254.169.254", False),
        ("100.100.100.200", False),
        ("224.0.0.1", False),
        ("::1", False),
        ("fe80::1", False),
        ("fd00:ec2::254", False),
        ("::ffff:127.0.0.1", False),
        ("2002:7f00:1::", False),  # 6to4 wrapping 127.0.0.1
        ("64:ff9b::a00:1", False),  # NAT64 wrapping 10.0.0.1
    ],
)
def test_is_public_address(address: str, public: bool) -> None:
    assert is_public_address(ipaddress.ip_address(address)) is public


def test_parse_link_drops_credentials_and_fragment() -> None:
    target = parse_link("https://user:secret@Example.com/a?x=1#top")
    assert str(target.url) == "https://example.com/a?x=1"
    assert target.host == "example.com"
    assert target.port == 443


def test_parse_link_assumes_https() -> None:
    assert str(parse_link("example.com").url) == "https://example.com/"


@pytest.mark.parametrize(
    "link",
    ["http://127.0.0.1/", "http://169.254.169.254/latest/meta-data", "http://[::1]/", "http://localhost/", "http://a.localhost/"],
)
def test_parse_link_blocks_local_literals(link: str) -> None:
    with pytest.raises(BlockedAddressError):
        parse_link(link)


@pytest.mark.parametrize("link", ["ftp://example.com/", "https://example.com:8443/", "", "https://"])
def test_parse_link_refuses_other_links(link: str) -> None:
    with pytest.raises(InvalidLinkError):
        parse_link(link)


# The fetcher


async def test_name_that_resolves_private_is_blocked_before_any_request(tmp_path: Path) -> None:
    seen: list[httpx.Request] = []
    fetcher = LinkFetcher(
        _settings(tmp_path),
        resolver=_resolver({"inside.example": ["10.1.2.3"]}),
        transport=_site({}, seen),
    )
    with pytest.raises(BlockedAddressError):
        await fetcher.fetch(parse_link("https://inside.example/"))
    assert seen == []


async def test_any_private_address_in_the_answer_blocks(tmp_path: Path) -> None:
    seen: list[httpx.Request] = []
    fetcher = LinkFetcher(
        _settings(tmp_path),
        resolver=_resolver({"mixed.example": [PUBLIC, "127.0.0.1"]}),
        transport=_site({}, seen),
    )
    with pytest.raises(BlockedAddressError):
        await fetcher.fetch(parse_link("https://mixed.example/"))
    assert seen == []


async def test_numeric_host_is_checked_after_resolving(tmp_path: Path) -> None:
    # 0x7f000001 is not an address literal to the parser, but resolves to 127.0.0.1.
    fetcher = LinkFetcher(
        _settings(tmp_path),
        resolver=_resolver({"0x7f000001": ["127.0.0.1"]}),
        transport=_site({}, []),
    )
    with pytest.raises(BlockedAddressError):
        await fetcher.fetch(parse_link("http://0x7f000001/"))


async def test_redirect_to_private_address_is_rechecked_and_blocked(tmp_path: Path) -> None:
    seen: list[httpx.Request] = []
    routes = {
        "https://short.example/x": httpx.Response(302, headers={"location": "http://metadata.example/latest"}),
    }
    fetcher = LinkFetcher(
        _settings(tmp_path),
        resolver=_resolver({"short.example": [PUBLIC], "metadata.example": ["169.254.169.254"]}),
        transport=_site(routes, seen),
    )
    with pytest.raises(BlockedAddressError):
        await fetcher.fetch(parse_link("https://short.example/x"))
    assert [r.headers["host"] for r in seen] == ["short.example"]


async def test_redirect_to_a_literal_private_address_is_blocked(tmp_path: Path) -> None:
    routes = {"https://short.example/x": httpx.Response(301, headers={"location": "http://192.168.0.1/admin"})}
    fetcher = LinkFetcher(
        _settings(tmp_path),
        resolver=_resolver({"short.example": [PUBLIC]}),
        transport=_site(routes, []),
    )
    with pytest.raises(BlockedAddressError):
        await fetcher.fetch(parse_link("https://short.example/x"))


async def test_redirects_are_capped(tmp_path: Path) -> None:
    routes = {"https://loop.example/": httpx.Response(302, headers={"location": "/"})}
    seen: list[httpx.Request] = []
    fetcher = LinkFetcher(
        _settings(tmp_path, link_max_redirects=3),
        resolver=_resolver({"loop.example": [PUBLIC]}),
        transport=_site(routes, seen),
    )
    with pytest.raises(TooManyRedirectsError):
        await fetcher.fetch(parse_link("https://loop.example/"))
    assert len(seen) == 4


async def test_connects_to_the_checked_address_and_never_reads_the_body(tmp_path: Path) -> None:
    seen: list[httpx.Request] = []
    routes = {"https://site.example/": httpx.Response(200, headers=STRONG_HEADERS, stream=_ExplodingStream())}
    fetcher = LinkFetcher(
        _settings(tmp_path),
        resolver=_resolver({"site.example": [PUBLIC]}),
        transport=_site(routes, seen),
    )
    outcome = await fetcher.fetch(parse_link("https://site.example/"))
    assert outcome.status == 200
    assert seen[0].url.host == PUBLIC
    assert seen[0].headers["host"] == "site.example"
    assert seen[0].extensions["sni_hostname"] == "site.example"
    assert str(outcome.final_url) == "https://site.example/"


# Header graves


def test_every_missing_header_becomes_a_grave() -> None:
    graves = audit_headers(httpx.Headers({}), secure=True)
    assert {g.id for g in graves} == {
        "header-hsts",
        "header-csp",
        "header-nosniff",
        "header-framing",
        "header-referrer",
        "header-permissions",
    }
    assert all(g.label == MISSING_PROTECTION for g in graves)
    assert all("safe" not in (g.title + g.detail).lower() for g in graves)


def test_strong_headers_leave_no_graves() -> None:
    assert audit_headers(httpx.Headers(STRONG_HEADERS), secure=True) == []


def test_hsts_is_only_judged_over_https() -> None:
    ids = {g.id for g in audit_headers(httpx.Headers({}), secure=False)}
    assert "header-hsts" not in ids


def test_hsts_turned_off_counts_as_missing() -> None:
    headers = httpx.Headers({**STRONG_HEADERS, "strict-transport-security": "max-age=0"})
    graves = audit_headers(headers, secure=True)
    assert [g.id for g in graves] == ["header-hsts"]
    assert "max-age=0" in graves[0].evidence


def test_x_frame_options_alone_covers_framing() -> None:
    headers = {k: v for k, v in STRONG_HEADERS.items() if k != "content-security-policy"}
    headers["x-frame-options"] = "DENY"
    ids = {g.id for g in audit_headers(httpx.Headers(headers), secure=True)}
    assert "header-framing" not in ids
    assert "header-csp" in ids


# The endpoint


def _install(tmp_path: Path, routes: dict[str, httpx.Response], table: dict[str, list[str]], per_minute: int = 20) -> None:
    settings = _settings(tmp_path)
    fetcher = LinkFetcher(settings, resolver=_resolver(table), transport=_site(routes, []))
    app.state.link_scan_service = LinkScanService(settings=settings, fetcher=fetcher)
    app.state.link_rate_limiter = RateLimiter(per_minute)


async def test_scan_endpoint_reports_redirect_and_missing_headers(tmp_path: Path) -> None:
    routes = {
        "https://bit.example/abc": httpx.Response(301, headers={"location": "https://www.landing.example/"}),
        "https://www.landing.example/": httpx.Response(200, headers={"x-content-type-options": "nosniff"}),
    }
    _install(tmp_path, routes, {"bit.example": [PUBLIC], "www.landing.example": [PUBLIC_2]})
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/linkscan/scan", json={"url": "https://bit.example/abc"})

    assert response.status_code == 200
    body = response.json()
    assert body["finalUrl"] == "https://www.landing.example/"
    assert body["headersChecked"] is True
    assert body["hops"] == [{"url": "https://bit.example/abc", "status": 301}]
    ids = [g["id"] for g in body["graves"]]
    assert ids[0] == "redirect-elsewhere"
    assert "header-nosniff" not in ids
    assert {"header-hsts", "header-csp", "header-framing"} <= set(ids)


async def test_scan_endpoint_flags_https_dropped_to_http(tmp_path: Path) -> None:
    routes = {
        "https://site.example/": httpx.Response(302, headers={"location": "http://site.example/plain"}),
        "http://site.example/plain": httpx.Response(200),
    }
    _install(tmp_path, routes, {"site.example": [PUBLIC]})
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        body = (await client.post("/api/linkscan/scan", json={"url": "https://site.example/"})).json()
    ids = [g["id"] for g in body["graves"]]
    assert ids[0] == "redirect-drops-https"
    assert "header-hsts" not in ids


async def test_scan_endpoint_returns_blocked_address_error(tmp_path: Path) -> None:
    _install(tmp_path, {}, {})
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/linkscan/scan", json={"url": "http://10.0.0.5/"})
    assert response.status_code == 400
    assert response.json() == {
        "error": {
            "code": "BLOCKED_ADDRESS",
            "message": "This link points to a private or local address, so it was not opened.",
        }
    }


async def test_scan_endpoint_is_rate_limited(tmp_path: Path) -> None:
    routes = {"https://site.example/": httpx.Response(200, headers=STRONG_HEADERS)}
    _install(tmp_path, routes, {"site.example": [PUBLIC]}, per_minute=1)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        first = await client.post("/api/linkscan/scan", json={"url": "https://site.example/"})
        second = await client.post("/api/linkscan/scan", json={"url": "https://site.example/"})
    assert first.status_code == 200
    assert first.json()["graves"] == []
    assert second.status_code == 429
    assert second.json()["error"]["code"] == "SCAN_RATE_LIMITED"
