"""What a finding is, and the severity and confidence scales (docs/REPO_SCAN_DESIGN.md §3)."""
from __future__ import annotations

from dataclasses import dataclass, field, replace
from typing import Literal

Severity = Literal["critical", "high", "medium", "low", "info"]
Confidence = Literal["confirmed", "likely", "possible"]
Category = Literal[
    "vulnerable-dependency",
    "secret",
    "injection",
    "access-control",
    "crypto",
    "authentication",
    "misconfiguration",
    "supply-chain",
    "exposure",
    "code-note",
]

# Most serious first. Sorting and lowering both read these orders.
SEVERITIES: tuple[Severity, ...] = ("critical", "high", "medium", "low", "info")
CONFIDENCES: tuple[Confidence, ...] = ("confirmed", "likely", "possible")
CATEGORIES: tuple[Category, ...] = (
    "vulnerable-dependency",
    "secret",
    "injection",
    "access-control",
    "crypto",
    "authentication",
    "misconfiguration",
    "supply-chain",
    "exposure",
    "code-note",
)

# A snippet of the offending line is cut to this many characters.
SNIPPET_MAX_CHARS = 160


def lower(severity: Severity) -> Severity:
    """One step less serious. `info` stays `info`."""
    return SEVERITIES[min(SEVERITIES.index(severity) + 1, len(SEVERITIES) - 1)]


def worst(severities: list[Severity]) -> Severity:
    """The most serious of several severities."""
    return min(severities, key=SEVERITIES.index)


@dataclass(frozen=True)
class Reference:
    label: str
    url: str


@dataclass(frozen=True)
class PackageRef:
    """The package a dependency finding is about."""

    ecosystem: str
    name: str
    version: str
    fixed_in: str | None
    dev: bool


@dataclass(frozen=True)
class Finding:
    """One problem found in the repo. Becomes one grave."""

    rule: str
    category: Category
    severity: Severity
    confidence: Confidence
    title: str
    detail: str
    fix: str
    path: str | None
    line: int | None
    snippet: str | None
    owasp: str | None
    cwe: str | None
    references: tuple[Reference, ...] = ()
    package: PackageRef | None = None
    # Findings in the same family on the same line are de-duplicated; the most specific is kept (§8).
    family: str | None = None
    specificity: int = 0
    # Lowered one step in test, example and documentation code (§3).
    lower_in_tests: bool = True

    @property
    def id(self) -> str:
        if self.package is not None:
            p = self.package
            return f"{self.rule}:{p.ecosystem}:{p.name}@{p.version}"
        return f"{self.rule}:{self.path or ''}:{self.line or 0}"

    def with_(self, **changes: object) -> Finding:
        return replace(self, **changes)  # type: ignore[arg-type]


@dataclass
class CheckReport:
    """How one check went: ran, partial, skipped or failed, and why."""

    id: Literal["dependencies", "secrets", "code", "config", "project", "markers"]
    name: str
    status: Literal["ran", "partial", "skipped", "failed"] = "ran"
    detail: str = ""


@dataclass
class ScanStats:
    files_read: int = 0
    files_discovered: int = 0
    files_skipped: int = 0
    languages: list[str] = field(default_factory=list)
    lockfiles: list[str] = field(default_factory=list)
    packages_checked: int = 0
    marker_count: int = 0
