---
inclusion: fileMatch
fileMatchPattern: 'apps/api/**'
---

# Gravecast API conventions

Follow the patterns already in `apps/api`. New features copy the shape of `app/modules/github`.

## Module layout

Each feature is a package at `app/modules/<name>/`. The current ones are `github`, plus `linkscan` and `channel` as planned.

| File | Holds |
| --- | --- |
| `router.py` | The `APIRouter`, with prefix `/api/<name>` and a tag. Handlers stay thin. |
| `service.py` | The logic. It is created once in `main.py`'s `lifespan` and stored on `app.state`. |
| `types.py` | Pydantic models for requests, responses, and internal records. |
| `client.py` | Calls to outside services, using async `httpx`. |
| Other files | Small pure helpers, for example `parser.py` and `filters.py`. |

Register each router in `app/main.py` with `app.include_router(...)`.

## Rules

- **File headers:** start every file with a one-line module docstring and `from __future__ import annotations`.
- **Errors:**
  - Raise a subclass of `AppError` from `app/common/errors.py`, with a stable `code`, a safe `message`, and a `status_code`.
  - The router returns it as `{"error": {"code", "message"}}`.
  - Never leak stack traces or internal details to clients.
- **JSON field names:**
  - JSON uses camelCase. Python uses snake_case.
  - Use `Field(serialization_alias=...)` and `model_config = {"populate_by_name": True}`.
  - Set `response_model_by_alias=True` on routes.
- **Limits and settings:**
  - Every limit goes in `app/config.py`'s `Settings` dataclass, with a default and a `GRAVECAST_*` environment override.
  - Limits include timeouts, sizes, redirect counts, and rates.
  - No magic numbers inside services.
- **Outbound requests:**
  - Use async `httpx` with explicit timeouts and a Gravecast user agent.
  - Retry only where it's safe to repeat the request.
- **Untrusted input:**
  - Validate URLs and inputs at the edge.
  - Never execute fetched content, repo code, or package scripts.
- **Safe fetching (linkscan):**
  - Resolve the host, then reject private, loopback, link-local, and cloud-metadata addresses.
  - Re-check after every redirect.
  - Cap redirects, response bytes, and total time.
- **Messages to users:** plain, calm words, following the content-guidelines steering.

## Tests

- **Where and how:** tests live in `apps/api/tests` and use pytest (`asyncio_mode = "auto"`) with `httpx.AsyncClient(transport=ASGITransport(app=app))`.
- **What must be tested:**
  - pure helpers: parsers, lookalike detection, grave card encoding
  - the fetcher's address blocking
  - error responses
- **No live network:** tests don't call the real internet. Use fixtures or mock clients.
- **Command:** run tests with `python -m pytest` from `apps/api`.
