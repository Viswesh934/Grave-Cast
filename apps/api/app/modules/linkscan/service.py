"""Run the server side of the link scan: where the link leads and the site's headers."""

from __future__ import annotations

import asyncio
from typing import Protocol

import httpx

from app.config import Settings, get_settings
from app.modules.linkscan.address import parse_link
from app.modules.linkscan.client import FetchOutcome, LinkFetcher
from app.modules.linkscan.headers import audit_headers
from app.modules.linkscan.types import DomainRecord, LinkGrave, LinkScanResponse
from app.modules.linkscan.whois import WhoisLookup, age_graves, registrable_domain

_SEVERITY_ORDER = ("danger", "warning", "caution", "note")


def _site(url: httpx.URL) -> str:
    host = url.host.lower()
    return host[4:] if host.startswith("www.") else host


def journey_graves(start: httpx.URL, outcome: FetchOutcome) -> list[LinkGrave]:
    """Graves about where the link leads, from the redirects it took."""
    graves: list[LinkGrave] = []
    final = outcome.final_url

    if _site(final) != _site(start):
        steps = len(outcome.hops)
        graves.append(
            LinkGrave(
                id="redirect-elsewhere",
                severity="caution",
                title="Sends you to another site",
                evidence=f"{start.host} \u2192 {final.host}",
                detail=(
                    f"The link forwards you {steps} {'time' if steps == 1 else 'times'} "
                    f"and ends on {final.host}, not the site it names."
                ),
            )
        )

    if start.scheme == "https":
        # hops[0] is the link itself; later hops and the end are where it went.
        dropped = next(
            (hop.url for hop in outcome.hops[1:] if hop.url.startswith("http:")), None
        )
        if dropped is None and final.scheme == "http":
            dropped = str(final)
        if dropped is not None:
            graves.append(
                LinkGrave(
                    id="redirect-drops-https",
                    severity="warning",
                    title="Drops encryption on the way",
                    evidence=dropped,
                    detail=(
                        "The link starts on https but forwards you to plain http, "
                        "where what you send can be read on the way."
                    ),
                )
            )

    if outcome.certificate_error is not None:
        graves.append(
            LinkGrave(
                id="certificate",
                severity="warning",
                title="Certificate didn't pass",
                evidence=outcome.certificate_error,
                detail=(
                    "The site's security certificate failed its checks, so its "
                    "encrypted connection can't be trusted. The visit stopped there."
                ),
            )
        )
    elif outcome.status is not None and outcome.status >= 400:
        graves.append(
            LinkGrave(
                id="error-status",
                severity="note",
                title="The site answered with an error",
                evidence=f"HTTP {outcome.status}",
                detail=(
                    "The page didn't open normally. Its headers were still read, "
                    "but an error page may set different ones."
                ),
            )
        )
    return graves


class DomainAges(Protocol):
    async def record(self, domain: str) -> DomainRecord | None: ...


class LinkScanService:
    def __init__(self, settings: Settings | None = None, fetcher: LinkFetcher | None = None, whois: DomainAges | None = None) -> None:
        self._settings = settings or get_settings()
        self._fetcher = fetcher or LinkFetcher(self._settings)
        self._whois = whois or WhoisLookup(self._settings)

    async def scan(self, url: str) -> LinkScanResponse:
        target = parse_link(url)
        # Ask WHOIS about the link's own domain while the page is visited, so it adds as little time as it can.
        start_domain = registrable_domain(target.url.host)
        start_age = asyncio.create_task(self._whois.record(start_domain)) if start_domain else None
        try:
            outcome = await self._fetcher.fetch(target)
        except BaseException:
            if start_age:
                start_age.cancel()
            raise
        records: list[DomainRecord] = []
        start_record = await start_age if start_age else None
        if start_record:
            records.append(start_record)
        # Where the link ends matters most: a shortener is old, the site it forwards to may be days old.
        final_domain = registrable_domain(outcome.final_url.host)
        final_record = start_record
        if final_domain and final_domain != start_domain:
            final_record = await self._whois.record(final_domain)
            if final_record:
                records.append(final_record)

        graves = journey_graves(target.url, outcome)
        for record in records:
            graves.extend(age_graves(record, self._settings))
        if outcome.headers is not None:
            graves.extend(
                audit_headers(outcome.headers, secure=outcome.final_url.scheme == "https")
            )
        graves.sort(key=lambda g: _SEVERITY_ORDER.index(g.severity))

        return LinkScanResponse(
            requested_url=str(target.url),
            final_url=str(outcome.final_url),
            status_code=outcome.status,
            hops=outcome.hops,
            graves=graves,
            headers_checked=outcome.headers is not None,
            domain_records=records,
            domain_age_checked=final_record is not None,
        )
