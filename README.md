# ⚰️ Gravecast

> **Kiroween 2026** — A repository graveyard that turns real code problems into a place you can explore and a signal you can decode.

Paste a public GitHub URL. Gravecast scans the source and history, then renders the findings as a 3D graveyard of tombstones, wooden crosses, and cursed graves — each backed by real evidence.

See [docs/BUILD_SPEC.md](docs/BUILD_SPEC.md) for the full product and technical specification.

---

## Project layout

```
apps/
  api/        Python FastAPI backend
  web/        React + Vite + TypeScript + Tailwind frontend
docs/
  BUILD_SPEC.md
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.11+ |
| Node.js | 18+ |
| npm | 9+ |

---

## Dev setup

### 1. Backend

```bash
cd apps/api

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -e ".[dev]"

# Start the API (auto-reloads on file changes)
uvicorn app.main:app --reload
```

API is now running at **http://localhost:8000**

- Health check: http://localhost:8000/health
- Interactive docs: http://localhost:8000/docs

### 2. Frontend

Open a second terminal:

```bash
cd apps/web

npm install
npm run dev
```

Frontend is now running at **http://localhost:5173**

The Vite dev server proxies `/health` and `/api/*` to the backend automatically — no CORS issues during development.

---

## Run backend tests

```bash
cd apps/api
source .venv/bin/activate
pytest
```

---

## Current state

- [x] Backend scaffold (FastAPI + health endpoint)
- [x] Frontend scaffold (React + Vite + TypeScript + Tailwind)
- [x] Frontend connected to backend health endpoint
- [ ] Scanner (Phase 1)
- [ ] 3D graveyard world (Phase 2)
- [ ] Persistence and sharing (Phase 3)
- [ ] Gravekeeper (Phase 4)
- [ ] Signal codec and radio (Phase 5)
