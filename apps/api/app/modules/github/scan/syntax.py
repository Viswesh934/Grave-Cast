"""Tree-sitter parsing and small helpers over syntax trees, shared by the Python and JavaScript rules (docs/REPO_SCAN_DESIGN.md §5.3).

Tree-sitter only parses: nothing in the repo is run or imported.
"""
from __future__ import annotations

import re
import threading
from collections.abc import Iterator
from dataclasses import dataclass
from functools import lru_cache
from pathlib import PurePosixPath

import tree_sitter
import tree_sitter_javascript
import tree_sitter_python
import tree_sitter_typescript

from app.modules.github.scan.files import TREE_SITTER_LANGUAGES

Node = tree_sitter.Node


@lru_cache(maxsize=None)
def _language(name: str) -> tree_sitter.Language:
    if name == "python":
        return tree_sitter.Language(tree_sitter_python.language())
    if name == "javascript":
        return tree_sitter.Language(tree_sitter_javascript.language())
    if name == "typescript":
        return tree_sitter.Language(tree_sitter_typescript.language_typescript())
    if name == "tsx":
        return tree_sitter.Language(tree_sitter_typescript.language_tsx())
    raise ValueError(f"No grammar for {name}")


# One parser per language per thread: parsers keep state between parses.
_local = threading.local()


def _parser(name: str) -> tree_sitter.Parser:
    parsers: dict[str, tree_sitter.Parser] = getattr(_local, "parsers", None) or {}
    _local.parsers = parsers
    if name not in parsers:
        parsers[name] = tree_sitter.Parser(_language(name))
    return parsers[name]


def grammar_for(path: str) -> str | None:
    """The tree-sitter grammar for a file, or None when the code rules don't read it."""
    return TREE_SITTER_LANGUAGES.get(PurePosixPath(path).suffix.lower())


def parse(path: str, text: str) -> Node | None:
    """The file's syntax tree, or None when it has no grammar."""
    grammar = grammar_for(path)
    if grammar is None:
        return None
    return _parser(grammar).parse(text.encode("utf-8")).root_node


@lru_cache(maxsize=None)
def _query(grammar: str, types: tuple[str, ...]) -> tuple[tree_sitter.Query | None, tuple[str, ...]]:
    """One query capturing every node of the given types, leaving out types the grammar doesn't have."""
    language = _language(grammar)
    valid: list[str] = []
    for kind in types:
        try:
            tree_sitter.Query(language, f"({kind}) @{kind}")
        except tree_sitter.QueryError:
            continue
        valid.append(kind)
    if not valid:
        return None, ()
    return tree_sitter.Query(language, " ".join(f"({kind}) @{kind}" for kind in valid)), tuple(valid)


def nodes_of(root: Node, grammar: str, types: tuple[str, ...]) -> list[Node]:
    """Every node of the given types under `root`, in source order.

    Found by a tree-sitter query, which searches in C: much faster than
    visiting every node from Python.
    """
    query, _ = _query(grammar, types)
    if query is None:
        return []
    found = [node for nodes in tree_sitter.QueryCursor(query).captures(root).values() for node in nodes]
    found.sort(key=lambda node: (node.start_byte, -node.end_byte))
    return found


def text(node: Node | None) -> str:
    return node.text.decode("utf-8", "replace") if node is not None and node.text is not None else ""


def line(node: Node) -> int:
    """The node's 1-based line."""
    return node.start_point[0] + 1


def walk(root: Node) -> Iterator[Node]:
    """Every node under `root`, depth first, in source order.

    Uses a tree cursor, which is several times faster than building each node's
    child list, and is iterative, so deep trees can't overflow the stack.
    """
    cursor = root.walk()
    while True:
        yield cursor.node  # type: ignore[misc]
        if cursor.goto_first_child():
            continue
        while not cursor.goto_next_sibling():
            if not cursor.goto_parent():
                return


def contains(node: Node, *types: str) -> bool:
    return any(n.type in types for n in walk(node))


def ancestor(node: Node, *types: str) -> Node | None:
    current = node.parent
    while current is not None:
        if current.type in types:
            return current
        current = current.parent
    return None


# A string that reads as SQL, so `.execute(...)` rules ignore task runners and other non-database calls.
SQL_TEXT = re.compile(
    r"(?is)\b(select\b.*\bfrom|insert\s+into|update\b.*\bset\b|delete\s+from|replace\s+into|merge\s+into|"
    r"create\s+(table|index|view)|drop\s+(table|index|view|database)|alter\s+table|truncate\s+table|union\s+select)\b"
)
# A line or function about passwords, which turns a weak hash into weak password hashing.
PASSWORD_CONTEXT = re.compile(r"(?i)passw|pwd|passphrase|\bpw\b")

_FUNCTIONS: dict[str, frozenset[str]] = {
    "python": frozenset({"function_definition", "lambda"}),
    "js": frozenset(
        {"function_declaration", "function_expression", "function", "arrow_function", "method_definition", "generator_function_declaration", "generator_function"}
    ),
}
_NAMES: dict[str, frozenset[str]] = {
    "python": frozenset({"identifier"}),
    "js": frozenset({"identifier", "shorthand_property_identifier"}),
}
# A Python route handler's decorator: @app.route(...), @router.get(...), @bp.post(...), @app.api_route(...).
_ROUTE_DECORATOR = re.compile(r"^@[\w.]+\.(route|get|post|put|patch|delete|api_route|websocket)\s*\(")
_ROOT_SCOPE = (-1, -1)
# The nodes that bind a name, or mark a route handler, by language.
_BINDING_NODES: dict[str, tuple[str, ...]] = {
    "python": ("assignment", "decorated_definition"),
    "js": ("variable_declarator", "assignment_expression"),
}


def _key(node: Node) -> tuple[int, int]:
    return node.start_byte, node.end_byte


@dataclass(frozen=True)
class _Binding:
    end: int  # where the assignment ends: a use after this point can see it
    value: Node
    # False for destructured names: the value is the whole object, so only its taint carries over.
    resolvable: bool


class Flow:
    """Values followed through variables inside one function (docs/REPO_SCAN_DESIGN.md §1, §5.3).

    `resolve` replaces a name with what it was assigned earlier in the same
    function (or at the top of the file); `tainted` says whether a value holds
    user input, read directly or through such names. Nothing is followed
    between functions or files.
    """

    MAX_DEPTH = 4

    def __init__(self, root: Node, language: str, user_input: re.Pattern[str], grammar: str | None = None) -> None:
        self._language = language
        self._functions = _FUNCTIONS[language]
        self._names = _NAMES[language]
        self._user_input = user_input
        self._bindings: dict[tuple[int, int], dict[str, list[_Binding]]] = {}
        self._route_params: dict[tuple[int, int], set[str]] = {}
        grammar = grammar or ("python" if language == "python" else "javascript")
        for node in nodes_of(root, grammar, _BINDING_NODES[language]):
            self._collect(node)

    # ---- collecting assignments ----
    def _scope_of(self, node: Node) -> tuple[int, int]:
        function = ancestor(node, *self._functions)
        return _key(function) if function is not None else _ROOT_SCOPE

    def _bind(self, name_node: Node, value: Node, statement: Node, resolvable: bool) -> None:
        scope = self._bindings.setdefault(self._scope_of(statement), {})
        scope.setdefault(text(name_node), []).append(_Binding(statement.end_byte, value, resolvable))

    def _bind_pattern(self, pattern: Node, value: Node, statement: Node) -> None:
        for child in walk(pattern):
            if child.type in {"identifier", "shorthand_property_identifier_pattern"}:
                self._bind(child, value, statement, resolvable=False)

    def _collect(self, node: Node) -> None:
        t = node.type
        if self._language == "python":
            if t == "assignment":
                left, right = node.child_by_field_name("left"), node.child_by_field_name("right")
                if left is not None and right is not None:
                    if left.type == "identifier":
                        self._bind(left, right, node, resolvable=True)
                    elif left.type in {"pattern_list", "tuple_pattern", "list_pattern"}:
                        self._bind_pattern(left, right, node)
            elif t == "decorated_definition":
                self._route_handler(node)
        else:
            if t == "variable_declarator":
                name, value = node.child_by_field_name("name"), node.child_by_field_name("value")
                if name is not None and value is not None:
                    if name.type == "identifier":
                        self._bind(name, value, node, resolvable=True)
                    else:
                        self._bind_pattern(name, value, node)
            elif t == "assignment_expression":
                left, right = node.child_by_field_name("left"), node.child_by_field_name("right")
                if left is not None and right is not None and left.type == "identifier":
                    self._bind(left, right, node, resolvable=True)

    def _route_handler(self, node: Node) -> None:
        """A Python function decorated as a route: its parameters are request data."""
        if not any(child.type == "decorator" and _ROUTE_DECORATOR.match(text(child)) for child in node.children):
            return
        function = node.child_by_field_name("definition")
        parameters = function.child_by_field_name("parameters") if function is not None else None
        if function is None or parameters is None:
            return
        names: set[str] = set()
        for parameter in parameters.named_children:
            if "Depends(" in text(parameter):  # FastAPI dependencies are not request data
                continue
            name = parameter if parameter.type == "identifier" else next((c for c in parameter.children if c.type == "identifier"), None)
            if name is not None and text(name) not in {"self", "cls"}:
                names.add(text(name))
        self._route_params[_key(function)] = names

    # ---- reading them back ----
    def _scopes(self, node: Node) -> Iterator[tuple[int, int]]:
        current = node.parent
        while current is not None:
            if current.type in self._functions:
                yield _key(current)
            current = current.parent
        yield _ROOT_SCOPE

    def _binding(self, name: Node) -> _Binding | None:
        """The assignment a use of a name sees: the latest one before it in the nearest scope that has one."""
        word = text(name)
        for scope in self._scopes(name):
            candidates = self._bindings.get(scope, {}).get(word)
            if not candidates:
                continue
            before = [b for b in candidates if b.end <= name.start_byte]
            if before:
                return max(before, key=lambda b: b.end)
            if scope == _ROOT_SCOPE:
                return candidates[0]  # a module constant used by a function defined above it
            return None
        return None

    def _route_param(self, name: Node) -> bool:
        word = text(name)
        return any(word in self._route_params.get(scope, ()) for scope in self._scopes(name))

    def resolve(self, node: Node | None, depth: int = 0) -> Node | None:
        """The value a name stands for, or the node itself when it is not a name or can't be followed."""
        if node is None or node.type != "identifier" or depth >= self.MAX_DEPTH:
            return node
        binding = self._binding(node)
        if binding is None or not binding.resolvable:
            return node
        return self.resolve(binding.value, depth + 1)

    def tainted(self, node: Node | None, pattern: re.Pattern[str] | None = None, depth: int = 0) -> bool:
        """Whether a value holds user input: read directly, or through names assigned from it."""
        if node is None:
            return False
        pattern = pattern or self._user_input
        if pattern.search(text(node)):
            return True
        if depth >= self.MAX_DEPTH:
            return False
        for child in walk(node):
            if child.type not in self._names or self._is_property_name(child):
                continue
            if pattern is self._user_input and self._route_param(child):
                return True
            binding = self._binding(child)
            if binding is not None and self.tainted(binding.value, pattern, depth + 1):
                return True
        return False

    @staticmethod
    def _is_property_name(node: Node) -> bool:
        """`args` in `request.args`, or the name in `name=value`: not a variable."""
        parent = node.parent
        if parent is None:
            return False
        if parent.type == "attribute" and parent.child_by_field_name("attribute") == node:
            return True
        return parent.type == "keyword_argument" and parent.child_by_field_name("name") == node
