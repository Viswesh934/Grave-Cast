"""Typed models for Chat: messages, mail runs and echo reads."""

from __future__ import annotations

from pydantic import BaseModel, Field

# These limits only keep a request's size sane. The real rules (and their
# limits) live in the service, which rejects one bad message without failing
# the whole mail run, so a phone's outbox can never get stuck on it.
_WIRE_TEXT_MAX = 2000
_WIRE_MESSAGES_MAX = 100


class IncomingMessage(BaseModel):
    """A message as a phone sends it. Its id and time were made on the phone."""

    msgid: str = Field(max_length=64)
    area: str = Field(max_length=32)
    sender: str = Field(alias="from", max_length=64)
    body: str = Field(max_length=_WIRE_TEXT_MAX)
    sent_at: str = Field(alias="sentAt", max_length=40)

    model_config = {"populate_by_name": True}


class MailRunRequest(BaseModel):
    """What a phone sends in one mail run: its outbox, and how far it has read each echo."""

    messages: list[IncomingMessage] = Field(default_factory=list, max_length=_WIRE_MESSAGES_MAX)
    cursors: dict[str, int] = Field(default_factory=dict)


class ChannelMessage(BaseModel):
    """A message in an echo. `seq` is the server's order and the reader's place marker."""

    seq: int
    msgid: str
    area: str
    sender: str = Field(alias="from")
    body: str
    sent_at: str = Field(alias="sentAt")
    received_at: str = Field(alias="receivedAt")

    model_config = {"populate_by_name": True}


class RejectedMessage(BaseModel):
    msgid: str
    reason: str


class MailRunResponse(BaseModel):
    accepted: list[str]
    rejected: list[RejectedMessage]
    messages: list[ChannelMessage]
    cursors: dict[str, int]
    # True when an echo has more waiting; run again to fetch it.
    more: bool
    server_time: str = Field(alias="serverTime")

    model_config = {"populate_by_name": True}


class EchoResponse(BaseModel):
    area: str
    messages: list[ChannelMessage]
    cursor: int
    more: bool
    server_time: str = Field(alias="serverTime")

    model_config = {"populate_by_name": True}