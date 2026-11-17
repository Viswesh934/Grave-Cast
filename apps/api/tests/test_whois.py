"""Domain age over WHOIS: parsing, the two-step lookup, address blocking, time limits, and the scan's graves."""

from __future__ import annotations

import asyncio
import ipaddress
from datetime import date, datetime, timezone
from pathlib import Path

import httpx
import pytest
from httpx import ASGITransport, AsyncClient

from app.common.rate_limit import RateLimiter
from app.config import Settings
from app.main import app
from app.modules.linkscan.client import LinkFetcher
from app.modules.linkscan.service import LinkScanService
from app.modules.linkscan.types import DomainRecord
from app.modules.linkscan.whois import WhoisLookup, age_graves, parse_created, referral, registrable_domain
from tests.test_linkscan import PUBLIC, PUBLIC_2, _resolver, _site

NOW = datetime(2026, 11, 17, 12, 0, tzinfo=timezone.utc)

IANA_COM = """% IANA WHOIS server
refer:        whois.verisign-grs.com

domain:       COM
created:      1985-01-01
"""

VERISIGN_YOUNG = """   Domain Name: CYCLONE-RELIEF-DONATE.COM
   Registrar WHOIS Server: whois.example-registrar.com
   Updated Date: 2026-11-14T09:00:00Z
   Creation Date: 2026-11-14T08:12:44Z
"""


def _settings(tmp_path: Path, **overrides) -> Settings:
    base = dict(workspace_root=tmp_path / "repositories", link_max_redirects=3)
    base.update(overrides)
    return Settings(**base)


# Pure parts


@pytest.mark.parametrize(
    ("host", "domain"),
    [
        ("www.example.com", "example.com"),
        ("shop.example.co.uk", "example.co.uk"),
        ("example.com.au", "example.com.au"),
        ("a.b.example.org", "example.org"),
        ("example.de", "example.de"),
        ("localhost", None),
        ("93.184.215.14", None),
        ("[2606:4700::1111]", None),
    ],
)
def test_registrable_domain(host: str, domain: str | None) -> None:
    assert registrable_domain(host) == domain


def test_referral_reads_refer_and_refuses_odd_hosts() -> None:
    assert referral(IANA_COM) == "whois.verisign-grs.com"
    assert referral("whois: whois.nic.uk\n") == "whois.nic.uk"
    assert referral("refer: 10.0.0.1:43/../x\n") is None
    assert referral("no referral here") is None


@pytest.mark.parametrize(
    ("reply", "day"),
    [
        (VERISIGN_YOUNG, date(2026, 11, 14)),
        ("created:      2001-05-31\n", date(2001, 5, 31)),
        ("Registered on: 01-Jan-2010\n", date(2010, 1, 1)),
        ("Registration Time: 2019-07-02 10:00:00\n", date(2019, 7, 2)),
        ("created: 31.12.2015\n", date(2015, 12, 31)),
        ("created: 20200102\n", date(2020, 1, 2)),
    ],
)
def test_parse_created_formats(reply: str, day: date) -> None:
    found = parse_created(reply)
    assert found is not None and found[0] == day


def test_parse_created_keeps_the_record_line_and_skips_nonsense() -> None:
    found = parse_created(VERISIGN_YOUNG)
    assert found is not None and found[1] == "Creation Date: 2026-11-14T08:12:44Z"
    assert parse_created("Creation Date: 1970-01-01\n") is None
    assert parse_created("Creation Date: not a date\n") is None
    assert parse_created("Updated Date: 2026-11-14\n") is None


def _record(days: int) -> DomainRecord:
    return DomainRecord(domain="x.com", server="whois.test", created="2026-01-01", line="Creation Date: 2026-01-01", age_days=days)


def test_age_graves_by_age(tmp_path: Path) -> None:
    s = _settings(tmp_path)
    assert age_graves(_record(3), s)[0].severity == "warning"
    assert age_graves(_record(3), s)[0].title == "Very new site"
    assert age_graves(_record(90), s)[0].severity == "caution"
    assert age_graves(_record(400), s) == []
    assert age_graves(_record(-1), s) == []
    assert "3 days ago" in age_graves(_record(3), s)[0].evidence


# The two-step lookup


def _scripted(lookup: WhoisLookup, replies: dict[tuple[str, str], str | None], asked: list[tuple[str, str]]) -> WhoisLookup:
    async def query(server: str, question: str) -> str | None:
        asked.append((server, question))
        return replies.get((server, question))

    lookup.query = query  # type: ignore[method-assign]
    return lookup


async def test_record_asks_the_root_then_the_registry(tmp_path: Path) -> None:
    asked: list[tuple[str, str]] = []
    lookup = _scripted(
        WhoisLookup(_settings(tmp_path), clock=lambda: NOW),
        {("whois.iana.org", "com"): IANA_COM, ("whois.verisign-grs.com", "cyclone-relief-donate.com"): VERISIGN_YOUNG},
        asked,
    )
    record = await lookup.record("cyclone-relief-donate.com")
    assert asked == [("whois.iana.org", "com"), ("whois.verisign-grs.com", "cyclone-relief-donate.com")]
    assert record is not None
    assert (record.server, record.created, record.age_days) == ("whois.verisign-grs.com", "2026-11-14", 3)


async def test_record_is_none_when_no_server_answers(tmp_path: Path) -> None:
    lookup = _scripted(WhoisLookup(_settings(tmp_path), clock=lambda: NOW), {}, [])
    assert await lookup.record("example.com") is None


async def test_query_refuses_a_whois_server_on_a_private_address(tmp_path: Path) -> None:
    lookup = WhoisLookup(_settings(tmp_path), resolver=_resolver({"whois.evil.test": ["127.0.0.1"]}))
    assert await lookup.query("whois.evil.test", "example.com") is None


async def test_query_gives_up_at_the_time_limit(tmp_path: Path) -> None:
    async def slow(host: str, port: int):
        await asyncio.sleep(5)
        return [ipaddress.ip_address(PUBLIC)]

    lookup = WhoisLookup(_settings(tmp_path, whois_timeout_seconds=0.05), resolver=slow)
    started = asyncio.get_running_loop().time()
    assert await lookup.query("whois.slow.test", "example.com") is None
    assert asyncio.get_running_loop().time() - started < 1


# In the scan


class _FakeWhois:
    def __init__(self, ages: dict[str, int]) -> None:
        self.ages = ages
        self.asked: list[str] = []

    async def record(self, domain: str) -> DomainRecord | None:
        self.asked.append(domain)
        if domain not in self.ages:
            return None
        return DomainRecord(domain=domain, server="whois.test", created="2026-11-14", line="Creation Date: 2026-11-14T08:12:44Z", age_days=self.ages[domain])


def _install(tmp_path: Path, routes: dict[str, httpx.Response], table: dict[str, list[str]], whois: _FakeWhois) -> None:
    settings = _settings(tmp_path)
    fetcher = LinkFetcher(settings, resolver=_resolver(table), transport=_site(routes, []))
    app.state.link_scan_service = LinkScanService(settings=settings, fetcher=fetcher, whois=whois)
    app.state.link_rate_limiter = RateLimiter(20)


async def test_scan_flags_a_days_old_site_behind_an_old_shortener(tmp_path: Path) -> None:
    routes = {
        "https://bit.example/abc": httpx.Response(301, headers={"location": "https://cyclone-relief-donate.com/"}),
        "https://cyclone-relief-donate.com/": httpx.Response(200),
    }
    whois = _FakeWhois({"bit.example": 4000, "cyclone-relief-donate.com": 3})
    _install(tmp_path, routes, {"bit.example": [PUBLIC], "cyclone-relief-donate.com": [PUBLIC_2]}, whois)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        body = (await client.post("/api/linkscan/scan", json={"url": "https://bit.example/abc"})).json()

    assert whois.asked == ["bit.example", "cyclone-relief-donate.com"]
    assert body["domainAgeChecked"] is True
    assert [r["domain"] for r in body["domainRecords"]] == ["bit.example", "cyclone-relief-donate.com"]
    assert body["domainRecords"][1]["ageDays"] == 3
    young = [g for g in body["graves"] if g["id"].startswith("domain-age-")]
    assert [g["id"] for g in young] == ["domain-age-cyclone-relief-donate.com"]
    assert young[0]["severity"] == "warning" and "Creation Date: 2026-11-14T08:12:44Z" in young[0]["evidence"]


async def test_scan_says_domain_age_not_checked_when_whois_is_silent(tmp_path: Path) -> None:
    routes = {"https://quiet.example/": httpx.Response(200)}
    _install(tmp_path, routes, {"quiet.example": [PUBLIC]}, _FakeWhois({}))
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        body = (await client.post("/api/linkscan/scan", json={"url": "https://quiet.example/"})).json()
    assert body["domainAgeChecked"] is False
    assert body["domainRecords"] == []
    assert not any(g["id"].startswith("domain-age-") for g in body["graves"])
