"""Validate and parse public GitHub repository URLs."""

from __future__ import annotations

import re
from urllib.parse import urlparse

from app.common.errors import InvalidRepositoryUrlError, UnsupportedHostError
from app.modules.github.types import ParsedRepoRef

_GITHUB_HOSTS = {"github.com", "www.github.com"}
_OWNER_REPO_RE = re.compile(
    r"^/(?P<owner>[A-Za-z0-9_.-]+)/(?P<repo>[A-Za-z0-9_.-]+?)(?:\.git)?/?$"
)


def parse_github_repo_url(url: str) -> ParsedRepoRef:
    """Extract owner/repo from a supported public GitHub repository URL.

    Accepts:
      - https://github.com/owner/repo
      - https://github.com/owner/repo.git
      - http://github.com/owner/repo/
      - github.com/owner/repo  (scheme optional)
    Rejects non-GitHub hosts, gist URLs, and URLs that do not identify a repo.
    """
    raw = (url or "").strip()
    if not raw:
        raise InvalidRepositoryUrlError("Repository URL is required.")

    candidate = raw if "://" in raw else f"https://{raw}"

    try:
        parsed = urlparse(candidate)
    except ValueError as exc:
        raise InvalidRepositoryUrlError("Malformed repository URL.") from exc

    if parsed.scheme not in {"http", "https"}:
        raise InvalidRepositoryUrlError(
            "Repository URL must use http or https."
        )

    host = (parsed.hostname or "").lower()
    if host not in _GITHUB_HOSTS:
        raise UnsupportedHostError(
            "Only public github.com repositories are supported."
        )

    path = parsed.path or ""
    # Reject nested resource URLs such as /owner/repo/tree/main
    match = _OWNER_REPO_RE.fullmatch(path)
    if not match:
        raise InvalidRepositoryUrlError(
            "URL must identify a GitHub repository as github.com/{owner}/{repo}."
        )

    owner = match.group("owner")
    repo = match.group("repo")

    if owner.lower() in {"settings", "marketplace", "orgs", "users", "login"}:
        raise InvalidRepositoryUrlError(
            "URL must identify a GitHub repository as github.com/{owner}/{repo}."
        )

    if not repo or repo in {".", ".."}:
        raise InvalidRepositoryUrlError("Invalid repository name.")

    return ParsedRepoRef(owner=owner, name=repo)
