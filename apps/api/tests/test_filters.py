from app.config import Settings
from app.modules.github.filters import (
    detect_language,
    is_ignored_path,
    is_safe_repo_relative_path,
    should_include_blob,
)


def test_detect_language_allowlist() -> None:
    assert detect_language("src/index.ts") == "typescript"
    assert detect_language("src/App.tsx") == "typescript"
    assert detect_language("main.py") == "python"
    assert detect_language("Dockerfile") == "dockerfile"
    assert detect_language("infra/main.tf") == "terraform"
    assert detect_language("lib.rb") == "ruby"
    assert detect_language("photo.png") is None
    assert detect_language("bundle.min.js") is None


def test_ignored_directories_and_lockfiles() -> None:
    assert is_ignored_path("node_modules/lodash/index.js")
    assert is_ignored_path("vendor/pkg/file.go")
    assert is_ignored_path("dist/app.js")
    assert is_ignored_path("package-lock.json")
    assert not is_ignored_path("src/app.js")


def test_path_safety() -> None:
    assert is_safe_repo_relative_path("src/index.ts")
    assert not is_safe_repo_relative_path("../secret.py")
    assert not is_safe_repo_relative_path("/etc/passwd")
    assert not is_safe_repo_relative_path("src\\evil.ts")


def test_should_include_respects_size_limit() -> None:
    settings = Settings(max_file_size_bytes=100)
    include, language = should_include_blob(
        path="src/a.ts", size=50, settings=settings
    )
    assert include and language == "typescript"

    include, language = should_include_blob(
        path="src/big.ts", size=101, settings=settings
    )
    assert not include and language is None
