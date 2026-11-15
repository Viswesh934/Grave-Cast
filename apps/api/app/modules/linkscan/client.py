"""Open a link the way a browser would, passively and with every safety cap."""

from __future__ import annotations

import asyncio
import ipaddress
import socket
import ssl
from collections.abc import Awaitable, Callable
from dataclasses import dataclass

import httpx

from app.common.errors import (
    BlockedAddressError,
    LinkTimeoutError,
    LinkUnreachableError,
    TooManyRedirectsError,
)
from app.config import Settings
from app.modules.linkscan.address import IPAddress, LinkTarget, is_public_address, parse_link
from app.modules.linkscan.types import LinkHop

Resolver = Callable[[str, int], Awaitable[list[IPAddress]]]

REDIRECT_STATUSES = frozenset({301, 302, 303, 307, 308})
_DEFAULT_PORTS = {"http": 80, "https": 443}


async def system_resolver(host: str, port: int) -> list[IPAddress]:
    """Every address the system's DNS gives for `host`."""
    loop = asyncio.get_running_loop()
    infos = await loop.getaddrinfo(host, port, type=socket.SOCK_STREAM)
    seen: list[IPAddress] = []
    for info in infos:
        ip = ipaddress.ip_address(str(info[4][0]).split("%", 1)[0])
        if ip not in seen:
            seen.append(ip)
    return seen


@dataclass(frozen=True)
class FetchOutcome:
    """What one passive visit found."""

    hops: list[LinkHop]  # each redirect on the way, in order
    final_url: httpx.URL
    status: int | None
    headers: httpx.Headers | None
    certificate_error: str | None = None


def _is_ip(host: str) -> bool:
    try:
        ipaddress.ip_address(host)
    except ValueError:
        return False
    return True


def _certificate_problem(exc: BaseException) -> str | None:
    """The certificate failure behind a connection error, if that is what it was."""
    seen: set[int] = set()
    current: BaseException | None = exc
    while current is not None and id(current) not in seen:
        seen.add(id(current))
        if isinstance(current, ssl.SSLCertVerificationError):
            return current.verify_message or "The certificate could not be verified."
        current = current.__cause__ or current.__context__
    return None


class LinkFetcher:
    """Follows a link hop by hop.

    For every hop it resolves the name itself, refuses the hop if any address
    is private, local or a metadata service, and then connects to the address
    it checked (so DNS can't swap in another one between the check and the
    request). It sends GET, reads only the status and headers, and never reads
    the page body or runs anything in it.
    """

    def __init__(
        self,
        settings: Settings,
        resolver: Resolver = system_resolver,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        self._settings = settings
        self._resolver = resolver
        self._transport = transport

    async def fetch(self, target: LinkTarget) -> FetchOutcome:
        try:
            return await asyncio.wait_for(
                self._follow(target), timeout=self._settings.link_total_timeout_seconds
            )
        except asyncio.TimeoutError as exc:
            raise LinkTimeoutError() from exc

    async def _checked_address(self, target: LinkTarget) -> IPAddress:
        try:
            addresses = await self._resolver(target.host, target.port)
        except (OSError, UnicodeError) as exc:
            raise LinkUnreachableError("The site's name could not be found.") from exc
        if not addresses:
            raise LinkUnreachableError("The site's name could not be found.")
        if not all(is_public_address(ip) for ip in addresses):
            raise BlockedAddressError()
        return addresses[0]

    async def _follow(self, target: LinkTarget) -> FetchOutcome:
        timeout = httpx.Timeout(self._settings.link_connect_timeout_seconds)
        async with httpx.AsyncClient(
            transport=self._transport,
            timeout=timeout,
            follow_redirects=False,
            trust_env=False,  # a proxy would bypass the address checks
        ) as client:
            hops: list[LinkHop] = []
            current = target
            for _ in range(self._settings.link_max_redirects + 1):
                address = await self._checked_address(current)
                response = await self._visit(client, current, address)
                if isinstance(response, str):
                    return FetchOutcome(hops, current.url, None, None, certificate_error=response)
                status, headers = response
                location = headers.get("location")
                if status in REDIRECT_STATUSES and location:
                    hops.append(LinkHop(url=str(current.url), status=status))
                    # parse_link re-checks scheme, port and literal addresses.
                    current = parse_link(str(current.url.join(location)))
                    continue
                return FetchOutcome(hops, current.url, status, headers)
            raise TooManyRedirectsError()

    async def _visit(
        self, client: httpx.AsyncClient, target: LinkTarget, address: IPAddress
    ) -> tuple[int, httpx.Headers] | str:
        """Status and headers, or the certificate problem that stopped the visit."""
        url = target.url
        literal = _is_ip(target.host)
        name = f"[{target.host}]" if literal and ":" in target.host else target.host
        host_header = name if target.port == _DEFAULT_PORTS[url.scheme] else f"{name}:{target.port}"
        extensions: dict[str, object] = {}
        if url.scheme == "https" and not literal:
            # Connect to the checked address, but verify the certificate for the name.
            extensions["sni_hostname"] = target.host
        request = client.build_request(
            "GET",
            url.copy_with(host=str(address)),
            headers={
                "Host": host_header,
                "User-Agent": self._settings.link_user_agent,
                "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
            },
            extensions=extensions,
        )
        try:
            response = await client.send(request, stream=True)
        except httpx.TimeoutException as exc:
            raise LinkTimeoutError() from exc
        except httpx.ConnectError as exc:
            problem = _certificate_problem(exc)
            if problem is not None:
                return problem
            raise LinkUnreachableError() from exc
        except httpx.HTTPError as exc:
            raise LinkUnreachableError() from exc
        try:
            return response.status_code, response.headers
        finally:
            # The body is never read.
            await response.aclose()
