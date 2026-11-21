"""Dangerous Python code, read from tree-sitter syntax trees (docs/REPO_SCAN_DESIGN.md §5.3)."""
from __future__ import annotations

import re
from collections.abc import Iterator
from dataclasses import dataclass, field

from app.modules.github.scan.catalog import RULES, finding
from app.modules.github.scan.files import ScanFile
from app.modules.github.scan.findings import Finding, worst
from app.modules.github.scan.syntax import PASSWORD_CONTEXT, SQL_TEXT, Flow, Node, ancestor, line, nodes_of, text, walk

# User input, read straight from the request (Flask, Django, Starlette and FastAPI request objects).
USER_INPUT = re.compile(
    r"\brequest\.(args|form|values|json|data|files|cookies|headers|GET|POST|body|query_params|path_params|get_json|params|FILES|COOKIES|META)\b"
)

_SQL_METHODS = frozenset({"execute", "executemany", "executescript", "raw", "extra"})
_SHELL_CALLS = frozenset({"os.system", "os.popen", "subprocess.getoutput", "subprocess.getstatusoutput", "commands.getoutput", "commands.getstatusoutput"})
_SUBPROCESS = frozenset({"run", "call", "Popen", "check_call", "check_output"})
_PICKLE_LOADS = frozenset(
    {
        "pickle.load",
        "pickle.loads",
        "cPickle.load",
        "cPickle.loads",
        "_pickle.load",
        "_pickle.loads",
        "dill.load",
        "dill.loads",
        "marshal.load",
        "marshal.loads",
        "jsonpickle.decode",
        "pd.read_pickle",
        "pandas.read_pickle",
    }
)
_UNSAFE_YAML_LOADERS = frozenset({"Loader", "yaml.Loader", "UnsafeLoader", "yaml.UnsafeLoader", "FullLoader", "yaml.FullLoader"})
_HTTP_VERBS = frozenset({"get", "post", "put", "patch", "delete", "head", "options", "request", "stream"})
_HTTP_CLIENTS = frozenset({"requests", "httpx"})
_REDIRECTS = frozenset({"redirect", "HttpResponseRedirect", "HttpResponsePermanentRedirect", "RedirectResponse"})
_FILE_SENDERS = frozenset({"open", "send_file", "FileResponse"})
_SECRET_KEY_NAMES = frozenset({"SECRET_KEY", "JWT_SECRET_KEY", "JWT_SECRET", "secret_key"})
_SETTINGS_FILE = re.compile(r"(^|/)settings[\w-]*\.py$|(^|/)settings/[\w-]+\.py$")
_ANY_ORIGIN = re.compile(r"['\"]\*['\"]")
_EXTERNAL_ENTITIES = re.compile(r"feature_external_[gp]es|external-(general|parameter)-entities")


def is_literal(node: Node | None) -> bool:
    """A fixed value: a string with no {…} interpolation, a number, True, False or None."""
    if node is None:
        return True
    t = node.type
    if t == "string":
        return not any(child.type == "interpolation" for child in node.children)
    if t in {"concatenated_string", "parenthesized_expression"}:
        return all(is_literal(child) for child in node.named_children)
    return t in {"integer", "float", "true", "false", "none"}


def _has_string(node: Node) -> bool:
    return any(n.type == "string" for n in walk(node))


def is_dynamic_string(node: Node) -> bool:
    """A string built at run time: an f-string with {…}, % or + on a string, or str.format(…)."""
    t = node.type
    if t in {"string", "concatenated_string"}:
        return any(n.type == "interpolation" for n in walk(node))
    if t == "parenthesized_expression":
        return any(is_dynamic_string(child) for child in node.named_children)
    if t == "binary_operator":
        operator = node.child_by_field_name("operator")
        return operator is not None and operator.type in {"%", "+"} and _has_string(node)
    if t == "call":
        function = node.child_by_field_name("function")
        if function is not None and function.type == "attribute":
            name = function.child_by_field_name("attribute")
            target = function.child_by_field_name("object")
            return text(name) == "format" and target is not None and _has_string(target)
    return False


@dataclass
class _Call:
    node: Node
    name: str  # the callee as written: "cur.execute", "os.system", "eval"
    last: str  # its last part: "execute"
    args: list[Node] = field(default_factory=list)
    kwargs: dict[str, Node] = field(default_factory=dict)

    def arg(self, index: int, keyword: str | None = None) -> Node | None:
        if keyword and keyword in self.kwargs:
            return self.kwargs[keyword]
        return self.args[index] if len(self.args) > index else None


def _call(node: Node) -> _Call | None:
    function = node.child_by_field_name("function")
    arguments = node.child_by_field_name("arguments")
    if function is None:
        return None
    name = text(function)
    last = text(function.child_by_field_name("attribute")) if function.type == "attribute" else name
    call = _Call(node=node, name=name, last=last)
    if arguments is not None and arguments.type == "argument_list":
        for child in arguments.named_children:
            if child.type == "keyword_argument":
                key = child.child_by_field_name("name")
                value = child.child_by_field_name("value")
                if key is not None and value is not None:
                    call.kwargs[text(key)] = value
            elif child.type not in {"comment", "list_splat", "dictionary_splat"}:
                call.args.append(child)
    return call


def _is_true(node: Node | None) -> bool:
    return node is not None and node.type == "true"


def _is_false(node: Node | None) -> bool:
    return node is not None and node.type == "false"


def _user_input(node: Node | None) -> bool:
    return node is not None and bool(USER_INPUT.search(text(node)))


def _function_name(node: Node) -> str:
    function = ancestor(node, "function_definition")
    return text(function.child_by_field_name("name")) if function is not None else ""


def _string_value(node: Node | None) -> str | None:
    """The text inside a plain string literal, or None."""
    if node is None or node.type != "string" or not is_literal(node):
        return None
    return "".join(text(child) for child in node.children if child.type == "string_content")


class Emitter:
    """Collects one file's findings, skipping suppressed lines and raising findings fed by user input (§3)."""

    def __init__(self, file: ScanFile, flow: Flow) -> None:
        self.file = file
        self.flow = flow
        self.found: list[Finding] = []

    def __call__(self, rule_id: str, node: Node, *, user_input: bool = False, **overrides: object) -> None:
        at = line(node)
        if self.file.suppressed(at):
            return
        rule = RULES[rule_id]
        if user_input and rule.input_severity is not None:
            # User input always raises, even over a severity the rule set for the case.
            overrides["severity"] = worst([overrides.get("severity") or rule.severity, rule.input_severity])  # type: ignore[list-item]
            overrides["confidence"] = "confirmed"
            overrides.setdefault("detail", rule.detail + " Here the value comes from the request.")
        self.found.append(finding(rule_id, path=self.file.path, line=at, snippet=self.file.line_text(at), **overrides))  # type: ignore[arg-type]


_GUARDED_DETAIL = " An if earlier in the function checks this value and stops; confirm that the check really blocks bad values."


def _guarded(call: Node, value: Node | None) -> bool:
    """Whether an `if` earlier in the same function tests this value and stops (raises or returns)."""
    function = ancestor(call, "function_definition")
    if function is None or value is None:
        return False
    needle = text(value)
    for node in walk(function):
        if node.type != "if_statement" or node.end_byte > call.start_byte:
            continue
        condition = node.child_by_field_name("condition")
        body = node.child_by_field_name("consequence")
        if condition is not None and body is not None and needle in text(condition):
            if any(n.type in {"raise_statement", "return_statement"} for n in walk(body)):
                return True
    return False


def _emit_checked(emit: Emitter, rule_id: str, call: _Call, value: Node | None) -> None:
    """A rule that fires on user input, at possible confidence when the value is checked first (§3)."""
    if _guarded(call.node, value):
        emit(rule_id, call.node, confidence="possible", detail=RULES[rule_id].detail + _GUARDED_DETAIL)
    else:
        emit(rule_id, call.node)


def _check_call(call: _Call, emit: Emitter, file: ScanFile) -> None:
    flow = emit.flow
    first = call.arg(0)
    # The value itself, when the call is given a name assigned earlier in the function.
    value = flow.resolve(first)
    name, last = call.name, call.last
    root = name.split(".", 1)[0]

    # SQL built from a dynamic string.
    if (last in _SQL_METHODS or name in {"text", "sqlalchemy.text", "sa.text"}) and value is not None:
        if is_dynamic_string(value) and SQL_TEXT.search(text(value)):
            emit("py.sql-injection", call.node, user_input=flow.tainted(first))

    # Shell commands.
    if name in _SHELL_CALLS and first is not None and not is_literal(value):
        emit("py.command-injection", call.node, user_input=flow.tainted(first))
    elif (name.startswith("subprocess.") and last in _SUBPROCESS) or (name in _SUBPROCESS and "from subprocess import" in file.text):
        command = call.arg(0, "args")
        if _is_true(call.kwargs.get("shell")) and command is not None and not is_literal(flow.resolve(command)):
            emit("py.command-injection", call.node, user_input=flow.tainted(command))

    # eval / exec.
    if name in {"eval", "exec"} and first is not None and not is_literal(value):
        emit("py.code-injection", call.node, user_input=flow.tainted(first))

    # Templates built from a dynamic value. A fixed template given values as variables is safe.
    if last == "render_template_string" and first is not None and not is_literal(value):
        emit("py.template-injection", call.node, user_input=flow.tainted(first))
    elif (name in {"jinja2.Template", "Template"} or last == "from_string") and "jinja" in file.text.lower():
        if first is not None and not is_literal(value):
            emit("py.template-injection", call.node, user_input=flow.tainted(first))

    # HTML marked safe.
    if last in {"mark_safe", "Markup"} and first is not None and not is_literal(value):
        emit("py.xss", call.node, user_input=flow.tainted(first))

    # Unsafe deserialization.
    if name in {"yaml.load", "yaml.load_all"}:
        loader = call.arg(1, "Loader")
        if loader is None or text(loader) in _UNSAFE_YAML_LOADERS:
            emit("py.unsafe-deserialization", call.node, user_input=flow.tainted(first), severity="high")
    elif name in {"yaml.unsafe_load", "yaml.unsafe_load_all"}:
        emit("py.unsafe-deserialization", call.node, user_input=flow.tainted(first), severity="high")
    elif name in _PICKLE_LOADS:
        emit("py.unsafe-deserialization", call.node, user_input=flow.tainted(first))

    # User input into a file path, an outgoing request, or a redirect.
    if last in _FILE_SENDERS and (name == last or name.startswith(("flask.", "django."))) and flow.tainted(first):
        _emit_checked(emit, "py.path-traversal", call, first)
    if (root in _HTTP_CLIENTS and last in _HTTP_VERBS) or last == "urlopen":
        url = call.arg(0, "url")
        if flow.tainted(url):
            _emit_checked(emit, "py.ssrf", call, url)
    if last in _REDIRECTS and flow.tainted(first):
        _emit_checked(emit, "py.open-redirect", call, first)

    # Certificate checks off.
    if _is_false(call.kwargs.get("verify")) and (root in _HTTP_CLIENTS or last in _HTTP_VERBS or last in {"Client", "AsyncClient", "Session"}):
        emit("py.tls-verify-disabled", call.node)
    if name in {"ssl._create_unverified_context", "_create_unverified_context"}:
        emit("py.tls-verify-disabled", call.node)

    # JWT decoded without its signature checked.
    if name == "jwt.decode":
        options = flow.resolve(call.kwargs.get("options"))
        algorithms = flow.resolve(call.kwargs.get("algorithms"))
        no_signature = options is not None and re.search(r"['\"]verify_signature['\"]\s*:\s*False", text(options))
        none_algorithm = algorithms is not None and re.search(r"['\"]none['\"]", text(algorithms), re.IGNORECASE)
        if _is_false(call.kwargs.get("verify")) or no_signature or none_algorithm:
            emit("py.jwt-no-verify", call.node)

    # Weak hashes.
    weak = name in {"hashlib.md5", "hashlib.sha1"} or (name in {"md5", "sha1"} and "hashlib" in file.text)
    if name == "hashlib.new" and (_string_value(value) or "").lower() in {"md5", "sha1"}:
        weak = True
    if weak and not _is_false(call.kwargs.get("usedforsecurity")):
        about_passwords = PASSWORD_CONTEXT.search(file.line_text(line(call.node))) or PASSWORD_CONTEXT.search(_function_name(call.node))
        emit("py.weak-password-hash" if about_passwords else "py.weak-hash", call.node)

    # Debug mode.
    if last == "run" and _is_true(call.kwargs.get("debug")) and ("flask" in file.text.lower() or name.endswith("app.run")):
        emit("py.debug-enabled", call.node)

    # Any origin, with credentials.
    if name in {"CORS", "flask_cors.CORS"} and _is_true(call.kwargs.get("supports_credentials")):
        origins = call.kwargs.get("origins") or call.kwargs.get("resources")
        if origins is None or _ANY_ORIGIN.search(text(flow.resolve(origins))):
            emit("py.cors-credentials-wildcard", call.node)
    if last == "add_middleware" and first is not None and text(first).endswith("CORSMiddleware"):
        origins = flow.resolve(call.kwargs.get("allow_origins"))
        regex = call.kwargs.get("allow_origin_regex")
        everyone = (origins is not None and _ANY_ORIGIN.search(text(origins))) or (regex is not None and text(regex).strip("'\"") in {".*", ".+"})
        if everyone and _is_true(call.kwargs.get("allow_credentials")):
            emit("py.cors-credentials-wildcard", call.node)

    # XML parsers told to resolve external entities.
    if last == "XMLParser" and _is_true(call.kwargs.get("resolve_entities")):
        emit("py.xxe", call.node)
    if last == "setFeature" and first is not None and _EXTERNAL_ENTITIES.search(text(value)) and _is_true(call.arg(1)):
        emit("py.xxe", call.node)


def _check_assignment(node: Node, emit: Emitter, file: ScanFile) -> None:
    left = node.child_by_field_name("left")
    right = node.child_by_field_name("right")
    if left is None or right is None:
        return
    target = text(left)
    last = target.rsplit(".", 1)[-1]
    key = _string_value(left.child_by_field_name("subscript")) if left.type == "subscript" else None

    # The signing key written into the code.
    if (last in _SECRET_KEY_NAMES or key in _SECRET_KEY_NAMES) and _string_value(right):
        emit("py.hardcoded-secret-key", node)

    statement = node.parent
    module_level = statement is not None and statement.parent is not None and statement.parent.type == "module"
    # Django settings.
    if target == "DEBUG" and right.type == "true" and module_level and _SETTINGS_FILE.search(file.path):
        emit(
            "py.debug-enabled",
            node,
            severity="medium",
            detail="Django's DEBUG is on in the settings. Error pages then show code, settings and stack traces to anyone.",
            fix="Read DEBUG from an environment variable, and keep it off in production.",
        )
    # Flask's debug setting in the app's config: app.run() then starts the Werkzeug debugger.
    if right.type == "true" and ((key == "DEBUG" and target.startswith(("app.config", "application.config"))) or target == "app.debug"):
        emit("py.debug-enabled", node)
    if target == "ALLOWED_HOSTS" and right.type == "list" and _ANY_ORIGIN.search(text(right)):
        emit("py.allowed-hosts-wildcard", node)
    if (last == "WTF_CSRF_ENABLED" or key == "WTF_CSRF_ENABLED") and right.type == "false":
        emit("py.csrf-disabled", node, severity="medium")

    # Certificate checks off.
    if last == "check_hostname" and right.type == "false":
        emit("py.tls-verify-disabled", node)
    if last == "verify_mode" and text(right) in {"ssl.CERT_NONE", "CERT_NONE"}:
        emit("py.tls-verify-disabled", node)


def python_findings(file: ScanFile, root: Node) -> Iterator[Finding]:
    """Every Python rule over one file's syntax tree."""
    emit = Emitter(file, Flow(root, "python", USER_INPUT, "python"))
    for node in nodes_of(root, "python", ("call", "assignment", "keyword_argument", "decorator")):
        if node.type == "call":
            call = _call(node)
            if call is not None:
                _check_call(call, emit, file)
        elif node.type == "assignment":
            _check_assignment(node, emit, file)
        elif node.type == "keyword_argument":
            # cert_reqs=ssl.CERT_NONE and the like.
            if text(node.child_by_field_name("value")) in {"ssl.CERT_NONE", "CERT_NONE"}:
                emit("py.tls-verify-disabled", node)
        elif node.type == "decorator" and text(node).lstrip("@").split("(", 1)[0].strip().endswith("csrf_exempt"):
            emit("py.csrf-disabled", node)
    yield from emit.found
