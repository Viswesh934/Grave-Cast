"""Chat: accept a phone's outbox, and hand back what is new in each echo."""

from __future__ import annotations

from collections.abc import Callable
from datetime import datetime, timezone

from app.common.errors import TooManyMessagesError, UnknownEchoError
from app.config import Settings, get_settings
from app.modules.channel.rules import clean_body, problem_with
from app.modules.channel.store import ChannelStore, NewMessage, StoredMessage
from app.modules.channel.types import (
    ChannelMessage,
    EchoResponse,
    MailRunRequest,
    MailRunResponse,
    RejectedMessage,
)


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

        accepted: list[str] = []
        rejected: list[RejectedMessage] = []
        for incoming in request.messages:
            sender = incoming.sender.strip()
            body = clean_body(incoming.body)
            problem = problem_with(
                msgid=incoming.msgid, area=incoming.area, sender=sender, body=body, sent_at=incoming.sent_at, settings=settings
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
        for area in settings.channel_echoes:
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
        if area not in self._settings.channel_echoes:
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

    async def _read(self, area: str, since: int) -> tuple[list[StoredMessage], bool]:
        limit = self._settings.channel_page_size
        if since == 0:
            # Nothing read yet: the newest messages are the useful ones.
            return await self._store.latest(area, limit), False
        batch = await self._store.since(area, since, limit + 1)
        return batch[:limit], len(batch) > limit