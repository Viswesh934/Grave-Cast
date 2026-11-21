"""Chat's messages in DynamoDB: one table with a string key `pk` and a string sort key `sk`.

Items:
- `META`: the seq counter, the number of created echoes, and a message count per echo.
- `AREA#<echo>` / `<seq, zero padded>`: one message.
- `MSGID#<msgid>` / `MSGID`: marks a msgid as stored, so a retry never posts twice. It expires
  by itself when the table's time-to-live is switched on for the `expires_at` attribute.
- `ECHO` / `<name>`: a channel someone created.

A message is written in one transaction that moves the counter, stores the message and its
marker, and drops the echo's oldest message when the echo is full. The counter's value is
checked in the same transaction, so seq follows commit order exactly, as it does in SQLite.
"""
from __future__ import annotations

import asyncio
import logging
import random
import time
from typing import Any

import boto3
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError
from boto3.dynamodb.types import TypeDeserializer, TypeSerializer

from app.common.errors import ChannelBusyError
from app.config import Settings
from app.modules.channel.store import NewMessage, StoredEcho, StoredMessage

logger = logging.getLogger(__name__)

_SERIALIZER = TypeSerializer()
_DESERIALIZER = TypeDeserializer()

_META_KEY = {"pk": {"S": "META"}, "sk": {"S": "META"}}
_ECHO_PK = "ECHO"
_SECONDS_PER_DAY = 86_400
# Transaction failures that mean "someone else got there first": read again and retry.
_RETRYABLE = {"TransactionConflict", "ThrottlingError", "ProvisionedThroughputExceeded"}
_CONDITION_FAILED = "ConditionalCheckFailed"


def _typed(values: dict[str, Any]) -> dict[str, Any]:
    return {name: _SERIALIZER.serialize(value) for name, value in values.items()}


def _plain(item: dict[str, Any]) -> dict[str, Any]:
    return {name: _DESERIALIZER.deserialize(value) for name, value in item.items()}


def _area_pk(area: str) -> str:
    return f"AREA#{area}"


def _seq_sk(seq: int) -> str:
    return f"{seq:016d}"


def _message(item: dict[str, Any]) -> StoredMessage:
    return StoredMessage(
        seq=int(item["seq"]),
        msgid=item["msgid"],
        area=item["area"],
        sender=item["sender"],
        body=item["body"],
        sent_at=item["sent_at"],
        received_at=item["received_at"],
    )


def _cancel_codes(error: ClientError) -> list[str] | None:
    """Why each item of a cancelled transaction failed, or None when this was a different error."""
    if error.response.get("Error", {}).get("Code") != "TransactionCanceledException":
        return None
    return [reason.get("Code", "None") for reason in error.response.get("CancellationReasons", [])]


def _make_client(region: str | None, timeout_seconds: float) -> Any:
    config = Config(
        connect_timeout=timeout_seconds,
        read_timeout=timeout_seconds,
        retries={"max_attempts": 3, "mode": "standard"},
    )
    return boto3.client("dynamodb", region_name=region, config=config)


class DynamoChannelStore:
    """The ChannelStore interface on DynamoDB. Calls are blocking, so each runs in a thread."""

    def __init__(
        self,
        table: str,
        *,
        client: Any,
        write_attempts: int = 8,
        dedupe_days: int = 30,
    ) -> None:
        self._table = table
        self._client = client
        self._attempts = write_attempts
        self._dedupe_seconds = dedupe_days * _SECONDS_PER_DAY

    @classmethod
    def from_settings(cls, settings: Settings) -> DynamoChannelStore:
        if not settings.channel_table:
            raise RuntimeError("GRAVECAST_CHANNEL_TABLE is required when GRAVECAST_CHANNEL_STORE is dynamodb.")
        return cls(
            settings.channel_table,
            client=_make_client(settings.channel_region, settings.channel_aws_timeout_seconds),
            write_attempts=settings.channel_write_attempts,
            dedupe_days=settings.channel_dedupe_days,
        )

    # Blocking helpers

    def _call(self, name: str, **kwargs: Any) -> Any:
        """One DynamoDB call. Other failures become a calm 'busy' error and never leak details."""
        try:
            return getattr(self._client, name)(TableName=self._table, **kwargs)
        except (ClientError, BotoCoreError) as error:
            code = error.response.get("Error", {}).get("Code") if isinstance(error, ClientError) else type(error).__name__
            logger.error("DynamoDB %s failed: %s", name, code)
            raise ChannelBusyError() from error

    def _transact(self, items: list[dict[str, Any]]) -> list[str] | None:
        """Runs a transaction. None when it went through, or the per-item failure codes when it was cancelled."""
        for item in items:
            for operation in item.values():
                operation["TableName"] = self._table
        try:
            self._client.transact_write_items(TransactItems=items)
            return None
        except ClientError as error:
            codes = _cancel_codes(error)
            if codes is None:
                logger.error("DynamoDB transact_write_items failed: %s", error.response.get("Error", {}).get("Code"))
                raise ChannelBusyError() from error
            return codes
        except BotoCoreError as error:
            logger.error("DynamoDB transact_write_items failed: %s", type(error).__name__)
            raise ChannelBusyError() from error

    def _meta(self) -> dict[str, Any]:
        response = self._call("get_item", Key=_META_KEY, ConsistentRead=True)
        return _plain(response["Item"]) if "Item" in response else {}

    def _oldest_key(self, area: str) -> dict[str, Any] | None:
        response = self._call(
            "query",
            KeyConditionExpression="pk = :pk",
            ExpressionAttributeValues=_typed({":pk": _area_pk(area)}),
            ScanIndexForward=True,
            Limit=1,
            ConsistentRead=True,
        )
        items = response.get("Items", [])
        return {"pk": items[0]["pk"], "sk": items[0]["sk"]} if items else None

    def _backoff(self, attempt: int) -> None:
        time.sleep(random.uniform(0.005, 0.03) * (attempt + 1))

    # Messages

    def _add(self, message: NewMessage, keep: int) -> bool:
        count_name = f"c_{message.area}"
        for attempt in range(self._attempts):
            meta = self._meta()
            seq = int(meta.get("seq", 0))
            full = int(meta.get(count_name, 0)) >= keep
            oldest = self._oldest_key(message.area) if full else None
            operations: list[dict[str, Any]] = [
                {
                    "Update": {
                        "Key": _META_KEY,
                        "UpdateExpression": "SET seq = :next ADD #count :delta",
                        # The counter must still be where we read it, or someone else wrote first.
                        "ConditionExpression": "attribute_not_exists(seq) OR seq = :seq",
                        "ExpressionAttributeNames": {"#count": count_name},
                        "ExpressionAttributeValues": _typed(
                            {":next": seq + 1, ":seq": seq, ":delta": 0 if oldest else 1}
                        ),
                    }
                },
                {
                    "Put": {
                        "Item": _typed(
                            {
                                "pk": f"MSGID#{message.msgid}",
                                "sk": "MSGID",
                                "expires_at": int(time.time()) + self._dedupe_seconds,
                            }
                        ),
                        "ConditionExpression": "attribute_not_exists(pk)",
                    }
                },
                {
                    "Put": {
                        "Item": _typed(
                            {
                                "pk": _area_pk(message.area),
                                "sk": _seq_sk(seq + 1),
                                "seq": seq + 1,
                                "msgid": message.msgid,
                                "area": message.area,
                                "sender": message.sender,
                                "body": message.body,
                                "sent_at": message.sent_at,
                                "received_at": message.received_at,
                            }
                        )
                    }
                },
            ]
            if oldest:
                operations.append({"Delete": {"Key": oldest}})
            codes = self._transact(operations)
            if codes is None:
                return True
            if len(codes) > 1 and codes[1] == _CONDITION_FAILED:
                return False  # the marker exists: this msgid was stored before
            if any(code in _RETRYABLE for code in codes) or (codes and codes[0] == _CONDITION_FAILED):
                self._backoff(attempt)
                continue
            logger.error("DynamoDB message write cancelled: %s", codes)
            raise ChannelBusyError()
        raise ChannelBusyError()

    def _since(self, area: str, seq: int, limit: int) -> list[StoredMessage]:
        response = self._call(
            "query",
            KeyConditionExpression="pk = :pk AND sk > :sk",
            ExpressionAttributeValues=_typed({":pk": _area_pk(area), ":sk": _seq_sk(seq)}),
            ScanIndexForward=True,
            Limit=limit,
            ConsistentRead=True,
        )
        return [_message(_plain(item)) for item in response.get("Items", [])]

    def _latest(self, area: str, limit: int) -> list[StoredMessage]:
        response = self._call(
            "query",
            KeyConditionExpression="pk = :pk",
            ExpressionAttributeValues=_typed({":pk": _area_pk(area)}),
            ScanIndexForward=False,
            Limit=limit,
            ConsistentRead=True,
        )
        return [_message(_plain(item)) for item in reversed(response.get("Items", []))]

    def _newest_seq(self) -> int:
        return int(self._meta().get("seq", 0))

    # Created channels

    def _add_echo(self, echo: StoredEcho, limit: int) -> str:
        for attempt in range(self._attempts):
            codes = self._transact(
                [
                    {
                        "Update": {
                            "Key": _META_KEY,
                            "UpdateExpression": "ADD echo_count :one",
                            "ConditionExpression": "attribute_not_exists(echo_count) OR echo_count < :limit",
                            "ExpressionAttributeValues": _typed({":one": 1, ":limit": limit}),
                        }
                    },
                    {
                        "Put": {
                            "Item": _typed(
                                {
                                    "pk": _ECHO_PK,
                                    "sk": echo.name,
                                    "name": echo.name,
                                    "about": echo.about,
                                    "created_at": echo.created_at,
                                }
                            ),
                            "ConditionExpression": "attribute_not_exists(pk)",
                        }
                    },
                ]
            )
            if codes is None:
                return "added"
            if len(codes) > 1 and codes[1] == _CONDITION_FAILED:
                return "exists"
            if codes and codes[0] == _CONDITION_FAILED:
                return "full"
            if any(code in _RETRYABLE for code in codes):
                self._backoff(attempt)
                continue
            logger.error("DynamoDB echo write cancelled: %s", codes)
            raise ChannelBusyError()
        raise ChannelBusyError()

    def _echoes(self) -> list[StoredEcho]:
        echoes: list[StoredEcho] = []
        start: dict[str, Any] | None = None
        while True:
            extra = {"ExclusiveStartKey": start} if start else {}
            response = self._call(
                "query",
                KeyConditionExpression="pk = :pk",
                ExpressionAttributeValues=_typed({":pk": _ECHO_PK}),
                ConsistentRead=True,
                **extra,
            )
            for item in response.get("Items", []):
                plain = _plain(item)
                echoes.append(StoredEcho(name=plain["name"], about=plain["about"], created_at=plain["created_at"]))
            start = response.get("LastEvaluatedKey")
            if not start:
                break
        return sorted(echoes, key=lambda echo: (echo.created_at, echo.name))

    # ChannelStore

    async def add(self, message: NewMessage, keep: int) -> bool:
        return await asyncio.to_thread(self._add, message, keep)

    async def since(self, area: str, seq: int, limit: int) -> list[StoredMessage]:
        return await asyncio.to_thread(self._since, area, seq, limit)

    async def latest(self, area: str, limit: int) -> list[StoredMessage]:
        return await asyncio.to_thread(self._latest, area, limit)

    async def newest_seq(self) -> int:
        return await asyncio.to_thread(self._newest_seq)

    async def add_echo(self, echo: StoredEcho, limit: int) -> str:
        return await asyncio.to_thread(self._add_echo, echo, limit)

    async def echoes(self) -> list[StoredEcho]:
        return await asyncio.to_thread(self._echoes)
