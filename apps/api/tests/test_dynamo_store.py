"""Chat's DynamoDB store, against moto's in-memory DynamoDB. No real AWS, no network."""
from __future__ import annotations

import asyncio
import threading
from collections.abc import Callable, Iterator
from datetime import datetime, timezone

import boto3
import pytest
from botocore.exceptions import ClientError
from moto import mock_aws

from app.common.errors import ChannelBusyError
from app.config import Settings
from app.main import build_channel_store
from app.modules.channel.dynamo_store import DynamoChannelStore
from app.modules.channel.service import ChannelService
from app.modules.channel.store import NewMessage, SqliteChannelStore, StoredEcho
from app.modules.channel.types import MailRunRequest

TABLE = "gravecast-channel-test"
REGION = "ap-south-1"
DEVICE = "1a2b3c4d"


class _OneCallAtATime:
    """Moto's in-memory table is not safe for calls from several threads at once, so each call waits its turn.
    The store's own races (a read, then a transaction) still happen between calls, which is what the tests need.
    """

    def __init__(self, client: object) -> None:
        self._client = client
        self._lock = threading.Lock()

    def __getattr__(self, name: str) -> Callable[..., object]:
        method = getattr(self._client, name)

        def call(*args: object, **kwargs: object) -> object:
            with self._lock:
                return method(*args, **kwargs)

        return call


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch) -> Iterator[object]:
    monkeypatch.setenv("AWS_ACCESS_KEY_ID", "testing")
    monkeypatch.setenv("AWS_SECRET_ACCESS_KEY", "testing")
    with mock_aws():
        dynamo = boto3.client("dynamodb", region_name=REGION)
        dynamo.create_table(
            TableName=TABLE,
            KeySchema=[{"AttributeName": "pk", "KeyType": "HASH"}, {"AttributeName": "sk", "KeyType": "RANGE"}],
            AttributeDefinitions=[
                {"AttributeName": "pk", "AttributeType": "S"},
                {"AttributeName": "sk", "AttributeType": "S"},
            ],
            BillingMode="PAY_PER_REQUEST",
        )
        yield dynamo


@pytest.fixture
def store(client: object) -> DynamoChannelStore:
    return DynamoChannelStore(TABLE, client=_OneCallAtATime(client))


def _msgid(n: int) -> str:
    return f"{DEVICE}@gravecast {n:08x}"


def _message(n: int, area: str = "DEMO", body: str = "hello") -> NewMessage:
    return NewMessage(
        msgid=_msgid(n),
        area=area,
        sender="Ravi",
        body=body,
        sent_at="2026-11-15T12:00:00.000Z",
        received_at="2026-11-15T12:00:01+00:00",
    )


async def test_messages_get_one_rising_seq_across_all_echoes(store: DynamoChannelStore) -> None:
    assert await store.newest_seq() == 0
    assert await store.add(_message(1, "DEMO"), keep=500)
    assert await store.add(_message(2, "EMERGENCY"), keep=500)
    assert await store.add(_message(3, "DEMO"), keep=500)
    assert await store.newest_seq() == 3
    demo = await store.latest("DEMO", 10)
    assert [m.seq for m in demo] == [1, 3]
    assert [m.msgid for m in demo] == [_msgid(1), _msgid(3)]
    assert [m.seq for m in await store.latest("EMERGENCY", 10)] == [2]


async def test_since_returns_only_newer_messages_oldest_first_up_to_the_limit(store: DynamoChannelStore) -> None:
    for n in range(1, 6):
        await store.add(_message(n), keep=500)
    assert [m.seq for m in await store.since("DEMO", 2, 10)] == [3, 4, 5]
    assert [m.seq for m in await store.since("DEMO", 2, 2)] == [3, 4]
    assert await store.since("DEMO", 5, 10) == []
    assert await store.since("EMERGENCY", 0, 10) == []


async def test_latest_returns_the_newest_in_order(store: DynamoChannelStore) -> None:
    for n in range(1, 6):
        await store.add(_message(n), keep=500)
    assert [m.seq for m in await store.latest("DEMO", 3)] == [3, 4, 5]


async def test_the_message_comes_back_whole(store: DynamoChannelStore) -> None:
    await store.add(_message(1, body="Water is rising at the bridge"), keep=500)
    [stored] = await store.latest("DEMO", 1)
    assert stored.body == "Water is rising at the bridge"
    assert stored.sender == "Ravi"
    assert stored.area == "DEMO"
    assert stored.sent_at == "2026-11-15T12:00:00.000Z"
    assert stored.received_at == "2026-11-15T12:00:01+00:00"


async def test_a_repeated_msgid_is_not_stored_twice(store: DynamoChannelStore) -> None:
    assert await store.add(_message(1), keep=500) is True
    assert await store.add(_message(1, body="changed"), keep=500) is False
    messages = await store.latest("DEMO", 10)
    assert len(messages) == 1
    assert messages[0].body == "hello"
    # The refused repeat did not use up a seq.
    assert await store.newest_seq() == 1


async def test_the_same_message_sent_at_once_is_stored_exactly_once(store: DynamoChannelStore) -> None:
    results = await asyncio.gather(*(store.add(_message(1), keep=500) for _ in range(6)))
    assert results.count(True) == 1
    assert results.count(False) == 5
    assert len(await store.latest("DEMO", 10)) == 1


async def test_only_the_newest_keep_messages_stay_in_an_echo(store: DynamoChannelStore) -> None:
    for n in range(1, 6):
        await store.add(_message(n, "DEMO"), keep=3)
    await store.add(_message(10, "EMERGENCY"), keep=3)
    assert [m.msgid for m in await store.latest("DEMO", 10)] == [_msgid(3), _msgid(4), _msgid(5)]
    # Another echo is not touched.
    assert [m.msgid for m in await store.latest("EMERGENCY", 10)] == [_msgid(10)]


async def test_a_pruned_message_still_counts_as_stored(store: DynamoChannelStore) -> None:
    for n in range(1, 5):
        await store.add(_message(n), keep=2)
    assert await store.add(_message(1), keep=2) is False


async def test_many_writers_at_once_get_unique_contiguous_seqs(client: object) -> None:
    # Each round of collisions lets one writer through, so 15 writers need up to 15 attempts.
    store = DynamoChannelStore(TABLE, client=_OneCallAtATime(client), write_attempts=30)
    areas = ["DEMO", "EMERGENCY", "RADIO-1"]
    results = await asyncio.gather(*(store.add(_message(n, areas[n % 3]), keep=500) for n in range(1, 16)))
    assert all(results)
    seqs: list[int] = []
    for area in areas:
        seqs.extend(m.seq for m in await store.latest(area, 50))
    assert sorted(seqs) == list(range(1, 16))
    assert await store.newest_seq() == 15


async def test_created_channels_are_listed_oldest_first_and_names_are_unique(store: DynamoChannelStore) -> None:
    assert await store.echoes() == []
    first = StoredEcho(name="FLOOD-HELP", about="Flood help.", created_at="2026-11-15T12:00:00+00:00")
    second = StoredEcho(name="BRIDGE", about="", created_at="2026-11-15T12:00:05+00:00")
    assert await store.add_echo(first, limit=10) == "added"
    assert await store.add_echo(second, limit=10) == "added"
    assert await store.add_echo(first, limit=10) == "exists"
    assert await store.echoes() == [first, second]


async def test_the_number_of_created_channels_is_capped(store: DynamoChannelStore) -> None:
    for n in range(3):
        echo = StoredEcho(name=f"CHAN-{n}", about="", created_at=f"2026-11-15T12:00:0{n}+00:00")
        assert await store.add_echo(echo, limit=3) == "added"
    full = StoredEcho(name="ONE-MORE", about="", created_at="2026-11-15T12:00:09+00:00")
    assert await store.add_echo(full, limit=3) == "full"
    assert len(await store.echoes()) == 3


async def test_creating_the_same_channel_at_once_adds_it_once(store: DynamoChannelStore) -> None:
    echo = StoredEcho(name="SAME", about="", created_at="2026-11-15T12:00:00+00:00")
    results = await asyncio.gather(*(store.add_echo(echo, limit=10) for _ in range(5)))
    assert results.count("added") == 1
    assert results.count("exists") == 4
    assert len(await store.echoes()) == 1


async def test_creating_channels_does_not_disturb_message_numbers(store: DynamoChannelStore) -> None:
    await store.add(_message(1), keep=500)
    await store.add_echo(StoredEcho(name="LATER", about="", created_at="2026-11-15T12:00:00+00:00"), limit=10)
    await store.add(_message(2), keep=500)
    assert [m.seq for m in await store.latest("DEMO", 10)] == [1, 2]


async def test_the_chat_service_works_on_dynamodb(store: DynamoChannelStore) -> None:
    settings = Settings()
    times = iter(datetime(2026, 11, 15, 12, 0, s, tzinfo=timezone.utc) for s in range(60))
    service = ChannelService(store, settings, clock=lambda: next(times))
    wire = {"msgid": _msgid(1), "area": "DEMO", "from": "Ravi", "body": "hello", "sentAt": "2026-11-15T12:00:00.000Z"}
    first = await service.mail_run(MailRunRequest.model_validate({"messages": [wire], "cursors": {}}))
    assert first.accepted == [_msgid(1)]
    assert [m.body for m in first.messages if m.area == "DEMO"] == ["hello"]
    cursor = first.cursors["DEMO"]
    # A retry is accepted again but stored once, and nothing new comes back.
    again = await service.mail_run(MailRunRequest.model_validate({"messages": [wire], "cursors": {"DEMO": cursor}}))
    assert again.accepted == [_msgid(1)]
    assert [m for m in again.messages if m.area == "DEMO"] == []
    # A cursor from a wiped table starts over.
    reset = await service.mail_run(MailRunRequest.model_validate({"messages": [], "cursors": {"DEMO": cursor + 50}}))
    assert [m.body for m in reset.messages if m.area == "DEMO"] == ["hello"]


class _Failing:
    """A client whose calls fail the way AWS does when it is overloaded or the table is missing."""

    def __init__(self, code: str) -> None:
        self._code = code

    def _fail(self, operation: str) -> ClientError:
        return ClientError({"Error": {"Code": self._code, "Message": "secret details"}}, operation)

    def get_item(self, **_: object) -> None:
        raise self._fail("GetItem")

    def query(self, **_: object) -> None:
        raise self._fail("Query")

    def transact_write_items(self, **_: object) -> None:
        raise self._fail("TransactWriteItems")


@pytest.mark.parametrize("code", ["ProvisionedThroughputExceededException", "ResourceNotFoundException", "AccessDeniedException"])
async def test_aws_failures_become_a_calm_busy_error_without_details(code: str) -> None:
    store = DynamoChannelStore(TABLE, client=_Failing(code))
    for call in (
        store.newest_seq(),
        store.latest("DEMO", 5),
        store.since("DEMO", 0, 5),
        store.echoes(),
        store.add(_message(1), keep=500),
        store.add_echo(StoredEcho(name="X-Y", about="", created_at="now"), limit=5),
    ):
        with pytest.raises(ChannelBusyError) as caught:
            await call
        assert caught.value.status_code == 503
        assert "secret details" not in caught.value.message


class _AlwaysConflicts(_Failing):
    def transact_write_items(self, **_: object) -> None:
        raise ClientError(
            {
                "Error": {"Code": "TransactionCanceledException", "Message": "x"},
                "CancellationReasons": [{"Code": "ConditionalCheckFailed"}, {"Code": "None"}, {"Code": "None"}],
            },
            "TransactWriteItems",
        )

    def get_item(self, **_: object) -> dict:
        return {}


async def test_a_write_that_keeps_losing_the_race_gives_up_with_a_busy_error() -> None:
    store = DynamoChannelStore(TABLE, client=_AlwaysConflicts("x"), write_attempts=3)
    with pytest.raises(ChannelBusyError):
        await store.add(_message(1), keep=500)


# Choosing the store

def test_sqlite_is_the_default_store(tmp_path) -> None:
    settings = Settings(channel_db_path=tmp_path / "c.sqlite3")
    assert isinstance(build_channel_store(settings), SqliteChannelStore)


def test_dynamodb_needs_a_table_name() -> None:
    with pytest.raises(RuntimeError, match="GRAVECAST_CHANNEL_TABLE"):
        build_channel_store(Settings(channel_store="dynamodb"))


def test_an_unknown_store_stops_startup() -> None:
    with pytest.raises(RuntimeError, match="sqlite or dynamodb"):
        build_channel_store(Settings(channel_store="postgres"))


def test_dynamodb_store_is_built_from_settings(client: object) -> None:
    store = build_channel_store(Settings(channel_store="dynamodb", channel_table=TABLE, channel_region=REGION))
    assert isinstance(store, DynamoChannelStore)


def test_settings_read_the_chat_store_variables(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("GRAVECAST_CHANNEL_STORE", " DynamoDB ")
    monkeypatch.setenv("GRAVECAST_CHANNEL_TABLE", "gravecast-channel")
    monkeypatch.setenv("GRAVECAST_CHANNEL_REGION", "ap-south-1")
    settings = Settings.from_env()
    assert (settings.channel_store, settings.channel_table, settings.channel_region) == ("dynamodb", "gravecast-channel", "ap-south-1")
