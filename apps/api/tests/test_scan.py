"""Repo scan rules: each one fires on a sample and stays quiet on a near miss (docs/REPO_SCAN_DESIGN.md §12)."""
from __future__ import annotations

import io
import json
import zipfile

import httpx
import pytest

from app.config import Settings
from app.modules.github.scan.catalog import RULES, finding, owasp_for
from app.modules.github.scan.cvss import base_score, severity_of
from app.modules.github.scan.files import ScanArchive, ScanFile, classify, is_test_path, language_of, read_archive
from app.modules.github.scan.lockfiles import Package, read_lockfiles
from app.modules.github.scan.osv import OsvClient, advisory_severity, dependency_findings, fixed_version, merge_aliases
from app.modules.github.scan.rules_config import config_findings, path_findings
from app.modules.github.scan.rules_js import js_findings
from app.modules.github.scan.rules_project import project_findings
from app.modules.github.scan.rules_python import python_findings
from app.modules.github.scan.runner import cap, finalise, run_scan
from app.modules.github.scan.secrets import find_secrets
from app.modules.github.scan.syntax import parse


def _file(path: str, text: str, kind: str = "code") -> ScanFile:
    return ScanFile(path=path, text=text, kind=kind, language=language_of(path) if kind == "code" else None)  # type: ignore[arg-type]


def _rules(path: str, text: str) -> list[str]:
    """Every rule id the code, config and secret checks raise on one file."""
    file = _file(path, text)
    found = list(find_secrets(file, 3.0)) + config_findings(file)
    root = parse(path, text)
    if root is not None:
        found += list(python_findings(file, root) if path.endswith(".py") else js_findings(file, root))
    return [f.rule for f in found]


# ---- Python code rules: (rule, sample that fires, near miss that must not) ----
PYTHON_CASES = [
    ("py.sql-injection", 'cur.execute(f"SELECT * FROM users WHERE id = {uid}")', 'cur.execute("SELECT * FROM users WHERE id = %s", (uid,))'),
    ("py.command-injection", "import os\nos.system('rm ' + path)", "import os\nos.system('ls -la')"),
    ("py.command-injection", "import subprocess\nsubprocess.run(cmd, shell=True)", "import subprocess\nsubprocess.run(['ls', path])"),
    ("py.code-injection", "eval(user_code)", "eval('1 + 2')"),
    ("py.template-injection", "from flask import render_template_string\nrender_template_string(page)", "from flask import render_template_string\nrender_template_string('<p>{{ name }}</p>', name=name)"),
    ("py.xss", "from markupsafe import Markup\nMarkup(comment)", "from markupsafe import Markup\nMarkup('<b>fixed</b>')"),
    ("py.unsafe-deserialization", "import pickle\npickle.loads(blob)", "import json\njson.loads(blob)"),
    ("py.unsafe-deserialization", "import yaml\nyaml.load(text)", "import yaml\nyaml.load(text, Loader=yaml.SafeLoader)"),
    ("py.path-traversal", "open(request.args['name'])", "open('static/' + 'logo.png')"),
    ("py.ssrf", "import requests\nrequests.get(request.args['url'])", "import requests\nrequests.get('https://api.example.org/status')"),
    ("py.open-redirect", "return redirect(request.args['next'])", "return redirect('/home')"),
    ("py.csrf-disabled", "@csrf_exempt\ndef hook(request):\n    pass", "@login_required\ndef hook(request):\n    pass"),
    ("py.tls-verify-disabled", "import requests\nrequests.get(url, verify=False)", "import requests\nrequests.get(url, verify=True)"),
    ("py.jwt-no-verify", "import jwt\njwt.decode(token, options={'verify_signature': False})", "import jwt\njwt.decode(token, key, algorithms=['HS256'])"),
    ("py.weak-hash", "import hashlib\nhashlib.md5(data).hexdigest()", "import hashlib\nhashlib.md5(data, usedforsecurity=False).hexdigest()"),
    ("py.weak-password-hash", "import hashlib\nhashed = hashlib.sha1(password.encode())", "import hashlib\nhashed = hashlib.sha256(password.encode())"),
    ("py.hardcoded-secret-key", 'app.secret_key = "dev"', 'app.secret_key = os.environ["SECRET_KEY"]'),
    ("py.debug-enabled", "from flask import Flask\napp = Flask(__name__)\napp.run(debug=True)", "from flask import Flask\napp = Flask(__name__)\napp.run(debug=False)"),
    ("py.cors-credentials-wildcard", "CORS(app, supports_credentials=True)", "CORS(app, origins=['https://example.org'], supports_credentials=True)"),
    ("py.xxe", "from lxml import etree\netree.XMLParser(resolve_entities=True)", "from lxml import etree\netree.XMLParser(resolve_entities=False)"),
]


@pytest.mark.parametrize(("rule", "sample", "near_miss"), PYTHON_CASES)
def test_python_rule(rule: str, sample: str, near_miss: str) -> None:
    assert rule in _rules("app/views.py", sample)
    assert rule not in _rules("app/views.py", near_miss)


def test_django_settings_rules() -> None:
    sample = "DEBUG = True\nALLOWED_HOSTS = ['*']\n"
    assert {"py.debug-enabled", "py.allowed-hosts-wildcard"} <= set(_rules("site/settings.py", sample))
    assert "py.debug-enabled" not in _rules("site/views.py", "DEBUG = True\n")
    assert "py.allowed-hosts-wildcard" not in _rules("site/settings.py", "ALLOWED_HOSTS = ['example.org']\n")


def _python(path: str, text: str, rule: str) -> list:
    file = _file(path, text)
    root = parse(path, text)
    assert root is not None
    return [f for f in python_findings(file, root) if f.rule == rule]


def test_user_input_raises_severity() -> None:
    (found,) = _python("app.py", "import os\nos.system('ls ' + request.args['dir'])\n", "py.command-injection")
    assert found.severity == "critical" and found.confidence == "confirmed"
    (found,) = _python("app.py", "import os\nos.system('ls ' + folder)\n", "py.command-injection")
    assert found.severity == "high" and found.confidence == "likely"


# ---- JavaScript and TypeScript code rules: (rule, sample, near miss or None) ----
JS_CASES = [
    ("js.sql-injection", "db.query(`SELECT * FROM users WHERE id = ${id}`)", "db.query(sql`SELECT * FROM users WHERE id = ${id}`)"),
    ("js.command-injection", "const cp = require('child_process')\ncp.exec('ls ' + dir)", "const cp = require('child_process')\ncp.execFile('ls', [dir])"),
    ("js.code-injection", "eval(code)", "eval('2 + 2')"),
    ("js.code-injection", "new Function(body)", "new Function('return 1')"),
    ("js.xss", "el.innerHTML = comment", "el.innerHTML = DOMPurify.sanitize(comment)"),
    ("js.nosql-injection", "const mongoose = require('mongoose')\nUser.findOne({ name: req.body.name })", "const mongoose = require('mongoose')\nUser.findOne({ name: 'admin' })"),
    ("js.path-traversal", "res.sendFile(req.query.file)", "res.sendFile('index.html', { root: dir })"),
    ("js.ssrf", "axios.get(req.query.url)", "axios.get('https://api.example.org')"),
    ("js.open-redirect", "res.redirect(req.query.next)", "res.redirect('/home')"),
    ("js.tls-verify-disabled", "https.request({ host, rejectUnauthorized: false })", "https.request({ host, rejectUnauthorized: true })"),
    ("js.tls-verify-disabled", "process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'", "process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'"),
    ("js.jwt-none-algorithm", "const jwt = require('jsonwebtoken')\njwt.verify(t, key, { algorithms: ['none'] })", "const jwt = require('jsonwebtoken')\njwt.verify(t, key, { algorithms: ['HS256'] })"),
    ("js.jwt-ignore-expiration", "const jwt = require('jsonwebtoken')\njwt.verify(t, key, { ignoreExpiration: true })", "const jwt = require('jsonwebtoken')\njwt.verify(t, key, { maxAge: '1h' })"),
    ("js.weak-hash", "crypto.createHash('md5').update(file)", "crypto.createHash('sha256').update(file)"),
    ("js.weak-password-hash", "const hashPassword = (password) => crypto.createHash('sha1').update(password)", "const hashPassword = (password) => crypto.createHash('sha256').update(password)"),
    ("js.weak-cipher", "crypto.createCipher('aes192', key)", "crypto.createCipheriv('aes-256-gcm', key, iv)"),
    ("js.weak-cipher", "crypto.createCipheriv('des-ede3', key, iv)", None),
    ("js.hardcoded-secret-key", "jwt.sign(payload, 'keyboard cat')", "jwt.sign(payload, process.env.JWT_SECRET)"),
    ("js.hardcoded-secret-key", "app.use(session({ secret: 'keyboard cat' }))", "app.use(session({ secret: process.env.SESSION_SECRET }))"),
    ("js.cors-credentials-wildcard", "app.use(cors({ origin: true, credentials: true }))", "app.use(cors({ origin: 'https://example.org', credentials: true }))"),
    ("js.xxe", "libxml.parseXml(body, { noent: true })", "libxml.parseXml(body, { noent: false })"),
    ("js.insecure-cookie", "res.cookie('sid', id, { httpOnly: false })", "res.cookie('sid', id, { httpOnly: true, secure: true })"),
    ("js.stack-trace-exposure", "res.status(500).send(err.stack)", "res.status(500).send('Something went wrong')"),
]


@pytest.mark.parametrize(("rule", "sample", "near_miss"), JS_CASES)
def test_js_rule(rule: str, sample: str, near_miss: str | None) -> None:
    assert rule in _rules("src/server.js", sample)
    if near_miss is not None:
        assert rule not in _rules("src/server.js", near_miss)


def test_js_rules_read_typescript_and_tsx() -> None:
    assert "js.xss" in _rules("src/view.ts", "(el as HTMLElement).innerHTML = html!")
    assert "js.xss" in _rules("src/View.tsx", "export const V = () => <div dangerouslySetInnerHTML={{ __html: body }} />")
    assert "js.xss" not in _rules("src/View.tsx", "export const V = () => <div dangerouslySetInnerHTML={{ __html: '<b>x</b>' }} />")


def test_regex_exec_is_not_a_shell() -> None:
    assert "js.command-injection" not in _rules("src/parse.js", "const m = /a(b)/.exec(input)")


# ---- Config and CI rules ----
DOCKER_RULES = {"cfg.docker-unpinned-base", "cfg.docker-secret-in-image", "cfg.docker-runs-as-root"}


def test_dockerfile_rules() -> None:
    sample = "FROM node:latest\nENV API_TOKEN=abcd1234efgh\nCMD node app.js\n"
    assert DOCKER_RULES <= set(_rules("Dockerfile", sample))
    near = "FROM node:22-slim\nENV NODE_ENV=production\nUSER node\nCMD node app.js\n"
    assert not DOCKER_RULES & set(_rules("Dockerfile", near))


def test_dockerfile_secret_is_hidden() -> None:
    found = config_findings(_file("Dockerfile", "FROM node:22\nENV API_TOKEN=abcd1234efgh\nUSER node\n"))
    (f,) = [f for f in found if f.rule == "cfg.docker-secret-in-image"]
    assert "abcd1234efgh" not in (f.snippet or "")


def test_container_privileged() -> None:
    pod = "spec:\n  containers:\n    - securityContext:\n        privileged: {}\n"
    assert "cfg.container-privileged" in _rules("k8s/pod.yaml", pod.format("true"))
    assert "cfg.container-privileged" not in _rules("k8s/pod.yaml", pod.format("false"))


def test_terraform_rules() -> None:
    ingress = 'resource "aws_security_group" "db" {\n  ingress {\n    from_port = 5432\n    to_port = 5432\n    protocol = "tcp"\n    cidr_blocks = ["0.0.0.0/0"]\n  }\n}\n'
    assert "cfg.terraform-open-ingress" in _rules("infra/main.tf", ingress)
    assert "cfg.terraform-open-ingress" not in _rules("infra/main.tf", ingress.replace("5432", "443"))
    assert "cfg.terraform-public-storage" in _rules("infra/s3.tf", 'acl = "public-read"\n')
    assert "cfg.terraform-public-storage" not in _rules("infra/s3.tf", 'acl = "private"\n')
    assert "cfg.terraform-unencrypted" in _rules("infra/rds.tf", "storage_encrypted = false\n")
    assert "cfg.terraform-unencrypted" not in _rules("infra/rds.tf", "storage_encrypted = true\n")


WORKFLOW_RULES = {"cfg.gha-untrusted-checkout", "cfg.gha-script-injection", "cfg.gha-unpinned-action", "cfg.gha-write-all"}
WORKFLOW_RISKY = """on: pull_request_target
permissions: write-all
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.sha }}
      - run: echo "${{ github.event.issue.title }}"
      - uses: someone/deploy-action@v1
"""
WORKFLOW_SAFE = """on: pull_request
permissions:
  contents: read
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "$TITLE"
        env:
          TITLE: ${{ github.event.issue.title }}
      - uses: someone/deploy-action@0123456789abcdef0123456789abcdef01234567
"""


def test_workflow_rules() -> None:
    assert WORKFLOW_RULES <= set(_rules(".github/workflows/ci.yml", WORKFLOW_RISKY))
    assert not WORKFLOW_RULES & set(_rules(".github/workflows/ci.yml", WORKFLOW_SAFE))


def test_path_rules() -> None:
    rules = [f.rule for f in path_findings([".env", "config/.env.production", ".env.example", "certs/app.p12", "node_modules/x/.env"])]
    assert rules == ["cfg.env-file-committed", "cfg.env-file-committed", "cfg.key-store-committed"]


# ---- Secrets (values are built in parts so this file holds no real-looking key) ----
_AWS = "AKIA" + "Q3EGRCDPKVLMNWTZ"
_GITHUB = "ghp_" + "aB3dE5gH7jK9mN1pQ3sT5vX7zA9cE1gI3kM5"
SECRET_CASES = [
    ("secret.aws-access-key", f'key = "{_AWS}"', 'key = "AKIAIOSFODNN7EXAMPLE"'),
    ("secret.github-token", f"token: {_GITHUB}", "token: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"),
    ("secret.stripe-live-key", "STRIPE = 'sk_live_" + "4eC39HqLyjWDarjtT1zdp7dc'", "STRIPE = 'sk_test_" + "4eC39HqLyjWDarjtT1zdp7dc'"),
    ("secret.private-key", "-----BEGIN RSA " + "PRIVATE KEY-----", "-----BEGIN PUBLIC KEY-----"),
    ("secret.database-url", 'DB = "postgres://app:' + 'Zq8wLm3vRt@db.example.org/app"', 'DB = "postgres://app:${DB_PASSWORD}@db.example.org/app"'),
    ("secret.hardcoded-credential", 'api_key = "' + 'q8ZxL3mWv9TrK2pN"', 'api_key = "your-api-key-here"'),
]


@pytest.mark.parametrize(("rule", "sample", "near_miss"), SECRET_CASES)
def test_secret_rule(rule: str, sample: str, near_miss: str) -> None:
    assert rule in [f.rule for f in find_secrets(_file("config.py", sample), 3.0)]
    assert rule not in [f.rule for f in find_secrets(_file("config.py", near_miss), 3.0)]


def test_secrets_are_redacted() -> None:
    for value, line in ((_AWS, f'key = "{_AWS}"'), (_GITHUB, f"token = '{_GITHUB}'")):
        found = find_secrets(_file("config.py", line), 3.0)
        assert found
        for f in found:  # the provider rule and the generic one both fire; the runner keeps one
            assert value not in (f.snippet or "") and value not in f.detail
            assert "characters)" in (f.snippet or "")


def test_secrets_in_env_files_are_read() -> None:
    assert classify(".env") == "secret"
    found = find_secrets(_file(".env", "API_TOKEN=q8ZxL3mWv9TrK2pN\nDEBUG=true\n", kind="secret"), 3.0)
    assert [f.rule for f in found] == ["secret.hardcoded-credential"]


def test_suppression_comment() -> None:
    assert _rules("app.py", "eval(code)  # gravecast: ignore\n") == []
    assert _rules("app.py", "# nosec\neval(code)\n") == []
    assert find_secrets(_file("config.py", f'key = "{_AWS}"  # nosec'), 3.0) == []


# ---- Project rules ----
def test_rate_limiting_and_headers() -> None:
    package = _file("package.json", json.dumps({"dependencies": {"express": "^4.21.0"}}))
    paths = ["package.json", "package-lock.json"]
    assert sorted(f.rule for f in project_findings([package], paths)) == ["prj.no-rate-limiting", "prj.no-security-headers"]
    protected = _file("package.json", json.dumps({"dependencies": {"express": "^4", "helmet": "^7", "express-rate-limit": "^7"}}))
    assert list(project_findings([protected], paths)) == []
    mentioned = _file("src/app.js", "app.use(rateLimit({ windowMs: 60000 }))")
    assert [f.rule for f in project_findings([package, mentioned], paths)] == ["prj.no-security-headers"]


def test_python_framework_without_limiter() -> None:
    req = _file("requirements.txt", "fastapi==0.115.0\nuvicorn==0.30.0\n", kind="lockfile")
    assert [f.rule for f in project_findings([req], ["requirements.txt"])] == ["prj.no-rate-limiting"]
    req = _file("requirements.txt", "fastapi==0.115.0\nslowapi==0.1.9\n", kind="lockfile")
    assert list(project_findings([req], ["requirements.txt"])) == []


def test_no_lockfile() -> None:
    package = _file("web/package.json", json.dumps({"dependencies": {"left-pad": "^1"}}))
    assert [f.rule for f in project_findings([package], ["web/package.json"])] == ["dep.no-lockfile"]
    # A workspace keeps one lockfile at the root.
    assert list(project_findings([package], ["web/package.json", "pnpm-lock.yaml"])) == []
    empty = _file("package.json", json.dumps({"name": "x"}))
    assert list(project_findings([empty], ["package.json"])) == []


# ---- Lockfiles ----
def test_lockfile_parsers() -> None:
    npm = {"lockfileVersion": 3, "packages": {"": {}, "node_modules/a": {"version": "1.0.0"}, "node_modules/b": {"version": "2.0.0", "dev": True}}}
    files = [
        _file("package-lock.json", json.dumps(npm), "lockfile"),
        _file("yarn.lock", '"c@^3.0.0":\n  version "3.1.0"\n', "lockfile"),
        _file("requirements.txt", "Django==4.2.0\nrequests>=2\n", "lockfile"),
        _file("poetry.lock", '[[package]]\nname = "flask"\nversion = "2.0.0"\n', "lockfile"),
        _file("go.mod", "module x\n\nrequire (\n\tgithub.com/gin-gonic/gin v1.9.0\n)\n", "lockfile"),
        _file("Cargo.lock", '[[package]]\nname = "serde"\nversion = "1.0.0"\nsource = "registry+https://github.com/rust-lang/crates.io-index"\n', "lockfile"),
    ]
    report = read_lockfiles(files)
    got = {(p.ecosystem, p.name, p.version, p.dev) for p in report.packages}
    assert {
        ("npm", "a", "1.0.0", False),
        ("npm", "b", "2.0.0", True),
        ("npm", "c", "3.1.0", False),
        ("PyPI", "Django", "4.2.0", False),
        ("PyPI", "flask", "2.0.0", False),
        ("Go", "github.com/gin-gonic/gin", "1.9.0", False),
        ("crates.io", "serde", "1.0.0", False),
    } <= got
    assert report.unpinned == 1


def test_broken_lockfile_is_noted_not_fatal() -> None:
    report = read_lockfiles([_file("package-lock.json", "{not json", "lockfile")])
    assert report.packages == [] and report.notes == ["package-lock.json could not be read"]


# ---- OSV.dev helpers ----
def test_cvss_and_ratings() -> None:
    assert base_score("CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L") == 5.3
    assert base_score("CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H") == 9.8
    assert severity_of(9.8) == "critical" and severity_of(5.3) == "medium" and severity_of(3.9) == "low"
    assert advisory_severity({"database_specific": {"severity": "MODERATE"}}) == "medium"
    assert advisory_severity({"severity": [{"type": "CVSS_V3", "score": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"}]}) == "critical"
    assert advisory_severity({}) is None


def test_fixed_version_and_aliases() -> None:
    package = Package("npm", "lodash", "4.17.15", False, "package-lock.json")

    def fixed(name: str, version: str) -> dict[str, object]:
        return {"affected": [{"package": {"ecosystem": "npm", "name": name}, "ranges": [{"events": [{"introduced": "0"}, {"fixed": version}]}]}]}

    # The version that fixes every advisory with a fix: 4.17.19 would still leave the second one open.
    assert fixed_version(package, [fixed("lodash", "4.17.19"), fixed("lodash", "4.17.21"), fixed("other", "4.17.16")]) == "4.17.21"
    assert merge_aliases(["PYSEC-1", "GHSA-x"], {"PYSEC-1": {"aliases": ["CVE-1", "GHSA-x"]}}) == ["GHSA-x"]


async def test_dev_dependency_is_one_step_lower() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/v1/querybatch":
            return httpx.Response(200, json={"results": [{"vulns": [{"id": "GHSA-1"}]}]})
        return httpx.Response(200, json={"id": "GHSA-1", "database_specific": {"severity": "HIGH"}})

    settings = Settings()
    client = OsvClient(settings, client=httpx.AsyncClient(transport=httpx.MockTransport(handler), base_url="https://api.osv.dev"))
    result = await dependency_findings([Package("npm", "jest", "1.0.0", True, "package-lock.json")], [], client, settings)
    (f,) = result.findings
    assert f.severity == "medium" and f.package is not None and f.package.dev
    assert "development dependency" in f.detail


# ---- Finalising: test paths, redaction, de-duplication, order and caps ----
def test_test_paths_are_lowered() -> None:
    assert is_test_path("tests/test_app.py") and is_test_path("src/app.test.ts") and not is_test_path("src/app.ts")
    (f,) = finalise([finding("py.code-injection", path="tests/test_x.py", line=1)])
    assert f.severity == "medium" and "one step lower" in f.detail
    (key,) = finalise([finding("secret.aws-access-key", path="tests/fixtures.py", line=1)])
    assert key.severity == "critical"


def test_credential_family_keeps_most_specific() -> None:
    generic = finding("secret.hardcoded-credential", path="a.py", line=3, snippet='SECRET_KEY = "\u2026 (16 characters)"')
    specific = finding("py.hardcoded-secret-key", path="a.py", line=3, snippet='SECRET_KEY = "q8ZxL3mWv9TrK2pN"')
    (kept,) = finalise([generic, specific])
    assert kept.rule == "py.hardcoded-secret-key"
    assert "q8ZxL3mWv9TrK2pN" not in (kept.snippet or "")


def test_secret_line_is_redacted_on_other_graves() -> None:
    secret = finding("secret.aws-access-key", path="a.py", line=2, snippet='k = "AKIA\u2026 (20 characters)"  # TODO rotate')
    note = finding("note.marker", path="a.py", line=2, snippet=f'k = "{_AWS}"  # TODO rotate', title="TODO", detail="rotate")
    out = {f.rule: f for f in finalise([secret, note])}
    assert _AWS not in (out["note.marker"].snippet or "")


def test_order_and_caps() -> None:
    found = [finding("note.marker", path="a.py", line=i, title="TODO") for i in range(1, 6)]
    found += [finding("py.code-injection", path="b.py", line=1), finding("secret.aws-access-key", path="c.py", line=1)]
    ordered = finalise(found)
    assert [f.rule for f in ordered[:2]] == ["secret.aws-access-key", "py.code-injection"]
    assert [f.rule for f in cap(ordered, per_rule=2, total=3)] == ["secret.aws-access-key", "py.code-injection", "note.marker"]
    assert len(cap(ordered, per_rule=2, total=10)) == 4


def test_owasp_mapping_uses_official_lists() -> None:
    assert owasp_for("CWE-89") == ("A05:2025 Injection", "https://owasp.org/Top10/2025/A05_2025-Injection/")
    assert owasp_for("CWE-943") is None
    assert all(rule.cwe is None or rule.cwe.startswith("CWE-") for rule in RULES.values())


# ---- Reading the archive and running every check ----
def _zip(files: dict[str, str]) -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        for path, content in files.items():
            zf.writestr(f"repo-sha/{path}", content)
    return buf.getvalue()


def _failing_osv(settings: Settings) -> OsvClient:
    return OsvClient(settings, client=httpx.AsyncClient(transport=httpx.MockTransport(lambda r: httpx.Response(500))))


def test_read_archive_limits_skip_instead_of_failing() -> None:
    settings = Settings(graveyard_max_files=2)
    archive = read_archive(_zip({"a.py": "x", "b.py": "y", "c.py": "z", "node_modules/d.js": "q", "image.png": "p"}), settings)
    assert [f.path for f in archive.files] == ["a.py", "b.py"]
    assert archive.skipped == 1
    assert "node_modules/d.js" in archive.all_paths


async def test_run_scan_without_lockfiles_skips_dependencies() -> None:
    settings = Settings()
    archive = read_archive(_zip({"app.py": "eval(code)\n# TODO tidy\n"}), settings)
    result = await run_scan(archive, settings, _failing_osv(settings))
    checks = {c.id: c.status for c in result.checks}
    assert checks == {"dependencies": "skipped", "secrets": "ran", "code": "ran", "config": "skipped", "project": "ran", "markers": "ran"}
    assert [f.rule for f in result.graves] == ["py.code-injection", "note.marker"]
    assert result.total == 2 and result.by_severity["high"] == 1


async def test_run_scan_out_of_time_is_partial() -> None:
    settings = Settings(graveyard_time_budget_seconds=0.0)
    archive = ScanArchive(files=[_file("a.py", "eval(x)")], all_paths=["a.py"], discovered=1, skipped=0)
    result = await run_scan(archive, settings, _failing_osv(settings))
    checks = {c.id: c for c in result.checks}
    assert checks["code"].status == "partial" and "Time ran out" in checks["code"].detail
    assert checks["project"].status == "skipped"
