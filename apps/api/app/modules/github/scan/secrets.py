"""Leaked keys and passwords (docs/REPO_SCAN_DESIGN.md §5.2). Values are redacted here, before anything leaves the scanner."""
from __future__ import annotations

import math
import re
from collections import Counter, defaultdict
from collections.abc import Iterator
from dataclasses import dataclass

from app.modules.github.scan.catalog import finding
from app.modules.github.scan.files import ScanFile, is_test_path
from app.modules.github.scan.findings import Finding, Severity


@dataclass(frozen=True)
class _Pattern:
    rule: str
    regex: re.Pattern[str]
    # Characters of the match kept in the redacted snippet: a provider's public prefix.
    keep: int
    severity: Severity | None = None
    # The capture group holding the secret, when the pattern also matches its name.
    group: int = 0
    # Text the match must contain. A file without any of these is skipped without running the pattern.
    hints: tuple[str, ...] = ()
    # Whether the hints are matched against the lower-cased text.
    nocase: bool = False


_PROVIDER_PATTERNS: tuple[_Pattern, ...] = (
    _Pattern("secret.aws-access-key", re.compile(r"\b(?:AKIA|ABIA|ACCA)[A-Z0-9]{16}\b"), 4, hints=("AKIA", "ABIA", "ACCA")),
    _Pattern("secret.aws-access-key", re.compile(r"\bASIA[A-Z0-9]{16}\b"), 4, severity="high", hints=("ASIA",)),
    _Pattern(
        "secret.aws-secret-key",
        re.compile(r"(?i)aws.{0,20}?secret.{0,20}?['\"]?\s*[:=]\s*['\"]?([A-Za-z0-9/+=]{40})(?![A-Za-z0-9/+=])"),
        0,
        group=1,
        hints=("aws",),
        nocase=True,
    ),
    _Pattern("secret.github-token", re.compile(r"\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36}\b"), 4, hints=("ghp_", "gho_", "ghu_", "ghs_", "ghr_")),
    _Pattern("secret.github-token", re.compile(r"\bgithub_pat_[A-Za-z0-9_]{82}\b"), 11, hints=("github_pat_",)),
    _Pattern("secret.gitlab-token", re.compile(r"\bglpat-[A-Za-z0-9_-]{20}\b"), 6, hints=("glpat-",)),
    _Pattern("secret.slack-token", re.compile(r"\bxox[abprs]-[A-Za-z0-9-]{10,72}\b"), 5, hints=("xox",)),
    _Pattern("secret.slack-webhook", re.compile(r"https://hooks\.slack\.com/services/T[A-Z0-9]+/B[A-Z0-9]+/[A-Za-z0-9]{24}"), 35, hints=("hooks.slack.com",)),
    _Pattern("secret.stripe-live-key", re.compile(r"\b(?:sk|rk)_live_[0-9a-zA-Z]{24,99}\b"), 8, hints=("_live_",)),
    _Pattern("secret.openai-key", re.compile(r"\bsk-(?:proj-|svcacct-|admin-)?[A-Za-z0-9_-]{20,}T3BlbkFJ[A-Za-z0-9_-]{20,}\b"), 3, hints=("T3BlbkFJ",)),
    _Pattern("secret.anthropic-key", re.compile(r"\bsk-ant-(?:api03|admin01)-[A-Za-z0-9_-]{80,100}AA\b"), 14, hints=("sk-ant-",)),
    _Pattern("secret.sendgrid-key", re.compile(r"\bSG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}\b"), 3, hints=("SG.",)),
    _Pattern("secret.npm-token", re.compile(r"\bnpm_[A-Za-z0-9]{36}\b"), 4, hints=("npm_",)),
    _Pattern("secret.pypi-token", re.compile(r"\bpypi-AgEIcHlwaS5vcmc[A-Za-z0-9_-]{50,}"), 5, hints=("pypi-AgEIcHlwaS5vcmc",)),
    _Pattern("secret.google-api-key", re.compile(r"\bAIza[0-9A-Za-z_-]{35}(?![0-9A-Za-z_-])"), 4, hints=("AIza",)),
    _Pattern("secret.private-key", re.compile(r"-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP |)PRIVATE KEY(?: BLOCK)?-----"), 0, hints=("PRIVATE KEY-----", "PRIVATE KEY BLOCK-----")),
    _Pattern("secret.private-key", re.compile(r"-----BEGIN ENCRYPTED PRIVATE KEY-----"), 0, severity="high", hints=("ENCRYPTED PRIVATE KEY",)),
)

_DATABASE_URL = re.compile(
    r"\b(?P<scheme>postgres(?:ql)?|mysql|mariadb|mongodb(?:\+srv)?|rediss?|amqps?|mssql|sqlserver)://"
    r"(?P<user>[^:\s/@'\"`]+):(?P<password>[^@\s/'\"`]+)@(?P<host>[^\s:/'\"`?]+)"
)
_LOCAL_HOSTS = frozenset(
    {"localhost", "127.0.0.1", "0.0.0.0", "::1", "db", "database", "postgres", "postgresql", "mysql", "mongo", "mongodb", "redis", "rabbitmq", "host.docker.internal"}
)

# A quoted value assigned to a name.
_QUOTED_ASSIGNMENT = re.compile(
    r"(?P<key>[A-Za-z_$][\w$.-]{0,60})['\"]?\s*(?::=|=>|=|:)\s*(?P<quote>['\"`])(?P<value>[^'\"`\n]{4,200})(?P=quote)"
)
# An unquoted value: `.env` and `.properties` lines, YAML maps (`KEY: value`) and lists (`- KEY=value`).
_BARE_ASSIGNMENT = re.compile(
    r"^\s*(?:-\s+)?(?:export\s+)?(?P<key>[A-Za-z_][\w.-]{0,60})\s*[=:]\s*(?P<value>[^\s#'\"]{4,200})\s*$", re.MULTILINE
)
# A Terraform variable with a literal default: `variable "db_password" { default = "…" }`.
_TF_VARIABLE = re.compile(r'variable\s+"(?P<key>[^"]+)"\s*\{[^{}]*?\bdefault\s*=\s*"(?P<value>[^"\n]{4,200})"')
_SECRET_NAME = re.compile(
    r"(password|passwd|pwd|secret|token|api_?key|apikey|access_?key|client_?secret|private_?key|auth_?key|secret_?key|encryption_?key|signing_?key)$",
    re.IGNORECASE,
)
# A short value counts only for these names: a 4-character token is a placeholder, a 4-character password is a weak default.
_SHORT_SECRET_NAME = re.compile(r"(password|passwd|pwd|secret)$", re.IGNORECASE)
_PLACEHOLDER = re.compile(
    r"(?i)^(\*+|x+|\.+|-+|#+)$|^change.?me$|your[_-]|replace|example|sample|dummy|placeholder|redacted|insert|enter[_ ]|"
    r"<[^>]*>|\$\{|\{\{|\{[\w.\[\]'\"]*\}|%\(|^\$|process\.env|os\.environ|getenv|env\(|^password$|^secret$|^hashed[_-]|"
    r"test|fake|todo|^null$|^none$|^undefined$|^true$|^false$"
)
# A line that can hold a credential: its name must end in one of these words, so other lines are never read.
_SECRET_WORD = re.compile(r"(?i)passw|pwd|secret|token|api_?key|apikey|access_?key|private_?key|auth_?key|encryption_?key|signing_?key")
# The same words in lower case, found with plain substring search, which is much faster than the pattern.
# Every name `_SECRET_NAME` accepts, after `-` and `.` become `_`, contains one of them.
_SECRET_WORDS: tuple[str, ...] = (
    "passw",
    "pwd",
    "secret",
    "token",
    "apikey",
    *(f"{word}{sep}key" for word in ("api", "access", "private", "auth", "secret", "encryption", "signing") for sep in ("_", "-", ".", "")),
)
# Words that name a kind of value (form fields, schemas), not a value.
_NOT_SECRETS = frozenset({"string", "text", "hidden", "required", "optional", "number", "boolean", "value", "empty", "password", "secret", "none"})
_BARE_VALUE_FILES = re.compile(r"(^\.env|\.(env|properties|ini|cfg|conf|tfvars|ya?ml)$)", re.IGNORECASE)
_IS_EXAMPLE = re.compile(r"EXAMPLE", re.IGNORECASE)
# A value made of this many different characters or fewer (such as xxxxxxxx) is never a real key.
_MIN_DISTINCT_CHARS = 4
_MIN_DISTINCT_SHORT = 3
# Values shorter than this are only reported as weak default passwords.
_LONG_VALUE = 8


def entropy(value: str) -> float:
    """Shannon entropy in bits per character: how random a value looks."""
    counts = Counter(value)
    return -sum((n / len(value)) * math.log2(n / len(value)) for n in counts.values())


def redact(value: str, keep: int) -> str:
    """A secret's public prefix and its length, never the rest: `AKIA… (20 characters)`."""
    return f"{value[:keep]}\u2026 ({len(value)} characters)"


@dataclass(frozen=True)
class _Hit:
    """One secret: which rule, where its characters are, and what is shown instead."""

    rule: str
    line: int
    start: int
    end: int
    replacement: str
    severity: Severity | None = None
    detail: str | None = None


def _provider(file: ScanFile) -> Iterator[_Hit]:
    lower = file.text.lower()
    for pattern in _PROVIDER_PATTERNS:
        haystack = lower if pattern.nocase else file.text
        if pattern.hints and not any(hint in haystack for hint in pattern.hints):
            continue
        for match in pattern.regex.finditer(file.text):
            value = match.group(pattern.group)
            # The provider's public prefix is left out, so ghp_xxxx… counts as the placeholder it is.
            body = value[pattern.keep :] or value
            if _IS_EXAMPLE.search(value) or len(set(body)) < _MIN_DISTINCT_CHARS:
                continue
            start, end = match.span(pattern.group)
            # A private key's header names the key type and holds no secret, so it is shown as it is.
            replacement = value if pattern.rule == "secret.private-key" else redact(value, pattern.keep)
            yield _Hit(pattern.rule, file.line_at(start), start, end, replacement, severity=pattern.severity)


_DATABASE_SCHEMES = ("postgres", "mysql", "mariadb", "mongodb", "redis", "amqp", "mssql", "sqlserver")


def _database_urls(file: ScanFile) -> Iterator[_Hit]:
    lower = file.text.lower()
    if "://" not in lower or not any(scheme in lower for scheme in _DATABASE_SCHEMES):
        return
    for match in _DATABASE_URL.finditer(file.text):
        password = match.group("password")
        if _PLACEHOLDER.search(password) or password.lower() in {"pass", "user", "root", "admin"}:
            continue
        start, end = match.span("password")
        local = match.group("host").lower() in _LOCAL_HOSTS
        yield _Hit(
            "secret.database-url",
            file.line_at(start),
            start,
            end,
            redact(password, 0),
            severity="low" if local else None,
            detail=(
                "A database address with a username and password in it is written into the code. It points at a local or "
                "container host, so it may be a development default, but the same password is often reused elsewhere."
                if local
                else None
            ),
        )


def _secret_lines(text: str) -> list[tuple[int, int]]:
    """The start and end of each line that mentions a secret word, each once."""
    lower = text.lower()
    spans: dict[int, int] = {}
    if len(lower) != len(text):
        # A few letters change length when lower-cased, which would shift the offsets: use the pattern instead.
        for word in _SECRET_WORD.finditer(text):
            start = text.rfind("\n", 0, word.start()) + 1
            end = text.find("\n", word.end())
            spans[start] = len(text) if end < 0 else end
        return sorted(spans.items())
    for word in _SECRET_WORDS:
        at = lower.find(word)
        while at >= 0:
            start = lower.rfind("\n", 0, at) + 1
            end = lower.find("\n", at)
            end = len(lower) if end < 0 else end
            spans[start] = end
            at = lower.find(word, end)  # the rest of this line is already in
    return sorted(spans.items())


def _credentials(file: ScanFile, min_entropy: float) -> Iterator[_Hit]:
    # Only lines that mention a secret word can match, so the patterns run on those lines alone.
    bare = bool(_BARE_VALUE_FILES.search(file.name))
    matches: list[re.Match[str]] = []
    for start, end in _secret_lines(file.text):
        matches += _QUOTED_ASSIGNMENT.finditer(file.text, start, end)
        if bare:
            matches += _BARE_ASSIGNMENT.finditer(file.text, start, end)
    if file.name.lower().endswith(".tf"):
        matches += list(_TF_VARIABLE.finditer(file.text))
    in_tests = is_test_path(file.path)
    for match in matches:
        key = match.group("key").replace("-", "_").replace(".", "_")
        value = match.group("value")
        if not _SECRET_NAME.search(key) or " " in value or "://" in value or value.startswith(("/", "./")):
            continue
        if _PLACEHOLDER.search(value) or value.lower() in _NOT_SECRETS:
            continue
        if len(value) < _LONG_VALUE:
            # A short password or secret is a weak default (root, letmein), but only outside throwaway test code.
            if in_tests or not _SHORT_SECRET_NAME.search(key) or len(set(value)) < _MIN_DISTINCT_SHORT:
                continue
        elif len(set(value)) < _MIN_DISTINCT_CHARS or entropy(value) < min_entropy:
            continue
        start, end = match.span("value")
        yield _Hit("secret.hardcoded-credential", file.line_at(start), start, end, redact(value, 0))


def _redacted_line(file: ScanFile, line: int, hits: list[_Hit]) -> str:
    """The line with every secret on it replaced, not only the one a grave is about."""
    text = file.line_text(line)
    line_start = file.text.rfind("\n", 0, hits[0].start) + 1
    # Earliest first; for spans starting together, the longer one, and a provider's pattern before the generic rule.
    ordered = sorted(hits, key=lambda h: (h.start, -h.end, h.rule == "secret.hardcoded-credential"))
    parts: list[str] = []
    cursor = 0
    for hit in ordered:
        a, b = hit.start - line_start, min(hit.end - line_start, len(text))
        if a < cursor or a > len(text):
            continue  # inside a secret already hidden
        parts += [text[cursor:a], hit.replacement]
        cursor = b
    parts.append(text[cursor:])
    return "".join(parts)


def find_secrets(file: ScanFile, min_entropy: float) -> list[Finding]:
    """Every secret in one file, redacted. Lines marked `gravecast: ignore` or `nosec` are skipped."""
    hits = [h for h in (*_provider(file), *_database_urls(file), *_credentials(file, min_entropy)) if not file.suppressed(h.line)]
    by_line: dict[int, list[_Hit]] = defaultdict(list)
    for hit in hits:
        by_line[hit.line].append(hit)
    snippets = {line: _redacted_line(file, line, group) for line, group in by_line.items()}
    return [
        finding(hit.rule, path=file.path, line=hit.line, snippet=snippets[hit.line], severity=hit.severity, detail=hit.detail)
        for hit in hits
    ]
