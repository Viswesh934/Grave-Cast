"""Run the server side of the link scan: where the link leads and the site's headers."""

from __future__ import annotations

import httpx

from app.config import Settings, get_settings
from app.modules.linkscan.address import parse_link
from app.modules.linkscan.client import FetchOutcome, LinkFetcher
from app.modules.linkscan.headers import audit_headers
from app.modules.linkscan.types import LinkGrave, LinkScanResponse

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


class LinkScanService:
    def __init__(self, settings: Settings | None = None, fetcher: LinkFetcher | None = None) -> None:
        self._settings = settings or get_settings()
        self._fetcher = fetcher or LinkFetcher(self._settings)

    async def scan(self, url: str) -> LinkScanResponse:
        target = parse_link(url)
        outcome = await self._fetcher.fetch(target)

        graves = journey_graves(target.url, outcome)
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
        )
