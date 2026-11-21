"""Every rule the scan can raise, in one place (docs/REPO_SCAN_DESIGN.md §5).

Each rule's id, severity, confidence, CWE and OWASP category match the design
document. Findings are made only through `finding()`, so a grave always
carries its rule's words, CWE, OWASP category and references.
"""
from __future__ import annotations

from dataclasses import dataclass

from app.modules.github.scan.findings import (
    Category,
    Confidence,
    Finding,
    PackageRef,
    Reference,
    Severity,
    SNIPPET_MAX_CHARS,
)

# OWASP Top 10:2025 categories, by the CWEs their official lists contain.
# Read from owasp.org/Top10/2025 while writing the design. A CWE that no list
# contains has no category, and the grave shows the CWE alone (§3).
_OWASP_CATEGORIES: dict[str, tuple[str, str, tuple[int, ...]]] = {
    "A01": ("Broken Access Control", "A01_2025-Broken_Access_Control", (22, 284, 352, 601, 732, 918)),
    "A02": ("Security Misconfiguration", "A02_2025-Security_Misconfiguration", (16, 489, 611, 614, 942, 1004)),
    "A03": ("Software Supply Chain Failures", "A03_2025-Software_Supply_Chain_Failures", (1104, 1357, 1395)),
    "A04": ("Cryptographic Failures", "A04_2025-Cryptographic_Failures", (321, 326, 327, 328, 330, 347, 916)),
    "A05": ("Injection", "A05_2025-Injection", (77, 78, 79, 89, 94, 95)),
    "A06": ("Insecure Design", "A06_2025-Insecure_Design", (269, 311, 312, 522, 1021)),
    "A07": ("Authentication Failures", "A07_2025-Authentication_Failures", (259, 287, 295, 307, 346, 521, 613, 798, 1392)),
    "A08": ("Software or Data Integrity Failures", "A08_2025-Software_or_Data_Integrity_Failures", (345, 494, 502, 829)),
    "A10": ("Mishandling of Exceptional Conditions", "A10_2025-Mishandling_of_Exceptional_Conditions", (209,)),
}
OWASP_BASE_URL = "https://owasp.org/Top10/2025"
CWE_BASE_URL = "https://cwe.mitre.org/data/definitions"


def owasp_for(cwe: str | None) -> tuple[str, str] | None:
    """The OWASP Top 10:2025 category for a CWE, as (label, page URL), or None."""
    if not cwe:
        return None
    number = int(cwe.split("-", 1)[1])
    for code, (name, slug, cwes) in _OWASP_CATEGORIES.items():
        if number in cwes:
            return f"{code}:2025 {name}", f"{OWASP_BASE_URL}/{slug}/"
    return None


# Families: findings in one family on one line are de-duplicated (§8).
CREDENTIAL = "credential"


@dataclass(frozen=True)
class Rule:
    id: str
    title: str
    category: Category
    severity: Severity
    confidence: Confidence
    cwe: str | None
    detail: str
    fix: str
    # What the severity becomes when the value is user input, for rules that fire on any non-literal (§3).
    input_severity: Severity | None = None
    family: str | None = None
    specificity: int = 0
    lower_in_tests: bool = True


def _r(*args: object, **kwargs: object) -> Rule:
    return Rule(*args, **kwargs)  # type: ignore[arg-type]


def _secret(rule_id: str, title: str, severity: Severity, what: str, rotate: str) -> Rule:
    return _r(
        rule_id,
        title,
        "secret",
        severity,
        "confirmed",
        "CWE-798",
        f"A {what} is written into the code. Anyone who can read the repo can use it, and it stays in the git history even after the line is deleted.",
        f"{rotate} Then load it from an environment variable or a secret manager, and remove it from the git history.",
        family=CREDENTIAL,
        specificity=3,
        lower_in_tests=False,
    )


_ROTATE = "Revoke the key now and issue a new one."

RULES: dict[str, Rule] = {
    rule.id: rule
    for rule in (
        # ---- Dependencies (§5.1) ----
        _r(
            "dep.vulnerable",
            "Vulnerable dependency",
            "vulnerable-dependency",
            "high",
            "confirmed",
            "CWE-1395",
            "This exact version of the package has published security advisories.",
            "Upgrade the package to a fixed version and update the lockfile.",
            lower_in_tests=False,
        ),
        _r(
            "dep.no-lockfile",
            "No lockfile",
            "supply-chain",
            "low",
            "likely",
            "CWE-1357",
            "Dependencies are declared without a lockfile, so every install can pick up different, unreviewed versions, and their known vulnerabilities could not be checked.",
            "Commit the lockfile your package manager writes (package-lock.json, poetry.lock, uv.lock, ...).",
            lower_in_tests=False,
        ),
        # ---- Secrets (§5.2) ----
        _r(
            "secret.aws-access-key",
            "AWS access key",
            "secret",
            "critical",
            "confirmed",
            "CWE-798",
            "An AWS access key id is written into the code. If its secret key is anywhere an attacker can find it, they can act on your AWS account and run up costs.",
            "Deactivate the key in AWS IAM now and create a new one. Then load it from the environment or an IAM role, and remove it from the git history.",
            family=CREDENTIAL,
            specificity=3,
            lower_in_tests=False,
        ),
        _secret("secret.aws-secret-key", "AWS secret key", "critical", "AWS secret access key", "Deactivate the key pair in AWS IAM now and create a new one."),
        _secret("secret.github-token", "GitHub token", "critical", "GitHub access token", _ROTATE),
        _secret("secret.gitlab-token", "GitLab token", "critical", "GitLab access token", _ROTATE),
        _secret("secret.slack-token", "Slack token", "high", "Slack API token", _ROTATE),
        _secret("secret.slack-webhook", "Slack webhook", "medium", "Slack webhook address, which lets anyone post into your workspace,", "Delete the webhook in Slack and create a new one."),
        _secret("secret.stripe-live-key", "Stripe live key", "critical", "live Stripe secret key, which can move real money,", "Roll the key in the Stripe dashboard now."),
        _secret("secret.openai-key", "OpenAI API key", "critical", "OpenAI API key, which others can spend on your bill,", _ROTATE),
        _secret("secret.anthropic-key", "Anthropic API key", "critical", "Anthropic API key, which others can spend on your bill,", _ROTATE),
        _secret("secret.sendgrid-key", "SendGrid API key", "high", "SendGrid API key, which lets others send email as you,", _ROTATE),
        _secret("secret.npm-token", "npm token", "critical", "npm token, which can publish new versions of your packages,", _ROTATE),
        _secret("secret.pypi-token", "PyPI token", "critical", "PyPI token, which can publish new versions of your packages,", _ROTATE),
        _r(
            "secret.google-api-key",
            "Google API key",
            "secret",
            "medium",
            "confirmed",
            "CWE-798",
            "A Google API key is written into the code. Keys used in web pages are public by nature, but an unrestricted key can be used by anyone on your bill.",
            "In the Google Cloud console, restrict the key to your site and to the APIs it needs. If it is a server key, rotate it and load it from the environment.",
            family=CREDENTIAL,
            specificity=3,
            lower_in_tests=False,
        ),
        _secret("secret.private-key", "Private key", "critical", "private key", "Treat the key as compromised: replace it and revoke anything it signed or unlocked."),
        _r(
            "secret.database-url",
            "Database password",
            "secret",
            "high",
            "likely",
            "CWE-798",
            "A database address with a username and password in it is written into the code.",
            "Change the database password, then load the address from an environment variable.",
            family=CREDENTIAL,
            specificity=2,
        ),
        _r(
            "secret.hardcoded-credential",
            "Hard-coded credential",
            "secret",
            "medium",
            "possible",
            "CWE-798",
            "A value that looks like a password, token or key is written into the code next to a name that says it is one.",
            "If it is real, change it, then load it from an environment variable or a secret manager.",
            family=CREDENTIAL,
            specificity=1,
        ),
        # ---- Code: injection (§5.3) ----
        _r(
            "py.sql-injection",
            "SQL injection",
            "injection",
            "high",
            "likely",
            "CWE-89",
            "A SQL query is built by putting values into the query text. If any of them comes from a user, they can change the query and read or destroy data.",
            "Pass values as query parameters (for example cursor.execute(sql, params)) instead of formatting them into the text.",
            input_severity="critical",
        ),
        _r(
            "js.sql-injection",
            "SQL injection",
            "injection",
            "high",
            "likely",
            "CWE-89",
            "A SQL query is built by putting values into the query text. If any of them comes from a user, they can change the query and read or destroy data.",
            "Use placeholders (db.query('... WHERE id = $1', [id])) or a tagged query builder instead of a template literal or +.",
            input_severity="critical",
        ),
        _r(
            "py.command-injection",
            "Command injection",
            "injection",
            "high",
            "likely",
            "CWE-78",
            "A shell command is built from a value that is not fixed. If a user controls any part of it, they can run their own commands on the server.",
            "Call subprocess with a list of arguments and without shell=True, and never pass user input to os.system or os.popen.",
            input_severity="critical",
        ),
        _r(
            "js.command-injection",
            "Command injection",
            "injection",
            "high",
            "likely",
            "CWE-78",
            "A shell command is built from a value that is not fixed. If a user controls any part of it, they can run their own commands on the server.",
            "Use execFile or spawn with an array of arguments and no shell option, and never pass user input to exec.",
            input_severity="critical",
        ),
        _r(
            "py.code-injection",
            "Code injection",
            "injection",
            "high",
            "likely",
            "CWE-94",
            "eval or exec runs a string that is not fixed as Python code. Whoever controls that string can run anything on the server.",
            "Remove eval and exec. To read data, use json.loads or ast.literal_eval.",
            input_severity="critical",
        ),
        _r(
            "js.code-injection",
            "Code injection",
            "injection",
            "high",
            "likely",
            "CWE-94",
            "A string that is not fixed is run as JavaScript (eval, new Function, vm, or a string timer). Whoever controls that string can run anything.",
            "Remove the dynamic code. To read data, use JSON.parse; pass functions, not strings, to setTimeout and setInterval.",
            input_severity="critical",
        ),
        _r(
            "py.template-injection",
            "Template injection",
            "injection",
            "high",
            "likely",
            "CWE-94",
            "A template is built from a value that is not fixed. In Jinja2, whoever controls the template text can run code on the server.",
            "Keep templates fixed and pass values to them as variables (render_template('page.html', name=name)).",
            input_severity="critical",
        ),
        _r(
            "py.xss",
            "Cross-site scripting",
            "injection",
            "medium",
            "likely",
            "CWE-79",
            "Text that is not fixed is marked as safe HTML, so the template's escaping is turned off. If it holds user input, it can run scripts in other people's browsers.",
            "Let the template escape the value; only mark fixed, reviewed HTML as safe.",
            input_severity="high",
        ),
        _r(
            "js.xss",
            "Cross-site scripting",
            "injection",
            "medium",
            "likely",
            "CWE-79",
            "HTML that is not fixed is written straight into the page. If it holds user input, it can run scripts in other people's browsers.",
            "Set textContent instead of innerHTML, or clean the HTML with a sanitizer such as DOMPurify first.",
            input_severity="high",
        ),
        _r(
            "js.nosql-injection",
            "NoSQL injection",
            "injection",
            "medium",
            "likely",
            "CWE-943",
            "Request data goes straight into a database query. A user can send query operators (such as $ne or $gt) instead of plain values and get past checks.",
            "Check that each value is a plain string or number before it reaches the query, or use a schema library.",
        ),
        _r(
            "py.unsafe-deserialization",
            "Unsafe deserialization",
            "injection",
            "medium",
            "likely",
            "CWE-502",
            "Data is loaded with a format that can run code while loading (pickle, marshal, unsafe YAML). Whoever controls the data can run code on the server.",
            "Use json, or yaml.safe_load. Only unpickle data your own code wrote and nobody else can change.",
            input_severity="critical",
        ),
        # ---- Code: access control (§5.3) ----
        _r(
            "py.path-traversal",
            "Path traversal",
            "access-control",
            "high",
            "likely",
            "CWE-22",
            "A file path comes straight from the request. A user can ask for ../../ paths and read files outside the folder you meant.",
            "Look the file up by a name you check against a list, or use safe_join / send_from_directory.",
        ),
        _r(
            "js.path-traversal",
            "Path traversal",
            "access-control",
            "high",
            "likely",
            "CWE-22",
            "A file path comes straight from the request. A user can ask for ../../ paths and read files outside the folder you meant.",
            "Resolve the path and check that it stays inside the folder, or pass a root option to sendFile.",
        ),
        _r(
            "py.ssrf",
            "Server-side request forgery",
            "access-control",
            "high",
            "likely",
            "CWE-918",
            "The server fetches an address that comes straight from the request. A user can make it call internal services or the cloud metadata address.",
            "Only fetch addresses on a fixed allow-list, and block private and local addresses.",
        ),
        _r(
            "js.ssrf",
            "Server-side request forgery",
            "access-control",
            "high",
            "likely",
            "CWE-918",
            "The server fetches an address that comes straight from the request. A user can make it call internal services or the cloud metadata address.",
            "Only fetch addresses on a fixed allow-list, and block private and local addresses.",
        ),
        _r(
            "py.open-redirect",
            "Open redirect",
            "access-control",
            "medium",
            "likely",
            "CWE-601",
            "The page redirects to an address taken straight from the request, so a link to your site can send people to a phishing page.",
            "Only redirect to paths on your own site, or to addresses on an allow-list.",
        ),
        _r(
            "js.open-redirect",
            "Open redirect",
            "access-control",
            "medium",
            "likely",
            "CWE-601",
            "The page redirects to an address taken straight from the request, so a link to your site can send people to a phishing page.",
            "Only redirect to paths on your own site, or to addresses on an allow-list.",
        ),
        _r(
            "py.csrf-disabled",
            "CSRF protection off",
            "access-control",
            "low",
            "likely",
            "CWE-352",
            "Cross-site request forgery protection is switched off here, so another site can make a signed-in user's browser send this request.",
            "Keep CSRF protection on, and only exempt endpoints that check their own signature, such as webhooks.",
        ),
        # ---- Code: crypto and authentication (§5.3) ----
        _r(
            "py.tls-verify-disabled",
            "Certificate checks off",
            "authentication",
            "high",
            "likely",
            "CWE-295",
            "HTTPS certificate checks are turned off, so anyone on the network path can pretend to be the server and read or change the traffic.",
            "Remove verify=False / CERT_NONE. If the server uses a private certificate authority, point verify at its certificate.",
        ),
        _r(
            "js.tls-verify-disabled",
            "Certificate checks off",
            "authentication",
            "high",
            "likely",
            "CWE-295",
            "HTTPS certificate checks are turned off, so anyone on the network path can pretend to be the server and read or change the traffic.",
            "Remove rejectUnauthorized: false and NODE_TLS_REJECT_UNAUTHORIZED=0. For a private certificate authority, pass its certificate with the ca option.",
        ),
        _r(
            "py.jwt-no-verify",
            "JWT not verified",
            "crypto",
            "high",
            "likely",
            "CWE-347",
            "A JSON Web Token is decoded without checking its signature, so anyone can write their own token and be trusted.",
            "Verify the signature with your key and a fixed list of algorithms (never 'none').",
        ),
        _r(
            "js.jwt-none-algorithm",
            "JWT accepts no signature",
            "crypto",
            "high",
            "likely",
            "CWE-347",
            "Token checks accept the 'none' algorithm, which means no signature at all, so anyone can write their own token.",
            "Pass a fixed list of real algorithms, such as ['HS256'] or ['RS256'].",
        ),
        _r(
            "js.jwt-ignore-expiration",
            "JWT expiry ignored",
            "authentication",
            "medium",
            "likely",
            "CWE-613",
            "Token checks ignore the expiry time, so a stolen or old token keeps working for ever.",
            "Remove ignoreExpiration and give tokens a short lifetime.",
        ),
        _r(
            "py.weak-hash",
            "Weak hash",
            "crypto",
            "low",
            "likely",
            "CWE-328",
            "MD5 or SHA-1 is used. Both are broken for security uses such as signatures and integrity checks.",
            "Use SHA-256 or better. If this is not a security use, pass usedforsecurity=False to say so.",
        ),
        _r(
            "js.weak-hash",
            "Weak hash",
            "crypto",
            "low",
            "likely",
            "CWE-328",
            "MD5 or SHA-1 is used. Both are broken for security uses such as signatures and integrity checks.",
            "Use SHA-256 or better for anything security-related.",
        ),
        _r(
            "py.weak-password-hash",
            "Weak password hashing",
            "crypto",
            "high",
            "likely",
            "CWE-916",
            "Passwords are hashed with a fast hash (MD5 or SHA-1). Leaked hashes like these can be cracked in bulk within hours.",
            "Hash passwords with a slow password hash: argon2, bcrypt or scrypt.",
        ),
        _r(
            "js.weak-password-hash",
            "Weak password hashing",
            "crypto",
            "high",
            "likely",
            "CWE-916",
            "Passwords are hashed with a fast hash (MD5 or SHA-1). Leaked hashes like these can be cracked in bulk within hours.",
            "Hash passwords with a slow password hash: argon2, bcrypt or scrypt.",
        ),
        _r(
            "js.weak-cipher",
            "Weak encryption",
            "crypto",
            "medium",
            "likely",
            "CWE-327",
            "Data is encrypted with a broken or deprecated cipher setup (createCipher, DES, RC4 or ECB mode).",
            "Use createCipheriv with AES-256-GCM and a fresh random IV for each message.",
        ),
        _r(
            "py.hardcoded-secret-key",
            "Hard-coded secret key",
            "crypto",
            "high",
            "likely",
            "CWE-321",
            "The key that signs sessions or tokens is written into the code. Anyone who reads it can forge a signed-in session for any user.",
            "Generate a long random key, load it from an environment variable, and change the old one.",
            family=CREDENTIAL,
            specificity=4,
        ),
        _r(
            "js.hardcoded-secret-key",
            "Hard-coded secret key",
            "crypto",
            "high",
            "likely",
            "CWE-321",
            "The key that signs sessions or tokens is written into the code. Anyone who reads it can forge a signed-in session for any user.",
            "Generate a long random key, load it from an environment variable, and change the old one.",
            family=CREDENTIAL,
            specificity=4,
        ),
        # ---- Code: misconfiguration and exposure (§5.3) ----
        _r(
            "py.debug-enabled",
            "Debug mode on",
            "misconfiguration",
            "high",
            "likely",
            "CWE-489",
            "The app runs in debug mode. Flask's debugger lets anyone who reaches an error page run code on the server.",
            "Turn debug off outside your own machine, for example with an environment variable.",
        ),
        _r(
            "py.cors-credentials-wildcard",
            "Any site can read responses",
            "misconfiguration",
            "medium",
            "likely",
            "CWE-942",
            "Cross-origin requests are allowed from every site, with cookies. Any website a signed-in user visits can read their data from this API.",
            "List the exact origins that may call the API, or turn credentials off.",
        ),
        _r(
            "js.cors-credentials-wildcard",
            "Any site can read responses",
            "misconfiguration",
            "medium",
            "likely",
            "CWE-942",
            "Cross-origin requests are allowed from every site, with cookies. Any website a signed-in user visits can read their data from this API.",
            "List the exact origins that may call the API, or turn credentials off.",
        ),
        _r(
            "py.allowed-hosts-wildcard",
            "Any host name accepted",
            "misconfiguration",
            "medium",
            "likely",
            "CWE-16",
            "Django accepts any Host header, which opens the door to host header attacks such as poisoned password-reset links.",
            "List your real domain names in ALLOWED_HOSTS.",
        ),
        _r(
            "py.xxe",
            "XML external entities",
            "misconfiguration",
            "high",
            "likely",
            "CWE-611",
            "The XML parser is set to resolve external entities, so a crafted XML file can read files from the server or make it call other addresses.",
            "Leave entity resolution off (resolve_entities=False), or use defusedxml.",
        ),
        _r(
            "js.xxe",
            "XML external entities",
            "misconfiguration",
            "high",
            "likely",
            "CWE-611",
            "The XML parser is set to expand external entities (noent: true), so a crafted XML file can read files from the server.",
            "Remove the noent option.",
        ),
        _r(
            "js.insecure-cookie",
            "Unprotected cookie",
            "misconfiguration",
            "low",
            "likely",
            "CWE-1004",
            "A cookie is set with httpOnly or secure turned off, so scripts can read it, or it can travel over plain http.",
            "Set httpOnly: true, secure: true and sameSite on cookies that carry sessions or tokens.",
        ),
        _r(
            "js.stack-trace-exposure",
            "Stack trace sent to users",
            "exposure",
            "medium",
            "likely",
            "CWE-209",
            "The error's stack trace is sent back in the response, showing file paths, library versions and internal details to anyone.",
            "Log the stack trace on the server and send a plain error message instead.",
        ),
        # ---- Config and CI (§5.4) ----
        _r(
            "cfg.env-file-committed",
            "Committed .env file",
            "secret",
            "high",
            "likely",
            "CWE-798",
            "An environment file is committed. These usually hold passwords and API keys, and everything in it is now public and in the git history.",
            "Change every secret in the file, remove it from the repo and the git history, add it to .gitignore, and commit an .env.example without values instead.",
        ),
        _r(
            "cfg.key-store-committed",
            "Committed key store",
            "crypto",
            "high",
            "likely",
            "CWE-321",
            "A key store file (.p12, .pfx, .jks or .keystore) is committed. These hold private keys and certificates.",
            "Replace the keys it holds, remove it from the repo and the git history, and keep it in a secret manager.",
        ),
        _r(
            "cfg.docker-runs-as-root",
            "Container runs as root",
            "misconfiguration",
            "medium",
            "likely",
            "CWE-250",
            "The image's last stage never switches away from the root user, so anyone who breaks into the app has root inside the container.",
            "Create an unprivileged user in the Dockerfile and add USER <name> before the app starts.",
        ),
        _r(
            "cfg.docker-unpinned-base",
            "Unpinned base image",
            "supply-chain",
            "low",
            "likely",
            "CWE-1357",
            "The base image has no version tag, or uses :latest, so each build can pull a different, unreviewed image.",
            "Pin the image to a version tag, or better, to its sha256 digest.",
        ),
        _r(
            "cfg.docker-secret-in-image",
            "Secret baked into image",
            "secret",
            "high",
            "likely",
            "CWE-798",
            "A secret is set with ENV or ARG in the Dockerfile. It is stored in the image's layers, where anyone who pulls the image can read it.",
            "Pass secrets at run time, or use BuildKit secret mounts (RUN --mount=type=secret).",
            family=CREDENTIAL,
            specificity=4,
        ),
        _r(
            "cfg.container-privileged",
            "Privileged container",
            "misconfiguration",
            "high",
            "likely",
            "CWE-269",
            "A container is given extra powers over its host (privileged mode, the host's network or processes, or privilege escalation). Breaking into it can mean breaking into the host.",
            "Remove privileged: true and the host* settings, and set allowPrivilegeEscalation: false.",
        ),
        _r(
            "cfg.terraform-open-ingress",
            "Open to the internet",
            "access-control",
            "high",
            "likely",
            "CWE-284",
            "A firewall rule lets the whole internet reach an administration, database or cache port, or every port.",
            "Limit the rule to your own addresses, or reach the service through a VPN or bastion host.",
        ),
        _r(
            "cfg.terraform-public-storage",
            "Public storage",
            "access-control",
            "high",
            "likely",
            "CWE-284",
            "Storage or a database is made public (a public-read ACL, or a publicly accessible database).",
            "Make it private, and share files through signed URLs or a CDN with access control.",
        ),
        _r(
            "cfg.terraform-unencrypted",
            "Storage not encrypted",
            "crypto",
            "medium",
            "likely",
            "CWE-311",
            "Encryption at rest is turned off for this disk or database.",
            "Set encrypted / storage_encrypted to true.",
        ),
        _r(
            "cfg.gha-untrusted-checkout",
            "Workflow runs untrusted code",
            "supply-chain",
            "critical",
            "likely",
            "CWE-829",
            "A pull_request_target workflow checks out the pull request's own code. It runs with the repo's secrets and write access, so anyone who opens a pull request can steal them.",
            "Use the pull_request trigger for building and testing contributors' code, or never check out the pull request's head in a pull_request_target workflow.",
            lower_in_tests=False,
        ),
        _r(
            "cfg.gha-script-injection",
            "Workflow script injection",
            "injection",
            "high",
            "likely",
            "CWE-78",
            "Text that anyone can write (an issue title, a pull request body, a branch name) is put straight into a shell script, so it can run its own commands in your CI with its secrets.",
            "Pass the value in an environment variable (env: TITLE: ${{ ... }}) and use \"$TITLE\" in the script.",
            lower_in_tests=False,
        ),
        _r(
            "cfg.gha-write-all",
            "Workflow has full write access",
            "access-control",
            "medium",
            "likely",
            "CWE-732",
            "The workflow's token can write to everything in the repo, so any step that goes wrong can push code or change releases.",
            "Grant only what each job needs, for example permissions: contents: read.",
            lower_in_tests=False,
        ),
        _r(
            "cfg.gha-unpinned-action",
            "Unpinned third-party action",
            "supply-chain",
            "low",
            "likely",
            "CWE-829",
            "A third-party action is used by a tag or branch, which its owner (or anyone who takes over their account) can move to new code that runs with your secrets.",
            "Pin the action to a full commit SHA, and let Dependabot update it.",
            lower_in_tests=False,
        ),
        # ---- Project (§5.5) ----
        _r(
            "prj.no-rate-limiting",
            "No sign of rate limiting",
            "authentication",
            "medium",
            "possible",
            "CWE-307",
            "The app is a web server, but no rate-limiting package or code was found, so logins and other endpoints can be hammered with guesses. It may be done by a gateway or proxy the scan cannot see.",
            "Add a rate limiter (express-rate-limit, @nestjs/throttler, slowapi, flask-limiter, django-ratelimit) at least to login, sign-up and password reset.",
            lower_in_tests=False,
        ),
        _r(
            "prj.no-security-headers",
            "No sign of security headers",
            "misconfiguration",
            "low",
            "possible",
            "CWE-1021",
            "The Node web server sets no security headers (such as Content-Security-Policy or X-Frame-Options), so its pages can be framed by other sites and scripts are not limited. They may be added by a proxy the scan cannot see.",
            "Add helmet (app.use(helmet())), or set the headers yourself.",
            lower_in_tests=False,
        ),
        # ---- Code notes (§5.6) ----
        _r(
            "note.marker",
            "Code note",
            "code-note",
            "info",
            "confirmed",
            None,
            "A note left in the code.",
            "Resolve it, or turn it into a tracked issue.",
            lower_in_tests=False,
        ),
    )
}


def cwe_reference(cwe: str) -> Reference:
    number = cwe.split("-", 1)[1]
    return Reference(label=cwe, url=f"{CWE_BASE_URL}/{number}.html")


def _trim(text: str | None) -> str | None:
    if text is None:
        return None
    text = " ".join(text.split())
    return text if len(text) <= SNIPPET_MAX_CHARS else text[: SNIPPET_MAX_CHARS - 1] + "\u2026"


def finding(
    rule_id: str,
    *,
    path: str | None,
    line: int | None,
    snippet: str | None = None,
    severity: Severity | None = None,
    confidence: Confidence | None = None,
    title: str | None = None,
    detail: str | None = None,
    fix: str | None = None,
    cwe: str | None = None,
    references: tuple[Reference, ...] = (),
    package: PackageRef | None = None,
) -> Finding:
    """A finding for `rule_id`, carrying the rule's words, CWE, OWASP category and references."""
    rule = RULES[rule_id]
    the_cwe = cwe if cwe is not None else rule.cwe
    owasp = owasp_for(the_cwe)
    refs = list(references)
    if the_cwe:
        refs.append(cwe_reference(the_cwe))
    if owasp:
        refs.append(Reference(label=owasp[0].split(" ", 1)[0], url=owasp[1]))
    return Finding(
        rule=rule.id,
        category=rule.category,
        severity=severity or rule.severity,
        confidence=confidence or rule.confidence,
        title=title or rule.title,
        detail=detail or rule.detail,
        fix=fix or rule.fix,
        path=path,
        line=line,
        snippet=_trim(snippet),
        owasp=owasp[0] if owasp else None,
        cwe=the_cwe,
        references=tuple(refs),
        package=package,
        family=rule.family,
        specificity=rule.specificity,
        lower_in_tests=rule.lower_in_tests,
    )
