"""Typed models for the server side of the link scan."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

GraveSeverity = Literal["note", "caution", "warning", "danger"]


class LinkScanRequest(BaseModel):
    url: str = Field(..., min_length=1, max_length=2048, description="The link to check")


class LinkGrave(BaseModel):
    """One finding, in the same shape as the app's device-check graves."""

    id: str
    severity: GraveSeverity
    title: str
    evidence: str
    detail: str
    label: str | None = Field(
        default=None,
        description="Replaces the severity word, e.g. 'Missing protection'.",
    )


class LinkHop(BaseModel):
    url: str
    status: int


class DomainRecord(BaseModel):
    """What a WHOIS server said about when a domain was registered."""

    domain: str
    server: str
    created: str = Field(description="The registration date, YYYY-MM-DD.")
    line: str = Field(description="The record's own line, word for word.")
    age_days: int = Field(serialization_alias="ageDays")

    model_config = {"populate_by_name": True}


class LinkScanResponse(BaseModel):
    requested_url: str = Field(serialization_alias="requestedUrl")
    final_url: str = Field(serialization_alias="finalUrl")
    status_code: int | None = Field(serialization_alias="statusCode")
    hops: list[LinkHop]
    graves: list[LinkGrave]
    headers_checked: bool = Field(serialization_alias="headersChecked")
    domain_records: list[DomainRecord] = Field(default_factory=list, serialization_alias="domainRecords")
    domain_age_checked: bool = Field(default=False, serialization_alias="domainAgeChecked")

    model_config = {"populate_by_name": True}
