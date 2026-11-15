"""Find TODO, FIXME, HACK and XXX comments in source text."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Literal

MarkerKind = Literal["FIXME", "XXX", "HACK", "TODO"]

# Most serious first: FIXME says something is broken, XXX flags something
# wrong or dangerous, HACK marks a workaround, TODO marks unfinished work.
MARKER_ORDER: tuple[MarkerKind, ...] = ("FIXME", "XXX", "HACK", "TODO")

# A marker counts only in upper case, as a whole word, optionally followed by
# an owner in brackets such as TODO(alice): and then the note.
_MARKER_RE = re.compile(r"\b(TODO|FIXME|HACK|XXX)\b(?:\([^)\n]{0,40}\))?[:\s-]*(.*)$")
_COMMENT_CLOSERS_RE = re.compile(r"\s*(\*/|-->|#\}|%\})\s*$")

_WORD_RE = re.compile(r"\w")

NOTE_MAX_CHARS = 140


@dataclass(frozen=True)
class Marker:
    kind: MarkerKind
    path: str
    line: int
    note: str


def find_markers(path: str, text: str) -> list[Marker]:
    """Every marker comment in one file, in line order."""
    found: list[Marker] = []
    for index, line in enumerate(text.splitlines()):
        match = _MARKER_RE.search(line)
        if match is None:
            continue
        note = _COMMENT_CLOSERS_RE.sub("", match.group(2)).strip()
        if not _WORD_RE.search(note):
            note = ""  # only punctuation, such as the end of a string
        if len(note) > NOTE_MAX_CHARS:
            note = note[: NOTE_MAX_CHARS - 1].rstrip() + "\u2026"
        found.append(
            Marker(kind=match.group(1), path=path, line=index + 1, note=note)  # type: ignore[arg-type]
        )
    return found


def sort_markers(markers: list[Marker]) -> list[Marker]:
    """Most serious first, then by path and line."""
    return sorted(
        markers,
        key=lambda m: (MARKER_ORDER.index(m.kind), m.path, m.line),
    )
