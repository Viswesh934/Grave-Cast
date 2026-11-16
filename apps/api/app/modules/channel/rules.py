"""The rules a message must follow. Pure functions, so they are easy to test."""

from __future__ import annotations

import re
from datetime import datetime

from app.config import Settings

# A MSGID is made on the phone: eight hex digits for the device, then eight for the message.
MSGID_RE = re.compile(r"^[0-9a-f]{8}@gravecast [0-9a-f]{8}$")

# Control characters, except newline and tab.
_CONTROL_RE = re.compile(r"[\x00-\x08\x0b-\x1f\x7f]")


def nick_pattern(max_chars: int) -> re.Pattern[str]:
    """A nickname: letters and digits first, then also spaces, dots, dashes and underscores."""
    return re.compile(rf"^[A-Za-z0-9][A-Za-z0-9 _.-]{{0,{max_chars - 1}}}$")


def clean_body(text: str) -> str:
    """The message text with control characters removed and the ends trimmed."""
    return _CONTROL_RE.sub("", text.replace("\r\n", "\n").replace("\r", "\n")).strip()


def parses_as_time(text: str) -> bool:
    try:
        datetime.fromisoformat(text.replace("Z", "+00:00"))
    except ValueError:
        return False
    return True


def problem_with(*, msgid: str, area: str, sender: str, body: str, sent_at: str, settings: Settings) -> str | None:
    """Why a message can't be accepted, in plain words, or None when it is fine."""
    if area not in settings.channel_echoes:
        return "That echo doesn't exist."
    if not MSGID_RE.match(msgid):
        return "The message id isn't in the right form."
    if not nick_pattern(settings.channel_max_nick_chars).match(sender):
        return "That nickname isn't allowed."
    if not parses_as_time(sent_at):
        return "The message's time couldn't be read."
    if body == "":
        return "The message is empty."
    if len(body) > settings.channel_max_body_chars:
        return f"The message is longer than {settings.channel_max_body_chars} characters."
    return None