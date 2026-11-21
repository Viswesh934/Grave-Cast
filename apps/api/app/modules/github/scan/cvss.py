"""CVSS 3.x base scores from vector strings, for advisories that give no rating of their own (docs/REPO_SCAN_DESIGN.md §5.1).

Weights and formulas are the CVSS v3.1 specification's (FIRST, section 7).
"""
from __future__ import annotations

import math

from app.modules.github.scan.findings import Severity

_AV = {"N": 0.85, "A": 0.62, "L": 0.55, "P": 0.2}
_AC = {"L": 0.77, "H": 0.44}
_PR_UNCHANGED = {"N": 0.85, "L": 0.62, "H": 0.27}
_PR_CHANGED = {"N": 0.85, "L": 0.68, "H": 0.5}
_UI = {"N": 0.85, "R": 0.62}
_CIA = {"H": 0.56, "L": 0.22, "N": 0.0}

# Qualitative bands (CVSS v3.1 specification, section 5).
_CRITICAL, _HIGH, _MEDIUM = 9.0, 7.0, 4.0


def _roundup(value: float) -> float:
    """CVSS 3.1's round-up to one decimal, done in integers so floating point can't tip it."""
    whole = round(value * 100_000)
    return whole / 100_000 if whole % 10_000 == 0 else (math.floor(whole / 10_000) + 1) / 10.0


def base_score(vector: str) -> float | None:
    """The base score of a CVSS 3.0 or 3.1 vector, or None if it can't be read."""
    if not vector.startswith(("CVSS:3.0/", "CVSS:3.1/")):
        return None
    metrics = dict(part.split(":", 1) for part in vector.split("/")[1:] if ":" in part)
    try:
        changed = metrics["S"] == "C"
        privileges = (_PR_CHANGED if changed else _PR_UNCHANGED)[metrics["PR"]]
        exploitability = 8.22 * _AV[metrics["AV"]] * _AC[metrics["AC"]] * privileges * _UI[metrics["UI"]]
        iss = 1 - (1 - _CIA[metrics["C"]]) * (1 - _CIA[metrics["I"]]) * (1 - _CIA[metrics["A"]])
    except KeyError:
        return None
    impact = 7.52 * (iss - 0.029) - 3.25 * (iss - 0.02) ** 15 if changed else 6.42 * iss
    if impact <= 0:
        return 0.0
    total = 1.08 * (impact + exploitability) if changed else impact + exploitability
    return _roundup(min(total, 10))


def severity_of(score: float) -> Severity:
    if score >= _CRITICAL:
        return "critical"
    if score >= _HIGH:
        return "high"
    if score >= _MEDIUM:
        return "medium"
    return "low"
