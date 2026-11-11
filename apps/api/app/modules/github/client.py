"""HTTP client for the GitHub REST API."""

from __future__ import annotations

import asyncio
import logging
from typing import Any

import httpx

from app.common.errors import (
    GitHubApiError,
    NetworkError,
    PrivateRepositoryError,
    RateLimitExceededError,
    RepositoryNotFoundError,
    RepositoryTooLargeError,
)
from app.config import Settings
from app.modules.github.types import CommitResolution, RepoMetadata

logger = logging.getLogger(__name__)


class GitHubClient:
    """Thin async wrapper around GitHub REST endpoints used for ingestion."""

    def __init__(
        self,
        settings: Settings,
        client: httpx.AsyncClient | None = None,
    ) -> None:
        self._settings = settings
        self._owns_client = client is None
        self._client = client or httpx.AsyncClient(
            base_url=settings.github_api_base_url,
            timeout=httpx.Timeout(settings.request_timeout_seconds),
            headers=self._default_headers(),
            follow_redirects=True,
        )

    def _default_headers(self) -> dict[str, str]:
        headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": self._settings.github_user_agent,
        }
        if self._settings.github_token:
            headers["Authorization"] = f"Bearer {self._settings.github_token}"
        return headers

    async def aclose(self) -> None:
        if self._owns_client:
            await self._client.aclose()

    async def __aenter__(self) -> GitHubClient:
        return self

    async def __aexit__(self, *args: object) -> None:
        await self.aclose()

    async def get_repository(self, owner: str, repo: str) -> RepoMetadata:
        data = await self._request_json("GET", f"/repos/{owner}/{repo}")
        return RepoMetadata(
            name=data["name"],
            full_name=data["full_name"],
            private=bool(data.get("private", False)),
            default_branch=data["default_branch"],
            size=int(data.get("size") or 0),
            language=data.get("language"),
        )

    async def resolve_commit(
        self, owner: str, repo: str, branch: str
    ) -> CommitResolution:
        data = await self._request_json(
            "GET", f"/repos/{owner}/{repo}/commits/{branch}"
        )
        commit_sha = data["sha"]
        tree_sha = data["commit"]["tree"]["sha"]
        return CommitResolution(commit_sha=commit_sha, tree_sha=tree_sha)

    async def download_zipball(
        self, owner: str, repo: str, commit_sha: str
    ) -> bytes:
        """Download the repository zip archive pinned to a commit SHA.

        This is typically 1 API request (plus an automatic redirect to
        codeload.github.com) instead of one request per file.
        """
        path = f"/repos/{owner}/{repo}/zipball/{commit_sha}"
        # When following redirects across domains (api.github.com -> codeload.github.com),
        # an explicit absolute URL or client request with follow_redirects=True is used.
        # Constructing full URL to prevent base_url mismatch on redirect.
        url = f"{self._settings.github_api_base_url}{path}"
        response = await self._client.get(url, follow_redirects=True)
        self._log_rate_limit(response)
        self._raise_for_github_status(response)
        if response.status_code >= 400:
            raise GitHubApiError("GitHub API request failed.")

        content_length = response.headers.get("Content-Length")
        if content_length and content_length.isdigit():
            max_compressed = max(self._settings.max_total_bytes * 2, 5_000_000)
            if int(content_length) > max_compressed:
                raise RepositoryTooLargeError(
                    "Repository archive exceeds the configured download size limit."
                )

        content = response.content
        max_compressed = max(self._settings.max_total_bytes * 2, 5_000_000)
        if len(content) > max_compressed:
            raise RepositoryTooLargeError(
                "Repository archive exceeds the configured download size limit."
            )
        if not content:
            raise GitHubApiError("GitHub returned an empty repository archive.")
        return content

    async def _request_json(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        response = await self._request_with_retries(method, path, params=params)
        try:
            data = response.json()
        except ValueError as exc:
            raise GitHubApiError(
                "GitHub API returned an invalid response."
            ) from exc
        if not isinstance(data, dict):
            raise GitHubApiError(
                "GitHub API returned an unexpected payload."
            )
        return data

    async def _request_raw(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, str] | None = None,
    ) -> httpx.Response:
        return await self._request_with_retries(method, path, params=params)

    async def _request_with_retries(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, str] | None = None,
    ) -> httpx.Response:
        last_error: Exception | None = None
        attempts = self._settings.max_retries + 1

        for attempt in range(attempts):
            try:
                response = await self._client.request(
                    method, path, params=params
                )
            except httpx.TimeoutException as exc:
                last_error = exc
                if attempt + 1 >= attempts:
                    raise NetworkError(
                        "GitHub API request timed out."
                    ) from exc
                await asyncio.sleep(
                    self._settings.retry_backoff_seconds * (attempt + 1)
                )
                continue
            except httpx.TransportError as exc:
                last_error = exc
                if attempt + 1 >= attempts:
                    raise NetworkError(
                        "Network error while contacting GitHub."
                    ) from exc
                await asyncio.sleep(
                    self._settings.retry_backoff_seconds * (attempt + 1)
                )
                continue

            self._log_rate_limit(response)
            self._raise_for_github_status(response)

            if response.status_code >= 500:
                last_error = GitHubApiError(
                    "GitHub API is temporarily unavailable."
                )
                if attempt + 1 >= attempts:
                    raise last_error
                await asyncio.sleep(
                    self._settings.retry_backoff_seconds * (attempt + 1)
                )
                continue

            if response.status_code >= 400:
                raise GitHubApiError("GitHub API request failed.")

            return response

        raise NetworkError(
            "Network error while contacting GitHub."
        ) from last_error

    def _raise_for_github_status(self, response: httpx.Response) -> None:
        if response.status_code == 404:
            raise RepositoryNotFoundError()
        if response.status_code == 403 and self._is_rate_limited(response):
            raise RateLimitExceededError()
        if response.status_code in {401, 403}:
            raise PrivateRepositoryError(
                "Repository is private or inaccessible."
            )
        if response.status_code == 429:
            raise RateLimitExceededError()

    @staticmethod
    def _is_rate_limited(response: httpx.Response) -> bool:
        remaining = response.headers.get("X-RateLimit-Remaining")
        if remaining == "0":
            return True
        message = ""
        try:
            message = str(response.json().get("message", "")).lower()
        except Exception:
            message = (response.text or "").lower()
        return "rate limit" in message

    @staticmethod
    def _log_rate_limit(response: httpx.Response) -> None:
        remaining = response.headers.get("X-RateLimit-Remaining")
        limit = response.headers.get("X-RateLimit-Limit")
        if remaining is not None:
            logger.debug(
                "GitHub rate limit remaining=%s limit=%s", remaining, limit
            )
