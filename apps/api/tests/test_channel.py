"""Chat tests: message rules, storage, mail runs, echo reads, and errors. No live network."""

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient

from app.common.errors import ChannelRateLimitedError, TooManyMessagesError
from app.common.rate_limit import RateLimiter
from app.config import Settings
from app.main import app
from app.modules.channel.rules import MSGID_RE, clean_body, nick_pattern, parses_as_time, problem_with
from app.modules.channel.service import ChannelService
from app.modules.channel.store import NewMessage, SqliteChannelStore
from app.modules.channel.types import IncomingMessage, MailRunRequest

DEVICE = "1a2b3c4d"


def _settings(tmp_path: Path, **overrides) -> Settings:
    base = dict(channel_db_path=tmp_path / "channel.sqlite3", workspace_root=tmp_path / "repositories")
    base.update(overrides)
    return Settings(**base)


def _msgid(n: int, device: str = DEVICE) -> str:
    return f"{device}@gravecast {n:08x}"


def _wire(n: int, *, area: str = "DEMO", sender: str = "Ravi", body: str = "hello", device: str = DEVICE) -> dict:
    return {
        "msgid": _msgid(n, device),
        "area": area,
        "from": sender,
        "body": body,
        "sentAt": "2026-11-15T12:00:00.000Z",
    }


def _service(tmp_path: Path, **overrides) -> tuple[ChannelService, Settings]:
    settings = _settings(tmp_path, **overrides)
    clock_times = iter(datetime(2026, 11, 15, 12, 0, s, tzinfo=timezone.utc) for s in range(60))
    return ChannelService(SqliteChannelStore(settings.channel_db_path), settings, clock=lambda: next(clock_times)), settings


def _run(messages: list[dict] | None = None, cursors: dict[str, int] | None = None) -> MailRunRequest:
    return MailRunRequest.model_validate({"messages": messages or [], "cursors": cursors or {}})


# Rules


@pytest.mark.parametrize("msgid", [f"{DEVICE}@gravecast 0000001f", "ffffffff@gravecast ffffffff"])
def test_good_msgids(msgid: str) -> None:
    assert MSGID_RE.match(msgid)


@pytest.mark.parametrize(
    "msgid", ["", "1a2b3c4d@gravecast 1f", "1A2B3C4D@gravecast 0000001f", "1a2b3c4d@elsewhere 0000001f", "1a2b3c4d@gravecast 0000001f extra", "x" * 80]
)
def test_bad_msgids(msgid: str) -> None:
    assert not MSGID_RE.match(msgid)


@pytest.mark.parametrize("nick", ["Ravi", "a", "Sam 2", "jo.k-l_m", "A" * 24])
def test_good_nicknames(nick: str) -> None:
    assert nick_pattern(24).match(nick)


@pytest.mark.parametrize("nick", ["", " Ravi", "-x", "A" * 25, "<b>hi</b>", "emoji\U0001f600", "two\nlines"])
def test_bad_nicknames(nick: str) -> None:
    assert not nick_pattern(24).match(nick)


def test_clean_body_removes_control_characters_and_trims() -> None:
    assert clean_body("  hi\x00 there\x07\r\nline two  ") == "hi there\nline two"


def test_times() -> None:
    assert parses_as_time("2026-11-15T12:00:00.123Z")
    assert parses_as_time("2026-11-15T12:00:00+05:30")
    assert not parses_as_time("yesterday")


def test_problem_with_reports_the_first_problem_in_plain_words(tmp_path: Path) -> None:
    settings = _settings(tmp_path, channel_max_body_chars=10)
    good = dict(msgid=_msgid(1), area="DEMO", sender="Ravi", body="hello", sent_at="2026-11-15T12:00:00Z", settings=settings)
    assert problem_with(**good) is None
    assert "echo" in problem_with(**{**good, "area": "NOPE"})
    assert "id" in problem_with(**{**good, "msgid": "nope"})
    assert "nickname" in problem_with(**{**good, "sender": "<x>"})
    assert "time" in problem_with(**{**good, "sent_at": "soon"})
    assert "empty" in problem_with(**{**good, "body": ""})
    assert "10 characters" in problem_with(**{**good, "body": "x" * 11})


# Storage


async def test_store_keeps_order_ignores_repeats_and_prunes(tmp_path: Path) -> None:
    store = SqliteChannelStore(tmp_path / "s.sqlite3")

    def new(n: int, area: str = "DEMO") -> NewMessage:
        return NewMessage(_msgid(n), area, "Ravi", f"m{n}", "2026-11-15T12:00:00Z", "2026-11-15T12:00:01+00:00")

    for n in range(1, 6):
        assert await store.add(new(n), keep=3) is True
    assert await store.add(new(5), keep=3) is False  # a retry
    assert await store.add(new(100, "EMERGENCY"), keep=3) is True

    kept = await store.latest("DEMO", 10)
    assert [m.body for m in kept] == ["m3", "m4", "m5"]  # only the newest three
    assert [m.body for m in await store.since("DEMO", kept[0].seq, 10)] == ["m4", "m5"]
    assert [m.body for m in await store.latest("EMERGENCY", 10)] == ["m100"]
    assert await store.newest_seq() == (await store.latest("EMERGENCY", 1))[0].seq


# Mail runs


async def test_mail_run_accepts_stores_and_returns_the_messages(tmp_path: Path) -> None:
    service, _ = _service(tmp_path)
    result = await service.mail_run(_run([_wire(1, body="first"), _wire(2, body="second")]))
    assert result.accepted == [_msgid(1), _msgid(2)]
    assert result.rejected == []
    assert [m.body for m in result.messages] == ["first", "second"]
    assert result.cursors["DEMO"] == result.messages[-1].seq
    assert result.cursors["EMERGENCY"] == 0
    assert result.more is False


async def test_a_retried_message_is_accepted_but_stored_once(tmp_path: Path) -> None:
    service, _ = _service(tmp_path)
    await service.mail_run(_run([_wire(1)]))
    again = await service.mail_run(_run([_wire(1)]))
    assert again.accepted == [_msgid(1)]
    assert len(again.messages) == 1


async def test_one_bad_message_does_not_block_the_rest(tmp_path: Path) -> None:
    service, _ = _service(tmp_path)
    result = await service.mail_run(
        _run([_wire(1, body="fine"), _wire(2, sender="<script>"), _wire(3, area="NOPE"), _wire(4, body="   "), _wire(5, body="also fine")])
    )
    assert result.accepted == [_msgid(1), _msgid(5)]
    assert {r.msgid for r in result.rejected} == {_msgid(2), _msgid(3), _msgid(4)}
    assert all(r.reason for r in result.rejected)
    assert [m.body for m in result.messages] == ["fine", "also fine"]


async def test_cursors_return_only_what_is_new(tmp_path: Path) -> None:
    service, _ = _service(tmp_path)
    first = await service.mail_run(_run([_wire(1), _wire(2)]))
    second = await service.mail_run(_run([_wire(3, body="third")], cursors=first.cursors))
    assert [m.body for m in second.messages] == ["third"]
    quiet = await service.mail_run(_run(cursors=second.cursors))
    assert quiet.messages == []
    assert quiet.cursors == second.cursors


async def test_a_cursor_from_a_wiped_server_starts_over(tmp_path: Path) -> None:
    service, _ = _service(tmp_path)
    await service.mail_run(_run([_wire(1, body="kept")]))
    result = await service.mail_run(_run(cursors={"DEMO": 9999}))
    assert [m.body for m in result.messages] == ["kept"]


async def test_big_backlogs_come_in_pages(tmp_path: Path) -> None:
    service, _ = _service(tmp_path, channel_page_size=2, channel_max_run_messages=10)
    await service.mail_run(_run([_wire(n, body=f"m{n}") for n in range(1, 6)]))
    first = await service.mail_run(_run(cursors={"DEMO": 1}))  # reading from just after the first message
    assert [m.body for m in first.messages] == ["m2", "m3"]
    assert first.more is True
    rest = await service.mail_run(_run(cursors=first.cursors))
    assert [m.body for m in rest.messages] == ["m4", "m5"]
    assert rest.more is False


async def test_too_many_messages_in_one_run_is_refused(tmp_path: Path) -> None:
    service, _ = _service(tmp_path, channel_max_run_messages=2)
    with pytest.raises(TooManyMessagesError):
        await service.mail_run(_run([_wire(1), _wire(2), _wire(3)]))


async def test_the_phones_time_is_kept_and_the_servers_time_is_added(tmp_path: Path) -> None:
    service, _ = _service(tmp_path)
    wire = _wire(1)
    wire["sentAt"] = "1999-01-01T00:00:00Z"
    result = await service.mail_run(_run([wire]))
    assert result.messages[0].sent_at == "1999-01-01T00:00:00Z"
    assert result.messages[0].received_at.startswith("2026-11-15T12:00:")


# The endpoints


def _install(tmp_path: Path, runs: int = 60, reads: int = 90, **overrides) -> None:
    service, _ = _service(tmp_path, **overrides)
    app.state.channel_service = service
    app.state.channel_run_limiter = RateLimiter(runs, error=ChannelRateLimitedError)
    app.state.channel_read_limiter = RateLimiter(reads, error=ChannelRateLimitedError)


async def test_endpoints_use_the_json_names_the_apps_expect(tmp_path: Path) -> None:
    _install(tmp_path)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        posted = await client.post("/api/channel/mailrun", json={"messages": [_wire(1, body="hi")], "cursors": {}})
        read = await client.get("/api/channel/echoes/demo")  # the area is case-insensitive

    assert posted.status_code == 200
    body = posted.json()
    assert body["accepted"] == [_msgid(1)]
    assert set(body) == {"accepted", "rejected", "messages", "cursors", "more", "serverTime"}
    message = body["messages"][0]
    assert set(message) == {"seq", "msgid", "area", "from", "body", "sentAt", "receivedAt"}
    assert message["from"] == "Ravi"

    assert read.status_code == 200
    echo = read.json()
    assert echo["area"] == "DEMO"
    assert [m["body"] for m in echo["messages"]] == ["hi"]
    assert echo["cursor"] == message["seq"]


async def test_reading_after_the_cursor_returns_nothing_new(tmp_path: Path) -> None:
    _install(tmp_path)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/api/channel/mailrun", json={"messages": [_wire(1)], "cursors": {}})
        first = (await client.get("/api/channel/echoes/DEMO")).json()
        after = (await client.get("/api/channel/echoes/DEMO", params={"since": first["cursor"]})).json()
    assert after["messages"] == []
    assert after["cursor"] == first["cursor"]


async def test_unknown_echo_and_oversized_runs_return_the_error_shape(tmp_path: Path) -> None:
    _install(tmp_path, channel_max_run_messages=1)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        unknown = await client.get("/api/channel/echoes/NOPE")
        too_many = await client.post("/api/channel/mailrun", json={"messages": [_wire(1), _wire(2)], "cursors": {}})
    assert unknown.status_code == 404
    assert unknown.json() == {"error": {"code": "UNKNOWN_ECHO", "message": "That echo doesn't exist."}}
    assert too_many.status_code == 422
    assert too_many.json()["error"]["code"] == "TOO_MANY_MESSAGES"


async def test_both_endpoints_are_rate_limited(tmp_path: Path) -> None:
    _install(tmp_path, runs=1, reads=1)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        run_ok = await client.post("/api/channel/mailrun", json={"messages": [], "cursors": {}})
        run_blocked = await client.post("/api/channel/mailrun", json={"messages": [], "cursors": {}})
        read_ok = await client.get("/api/channel/echoes/DEMO")
        read_blocked = await client.get("/api/channel/echoes/DEMO")
    assert (run_ok.status_code, read_ok.status_code) == (200, 200)
    assert run_blocked.status_code == read_blocked.status_code == 429
    assert run_blocked.json()["error"]["code"] == "CHANNEL_RATE_LIMITED"


def test_incoming_message_accepts_the_json_names() -> None:
    message = IncomingMessage.model_validate(_wire(1))
    assert message.sender == "Ravi"
    assert message.sent_at == "2026-11-15T12:00:00.000Z"
