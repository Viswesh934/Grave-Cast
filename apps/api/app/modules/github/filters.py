"""File inclusion / exclusion rules for repository ingestion."""

from __future__ import annotations

from pathlib import PurePosixPath

from app.config import Settings

# Directory path segments that should never be ingested.
IGNORED_DIRECTORIES: frozenset[str] = frozenset(
    {
        "node_modules",
        "vendor",
        "dist",
        "build",
        ".git",
        "coverage",
        ".next",
        "out",
        "target",
        "__pycache__",
        ".venv",
        "venv",
        ".tox",
        ".mypy_cache",
        ".pytest_cache",
        ".turbo",
        ".cache",
        "Pods",
        "bower_components",
    }
)

# Exact filenames that are never fetched (lockfiles / generated).
IGNORED_FILENAMES: frozenset[str] = frozenset(
    {
        "package-lock.json",
        "yarn.lock",
        "pnpm-lock.yaml",
        "bun.lock",
        "bun.lockb",
        "composer.lock",
        "poetry.lock",
        "Pipfile.lock",
        "Cargo.lock",
        "Gemfile.lock",
        "go.sum",
        "uv.lock",
    }
)

# Binary / asset extensions excluded even if somehow listed.
BINARY_EXTENSIONS: frozenset[str] = frozenset(
    {
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".webp",
        ".ico",
        ".bmp",
        ".svg",
        ".mp4",
        ".webm",
        ".mov",
        ".mp3",
        ".wav",
        ".ogg",
        ".woff",
        ".woff2",
        ".ttf",
        ".otf",
        ".eot",
        ".zip",
        ".tar",
        ".gz",
        ".tgz",
        ".rar",
        ".7z",
        ".exe",
        ".dll",
        ".so",
        ".dylib",
        ".bin",
        ".pdf",
        ".wasm",
        ".pyc",
        ".class",
        ".o",
        ".a",
        ".jar",
        ".map",
        ".min.js",
        ".min.css",
    }
)

EXTENSION_LANGUAGE: dict[str, str] = {
    ".js": "javascript",
    ".jsx": "javascript",
    ".mjs": "javascript",
    ".cjs": "javascript",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".mts": "typescript",
    ".cts": "typescript",
    ".py": "python",
    ".java": "java",
    ".c": "c",
    ".h": "c",
    ".cc": "cpp",
    ".cpp": "cpp",
    ".cxx": "cpp",
    ".hpp": "cpp",
    ".hh": "cpp",
    ".go": "go",
    ".php": "php",
    ".rb": "ruby",
    ".json": "json",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".toml": "toml",
    ".tf": "terraform",
    ".dockerfile": "dockerfile",
}

SPECIAL_FILENAMES: dict[str, str] = {
    "dockerfile": "dockerfile",
}


def detect_language(path: str) -> str | None:
    """Return a language id for an allowlisted path, else None."""
    posix = PurePosixPath(path)
    name = posix.name
    lower_name = name.lower()

    if lower_name in SPECIAL_FILENAMES:
        return SPECIAL_FILENAMES[lower_name]

    # multi-suffix generated assets like foo.min.js
    if lower_name.endswith(".min.js") or lower_name.endswith(".min.css"):
        return None

    suffix = posix.suffix.lower()
    if suffix in BINARY_EXTENSIONS:
        return None
    return EXTENSION_LANGUAGE.get(suffix)


def is_ignored_path(path: str) -> bool:
    """True if the path sits under an ignored directory or is a lockfile."""
    posix = PurePosixPath(path)
    if any(part in IGNORED_DIRECTORIES for part in posix.parts):
        return True
    if posix.name in IGNORED_FILENAMES:
        return True
    return False


def is_safe_repo_relative_path(path: str) -> bool:
    """Reject empty, absolute, or traversal paths from untrusted tree data."""
    if not path or path.startswith("/") or "\\" in path or "\x00" in path:
        return False
    posix = PurePosixPath(path)
    if posix.is_absolute():
        return False
    return ".." not in posix.parts


def should_include_blob(
    *,
    path: str,
    size: int | None,
    settings: Settings,
) -> tuple[bool, str | None]:
    """Decide whether a tree blob should be fetched.

    Returns (include, language). language is None when excluded.
    """
    if not is_safe_repo_relative_path(path):
        return False, None
    if is_ignored_path(path):
        return False, None

    language = detect_language(path)
    if language is None:
        return False, None

    if size is not None and size > settings.max_file_size_bytes:
        return False, None

    return True, language
