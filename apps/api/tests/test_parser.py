import pytest

from app.common.errors import InvalidRepositoryUrlError, UnsupportedHostError
from app.modules.github.parser import parse_github_repo_url


@pytest.mark.parametrize(
    "url,owner,name",
    [
        ("https://github.com/owner/repository", "owner", "repository"),
        ("https://github.com/owner/repository.git", "owner", "repository"),
        ("https://github.com/owner/repository/", "owner", "repository"),
        ("http://www.github.com/acme/app", "acme", "app"),
        ("github.com/acme/app", "acme", "app"),
    ],
)
def test_parse_valid_urls(url: str, owner: str, name: str) -> None:
    ref = parse_github_repo_url(url)
    assert ref.owner == owner
    assert ref.name == name


@pytest.mark.parametrize(
    "url",
    [
        "",
        "   ",
        "https://gitlab.com/owner/repo",
        "https://github.com/owner/repo/tree/main",
        "https://github.com/owner",
        "https://github.com/owner/repo/issues/1",
        "ftp://github.com/owner/repo",
        "https://gist.github.com/owner/abc",
    ],
)
def test_parse_invalid_urls(url: str) -> None:
    with pytest.raises((InvalidRepositoryUrlError, UnsupportedHostError)):
        parse_github_repo_url(url)
