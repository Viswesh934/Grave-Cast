"""Stable application-level errors for the API surface."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class AppError(Exception):
    """Domain error with a stable code and safe client message."""

    code: str
    message: str
    status_code: int = 400

    def __str__(self) -> str:  # pragma: no cover - trivial
        return f"{self.code}: {self.message}"


class InvalidRepositoryUrlError(AppError):
    def __init__(self, message: str = "Invalid GitHub repository URL.") -> None:
        super().__init__(
            code="INVALID_URL",
            message=message,
            status_code=400,
        )


class UnsupportedHostError(AppError):
    def __init__(
        self, message: str = "Only public github.com repositories are supported."
    ) -> None:
        super().__init__(
            code="UNSUPPORTED_HOST",
            message=message,
            status_code=400,
        )


class RepositoryNotFoundError(AppError):
    def __init__(
        self, message: str = "Repository not found or is inaccessible."
    ) -> None:
        super().__init__(
            code="REPO_NOT_FOUND",
            message=message,
            status_code=404,
        )


class PrivateRepositoryError(AppError):
    def __init__(
        self, message: str = "Private repositories are not supported."
    ) -> None:
        super().__init__(
            code="PRIVATE_REPO",
            message=message,
            status_code=403,
        )


class RateLimitExceededError(AppError):
    def __init__(
        self,
        message: str = "GitHub API rate limit exceeded. Try again later.",
    ) -> None:
        super().__init__(
            code="RATE_LIMITED",
            message=message,
            status_code=429,
        )


class GitHubApiError(AppError):
    def __init__(
        self, message: str = "GitHub API request failed."
    ) -> None:
        super().__init__(
            code="GITHUB_API_ERROR",
            message=message,
            status_code=502,
        )


class NetworkError(AppError):
    def __init__(
        self, message: str = "Network error while contacting GitHub."
    ) -> None:
        super().__init__(
            code="NETWORK_ERROR",
            message=message,
            status_code=502,
        )


class TreeTruncatedError(AppError):
    def __init__(
        self,
        message: str = (
            "Repository tree is too large for recursive ingestion. "
            "Try a smaller repository."
        ),
    ) -> None:
        super().__init__(
            code="TREE_TRUNCATED",
            message=message,
            status_code=422,
        )


class RepositoryTooLargeError(AppError):
    def __init__(
        self,
        message: str = "Repository exceeds the configured size limit.",
    ) -> None:
        super().__init__(
            code="REPO_TOO_LARGE",
            message=message,
            status_code=422,
        )


class FileLimitExceededError(AppError):
    def __init__(
        self,
        message: str = "Repository exceeds configured file or byte limits.",
    ) -> None:
        super().__init__(
            code="FILE_LIMIT_EXCEEDED",
            message=message,
            status_code=422,
        )


class DecodeError(AppError):
    def __init__(
        self, message: str = "Failed to decode one or more repository files."
    ) -> None:
        super().__init__(
            code="DECODE_ERROR",
            message=message,
            status_code=422,
        )


class PathValidationError(AppError):
    def __init__(
        self, message: str = "Repository contained an unsafe file path."
    ) -> None:
        super().__init__(
            code="UNSAFE_PATH",
            message=message,
            status_code=422,
        )


class ArchiveError(AppError):
    def __init__(
        self, message: str = "Failed to process the repository archive."
    ) -> None:
        super().__init__(
            code="ARCHIVE_ERROR",
            message=message,
            status_code=422,
        )
