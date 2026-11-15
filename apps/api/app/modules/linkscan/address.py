"""Decide whether a link may be opened by the server, before any request is made."""

from __future__ import annotations

import ipaddress
from dataclasses import dataclass
from typing import Union

import httpx

from app.common.errors import BlockedAddressError, InvalidLinkError

IPAddress = Union[ipaddress.IPv4Address, ipaddress.IPv6Address]

MAX_LINK_CHARS = 2048
ALLOWED_PORTS = frozenset({80, 443})

# Cloud metadata services. Most sit in ranges that are blocked anyway; they are
# listed so the intent is explicit and survives changes to the range checks.
_METADATA_ADDRESSES: frozenset[IPAddress] = frozenset(
    {
        ipaddress.ip_address("169.254.169.254"),  # AWS, GCP, Azure, others
        ipaddress.ip_address("169.254.170.2"),  # AWS ECS task metadata
        ipaddress.ip_address("fd00:ec2::254"),  # AWS over IPv6
        ipaddress.ip_address("100.100.100.200"),  # Alibaba Cloud
    }
)
_NAT64 = ipaddress.ip_network("64:ff9b::/96")


def _embedded_ipv4(ip: ipaddress.IPv6Address) -> ipaddress.IPv4Address | None:
    """The IPv4 address hidden inside an IPv6 one, for the forms that carry one."""
    if ip.ipv4_mapped is not None:
        return ip.ipv4_mapped
    if ip.sixtofour is not None:
        return ip.sixtofour
    if ip.teredo is not None:
        return ip.teredo[1]
    if ip in _NAT64:
        return ipaddress.IPv4Address(int(ip) & 0xFFFFFFFF)
    return None


def is_public_address(ip: IPAddress) -> bool:
    """True only for ordinary public internet addresses."""
    if isinstance(ip, ipaddress.IPv6Address):
        inner = _embedded_ipv4(ip)
        if inner is not None and not is_public_address(inner):
            return False
    if ip in _METADATA_ADDRESSES:
        return False
    return ip.is_global and not (
        ip.is_private
        or ip.is_loopback
        or ip.is_link_local
        or ip.is_multicast
        or ip.is_reserved
        or ip.is_unspecified
    )


@dataclass(frozen=True)
class LinkTarget:
    """A link that passed the checks that need no network."""

    url: httpx.URL
    host: str  # ASCII form, as sent to DNS
    port: int


def parse_link(raw: str) -> LinkTarget:
    """Read a link and refuse anything the server must not open.

    Credentials in the link are dropped, never sent. Only http and https on
    the usual ports are allowed.
    """
    text = (raw or "").strip()
    if not text:
        raise InvalidLinkError("Paste a link to check.")
    if len(text) > MAX_LINK_CHARS:
        raise InvalidLinkError("That link is too long to check.")
    if "://" not in text:
        text = f"https://{text}"
    try:
        url = httpx.URL(text)
        raw_host = url.raw_host.decode("ascii")
    except (httpx.InvalidURL, ValueError, UnicodeError) as exc:
        raise InvalidLinkError() from exc
    if url.scheme not in {"http", "https"}:
        raise InvalidLinkError("Only http and https links can be checked.")
    host = raw_host.strip("[]").rstrip(".").lower()
    if not host:
        raise InvalidLinkError("That link has no site name in it.")
    port = url.port or (443 if url.scheme == "https" else 80)
    if port not in ALLOWED_PORTS:
        raise InvalidLinkError(
            "The server only opens links on the usual web ports, so this one was not opened."
        )
    # A literal address is checked here; names are checked after DNS.
    try:
        literal: IPAddress | None = ipaddress.ip_address(host)
    except ValueError:
        literal = None
    if literal is not None and not is_public_address(literal):
        raise BlockedAddressError()
    if literal is None and (host == "localhost" or host.endswith(".localhost")):
        raise BlockedAddressError()
    clean = httpx.URL(
        scheme=url.scheme,
        host=host,
        port=url.port,
        raw_path=url.raw_path,
    )
    return LinkTarget(url=clean, host=host, port=port)
