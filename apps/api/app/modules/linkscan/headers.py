"""Read a site's security headers and turn each missing protection into a grave."""

from __future__ import annotations

import re
from collections.abc import Mapping

from app.modules.linkscan.types import LinkGrave

MISSING_PROTECTION = "Missing protection"

_MAX_AGE_RE = re.compile(r"max-age\s*=\s*\"?(\d+)", re.IGNORECASE)
_VALUE_PREVIEW_CHARS = 80


def _preview(value: str) -> str:
    value = " ".join(value.split())
    return value if len(value) <= _VALUE_PREVIEW_CHARS else value[: _VALUE_PREVIEW_CHARS - 1] + "\u2026"


def audit_headers(headers: Mapping[str, str], *, secure: bool) -> list[LinkGrave]:
    """One grave per protection the site doesn't set.

    `headers` must look up names case-insensitively (as `httpx.Headers` does).
    `secure` is whether the final page came over https; HSTS only means
    something there.
    """
    graves: list[LinkGrave] = []
    csp = headers.get("content-security-policy", "")

    if secure:
        hsts = headers.get("strict-transport-security")
        max_age = _MAX_AGE_RE.search(hsts or "")
        if hsts is None or max_age is None or int(max_age.group(1)) == 0:
            graves.append(
                LinkGrave(
                    id="header-hsts",
                    severity="caution",
                    label=MISSING_PROTECTION,
                    title="Doesn't insist on https",
                    evidence=(
                        "Strict-Transport-Security: missing"
                        if hsts is None
                        else f"Strict-Transport-Security: {_preview(hsts)}"
                    ),
                    detail=(
                        "The site doesn't tell browsers to always use its encrypted "
                        "connection, so on a hostile network a visit can be pulled "
                        "down to plain http."
                    ),
                )
            )

    if not csp:
        report_only = "content-security-policy-report-only" in headers
        graves.append(
            LinkGrave(
                id="header-csp",
                severity="caution",
                label=MISSING_PROTECTION,
                title="No limits on scripts",
                evidence=(
                    "Content-Security-Policy: report-only, nothing blocked"
                    if report_only
                    else "Content-Security-Policy: missing"
                ),
                detail=(
                    "The site doesn't limit which scripts may run on its pages, so a "
                    "script slipped into the page would run with no limits."
                ),
            )
        )

    nosniff = headers.get("x-content-type-options")
    if (nosniff or "").strip().lower() != "nosniff":
        graves.append(
            LinkGrave(
                id="header-nosniff",
                severity="note",
                label=MISSING_PROTECTION,
                title="Lets the browser guess file types",
                evidence=(
                    "X-Content-Type-Options: missing"
                    if nosniff is None
                    else f"X-Content-Type-Options: {_preview(nosniff)}"
                ),
                detail=(
                    "Without \u201cnosniff\u201d, a browser may guess what a file is "
                    "and run a disguised file as a script."
                ),
            )
        )

    if "x-frame-options" not in headers and "frame-ancestors" not in csp.lower():
        graves.append(
            LinkGrave(
                id="header-framing",
                severity="caution",
                label=MISSING_PROTECTION,
                title="Can be hidden inside another site",
                evidence="X-Frame-Options and frame-ancestors: both missing",
                detail=(
                    "Another site can load this page invisibly inside its own and "
                    "trick you into clicking on it."
                ),
            )
        )

    if "referrer-policy" not in headers:
        graves.append(
            LinkGrave(
                id="header-referrer",
                severity="note",
                label=MISSING_PROTECTION,
                title="No rule for what it passes on",
                evidence="Referrer-Policy: missing",
                detail=(
                    "The site doesn't say how much of its address goes with you when "
                    "you follow a link from it. Browsers fall back to a cautious default."
                ),
            )
        )

    if "permissions-policy" not in headers:
        graves.append(
            LinkGrave(
                id="header-permissions",
                severity="note",
                label=MISSING_PROTECTION,
                title="Doesn't switch off what it doesn't use",
                evidence="Permissions-Policy: missing",
                detail=(
                    "The site doesn't turn off features such as the camera, "
                    "microphone or location for the pages and scripts it loads."
                ),
            )
        )

    return graves
