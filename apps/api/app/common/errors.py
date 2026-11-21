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


class ScanRateLimitedError(AppError):
    def __init__(
        self, message: str = "Too many checks in a short time. Wait a minute and try again."
    ) -> None:
        super().__init__(code="SCAN_RATE_LIMITED", message=message, status_code=429)


class InvalidLinkError(AppError):
    def __init__(self, message: str = "That doesn't read as a web address.") -> None:
        super().__init__(code="INVALID_LINK", message=message, status_code=400)


class BlockedAddressError(AppError):
    def __init__(
        self,
        message: str = (
            "This link points to a private or local address, so it was not opened."
        ),
    ) -> None:
        super().__init__(code="BLOCKED_ADDRESS", message=message, status_code=400)


class TooManyRedirectsError(AppError):
    def __init__(
        self, message: str = "The link forwards too many times, so it was not followed to the end."
    ) -> None:
        super().__init__(code="TOO_MANY_REDIRECTS", message=message, status_code=422)


class LinkUnreachableError(AppError):
    def __init__(self, message: str = "The site could not be reached.") -> None:
        super().__init__(code="LINK_UNREACHABLE", message=message, status_code=502)


class LinkTimeoutError(AppError):
    def __init__(self, message: str = "The site took too long to answer.") -> None:
        super().__init__(code="LINK_TIMEOUT", message=message, status_code=504)


class ChannelRateLimitedError(AppError):
    def __init__(self, message: str = "Too many requests. Wait a few seconds and try again.") -> None:
        super().__init__(code="CHANNEL_RATE_LIMITED", message=message, status_code=429)


class UnknownEchoError(AppError):
    def __init__(self, message: str = "That echo doesn't exist.") -> None:
        super().__init__(code="UNKNOWN_ECHO", message=message, status_code=404)


class TooManyMessagesError(AppError):
    def __init__(self, message: str = "Too many messages in one mail run.") -> None:
        super().__init__(code="TOO_MANY_MESSAGES", message=message, status_code=422)

class InvalidEchoNameError(AppError):
    def __init__(self, message: str) -> None:
        super().__init__(code="INVALID_ECHO", message=message, status_code=422)


class EchoExistsError(AppError):
    def __init__(self, message: str = "A channel with that name already exists. Open it instead.") -> None:
        super().__init__(code="ECHO_EXISTS", message=message, status_code=409)


class TooManyEchoesError(AppError):
    def __init__(self, message: str = "There are as many channels as this server can hold. Use one of them.") -> None:
        super().__init__(code="TOO_MANY_ECHOES", message=message, status_code=422)

class OriginNotAllowedError(AppError):
    def __init__(self, message: str = "This request is not allowed.") -> None:
        super().__init__(code="ORIGIN_NOT_ALLOWED", message=message, status_code=403)
