"""Chat tests: message rules, storage, mail runs, echo reads, and errors. No live network."""

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient

from app.common.errors import (
    ChannelRateLimitedError,
    EchoExistsError,
    InvalidEchoNameError,
    TooManyEchoesError,
    TooManyMessagesError,
)
from app.common.rate_limit import RateLimiter
from app.config import DEFAULT_ECHOES, Settings
from app.main import app
from app.modules.channel.rules import (
    MSGID_RE,
    clean_about,
    clean_body,
    echo_name_problem,
    nick_pattern,
    parses_as_time,
    problem_with,
)
from app.modules.channel.service import ChannelService
from app.modules.channel.store import NewMessage, SqliteChannelStore
from app.modules.channel.types import IncomingMessage, MailRunRequest

DEVICE = "1a2b3c4d"
BUILTIN = list(DEFAULT_ECHOES)


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


# Channels people create


@pytest.mark.parametrize("name", ["NEWS", "CHENNAI-FLOOD", "AB", "Z9_X", "A" * 20])
def test_good_echo_names(name: str) -> None:
    assert echo_name_problem(name) is None


@pytest.mark.parametrize("name", ["", "A", "9LIVES", "-X", "news", "A" * 21, "TWO WORDS", "<B>", "CAF\u00c9"])
def test_bad_echo_names(name: str) -> None:
    assert "capital letters" in echo_name_problem(name)


def test_clean_about_keeps_one_short_line() -> None:
    assert clean_about("  Water\tand\nfood\x00 drops  ", 80) == "Water and food drops"
    assert clean_about("x" * 100, 10) == "x" * 10


async def test_a_created_channel_is_listed_after_the_built_in_ones(tmp_path: Path) -> None:
    service, _ = _service(tmp_path)
    made = await service.create_echo(" chennai-flood ", "Updates for the flood")
    listed = await service.list_echoes()
    assert made.name == "CHENNAI-FLOOD"
    assert [e.name for e in listed.echoes] == [*BUILTIN, "CHENNAI-FLOOD"]
    assert [e.builtin for e in listed.echoes] == [True] * len(BUILTIN) + [False]
    assert listed.echoes[-1].about == "Updates for the flood"
    assert listed.room == 99


async def test_names_must_be_new_and_well_formed(tmp_path: Path) -> None:
    service, _ = _service(tmp_path)
    await service.create_echo("NEWS", "")
    with pytest.raises(EchoExistsError):
        await service.create_echo("news", "")
    with pytest.raises(EchoExistsError):
        await service.create_echo("DEMO", "")
    with pytest.raises(InvalidEchoNameError):
        await service.create_echo("no spaces", "")


async def test_the_number_of_channels_is_capped(tmp_path: Path) -> None:
    service, _ = _service(tmp_path, channel_max_echoes=2)
    await service.create_echo("ONE", "")
    await service.create_echo("TWO", "")
    with pytest.raises(TooManyEchoesError):
        await service.create_echo("THREE", "")
    assert (await service.list_echoes()).room == 0


async def test_messages_go_to_a_created_channel_and_come_back_to_followers(tmp_path: Path) -> None:
    service, _ = _service(tmp_path)
    await service.create_echo("NEWS", "")
    sent = await service.mail_run(_run([_wire(1, area="NEWS", body="road closed")]))
    assert sent.accepted == [_msgid(1)]
    # A phone that doesn't follow NEWS doesn't get its messages; one that does, does.
    stranger = await service.mail_run(_run())
    follower = await service.mail_run(_run(cursors={"NEWS": 0}))
    assert "NEWS" not in stranger.cursors and stranger.messages == []
    assert [m.body for m in follower.messages] == ["road closed"]
    assert follower.cursors["NEWS"] == follower.messages[0].seq
    assert {"EMERGENCY", "DEMO"} <= set(follower.cursors)


async def test_unknown_echoes_are_refused_and_not_followed(tmp_path: Path) -> None:
    service, _ = _service(tmp_path)
    run = await service.mail_run(_run([_wire(1, area="NOPE")], cursors={"NOPE": 0}))
    assert run.rejected[0].reason == "That echo doesn't exist."
    assert "NOPE" not in run.cursors


async def test_a_mail_run_reads_at_most_the_followed_cap(tmp_path: Path) -> None:
    service, _ = _service(tmp_path, channel_echoes=("EMERGENCY", "DEMO"), channel_max_followed_echoes=3)
    for name in ("AAA", "BBB", "CCC"):
        await service.create_echo(name, "")
    run = await service.mail_run(_run(cursors={"AAA": 0, "BBB": 0, "CCC": 0}))
    assert set(run.cursors) == {"EMERGENCY", "DEMO", "AAA"}


async def test_channel_endpoints_create_list_and_read(tmp_path: Path) -> None:
    _install(tmp_path)
    app.state.channel_create_limiter = RateLimiter(3, error=ChannelRateLimitedError)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        made = await client.post("/api/channel/echoes", json={"name": "news", "about": "Local news"})
        again = await client.post("/api/channel/echoes", json={"name": "NEWS"})
        bad = await client.post("/api/channel/echoes", json={"name": "x"})
        listed = await client.get("/api/channel/echoes")
        read = await client.get("/api/channel/echoes/news")
    assert made.status_code == 201
    assert made.json() == {"name": "NEWS", "about": "Local news", "builtin": False, "createdAt": made.json()["createdAt"]}
    assert again.status_code == 409 and again.json()["error"]["code"] == "ECHO_EXISTS"
    assert bad.status_code == 422 and bad.json()["error"]["code"] == "INVALID_ECHO"
    assert listed.status_code == 200
    assert [e["name"] for e in listed.json()["echoes"]] == [*BUILTIN, "NEWS"]
    assert set(listed.json()) == {"echoes", "room"}
    assert read.status_code == 200 and read.json()["area"] == "NEWS"


async def test_creating_channels_is_rate_limited(tmp_path: Path) -> None:
    _install(tmp_path)
    app.state.channel_create_limiter = RateLimiter(1, error=ChannelRateLimitedError)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        first = await client.post("/api/channel/echoes", json={"name": "ONE"})
        second = await client.post("/api/channel/echoes", json={"name": "TWO"})
    assert first.status_code == 201
    assert second.status_code == 429 and second.json()["error"]["code"] == "CHANNEL_RATE_LIMITED"


async def test_radio_channels_are_built_in_with_their_own_about_text(tmp_path: Path) -> None:
    service, _ = _service(tmp_path)
    listed = await service.list_echoes()
    radio = [e for e in listed.echoes if e.name.startswith("RADIO-")]
    assert [e.name for e in radio] == [f"RADIO-{n}" for n in range(1, 10)]
    assert all(e.builtin for e in radio)
    assert radio[2].about == "Radio channel 3, played as radio teletype."
    with pytest.raises(EchoExistsError):
        await service.create_echo("radio-4", "")
