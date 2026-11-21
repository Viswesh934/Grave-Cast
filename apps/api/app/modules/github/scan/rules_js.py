"""Dangerous JavaScript and TypeScript code, read from tree-sitter syntax trees (docs/REPO_SCAN_DESIGN.md §5.3)."""
from __future__ import annotations

import re
from collections.abc import Iterator
from dataclasses import dataclass

from app.modules.github.scan.files import ScanFile
from app.modules.github.scan.findings import Finding
from app.modules.github.scan.rules_python import Emitter
from app.modules.github.scan.syntax import PASSWORD_CONTEXT, SQL_TEXT, Flow, Node, ancestor, grammar_for, line, nodes_of, text, walk

# User input, read straight from the request (Express, Koa, Fastify and Next.js request objects).
USER_INPUT = re.compile(r"\b(req|request)\.(query|params|body|headers|cookies|files)\b|\bctx\.(query|params|request\.(query|body|params))\b")
# NoSQL injection needs a value that can be an object: an Express route parameter is always a string.
NOSQL_INPUT = re.compile(r"\b(req|request)\.(query|body|cookies)\b|\bctx\.(query|request\.(query|body))\b")
# A value wrapped in a sanitizer is not reported as cross-site scripting.
_SANITIZED = re.compile(r"(?i)\b(sanitize\w*|dompurify|purify|escape\w*|xss|encode\w*)\s*[.(]")

_WRAPPERS = frozenset({"parenthesized_expression", "as_expression", "non_null_expression", "satisfies_expression", "type_assertion", "await_expression"})
_SQL_METHODS = frozenset({"query", "execute", "raw", "whereRaw", "orWhereRaw", "havingRaw", "joinRaw", "orderByRaw", "groupByRaw", "fromRaw", "unsafe"})
_UNSAFE_PRISMA = frozenset({"$queryRawUnsafe", "$executeRawUnsafe"})
_EXEC = frozenset({"exec", "execSync"})
_SPAWN = frozenset({"spawn", "spawnSync", "execFile", "execFileSync"})
_VM = frozenset({"runInNewContext", "runInThisContext", "runInContext", "compileFunction"})
_MONGO = frozenset(
    {"find", "findOne", "findOneAndUpdate", "findOneAndDelete", "findOneAndReplace", "updateOne", "updateMany", "deleteOne", "deleteMany", "replaceOne", "aggregate", "countDocuments", "where"}
)
_FILE_READS = frozenset(
    {"sendFile", "download", "readFile", "readFileSync", "createReadStream", "writeFile", "writeFileSync", "appendFile", "appendFileSync", "createWriteStream", "unlink", "unlinkSync", "mv"}
)
_FETCHERS = frozenset({"fetch", "axios", "got", "needle", "request", "superagent"})
_FETCH_CLIENTS = frozenset({"axios", "got", "superagent", "http", "https", "needle"})
_FETCH_VERBS = frozenset({"get", "post", "put", "patch", "delete", "head", "request"})
_SESSIONS = frozenset({"session", "expressSession", "cookieSession"})
_RESPONSE_SENDS = re.compile(r"^(res|reply|response)(\.status\([^)]*\))?\.(send|json|end|write)$")
_STACK = re.compile(r"\b(err|error|e|ex|exception)\.stack\b")
_ALIAS_ASSIGN = re.compile(r"(\w+)\s*=\s*require\(\s*['\"](?:node:)?child_process['\"]\s*\)")
_ALIAS_IMPORT = re.compile(r"import\s+(?:\*\s+as\s+)?(\w+)\s+from\s+['\"](?:node:)?child_process['\"]")
_WEAK_CIPHER = re.compile(r"(?i)\b(des|des-ede\d?|rc2|rc4|bf|blowfish)\b|-ecb\b")
_NONE_ALGORITHM = re.compile(r"['\"`]none['\"`]", re.IGNORECASE)
_TLS_ENV = frozenset({"process.env.NODE_TLS_REJECT_UNAUTHORIZED", "process.env['NODE_TLS_REJECT_UNAUTHORIZED']", 'process.env["NODE_TLS_REJECT_UNAUTHORIZED"]'})


def unwrap(node: Node) -> Node:
    """The expression inside parentheses, `await`, and TypeScript's `as` and `!`."""
    while node.type in _WRAPPERS and node.named_children:
        node = node.named_children[0]
    return node


def is_literal(node: Node | None) -> bool:
    """A fixed value: a string, a template with no ${…}, a number, true, false, null or undefined."""
    if node is None:
        return True
    node = unwrap(node)
    if node.type == "template_string":
        return not any(child.type == "template_substitution" for child in node.children)
    return node.type in {"string", "number", "true", "false", "null", "undefined", "regex"}


def _has_string(node: Node) -> bool:
    return any(n.type in {"string", "template_string"} for n in walk(node))


def is_dynamic_string(node: Node) -> bool:
    """A string built at run time: a template with ${…}, or + with a string."""
    node = unwrap(node)
    if node.type == "template_string":
        return any(child.type == "template_substitution" for child in node.children)
    if node.type == "binary_expression":
        operator = node.child_by_field_name("operator")
        return operator is not None and text(operator) == "+" and _has_string(node)
    return False


def _args(call: Node) -> list[Node] | None:
    """A call's arguments, or None for a tagged template (sql`...`), which escapes its values."""
    arguments = call.child_by_field_name("arguments")
    if arguments is None or arguments.type != "arguments":
        return None
    return [child for child in arguments.named_children if child.type != "comment"]


def _pairs(node: Node | None) -> dict[str, Node]:
    """An object literal's keys and values."""
    if node is None:
        return {}
    node = unwrap(node)
    if node.type != "object":
        return {}
    pairs: dict[str, Node] = {}
    for child in node.named_children:
        if child.type == "pair":
            key = child.child_by_field_name("key")
            value = child.child_by_field_name("value")
            if key is not None and value is not None:
                pairs[text(key).strip("'\"`")] = value
    return pairs


def _is(node: Node | None, kind: str) -> bool:
    return node is not None and unwrap(node).type == kind


def _user_input(node: Node | None) -> bool:
    return node is not None and bool(USER_INPUT.search(text(node)))


def _names(callee: Node) -> tuple[str, str, str]:
    """The callee as written, its last part, and the object it is called on."""
    name = text(callee)
    if callee.type == "member_expression":
        return name, text(callee.child_by_field_name("property")), text(callee.child_by_field_name("object"))
    return name, name, ""


def _string_value(node: Node | None) -> str | None:
    if node is None or not is_literal(node) or unwrap(node).type not in {"string", "template_string"}:
        return None
    return text(unwrap(node)).strip("'\"`")


def _child_process_names(file: ScanFile) -> frozenset[str]:
    """The names child_process is bound to in this file, so regex.exec(...) is never mistaken for a shell."""
    if "child_process" not in file.text:
        return frozenset()
    names = {"child_process", "childProcess", "cp"}
    names.update(_ALIAS_ASSIGN.findall(file.text))
    names.update(_ALIAS_IMPORT.findall(file.text))
    return frozenset(names)


def _literal_array(node: Node | None) -> bool:
    if node is None or unwrap(node).type != "array":
        return False
    items = unwrap(node).named_children
    return bool(items) and all(is_literal(item) for item in items)


def _value(flow: Flow, node: Node | None) -> Node | None:
    """The expression a name stands for (assigned earlier in the function), unwrapped; or the node itself."""
    if node is None:
        return None
    node = unwrap(node)
    resolved = flow.resolve(node)
    return unwrap(resolved) if resolved is not None else node


_ESCAPE_CALL = re.compile(r"(^|\.)(escape|escapeLiteral|escapeIdentifier|escapeId|quote|literal)$")


def _escaped(node: Node) -> bool:
    node = unwrap(node)
    return node.type == "call_expression" and bool(_ESCAPE_CALL.search(text(node.child_by_field_name("function"))))


def _all_escaped(node: Node) -> bool:
    """Whether every value put into a dynamic string goes through an escape function, such as sql.escape(x)."""
    node = unwrap(node)
    if node.type == "string":
        return True
    if node.type == "template_string":
        return all(_escaped(c.named_children[0]) for c in node.children if c.type == "template_substitution" and c.named_children)
    if node.type == "binary_expression":
        parts = (node.child_by_field_name("left"), node.child_by_field_name("right"))
        return all(part is not None and _all_escaped(part) for part in parts)
    return _escaped(node)


@dataclass(frozen=True)
class _Facts:
    """What a file uses, read once per file instead of once per call."""

    vm: bool
    mongo: bool
    jwt: bool
    shelljs: bool

    @staticmethod
    def of(file: ScanFile) -> _Facts:
        text = file.text
        return _Facts(
            vm=bool(re.search(r"require\(\s*['\"](node:)?vm['\"]|from\s+['\"](node:)?vm['\"]", text)),
            mongo=bool(re.search(r"mongo|mongoose", text, re.IGNORECASE)),
            jwt="jsonwebtoken" in text,
            shelljs="shelljs" in text,
        )


def _check_call(node: Node, emit: Emitter, file: ScanFile, shells: frozenset[str], facts: _Facts) -> None:
    flow = emit.flow
    callee = node.child_by_field_name("function")
    args = _args(node)
    if callee is None or args is None:
        return
    name, last, target = _names(callee)
    first = args[0] if args else None
    second = args[1] if len(args) > 1 else None
    value = _value(flow, first)
    last_value = _value(flow, args[-1]) if args else None
    options = last_value if last_value is not None and last_value.type == "object" else None

    # SQL built from a dynamic string, in the call or in a variable it was put in first.
    if last in _SQL_METHODS and value is not None and is_dynamic_string(value) and SQL_TEXT.search(text(value)) and not _all_escaped(value):
        emit("js.sql-injection", node, user_input=flow.tainted(first))
    if last in _UNSAFE_PRISMA and first is not None and not is_literal(value):
        emit("js.sql-injection", node, user_input=flow.tainted(first))

    # Shell commands, only where child_process (or shelljs) is in use.
    if shells:
        bound = callee.type == "identifier" or target in shells
        if last in _EXEC and bound and first is not None and not is_literal(value):
            emit("js.command-injection", node, user_input=flow.tainted(first))
        if last in _SPAWN and bound and _is(_pairs(options).get("shell"), "true") and first is not None and not is_literal(value):
            emit("js.command-injection", node, user_input=flow.tainted(first))
    if target == "shell" and last == "exec" and facts.shelljs and first is not None and not is_literal(value):
        emit("js.command-injection", node, user_input=flow.tainted(first))

    # Strings run as code.
    if name == "eval" and first is not None and not is_literal(value):
        emit("js.code-injection", node, user_input=flow.tainted(first))
    if name in {"setTimeout", "setInterval"} and value is not None and is_dynamic_string(value):
        emit("js.code-injection", node, user_input=flow.tainted(first))
    uses_vm = target in {"vm", "node:vm"} or facts.vm
    if last in _VM and uses_vm and first is not None and not is_literal(value):
        emit("js.code-injection", node, user_input=flow.tainted(first))

    # HTML written straight into the page, or user input sent back as the response.
    if name in {"document.write", "document.writeln"} and first is not None and not is_literal(value) and not _SANITIZED.search(text(value)):
        emit("js.xss", node, user_input=flow.tainted(first))
    html = _value(flow, second) if last == "insertAdjacentHTML" else None
    if last == "insertAdjacentHTML" and html is not None and not is_literal(html) and not _SANITIZED.search(text(html)):
        emit("js.xss", node, user_input=flow.tainted(second))
    if _RESPONSE_SENDS.match(name) and last in {"send", "write", "end"} and any(_user_input(arg) for arg in args):
        emit(
            "js.xss",
            node,
            detail="Request data is sent straight back as the response. If the response is HTML, a crafted link can run scripts in the visitor's browser.",
        )

    # Request data into a database query, a file path, an outgoing request, or a redirect.
    # Operators are injected through the filter; the whole request body as an update document counts too.
    if last in _MONGO and facts.mongo:
        whole_body = any(re.fullmatch(r"(req|request|ctx\.request)\.body", text(unwrap(arg))) for arg in args)
        if whole_body or flow.tainted(first, NOSQL_INPUT):
            emit("js.nosql-injection", node)
    if last in _FILE_READS and first is not None and flow.tainted(first):
        emit("js.path-traversal", node)
    fetches = (callee.type == "identifier" and name in _FETCHERS) or (target in _FETCH_CLIENTS and last in _FETCH_VERBS)
    if fetches and first is not None and (flow.tainted(first) or flow.tainted(_pairs(value).get("url"))):
        emit("js.ssrf", node)
    if last == "redirect" and target in {"res", "ctx", "reply", "response"} and any(flow.tainted(arg) for arg in args):
        emit("js.open-redirect", node)

    # Tokens. The options object may be kept in a variable.
    if name in {"jwt.verify", "verify"} and facts.jwt:
        settings = _pairs(options)
        if "algorithms" in settings and _NONE_ALGORITHM.search(text(_value(flow, settings["algorithms"]))):
            emit("js.jwt-none-algorithm", node)
        if _is(_value(flow, settings.get("ignoreExpiration")), "true"):
            emit("js.jwt-ignore-expiration", node)
    if name in {"jwt.sign", "jwt.verify"} and second is not None and _string_value(_value(flow, second)):
        emit("js.hardcoded-secret-key", node)

    # Weak hashing and ciphers.
    if last == "createHash" and (_string_value(value) or "").lower() in {"md5", "sha1"}:
        function = ancestor(node, "function_declaration", "method_definition", "variable_declarator")
        context = file.line_text(line(node)) + (text(function.child_by_field_name("name")) if function is not None else "")
        emit("js.weak-password-hash" if PASSWORD_CONTEXT.search(context) else "js.weak-hash", node)
    if last == "createCipher":
        emit("js.weak-cipher", node)
    if last == "createCipheriv" and _WEAK_CIPHER.search(_string_value(value) or ""):
        emit("js.weak-cipher", node)

    # Session secrets written into the code.
    if last in _SESSIONS:
        settings = _pairs(value)
        secret = _value(flow, settings.get("secret"))
        if (secret is not None and _string_value(secret)) or _literal_array(_value(flow, settings.get("keys"))):
            emit("js.hardcoded-secret-key", node)

    # Any origin, with credentials.
    if name == "cors":
        settings = _pairs(value)
        origin = _value(flow, settings.get("origin"))
        if origin is not None and (_string_value(origin) == "*" or _is(origin, "true")) and _is(_value(flow, settings.get("credentials")), "true"):
            emit("js.cors-credentials-wildcard", node)

    # Stack traces sent to users.
    if _RESPONSE_SENDS.match(name) and any(_STACK.search(text(arg)) for arg in args):
        emit("js.stack-trace-exposure", node)

    # Cookies without their protections.
    if name in {"res.cookie", "reply.setCookie", "response.cookie"}:
        settings = _pairs(options)
        if _is(settings.get("httpOnly"), "false"):
            emit("js.insecure-cookie", node)
        elif _is(settings.get("secure"), "false"):
            emit(
                "js.insecure-cookie",
                node,
                cwe="CWE-614",
                detail="A cookie is set with secure: false, so it can travel over plain http where others on the network can read it.",
            )

    # XML parsers told to expand entities.
    if last in {"parseXml", "parseXmlString"} and _is(_pairs(options).get("noent"), "true"):
        emit("js.xxe", node)


def _check_new(node: Node, emit: Emitter) -> None:
    flow = emit.flow
    constructor = text(node.child_by_field_name("constructor"))
    args = _args(node) or []
    if constructor == "Function" and any(not is_literal(_value(flow, arg)) for arg in args):
        emit("js.code-injection", node, user_input=any(flow.tainted(arg) for arg in args))
    if constructor == "vm.Script" and args and not is_literal(_value(flow, args[0])):
        emit("js.code-injection", node, user_input=flow.tainted(args[0]))


def _check_assignment(node: Node, emit: Emitter) -> None:
    left = node.child_by_field_name("left")
    right = node.child_by_field_name("right")
    if left is None or right is None:
        return
    if left.type == "member_expression" and text(left.child_by_field_name("property")) in {"innerHTML", "outerHTML"}:
        html = _value(emit.flow, right)
        if html is not None and not is_literal(html) and not _SANITIZED.search(text(html)):
            emit("js.xss", node, user_input=emit.flow.tainted(right))
    if text(left) in _TLS_ENV and text(unwrap(right)).strip("'\"`") == "0":
        emit("js.tls-verify-disabled", node)


def _check_pair(node: Node, emit: Emitter) -> None:
    key = text(node.child_by_field_name("key")).strip("'\"`")
    if key in {"rejectUnauthorized", "strictSSL"} and _is(node.child_by_field_name("value"), "false"):
        emit("js.tls-verify-disabled", node)


def _check_jsx(node: Node, emit: Emitter) -> None:
    name = node.named_children[0] if node.named_children else None
    if text(name) != "dangerouslySetInnerHTML":
        return
    for child in walk(node):
        if child.type == "pair" and text(child.child_by_field_name("key")).strip("'\"") == "__html":
            raw = child.child_by_field_name("value")
            html = _value(emit.flow, raw)
            if html is not None and not is_literal(html) and not _SANITIZED.search(text(html)):
                emit("js.xss", node, user_input=emit.flow.tainted(raw))
            return


def js_findings(file: ScanFile, root: Node) -> Iterator[Finding]:
    """Every JavaScript and TypeScript rule over one file's syntax tree."""
    grammar = grammar_for(file.path) or "javascript"
    emit = Emitter(file, Flow(root, "js", USER_INPUT, grammar))
    shells = _child_process_names(file)
    facts = _Facts.of(file)
    for node in nodes_of(root, grammar, ("call_expression", "new_expression", "assignment_expression", "pair", "jsx_attribute")):
        t = node.type
        if t == "call_expression":
            _check_call(node, emit, file, shells, facts)
        elif t == "new_expression":
            _check_new(node, emit)
        elif t == "assignment_expression":
            _check_assignment(node, emit)
        elif t == "pair":
            _check_pair(node, emit)
        elif t == "jsx_attribute":
            _check_jsx(node, emit)
    yield from emit.found
