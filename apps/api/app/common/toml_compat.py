"""TOML parsing that works on Python 3.10 and newer: `tomllib` is built in from 3.11, `tomli` is the same code for 3.10."""
from __future__ import annotations

try:
    import tomllib
except ModuleNotFoundError:  # Python 3.10
    import tomli as tomllib  # type: ignore[no-redef]

__all__ = ["tomllib"]
