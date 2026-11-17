"""Domain age over WHOIS (RFC 3912): the 1982 protocol that RDAP replaced, brought back for one question."""

from __future__ import annotations

import asyncio
import ipaddress
import re
from collections.abc import Awaitable, Callable
from datetime import date, datetime, timezone

from app.config import Settings, get_settings
from app.modules.linkscan.address import IPAddress, is_public_address
from app.modules.linkscan.client import system_resolver
from app.modules.linkscan.types import DomainRecord, LinkGrave

Resolver = Callable[[str, int], Awaitable[list[IPAddress]]]

# Country domains that sell names one level down, such as example.co.uk.
_SECOND_LEVEL = frozenset({"co", "com", "net", "org", "gov", "edu", "ac", "or", "ne", "go"})
_HOSTNAME = re.compile(r"^(?=.{1,253}$)(?!-)[a-z0-9-]{1,63}(?:\.(?!-)[a-z0-9-]{1,63})+$")
_REFERRAL = re.compile(r"^\s*(?:refer|whois)\s*:\s*(\S+)\s*$", re.IGNORECASE | re.MULTILINE)
_CREATED = re.compile(
    r"^\s*(creation date|created on|created|registered on|registration date|registration time|domain registration date)"
    r"\s*:\s*(.+?)\s*$",
    re.IGNORECASE | re.MULTILINE,
)
_MONTHS = {m: i for i, m in enumerate(["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"], start=1)}
# The first domain names were registered in 1985; anything earlier is a misread.
_FIRST_YEAR = 1985
# How much of a reply to read at a time.
_CHUNK_BYTES = 4096


def registrable_domain(host: str) -> str | None:
    """The name a person registers for a host (`www.shop.example.co.uk` gives `example.co.uk`), or None for an address."""
    host = host.lower().rstrip(".")
    try:
        ipaddress.ip_address(host.strip("[]"))
        return None
    except ValueError:
        pass
    labels = host.split(".")
    if len(labels) < 2:
        return None
    if len(labels) >= 3 and len(labels[-1]) == 2 and labels[-2] in _SECOND_LEVEL:
        return ".".join(labels[-3:])
    return ".".join(labels[-2:])


def referral(reply: str) -> str | None:
    """The WHOIS server a root reply points to, if it names a plain host."""
    match = _REFERRAL.search(reply)
    if not match:
        return None
    host = match.group(1).lower().rstrip(".")
    return host if _HOSTNAME.match(host) else None


def _parse_date(value: str) -> date | None:
    text = value.strip()
    found = None
    if m := re.match(r"(\d{4})[-./](\d{1,2})[-./](\d{1,2})", text):
        found = (int(m[1]), int(m[2]), int(m[3]))
    elif m := re.match(r"(\d{1,2})[-. ]([A-Za-z]{3})[A-Za-z]*[-. ](\d{4})", text):
        month = _MONTHS.get(m[2].lower())
        found = (int(m[3]), month, int(m[1])) if month else None
    elif m := re.match(r"(\d{1,2})[-./](\d{1,2})[-./](\d{4})", text):
        found = (int(m[3]), int(m[2]), int(m[1]))
    elif m := re.match(r"(\d{4})(\d{2})(\d{2})\b", text):
        found = (int(m[1]), int(m[2]), int(m[3]))
    if not found:
        return None
    try:
        day = date(*found)
    except ValueError:
        return None
    return day if day.year >= _FIRST_YEAR else None


def parse_created(reply: str) -> tuple[date, str] | None:
    """When the domain was registered, and the record's own line that says so."""
    for match in _CREATED.finditer(reply):
        day = _parse_date(match.group(2))
        if day is not None:
            return day, match.group(0).strip()
    return None


def age_graves(record: DomainRecord, settings: Settings) -> list[LinkGrave]:
    """A grave when the site is young: scam and phishing sites are often days or weeks old."""
    days = record.age_days
    if days < 0 or days >= settings.whois_recent_days:
        return []
    young = days < settings.whois_young_days
    when = "today" if days == 0 else f"{days} {'day' if days == 1 else 'days'} ago"
    return [
        LinkGrave(
            id=f"domain-age-{record.domain}",
            severity="warning" if young else "caution",
            title="Very new site" if young else "Fairly new site",
            evidence=f"{record.line}  ({when}, from {record.server})",
            detail=(
                f"WHOIS says {record.domain} was registered {when}. Scam and phishing sites are often only days "
                "or weeks old. A new site isn't harmful by itself, so check who is behind it."
            ),
        )
    ]


class WhoisLookup:
    """Asks the WHOIS root which registry runs a domain's ending, then asks that registry when the domain was registered."""

    def __init__(self, settings: Settings | None = None, resolver: Resolver = system_resolver, clock: Callable[[], datetime] | None = None) -> None:
        self._settings = settings or get_settings()
        self._resolver = resolver
        self._clock = clock or (lambda: datetime.now(timezone.utc))

    async def query(self, server: str, question: str) -> str | None:
        """One WHOIS exchange on port 43: send a line, read the reply until the server closes. None on any failure."""
        try:
            line = f"{question}\r\n".encode("ascii")
        except UnicodeEncodeError:
            return None
        try:
            return await asyncio.wait_for(self._exchange(server, line), timeout=self._settings.whois_timeout_seconds)
        except (OSError, asyncio.TimeoutError):
            return None

    async def _exchange(self, server: str, line: bytes) -> str | None:
        s = self._settings
        addresses = await self._resolver(server, s.whois_port)
        # The same rule as the link fetcher: never talk to private, local or cloud-metadata addresses.
        if not addresses or not all(is_public_address(a) for a in addresses):
            return None
        reader, writer = await asyncio.open_connection(str(addresses[0]), s.whois_port)
        try:
            writer.write(line)
            await writer.drain()
            data = b""
            while len(data) < s.whois_max_bytes:
                chunk = await reader.read(min(_CHUNK_BYTES, s.whois_max_bytes - len(data)))
                if not chunk:
                    break
                data += chunk
            return data.decode("utf-8", errors="replace")
        finally:
            writer.close()

    async def record(self, domain: str) -> DomainRecord | None:
        """The domain's registration date from WHOIS, or None if no WHOIS server answers with one. Never raises."""
        try:
            root = await self.query(self._settings.whois_root_server, domain.rsplit(".", 1)[-1])
            server = referral(root) if root else None
            if server is None:
                return None
            reply = await self.query(server, domain)
            found = parse_created(reply) if reply else None
            if found is None:
                return None
            created, line = found
            age = (self._clock().date() - created).days
            return DomainRecord(domain=domain, server=server, created=created.isoformat(), line=line, age_days=age)
        except Exception:  # noqa: BLE001 - a lookup that fails is reported as "not checked", never as an error
            return None
