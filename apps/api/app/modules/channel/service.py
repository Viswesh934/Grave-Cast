"""Chat: accept a phone's outbox, and hand back what is new in each echo."""

from __future__ import annotations

from collections.abc import Callable
from datetime import datetime, timezone

from app.common.errors import (
    EchoExistsError,
    InvalidEchoNameError,
    TooManyEchoesError,
    TooManyMessagesError,
    UnknownEchoError,
)
from app.config import Settings, get_settings
from app.modules.channel.rules import clean_about, clean_body, echo_name_problem, problem_with
from app.modules.channel.store import ChannelStore, NewMessage, StoredEcho, StoredMessage
from app.modules.channel.types import (
    ChannelMessage,
    EchoInfo,
    EchoListResponse,
    EchoResponse,
    MailRunRequest,
    MailRunResponse,
    RejectedMessage,
)


# What the built-in echoes are for, shown in the channel list.
_BUILTIN_ABOUT = {
    "EMERGENCY": "For real warnings and help.",
    "DEMO": "For testing. Say hello here.",
}


def _about(name: str) -> str:
    """What a built-in echo is for. The Radio channels are numbered, so their text is made from the name."""
    if name.startswith("RADIO-"):
        return f"Radio channel {name.removeprefix('RADIO-')}, played as radio teletype."
    return _BUILTIN_ABOUT.get(name, "")


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _out(message: StoredMessage) -> ChannelMessage:
    return ChannelMessage(
        seq=message.seq,
        msgid=message.msgid,
        area=message.area,
        sender=message.sender,
        body=message.body,
        sent_at=message.sent_at,
        received_at=message.received_at,
    )


class ChannelService:
    def __init__(self, store: ChannelStore, settings: Settings | None = None, clock: Callable[[], datetime] = _now) -> None:
        self._store = store
        self._settings = settings or get_settings()
        self._clock = clock

    async def mail_run(self, request: MailRunRequest) -> MailRunResponse:
        """One mail run: store what the phone sends, then return what is new for it."""
        settings = self._settings
        if len(request.messages) > settings.channel_max_run_messages:
            raise TooManyMessagesError(
                f"A mail run can carry at most {settings.channel_max_run_messages} messages. Send fewer at a time."
            )

        known = await self._known()
        accepted: list[str] = []
        rejected: list[RejectedMessage] = []
        for incoming in request.messages:
            sender = incoming.sender.strip()
            body = clean_body(incoming.body)
            problem = problem_with(
                msgid=incoming.msgid,
                area=incoming.area,
                sender=sender,
                body=body,
                sent_at=incoming.sent_at,
                settings=settings,
                echoes=known,
            )
            if problem is not None:
                rejected.append(RejectedMessage(msgid=incoming.msgid, reason=problem))
                continue
            # A retry of a message already stored is accepted too: the phone can stop resending it.
            await self._store.add(
                NewMessage(
                    msgid=incoming.msgid,
                    area=incoming.area,
                    sender=sender,
                    body=body,
                    sent_at=incoming.sent_at,
                    received_at=self._clock().isoformat(),
                ),
                keep=settings.channel_keep_per_echo,
            )
            accepted.append(incoming.msgid)

        newest = await self._store.newest_seq()
        messages: list[ChannelMessage] = []
        cursors: dict[str, int] = {}
        more = False
        for area in self._followed(request.cursors, known):
            since = request.cursors.get(area, 0)
            # A place marker beyond everything stored means the server's memory was reset: start over.
            if since < 0 or since > newest:
                since = 0
            batch, area_more = await self._read(area, since)
            messages.extend(_out(m) for m in batch)
            cursors[area] = batch[-1].seq if batch else since
            more = more or area_more

        return MailRunResponse(
            accepted=accepted,
            rejected=rejected,
            messages=messages,
            cursors=cursors,
            more=more,
            server_time=self._clock().isoformat(),
        )

    async def read_echo(self, area: str, since: int) -> EchoResponse:
        """Messages in one echo after `since`, for a screen that only watches."""
        if area not in await self._known():
            raise UnknownEchoError()
        newest = await self._store.newest_seq()
        if since > newest:
            since = 0
        batch, more = await self._read(area, since)
        return EchoResponse(
            area=area,
            messages=[_out(m) for m in batch],
            cursor=batch[-1].seq if batch else since,
            more=more,
            server_time=self._clock().isoformat(),
        )

    async def list_echoes(self) -> EchoListResponse:
        """The built-in echoes first, then every created channel, oldest first."""
        settings = self._settings
        created = await self._store.echoes()
        echoes = [EchoInfo(name=name, about=_about(name), builtin=True) for name in settings.channel_echoes]
        echoes += [EchoInfo(name=e.name, about=e.about, builtin=False, created_at=e.created_at) for e in created]
        return EchoListResponse(echoes=echoes, room=max(0, settings.channel_max_echoes - len(created)))

    async def create_echo(self, name: str, about: str) -> EchoInfo:
        """Creates a public channel anyone can read and post to."""
        settings = self._settings
        clean_name = name.strip().upper()
        problem = echo_name_problem(clean_name)
        if problem is not None:
            raise InvalidEchoNameError(problem)
        if clean_name in settings.channel_echoes:
            raise EchoExistsError()
        echo = StoredEcho(
            name=clean_name,
            about=clean_about(about, settings.channel_max_echo_about_chars),
            created_at=self._clock().isoformat(),
        )
        outcome = await self._store.add_echo(echo, settings.channel_max_echoes)
        if outcome == "exists":
            raise EchoExistsError()
        if outcome == "full":
            raise TooManyEchoesError()
        return EchoInfo(name=echo.name, about=echo.about, builtin=False, created_at=echo.created_at)

    async def _known(self) -> set[str]:
        """Every echo that exists: the built-in ones and the created ones."""
        return set(self._settings.channel_echoes) | {e.name for e in await self._store.echoes()}

    def _followed(self, cursors: dict[str, int], known: set[str]) -> list[str]:
        """The echoes a mail run reads: the built-in ones, then the ones the phone follows, up to the cap."""
        builtin = list(self._settings.channel_echoes)
        joined = sorted(area for area in cursors if area in known and area not in builtin)
        return (builtin + joined)[: max(len(builtin), self._settings.channel_max_followed_echoes)]

    async def _read(self, area: str, since: int) -> tuple[list[StoredMessage], bool]:
        limit = self._settings.channel_page_size
        if since == 0:
            # Nothing read yet: the newest messages are the useful ones.
            return await self._store.latest(area, limit), False
        batch = await self._store.since(area, since, limit + 1)
        return batch[:limit], len(batch) > limit