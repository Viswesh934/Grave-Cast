"""Repo scan regressions: each test is a bug found by scanning five deliberately vulnerable repos (docs/REPO_SCAN_DESIGN.md)."""
from __future__ import annotations

import json

import httpx

from app.config import Settings
from app.modules.github.scan.catalog import finding
from app.modules.github.scan.files import ScanFile, language_of
from app.modules.github.scan.lockfiles import Package, read_lockfiles
from app.modules.github.scan.osv import OsvClient, _line_of, dependency_findings
from app.modules.github.scan.rules_js import js_findings
from app.modules.github.scan.rules_project import project_findings
from app.modules.github.scan.rules_python import python_findings
from app.modules.github.scan.runner import _markers, cap, finalise
from app.modules.github.scan.secrets import find_secrets
from app.modules.github.scan.syntax import grammar_for, parse


def _file(path: str, text: str, kind: str = "code") -> ScanFile:
    return ScanFile(path=path, text=text, kind=kind, language=language_of(path) if kind == "code" else None)  # type: ignore[arg-type]


def _code(path: str, text: str) -> dict[str, list]:
    """The code rules' findings on one file, by rule id."""
    file = _file(path, text)
    root = parse(path, text)
    assert root is not None
    found = python_findings(file, root) if path.endswith(".py") else js_findings(file, root)
    out: dict[str, list] = {}
    for f in found:
        out.setdefault(f.rule, []).append(f)
    return out


def _secrets(path: str, text: str, kind: str = "code") -> list:
    return find_secrets(_file(path, text, kind), 3.0)


# ---- Secrets: every secret on a line is hidden (dvws-node test/browser-challenges.test.js:91) ----
def test_two_secrets_on_one_line_are_both_hidden() -> None:
    line = "      .send({ currentPassword: 'Before123!', newPassword: 'After123!' });"
    found = _secrets("src/account.js", line)
    assert found
    for f in found:
        assert "Before123!" not in (f.snippet or "") and "After123!" not in (f.snippet or "")
    (kept,) = finalise(found)
    assert kept.snippet == ".send({ currentPassword: '\u2026 (10 characters)', newPassword: '\u2026 (9 characters)' });"


# ---- Dependencies: ranges are not exact versions (owasp-security-lab requirements.txt) ----
def test_requirement_ranges_are_not_checked() -> None:
    report = read_lockfiles([_file("requirements.txt", "fastapi==0.115.*\nflask==2.0.1\nrequests==2.31.0 ; python_version>'3'\n", "lockfile")])
    assert sorted((p.name, p.version) for p in report.packages) == [("flask", "2.0.1"), ("requests", "2.31.0")]
    assert report.unpinned == 1


# ---- Code rules follow values through variables ----
def test_python_sql_through_a_variable_from_a_route_parameter() -> None:
    # owasp-security-lab app/vulns/a03_injection/vulnerable.py
    src = (
        "@router.post('/login')\n"
        "def login(data: Login) -> dict:\n"
        "    query = (\n"
        "        'SELECT id FROM users '\n"
        "        f\"WHERE username = '{data.username}'\"\n"
        "    )\n"
        "    row = conn.execute(query).fetchone()\n"
    )
    (f,) = _code("app/vulnerable.py", src)["py.sql-injection"]
    assert f.line == 7 and f.severity == "critical" and f.confidence == "confirmed"


def test_python_flask_request_through_variables() -> None:
    # simplest-sast-vulnerable app.py and vulnerable-python-app app.py
    src = (
        "import os, requests, pickle\n"
        "from flask import Flask, request, redirect\n"
        "def sqli():\n"
        "    username = request.args.get('user', '')\n"
        "    query = f\"SELECT * FROM users WHERE username = '{username}'\"\n"
        "    cursor.execute(query)\n"
        "def cmd():\n"
        "    filename = request.args.get('file', '')\n"
        "    os.popen(f'ls -la {filename}').read()\n"
        "def traverse():\n"
        "    file_param = request.args.get('file', '')\n"
        "    file_path = os.path.join('/srv/', file_param)\n"
        "    open(file_path)\n"
        "def proxy():\n"
        "    url = request.args.get('url', '')\n"
        "    requests.get(url)\n"
        "def go():\n"
        "    url = request.args.get('url', '')\n"
        "    return redirect(url)\n"
        "def load():\n"
        "    data = request.form.get('data', '')\n"
        "    pickle.loads(bytes.fromhex(data))\n"
    )
    found = _code("app.py", src)
    assert found["py.sql-injection"][0].severity == "critical"
    assert found["py.command-injection"][0].severity == "critical"
    assert found["py.unsafe-deserialization"][0].severity == "critical"
    assert {"py.path-traversal", "py.ssrf", "py.open-redirect"} <= found.keys()


def test_fastapi_route_parameter_is_user_input() -> None:
    # owasp-security-lab app/vulns/a10_ssrf/vulnerable.py
    src = "import httpx\n@router.post('/notes/import')\ndef import_note(req: ImportRequest) -> dict:\n    return httpx.get(req.url, timeout=5)\n"
    assert "py.ssrf" in _code("app/ssrf.py", src)
    # The same call outside a route handler is not reported.
    assert "py.ssrf" not in _code("app/ssrf.py", "import httpx\ndef fetch(req):\n    return httpx.get(req.url)\n")


def test_fixed_template_with_variables_is_safe() -> None:
    # vulnerable-python-app app.py:253-254: {{{{ name }}}} is a literal {{ name }}, filled in by Jinja2 escaping
    safe = "from flask import render_template_string\ndef t(name):\n    template = f'<h1>Hello {{{{ name }}}}!</h1>'\n    return render_template_string(template, name=name)\n"
    assert "py.template-injection" not in _code("app.py", safe)
    unsafe = "from flask import render_template_string\ndef t(name):\n    template = f'<h1>Hello {name}!</h1>'\n    return render_template_string(template)\n"
    assert "py.template-injection" in _code("app.py", unsafe)


def test_yaml_load_of_request_data_is_critical() -> None:
    src = "import yaml\nfrom flask import request\ndef p():\n    content = request.json.get('yaml', '')\n    yaml.load(content)\n"
    (f,) = _code("app.py", src)["py.unsafe-deserialization"]
    assert f.severity == "critical"


def test_python_extra_rules() -> None:
    assert "py.debug-enabled" in _code("app.py", "app.config['DEBUG'] = True\n")
    sax = "parser.setFeature('http://xml.org/sax/features/external-general-entities', True)\n"
    assert "py.xxe" in _code("xml_parser.py", sax)
    assert "py.weak-password-hash" in _code("db.py", "import hashlib\nfor name, pw in users:\n    h = hashlib.md5(pw.encode())\n")
    assert "py.hardcoded-secret-key" in _code("security.py", 'JWT_SECRET = "super-secret-key-change-me"\n')


def test_js_options_and_queries_in_variables() -> None:
    # dvws-node: jwt options, cors options and SQL text kept in variables
    src = (
        "const jwt = require('jsonwebtoken')\n"
        "const options = { algorithms: ['HS256', 'none'], ignoreExpiration: true }\n"
        "function check(token, key) { return jwt.verify(token, key, options) }\n"
        "const corsOptions = { origin: true, credentials: true }\n"
        "app.use(cors(corsOptions))\n"
        "function save(req, res) {\n"
        "  const saveQuery = `INSERT INTO passphrases (phrase) VALUES ('${req.body.phrase}')`\n"
        "  connection.query(saveQuery)\n"
        "}\n"
    )
    found = _code("src/server.js", src)
    assert {"js.jwt-none-algorithm", "js.jwt-ignore-expiration", "js.cors-credentials-wildcard"} <= found.keys()
    (sql,) = found["js.sql-injection"]
    assert sql.line == 8 and sql.severity == "critical"


def test_js_destructured_body_and_route_parameter() -> None:
    src = (
        "const mongoose = require('mongoose')\n"
        "async function login(req, res) {\n"
        "  const { username, password } = req.body\n"
        "  return User.findOne({ username, password })\n"
        "}\n"
        "async function note(req, res) {\n"
        "  return Note.findOne({ _id: req.params.id })\n"
        "}\n"
    )
    found = _code("src/users.js", src)
    # Body fields can carry query operators; a route parameter is always a string.
    assert [f.line for f in found["js.nosql-injection"]] == [4]


def test_js_path_traversal_on_writes_and_variables() -> None:
    src = "function up(req, res) {\n  const target = __dirname + '/uploads/' + req.body.name\n  req.files.file.mv(target)\n  fs.writeFileSync(target, 'x')\n}\n"
    assert [f.line for f in _code("src/files.js", src)["js.path-traversal"]] == [3, 4]


# ---- Secrets: short defaults, YAML, Terraform, placeholders ----
def test_short_default_passwords_outside_tests() -> None:
    assert [f.rule for f in _secrets("typeorm-db.js", "  password: 'root',")] == ["secret.hardcoded-credential"]
    assert _secrets("tests/login.test.js", "  password: 'root',") == []
    assert _secrets("app.js", "  token: 'abcd',") == []  # short tokens are placeholders, not defaults


def test_unquoted_yaml_secrets() -> None:
    compose = "services:\n  db:\n    environment:\n      POSTGRES_PASSWORD: mysecretpassword\n      - MYSQL_ROOT_PASSWORD=Zq8wLm3vRt\n    image: postgres\n"
    found = _secrets("docker-compose.yml", compose)
    assert [f.line for f in found] == [4, 5]
    assert all("mysecretpassword" not in (f.snippet or "") for f in found)
    assert _secrets(".github/workflows/ci.yml", "env:\n  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}\n") == []


def test_terraform_variable_default() -> None:
    tf = 'variable "db_password" {\n  default = "SuperSecretDBPassword123!"\n}\nvariable "region" {\n  default = "eu-west-1"\n}\n'
    (f,) = _secrets("terraform/main.tf", tf, kind="code")
    assert f.line == 2 and "SuperSecret" not in (f.snippet or "")


def test_placeholders_are_not_secrets() -> None:
    assert _secrets("app.py", "query = f\"SELECT * FROM users WHERE password = '{password}'\"") == []
    assert _secrets("app.py", "{'username': 'admin', 'password': 'hashed_password'}") == []
    assert _secrets("app.py", "password = 'changeme'") == []
    # A real value that only mentions change-me was never changed.
    assert [f.rule for f in _secrets("app.py", "api_secret = 'super-secret-key-change-me'")] == ["secret.hardcoded-credential"]


def test_test_file_credentials_are_grouped() -> None:
    lines = "\n".join(f"  password: 'Q{i}x8ZmL3vWp9',".replace("Q", chr(65 + i)) for i in range(5))
    found = finalise(_secrets("test/users.test.js", lines))
    (grave,) = found
    assert "4 more lines like it" in grave.detail


# ---- Code notes only inside comments (nodejs-goof routes/index.js) ----
def _notes(path: str, text: str) -> list[int]:
    file = _file(path, text)
    grammar = grammar_for(path)
    root = parse(path, text) if grammar else None
    return [f.line for f in _markers(file, root, grammar)]


def test_markers_only_in_comments() -> None:
    js = "const msg = 'TODO: buy milk'\n// TODO: real note\nres.send('<h1>TODO list</h1>')\n"
    assert _notes("routes/index.js", js) == [2]
    py = '"""TODO: in a docstring."""\nx = "FIXME not a note"\n# FIXME broken\n'
    assert _notes("app.py", py) == [1, 3]
    assert _notes("config.yml", "name: TODO app\n# TODO pin this\n") == [2]
    assert _notes("data.json", '{"title": "TODO"}') == []


# ---- Project rules: reports and tests don't count as protection (nodejs-goof sarif.json, dvws-node tests) ----
def test_reports_and_tests_do_not_silence_project_rules() -> None:
    package = _file("package.json", json.dumps({"dependencies": {"express": "^4"}}))
    sarif = _file("sarif.json", '{"id": "javascript/NoRateLimitingForExpensiveWebOperation"}')
    test = _file("test/headers.test.js", "expect(res.headers['x-frame-options']).toBeUndefined()")
    rules = sorted(f.rule for f in project_findings([package, sarif, test], ["package.json", "package-lock.json"]))
    assert rules == ["prj.no-rate-limiting", "prj.no-security-headers"]


# ---- Caps never hide serious graves (nodejs-goof: 22 high dependencies were hidden) ----
def test_cap_keeps_critical_and_high() -> None:
    serious = [finding("py.code-injection", path="a.py", line=i) for i in range(1, 6)]
    minor = [finding("py.weak-hash", path="b.py", line=i) for i in range(1, 6)]
    kept = cap(finalise(serious + minor), per_rule=2, total=100)
    assert [f.rule for f in kept].count("py.code-injection") == 5
    assert [f.rule for f in kept].count("py.weak-hash") == 2


# ---- Lockfile lines point at the package's own entry ----
def test_lockfile_line_matches_name_and_version() -> None:
    lock = _file(
        "package-lock.json",
        "\n".join(
            [
                "{",
                '  "packages": {',
                '    "node_modules/lodash": {',
                '      "version": "4.17.21"',
                "    },",
                '    "node_modules/ejs/node_modules/lodash": {',
                '      "version": "4.17.10"',
                "    }",
                "  }",
                "}",
            ]
        ),
        "lockfile",
    )
    assert _line_of(lock, "lodash", "4.17.21") == 3
    assert _line_of(lock, "lodash", "4.17.10") == 6
    req = _file("requirements.txt", "oauthlib==3.1.1\nauthlib==0.15.4\n", "lockfile")
    assert _line_of(req, "authlib", "0.15.4") == 2


# ---- Every vulnerable package gets a fetched advisory, so none shows a made-up rating ----
async def test_every_vulnerable_package_gets_an_advisory_first() -> None:
    fetched: list[str] = []

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/v1/querybatch":
            ids = [[f"GHSA-{n}-{i}" for i in range(5)] for n in "abc"]
            return httpx.Response(200, json={"results": [{"vulns": [{"id": i} for i in group]} for group in ids]})
        advisory = request.url.path.rsplit("/", 1)[1]
        fetched.append(advisory)
        return httpx.Response(200, json={"id": advisory, "database_specific": {"severity": "HIGH"}})

    settings = Settings(osv_max_advisories=3)
    client = OsvClient(settings, client=httpx.AsyncClient(transport=httpx.MockTransport(handler), base_url="https://api.osv.dev"))
    packages = [Package("npm", name, "1.0.0", False, "package-lock.json") for name in ("a", "b", "c")]
    result = await dependency_findings(packages, [], client, settings)
    assert sorted(fetched) == ["GHSA-a-0", "GHSA-b-0", "GHSA-c-0"]
    assert all(f.severity == "high" and "no severity rating" not in f.detail for f in result.findings)


# ---- Second rescan: escaped SQL, update documents, checked values (dvws-node, owasp-security-lab) ----
def test_escaped_sql_is_not_injection() -> None:
    src = "async function g(args) {\n  var query = 'select a from t WHERE r = ' + sql.escape(args.reminder) + ''\n  return sql.query(query)\n}\n"
    assert "js.sql-injection" not in _code("src/graphql/schema.js", src)
    raw = "async function g(args) {\n  var query = 'select a from t WHERE r = ' + args.reminder\n  return sql.query(query)\n}\n"
    assert "js.sql-injection" in _code("src/graphql/schema.js", raw)


def test_request_fields_in_an_update_are_not_nosql_injection() -> None:
    src = (
        "const mongoose = require('mongoose')\n"
        "async function bio(req, res) {\n"
        "  const { bio } = req.body\n"
        "  await User.findOneAndUpdate({ username: req.decoded.user }, { $set: { bio } })\n"
        "  await Note.findOneAndUpdate({ name: req.params.id }, req.body)\n"
        "}\n"
    )
    assert [f.line for f in _code("src/users.js", src)["js.nosql-injection"]] == [5]


def test_checked_value_is_possible_not_dropped() -> None:
    src = (
        "import httpx\n"
        "@router.post('/notes/import')\n"
        "def import_note(req: ImportRequest) -> dict:\n"
        "    if not _is_public_http_url(req.url):\n"
        "        raise HTTPException(status_code=400)\n"
        "    return httpx.get(req.url, timeout=5)\n"
    )
    (f,) = _code("app/secure.py", src)["py.ssrf"]
    assert f.confidence == "possible" and "confirm that the check" in f.detail
