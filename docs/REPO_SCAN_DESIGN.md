# Repo graveyard: security scan design

The repo graveyard (developer mode, vision doc §3.3) reads a public GitHub repo and raises one grave for each problem it finds. Until now it found only `TODO`, `FIXME`, `HACK` and `XXX` comments. This document is the design for the scan that replaces it. The code follows it exactly: every rule below has the same id, severity, CWE and OWASP category in `apps/api/app/modules/github/scan/catalog.py`.

## 1. Goals and limits

**Goal:** find the problems that get real projects breached, with evidence a developer can check in one click, and few false alarms.

**What the scan does not do, and says so:**

- It never runs the repo's code, installs its packages, or builds it. Everything is read from the files as text or as a syntax tree.
- It reads one commit (the default branch's latest). Git history is not read, so a key deleted in an earlier commit is not found.
- It follows values through variables inside one function: a name assigned before it is used (`query = f"…{name}"`, then `cursor.execute(query)`), names destructured from request data (`const { user } = req.body`), and options objects kept in a variable (`jwt.verify(t, key, options)`). The parameters of a route handler (a function decorated with `@app.route`, `@router.get` and the like) count as user input. Values passed between functions or files are not followed, and the code check's detail says so. Full data-flow analysis is out of scope.
- It does not check whether a leaked key still works. Trying a key would be using it.
- Unused code (Knip) is not checked yet.

**Honest verdicts:** the page never says a repo is safe. It lists every check with whether it ran, and what each one could not read.

## 2. What was considered and why

| Option | Decision |
| --- | --- |
| **Regex over lines** (today) | Kept only for things that really are text: secrets, Dockerfiles, Terraform, comment markers. It cannot tell code from comments or a call from its arguments. |
| **Tree-sitter** (`tree-sitter` 0.25–0.26 with the Python, JavaScript and TypeScript grammars) | **Chosen** for code rules. It is a C parser with Python bindings and prebuilt wheels, parses each file in milliseconds, never runs code, and gives one API for every language. Rules are written and tested by us. |
| **Semgrep** | Not used. It has thousands of rules, but it is a large separate binary, slow to start on Lambda, and its rule registry has its own licence that would need review for a public service. |
| **Bandit / ESLint security plugins** | Not used. Each covers one language and would mean shipping two more toolchains. |
| **OSV.dev** for dependencies | **Chosen.** Free, no key, covers npm, PyPI, Go, crates.io, RubyGems and Packagist, and returns real advisory ids, CWE ids, severities and fixed versions. Checked live while writing this document. |
| **A missing robots.txt or 404 page** | Not reported. robots.txt is a request to polite crawlers, not a protection, and a missing 404 page is a usability gap. Both belong to the link scan's site checks, not to a repo's security. |

## 3. Severity, confidence and evidence

**Severity**, from the worst outcome if the finding is real:

| Severity | Meaning | Weathering |
| --- | --- | --- |
| `critical` | Remote takeover or a working credential exposed, with little effort | crumbling |
| `high` | Serious harm under normal conditions | cracked |
| `medium` | Harm under some conditions, or a weakness that helps an attack | aged |
| `low` | Hardening gap | pristine |
| `info` | A note, not a weakness (the comment markers) | pristine |

**Confidence**, how sure the scan is:

| Confidence | Used for |
| --- | --- |
| `confirmed` | A published advisory matches the exact version; a key in a provider's known format; a marker that is literally there |
| `likely` | A code or config pattern that is dangerous unless something outside the file makes it safe |
| `possible` | Something is missing (no rate limiter found). It may live somewhere the scan cannot see, such as a gateway |

**Adjustments, applied after a rule fires:**

1. **User input:** a code rule that fires on any non-literal value is raised when that value is user input (`request.args`, `req.query`, and the like), read directly or through a variable in the same function (§1), and its confidence becomes `confirmed`. The raise applies even when the rule set its own severity for the case (such as unsafe YAML loading): to `critical` for SQL, command, code and template injection and unsafe deserialization, and to `high` for XSS. Rules that only fire on user input (path traversal, SSRF, open redirect, NoSQL injection) keep their listed severity.
2. **Test, example and documentation code** (`tests/`, `__tests__/`, `fixtures/`, `examples/`, `exploits/`, `docs/`, `*.test.js`, `test_*.py`, ...): one step lower, and the detail says so. Keys in a provider's format are not lowered: a real key in a test still leaks.
3. **Development-only dependencies** (`"dev": true` in `package-lock.json`, Poetry's `dev` category, `packages-dev` in Composer, `develop` in Pipfile): one step lower.
4. **Suppression:** a line ending in, or directly under, `gravecast: ignore` or `nosec` raises nothing, so a team can mark a reviewed line.
5. **Checked first:** when an `if` earlier in the same function tests the very value a path traversal, SSRF or open redirect rule fires on, and stops (raises or returns), the grave stays but its confidence becomes `possible`, and the detail says the check must be confirmed. The scan cannot tell whether the check is strong enough, so it never drops the grave.
6. **Test passwords are grouped:** `secret.hardcoded-credential` findings in test, example and documentation code become one grave per file, whose detail says how many more lines the file has. Throwaway test passwords would otherwise fill the yard.

**Evidence:** every grave carries the file and line, a short snippet of that line, the rule id, the CWE, and the OWASP Top 10:2025 category. Dependency graves carry the package, version, advisory ids and the fixed version. **Secrets are never shown:** the snippet keeps the key's public prefix and its length (`AKIA… (20 characters)`), never the value. Every secret on the line is hidden, not only the one the grave is about. They are never logged.

**OWASP mapping:** a rule names an OWASP Top 10:2025 category only when that category's official CWE list contains the rule's CWE. Otherwise the category is left empty and the CWE alone is shown. The lists were read from owasp.org/Top10/2025 while writing this document.

## 4. The finding schema

The response of `POST /api/repositories/graveyard`, schema version 2. JSON uses camelCase.

```ts
interface GraveyardResponse {
  schemaVersion: 2
  repository: { owner, name, fullName, defaultBranch, commitSha, treeSha, openIssues }
  graves: RepoGrave[]            // most serious first, capped (see §8)
  summary: {
    total: number                // every finding, before the cap
    bySeverity: Record<'critical'|'high'|'medium'|'low'|'info', number>
    byCategory: Record<Category, number>
  }
  stats: {
    filesRead: number            // files the scan read
    filesDiscovered: number      // files in the repo
    filesSkipped: number         // readable files left out by the size or count limits
    languages: string[]
    lockfiles: string[]          // paths of the lockfiles read
    packagesChecked: number      // distinct package versions sent to OSV.dev
    markerCount: number
  }
  checks: Check[]                // one per check, in order, ran or not
  truncated: boolean             // more findings than graves returned
}

interface Check {
  id: 'dependencies' | 'secrets' | 'code' | 'config' | 'project' | 'markers'
  name: string                   // plain words, shown on the page
  status: 'ran' | 'partial' | 'skipped' | 'failed'
  detail: string                 // what it read, or why it could not
}

type Category =
  | 'vulnerable-dependency' | 'secret' | 'injection' | 'access-control'
  | 'crypto' | 'authentication' | 'misconfiguration' | 'supply-chain'
  | 'exposure' | 'code-note'

interface RepoGrave {
  id: string                     // stable: `${rule}:${path}:${line}`, or `${rule}:${ecosystem}:${name}@${version}`
  rule: string                   // the catalogue id, such as 'py.sql-injection'
  category: Category
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  confidence: 'confirmed' | 'likely' | 'possible'
  title: string                  // short, carved on the stone: 'SQL injection'
  detail: string                 // what it means, in plain words
  fix: string                    // what to do about it
  path: string | null            // repo-relative; null only when a finding has no file
  line: number | null            // 1-based
  snippet: string | null         // the line, trimmed to 160 characters; secrets redacted
  owasp: string | null           // 'A05:2025 Injection'
  cwe: string | null             // 'CWE-89'
  references: { label: string; url: string }[]
  package: { ecosystem: string; name: string; version: string; fixedIn: string | null; dev: boolean } | null
}
```

## 5. The checks

The scan runs six checks. Each reports `ran`, `partial`, `skipped` or `failed` with a plain reason.

### 5.1 `dependencies`: known vulnerable dependencies

1. Find lockfiles anywhere outside `node_modules`, `vendor` and the other ignored folders (§6).
2. Parse them into exact `(ecosystem, name, version)` triples, each tagged as development-only when the lockfile says so.
3. Query `POST https://api.osv.dev/v1/querybatch` with up to 1,000 queries per request. Up to 5,000 distinct package versions are checked per scan.
4. Fetch each advisory once (`GET /v1/vulns/{id}`), at most 200 per scan, 8 at a time, with retries on network errors. One advisory for every vulnerable package is fetched first, so every grave has a rating; the rest fill the remaining room.
5. Merge advisories that are aliases of each other (the same CVE published as GHSA and PYSEC), then raise **one grave per vulnerable package version**, listing all of its advisories.

| Lockfile | Ecosystem | Read as |
| --- | --- | --- |
| `package-lock.json`, `npm-shrinkwrap.json` (v1, v2, v3) | npm | JSON |
| `yarn.lock` (classic and Berry) | npm | text blocks |
| `pnpm-lock.yaml` (v5 to v9) | npm | YAML package keys |
| `requirements*.txt` (`name==version` lines only; a range such as `==1.2.*` is not an exact version and is not checked) | PyPI | text |
| `poetry.lock`, `uv.lock` | PyPI | TOML |
| `Pipfile.lock` | PyPI | JSON |
| `go.mod` | Go | `require` lines |
| `Cargo.lock` | crates.io | TOML (registry packages only) |
| `Gemfile.lock` | RubyGems | `specs:` section |
| `composer.lock` | Packagist | JSON |

**Severity** comes from the advisory: GitHub's reviewed rating (`CRITICAL`, `HIGH`, `MODERATE`, `LOW`) when present; otherwise the CVSS 3.x base score worked out from its vector (9.0 and above critical, 7.0 high, 4.0 medium, below that low); otherwise medium, with the detail saying the advisory gives no rating. A package's grave takes its worst advisory.

**Fixed version:** the lowest version that fixes every listed advisory that has a fix: for each advisory, the lowest `fixed` event above the installed version in its ranges for that package, then the highest of those. When no advisory lists a fix, the grave says so; when only some do, the fix says how many have none yet. When an advisory's details could not be fetched (the cap in step 4), the grave says that, rather than that the advisory has no rating.

**Where the grave points:** the package's own entry in the lockfile, found by its name and its version, so nested copies of one package at different versions each point at their own entry.

**Not read:** `bun.lockb` (binary), `bun.lock`, Maven, Gradle, NuGet, and `requirements.txt` lines without an exact version. The check's detail names what was left out. When the lockfiles pin no exact version at all, the check is `skipped`, since nothing was checked.

### 5.2 `secrets`: leaked keys and passwords

Runs over every readable text file (source, config, shell scripts, `.env` files, `.properties`, `.ini`, `.xml`, `.tfvars`, `.npmrc`, ...), but not Markdown, whose examples would flood the yard.

| Rule | Matches | Severity | Confidence |
| --- | --- | --- | --- |
| `secret.aws-access-key` | `AKIA`/`ABIA`/`ACCA` + 16 (long-term) or `ASIA` + 16 (temporary, high) | critical | confirmed |
| `secret.aws-secret-key` | 40-character value assigned to an `aws_secret_access_key` name | critical | confirmed |
| `secret.github-token` | `ghp_`, `gho_`, `ghu_`, `ghs_`, `ghr_` + 36, or `github_pat_` + 82 | critical | confirmed |
| `secret.gitlab-token` | `glpat-` + 20 | critical | confirmed |
| `secret.slack-token` | `xoxb-`, `xoxa-`, `xoxp-`, `xoxr-`, `xoxs-` | high | confirmed |
| `secret.slack-webhook` | `https://hooks.slack.com/services/T…/B…/…` | medium | confirmed |
| `secret.stripe-live-key` | `sk_live_`, `rk_live_` | critical | confirmed |
| `secret.openai-key` | `sk-…T3BlbkFJ…` (all key types) | critical | confirmed |
| `secret.anthropic-key` | `sk-ant-api03-…AA`, `sk-ant-admin01-…AA` | critical | confirmed |
| `secret.sendgrid-key` | `SG.` + 22 + `.` + 43 | high | confirmed |
| `secret.npm-token` | `npm_` + 36 | critical | confirmed |
| `secret.pypi-token` | `pypi-AgEIcHlwaS5vcmc…` | critical | confirmed |
| `secret.google-api-key` | `AIza` + 35 (often a browser key meant to be public; check its restrictions) | medium | confirmed |
| `secret.private-key` | `-----BEGIN … PRIVATE KEY-----` (encrypted keys: high) | critical | confirmed |
| `secret.database-url` | `postgres://user:pass@host` and the MySQL, MongoDB, Redis, AMQP and MSSQL forms (local hosts: low) | high | likely |
| `secret.hardcoded-credential` | A string assigned to a name ending in `password`, `secret`, `token`, `api_key`, `client_secret`, `private_key`, `encryption_key` or `signing_key`: 8 or more characters with some randomness, or, outside test code, a short value of 4 to 7 characters given to a password or secret (weak defaults such as `root` or `letmein`). Quoted values anywhere; unquoted values in `.env`, `.properties`, `.ini`, `.cfg`, `.conf`, `.tfvars` and YAML files (`KEY: value` and `- KEY=value`); and the literal `default` of a Terraform `variable` with a secret-like name | medium | possible |

**Not reported:** values that contain `EXAMPLE` (AWS's documented sample keys), look like placeholders (exactly `changeme`, `your_api_key`, `xxx`, `<…>`, `${…}`, a template field such as `{password}`, or a `hashed_…` stand-in), or read a variable or the environment instead of a literal. A longer value that only contains `change-me`, such as `super-secret-key-change-me`, is a real secret that was never changed, and is reported.

### 5.3 `code`: dangerous code patterns (tree-sitter)

Runs on `.py`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.ts`, `.tsx`, `.mts` and `.cts` files. Code in other languages is read for secrets and markers only, and the check's detail says so.

**Dynamic string:** an f-string with a `{…}`, a `%` or `+` on a string, a `.format(…)` call, a JavaScript template literal with `${…}`, or `+` with a string operand. A **tagged** template (`` sql`…${x}` ``) is a query builder that escapes its values, so it is not counted.

**User input:** Python `request.args`, `.form`, `.values`, `.json`, `.data`, `.files`, `.cookies`, `.headers`, `.GET`, `.POST`, `.body`, `.query_params`, `.path_params`, `.get_json()`; JavaScript `req.query`, `.params`, `.body`, `.headers`, `.cookies`, and Koa's `ctx.query` and `ctx.request.*`. Also any name assigned from these, or from a value built with them, earlier in the same function, and the parameters of Python route handlers. NoSQL injection counts only the body, query and cookies: an Express route parameter is always a string, so it cannot carry query operators.

**Values in variables:** where a rule needs to see the value itself (is it a fixed string, is it SQL, which options are set), a name is replaced by what it was assigned earlier in the same function, or at the top of the file, up to four steps deep.

| Rule | Python | JavaScript / TypeScript | Severity | CWE | OWASP |
| --- | --- | --- | --- | --- | --- |
| `*.sql-injection` | `.execute`, `.executemany`, `.executescript`, `.raw`, `text(…)` given a dynamic string that reads as SQL | `.query`, `.execute`, `.raw`, `.whereRaw` and friends given a dynamic SQL string; `$queryRawUnsafe` / `$executeRawUnsafe` given anything but a literal. A string whose every inserted value goes through an escape function (`sql.escape`, `escapeLiteral`, …) is not counted | high | CWE-89 | A05 |
| `*.command-injection` | `os.system`, `os.popen`, `subprocess.getoutput`, or `subprocess.*` with `shell=True`, given a non-literal | `exec`/`execSync` from `child_process` given a non-literal; `spawn`/`execFile` with `shell: true` | high | CWE-78 | A05 |
| `*.code-injection` | `eval`, `exec` given a non-literal | `eval`, `new Function`, `vm.run*`, string `setTimeout`/`setInterval` | high | CWE-94 | A05 |
| `py.template-injection` | `render_template_string`, `jinja2.Template` given a non-literal (a fixed template that is passed values as variables is safe) | | high | CWE-94 | A05 |
| `*.xss` | `mark_safe`, `Markup` given a non-literal | `.innerHTML =`, `.outerHTML =`, `document.write`, `insertAdjacentHTML`, `dangerouslySetInnerHTML` given a non-literal not wrapped in a sanitizer; `res.send` of user input | medium | CWE-79 | A05 |
| `js.nosql-injection` | | `find`, `findOne`, `update*`, `delete*`, `aggregate` given user input in the filter (the first argument), or the whole request body as any argument. Request fields inside an update such as `$set` are not counted | medium | CWE-943 | – |
| `*.unsafe-deserialization` | `yaml.load` without a safe loader, `yaml.unsafe_load` (high); `pickle`, `dill`, `marshal`, `jsonpickle` loads (medium) | | high / medium | CWE-502 | A08 |
| `*.path-traversal` | `open`, `send_file`, `FileResponse` given user input | `res.sendFile`, `res.download`, `fs.readFile*`, `createReadStream`, and the writes `fs.writeFile*`, `appendFile*`, `createWriteStream`, `unlink*` and an upload's `.mv` given user input | high | CWE-22 | A01 |
| `*.ssrf` | `requests.*`, `httpx.*`, `urlopen` given user input | `fetch`, `axios`, `got`, `http(s).get`, `request` given user input | high | CWE-918 | A01 |
| `*.open-redirect` | `redirect`, `HttpResponseRedirect` given user input | `res.redirect` given user input | medium | CWE-601 | A01 |
| `*.tls-verify-disabled` | `verify=False`, `ssl._create_unverified_context`, `CERT_NONE`, `check_hostname = False` | `rejectUnauthorized: false`, `NODE_TLS_REJECT_UNAUTHORIZED = '0'` | high | CWE-295 | A07 |
| `py.jwt-no-verify`, `js.jwt-none-algorithm` | `jwt.decode` with `verify=False`, `verify_signature: False`, or the `none` algorithm | `jwt.verify` allowing the `none` algorithm | high | CWE-347 | A04 |
| `js.jwt-ignore-expiration` | | `jwt.verify` with `ignoreExpiration: true` | medium | CWE-613 | A07 |
| `*.weak-hash` | `hashlib.md5`, `sha1`, `new('md5')` (unless `usedforsecurity=False`) | `createHash('md5' / 'sha1')` | low | CWE-328 | A04 |
| `*.weak-password-hash` | the same, on a line about passwords (`password`, `pwd`, `pw`, `passphrase`) | the same | high | CWE-916 | A04 |
| `js.weak-cipher` | | `createCipher` (no IV), DES, RC4 or ECB ciphers | medium | CWE-327 | A04 |
| `*.hardcoded-secret-key` | `SECRET_KEY`, `app.secret_key`, `config['SECRET_KEY']`, `JWT_SECRET`, `JWT_SECRET_KEY` set to a literal | `session({ secret: '…' })`, `jwt.sign/verify(…, '…')` | high | CWE-321 | A04 |
| `py.debug-enabled` | `app.run(debug=True)` and `app.config['DEBUG'] = True` (high: the Werkzeug debugger runs code); `DEBUG = True` in Django settings (medium) | | high / medium | CWE-489 | A02 |
| `*.cors-credentials-wildcard` | Flask-CORS or `CORSMiddleware` allowing any origin with credentials | `cors({ origin: '*' or true, credentials: true })` | medium | CWE-942 | A02 |
| `py.allowed-hosts-wildcard` | `ALLOWED_HOSTS = ['*']` | | medium | CWE-16 | A02 |
| `py.csrf-disabled` | `@csrf_exempt` (low); `WTF_CSRF_ENABLED = False` (medium) | | low / medium | CWE-352 | A01 |
| `*.xxe` | `XMLParser(resolve_entities=True)`; external general or parameter entities turned on with `setFeature`, by constant or by feature URL | libxmljs `noent: true` | high | CWE-611 | A02 |
| `js.stack-trace-exposure` | | `err.stack` sent in a response | medium | CWE-209 | A10 |
| `js.insecure-cookie` | | `res.cookie(…, { httpOnly: false })` or `secure: false` | low | CWE-1004 / CWE-614 | A02 |

### 5.4 `config`: infrastructure and CI

| Rule | Matches | Severity | CWE | OWASP |
| --- | --- | --- | --- | --- |
| `cfg.env-file-committed` | A `.env` or `.env.*` file (not `.example`, `.sample`, `.template`, `.dist`, `.defaults`) | high | CWE-798 | A07 |
| `cfg.key-store-committed` | `.p12`, `.pfx`, `.jks`, `.keystore` files | high | CWE-321 | A04 |
| `cfg.docker-runs-as-root` | A Dockerfile whose last stage sets no `USER`, or sets `root` / `0` | medium | CWE-250 | – |
| `cfg.docker-unpinned-base` | `FROM image` with no tag or `:latest` | low | CWE-1357 | A03 |
| `cfg.docker-secret-in-image` | `ENV` or `ARG` with a secret-like name and a literal value | high | CWE-798 | A07 |
| `cfg.container-privileged` | `privileged: true` in Kubernetes or Compose YAML (high); `hostNetwork`, `hostPID`, `allowPrivilegeEscalation: true` (medium) | high / medium | CWE-269 | A06 |
| `cfg.terraform-open-ingress` | Ingress from `0.0.0.0/0` or `::/0` to SSH, RDP, database or cache ports, or to every port | high | CWE-284 | A01 |
| `cfg.terraform-public-storage` | `acl = "public-read"` / `"public-read-write"`; `publicly_accessible = true` | high | CWE-284 | A01 |
| `cfg.terraform-unencrypted` | `encrypted = false`, `storage_encrypted = false` | medium | CWE-311 | A06 |
| `cfg.gha-untrusted-checkout` | `pull_request_target` workflow that checks out the pull request's head | critical | CWE-829 | A08 |
| `cfg.gha-script-injection` | `${{ github.event.…title / body / message / ref / … }}` or `${{ github.head_ref }}` inside a `run:` step | high | CWE-78 | A05 |
| `cfg.gha-write-all` | `permissions: write-all` | medium | CWE-732 | A01 |
| `cfg.gha-unpinned-action` | A third-party action (not `actions/*` or `github/*`) not pinned to a full commit SHA | low | CWE-829 | A08 |

### 5.5 `project`: missing protections

Each of these has `possible` confidence and says "no sign of" in its title.

| Rule | Fires when | Severity | CWE | OWASP |
| --- | --- | --- | --- | --- |
| `prj.no-rate-limiting` | A web framework is a dependency (Express, Fastify, Koa, NestJS, Hapi, Hono, Restify; Flask, FastAPI, Django, Starlette, Sanic, aiohttp, Tornado), no known rate-limit package is, and no Python, JavaScript or TypeScript file outside test code mentions rate limiting or throttling (reports such as `sarif.json` don't count) | medium | CWE-307 | A07 |
| `prj.no-security-headers` | Express, Koa or Fastify without Helmet, and no Python, JavaScript or TypeScript file outside test code mentions `Content-Security-Policy` or `X-Frame-Options` | low | CWE-1021 | A06 |
| `dep.no-lockfile` | A `package.json` with dependencies, or a `pyproject.toml` with dependencies, and no lockfile beside it | low | CWE-1357 | A03 |

### 5.6 `markers`: code notes

The existing `TODO`, `FIXME`, `HACK` and `XXX` comments stay, as `note.marker` in the `code-note` category: `FIXME` and `XXX` are `low`, `HACK` and `TODO` are `info`. They sort after every security finding.

Only markers inside comments count. In Python, JavaScript and TypeScript the syntax tree says where the comments are (Python docstrings count as comments); in other files the marker must follow a comment sign on its line (`#`, `//`, `/*`, `*`, `--`, `<!--`). A `TODO` inside a string, such as a page's text, is not a grave.

## 6. Reading the repo

The scan downloads one zipball pinned to the commit (as today), then reads it **in memory** (no workspace on disk, which also suits Lambda's small `/tmp`):

- **Ignored folders:** as today (`node_modules`, `vendor`, `dist`, `build`, `.git`, `coverage`, virtual envs, caches, ...).
- **Read for code rules, secrets and markers:** files whose extension is in the language list (Python, JavaScript, TypeScript, Java, C, C++, Go, PHP, Ruby, JSON, YAML, TOML, Terraform, Dockerfile), up to 512 KB each.
- **Read for secrets only:** `.env*`, `.properties`, `.ini`, `.cfg`, `.conf`, `.config`, `.xml`, `.sh`, `.bash`, `.zsh`, `.ps1`, `.tfvars`, `.npmrc`, `.pypirc`, `.pem`, `.key`, `id_rsa` and its kin, up to 512 KB each.
- **Lockfiles:** the names in §5.1, up to 10 MB each.
- **Names only:** every path in the archive, for `cfg.env-file-committed` and `cfg.key-store-committed`, which need no contents.
- **Limits:** at most 2,000 files and 40 MB read. Past either limit, the remaining files are skipped and counted, and the scan carries on (it does not fail as ingestion does).
- **Binary and non-UTF-8 files** are skipped.

## 7. Running the scan

1. The OSV.dev lookups start as soon as the lockfiles are parsed and run while the code is read.
2. Code, secrets, config, project and marker checks run in a worker thread, so the server keeps answering other requests.
3. The scan has a 35-second budget, so with the download it fits inside the page's 60-second wait. A check that runs out of time stops, keeps what it found, and reports `partial`.
4. A file that fails to parse is skipped by the code rules (and counted) but still read for secrets and markers.

## 8. Ordering, de-duplication and caps

- **One finding per line:** when two rules fire on the same line, the more specific one is kept (a code rule over the generic credential rule; a provider key over the generic rule).
- **Order:** severity, then confidence, then category (dependencies, secrets, injection, ...), then path and line.
- **Caps:** at most 40 graves from one rule, and at most 300 in all. The per-rule cap never leaves out a critical or high grave, so a repo with 60 serious vulnerable packages shows all 60. `summary` always counts every finding, and `truncated` says when graves were left out.

## 9. Safety

- **Outbound requests** go only to `api.github.com`, `codeload.github.com` and `api.osv.dev`. None of them is chosen by the user, so there is no server-side request forgery risk. Each has a timeout and bounded retries.
- **Nothing from the repo is run**, installed or imported. YAML is read with `safe_load`, TOML with `tomllib`, JSON with `json`. Tree-sitter only parses.
- **Secrets are redacted before they leave the scanner,** and are never logged.
- **Bounded work:** file count, byte, per-file, lockfile, package, advisory, time and grave limits, all in `app/config.py` with `GRAVECAST_*` overrides.
- **Rate limit:** 4 scans per minute per client, as today.

## 10. Settings

| Setting | Default | Environment variable |
| --- | --- | --- |
| `graveyard_max_files` | 2000 | `GRAVECAST_GRAVEYARD_MAX_FILES` |
| `graveyard_max_total_bytes` | 40,000,000 | `GRAVECAST_GRAVEYARD_MAX_TOTAL_BYTES` |
| `graveyard_max_per_rule` | 40 | `GRAVECAST_GRAVEYARD_MAX_PER_RULE` |
| `graveyard_max_graves` | 300 | `GRAVECAST_GRAVEYARD_MAX_GRAVES` |
| `graveyard_time_budget_seconds` | 35 | `GRAVECAST_GRAVEYARD_TIME_BUDGET_SECONDS` |
| `lockfile_max_bytes` | 10,000,000 | `GRAVECAST_LOCKFILE_MAX_BYTES` |
| `osv_api_base_url` | `https://api.osv.dev` | `GRAVECAST_OSV_API_BASE_URL` |
| `osv_timeout_seconds` | 15 | `GRAVECAST_OSV_TIMEOUT_SECONDS` |
| `osv_retries` | 2 | `GRAVECAST_OSV_RETRIES` |
| `osv_batch_size` | 1000 | `GRAVECAST_OSV_BATCH_SIZE` |
| `osv_max_packages` | 5000 | `GRAVECAST_OSV_MAX_PACKAGES` |
| `osv_max_advisories` | 200 | `GRAVECAST_OSV_MAX_ADVISORIES` |
| `osv_concurrency` | 8 | `GRAVECAST_OSV_CONCURRENCY` |
| `secret_min_entropy` | 3.0 | `GRAVECAST_SECRET_MIN_ENTROPY` |

## 11. On the page

- **Graves are kinds of findings.** The page gathers findings by rule into one grave each (the Python and JavaScript versions of a rule share a grave; all vulnerable packages share one; all code notes share one). Graves are ordered by their worst severity, then by how many findings they hold. At most 10 stand in the yard: the first nine kinds get their own, and any further kinds share a tenth, "Other findings". The API still returns one entry per finding; the grouping is done on the page, so nothing is lost.
- **A grave's card lists every place** it was found: the file and line (linked to GitHub) and the line itself; for packages, the version, the version that fixes it and its advisories. The first five show at once, the rest open with one click.

- **Weathering** follows the worst severity in the grave (§3). The grave's label is its severity and category in words, such as "Critical · Leaked secret".
- **The stone** carries the short title and the file. **The card** above it, once the witch arrives, shows the file and line (linked to that line on GitHub, pinned to the commit), the problem, how to fix it, the CWE and OWASP category, and the advisory links.
- **The verdict** counts what was found by severity. With nothing found it reads "No problems found by these checks", never "safe".
- **"Not checked"** lists every check that did not fully run, with its reason, then the standing limits from §1.

## 12. Tests

Every rule has a test with a sample that must fire and a near miss that must not. Further tests cover:

- **Dependencies:** each lockfile parser, alias merging, severity from ratings and from CVSS vectors, the fixed version, and development-only lowering. OSV.dev is mocked.
- **Secrets:** redaction, so no value reaches the response.
- **Adjustments:** suppression comments, test-path lowering, de-duplication, ordering and caps.
- **The endpoint:** end to end, with GitHub and OSV.dev mocked. No test touches the real network.
