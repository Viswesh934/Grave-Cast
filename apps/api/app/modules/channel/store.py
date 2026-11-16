"""Where Chat's messages are kept. One interface; SQLite now, DynamoDB when deployed."""

from __future__ import annotations

import asyncio
import sqlite3
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol


@dataclass(frozen=True)
class NewMessage:
    msgid: str
    area: str
    sender: str
    body: str
    sent_at: str
    received_at: str


@dataclass(frozen=True)
class StoredMessage:
    seq: int
    msgid: str
    area: str
    sender: str
    body: str
    sent_at: str
    received_at: str


class ChannelStore(Protocol):
    """What the Chat service needs from storage. Implementations must be safe to call from async code."""

    async def add(self, message: NewMessage, keep: int) -> bool:
        """Stores a message. False when its msgid was already stored (a retry), which is not an error.

        Keeps only the newest `keep` messages in the message's echo.
        """

    async def since(self, area: str, seq: int, limit: int) -> list[StoredMessage]:
        """Messages in an echo after `seq`, oldest first, at most `limit`."""

    async def latest(self, area: str, limit: int) -> list[StoredMessage]:
        """The newest `limit` messages in an echo, oldest first."""

    async def newest_seq(self) -> int:
        """The highest seq stored, or 0 when empty."""


_SCHEMA = """
CREATE TABLE IF NOT EXISTS messages (
    seq INTEGER PRIMARY KEY AUTOINCREMENT,
    msgid TEXT NOT NULL UNIQUE,
    area TEXT NOT NULL,
    sender TEXT NOT NULL,
    body TEXT NOT NULL,
    sent_at TEXT NOT NULL,
    received_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS messages_area_seq ON messages (area, seq);
"""

_COLUMNS = "seq, msgid, area, sender, body, sent_at, received_at"


class SqliteChannelStore:
    """A local file. Each call opens its own connection, so it is safe from any thread."""

    def __init__(self, path: Path) -> None:
        self._path = path
        path.parent.mkdir(parents=True, exist_ok=True)
        with self._connect() as db:
            db.executescript(_SCHEMA)

    def _connect(self) -> sqlite3.Connection:
        db = sqlite3.connect(self._path, timeout=10)
        db.execute("PRAGMA journal_mode=WAL")
        return db

    @staticmethod
    def _rows(rows: list[tuple]) -> list[StoredMessage]:
        return [StoredMessage(*row) for row in rows]

    def _add(self, message: NewMessage, keep: int) -> bool:
        db = self._connect()
        try:
            with db:
                cursor = db.execute(
                    "INSERT OR IGNORE INTO messages (msgid, area, sender, body, sent_at, received_at) VALUES (?, ?, ?, ?, ?, ?)",
                    (message.msgid, message.area, message.sender, message.body, message.sent_at, message.received_at),
                )
                if cursor.rowcount == 0:
                    return False
                db.execute(
                    "DELETE FROM messages WHERE area = ? AND seq <= (SELECT seq FROM messages WHERE area = ? ORDER BY seq DESC LIMIT 1 OFFSET ?)",
                    (message.area, message.area, keep),
                )
                return True
        finally:
            db.close()

    def _since(self, area: str, seq: int, limit: int) -> list[StoredMessage]:
        db = self._connect()
        try:
            rows = db.execute(
                f"SELECT {_COLUMNS} FROM messages WHERE area = ? AND seq > ? ORDER BY seq ASC LIMIT ?", (area, seq, limit)
            ).fetchall()
            return self._rows(rows)
        finally:
            db.close()

    def _latest(self, area: str, limit: int) -> list[StoredMessage]:
        db = self._connect()
        try:
            rows = db.execute(
                f"SELECT {_COLUMNS} FROM messages WHERE area = ? ORDER BY seq DESC LIMIT ?", (area, limit)
            ).fetchall()
            return self._rows(rows[::-1])
        finally:
            db.close()

    def _newest_seq(self) -> int:
        db = self._connect()
        try:
            row = db.execute("SELECT COALESCE(MAX(seq), 0) FROM messages").fetchone()
            return int(row[0])
        finally:
            db.close()

    async def add(self, message: NewMessage, keep: int) -> bool:
        return await asyncio.to_thread(self._add, message, keep)

    async def since(self, area: str, seq: int, limit: int) -> list[StoredMessage]:
        return await asyncio.to_thread(self._since, area, seq, limit)

    async def latest(self, area: str, limit: int) -> list[StoredMessage]:
        return await asyncio.to_thread(self._latest, area, limit)

    async def newest_seq(self) -> int:
        return await asyncio.to_thread(self._newest_seq)