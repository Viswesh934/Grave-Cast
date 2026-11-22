# 🛠️ Development

Running Gravecast locally, testing it, and its settings. For the architecture, deployment and how we used Kiro, see the [README](../../README.md).

## Run it locally

You need **Python 3.10+** and **Node.js 20.19+** (or 22.12+).

**The API** runs at http://localhost:8000:

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

Locally, Chat is stored in a SQLite file, the origin check is off, and the API's own docs are at http://localhost:8000/docs.

**The website and Lantern** run at http://localhost:5173. Build Groove UI once first, because the app imports parts of it from its build:

```bash
cd packages/grave-ui
npm install
npm run build

cd ../../apps/gravecast
npm install
npm run dev
```

The dev server forwards `/api` and `/health` to the API on port 8000, the same way Vercel does in production. Lantern is at http://localhost:5173/lantern/.

## Tests and checks

```bash
cd apps/api && python -m pytest                       # API tests
cd apps/gravecast && npm run build && npm run lint    # app build and lint
cd packages/grave-ui && npm run type-check            # Groove UI types
```

The API tests don't call the internet: outside services are faked, and DynamoDB runs on moto, an in-memory stand-in.

## Settings

Copy `apps/api/.env.example` to `.env`, and `apps/gravecast/.env.example` to `.env.local`. Every setting is optional for local work.

| Setting | Where | What it's for |
| --- | --- | --- |
| `GITHUB_TOKEN` | API | Optional. Raises GitHub's limit for the repo scan, see below. |
| `GRAVECAST_CHANNEL_STORE`, `GRAVECAST_CHANNEL_TABLE` | API | `dynamodb` and the table name when deployed. SQLite is the default. |
| `GRAVECAST_ORIGIN_SECRET` | API | When deployed, the API refuses any request without this secret. Leave it empty locally. |
| `VITE_AWS_LOCATION_KEY`, `VITE_AWS_LOCATION_REGION` | App | Help near you. Without them, that one place says it isn't set up. |

Every limit (timeouts, sizes, rates) has a safe default and a `GRAVECAST_*` override in `apps/api/app/config.py`.

### Do I need a GitHub token?

No. The repo scan works without one. Each scan makes 3 requests to GitHub's API, and without a token GitHub allows 60 requests an hour per IP address, so about 20 scans an hour. On Lambda that address can be shared with other AWS users, so the limit can run out sooner. When it does, the scan says it has been rate limited instead of failing.

For a demo or real use, add a **fine-grained token with read-only access to public repositories** as `GITHUB_TOKEN`. GitHub then allows 5,000 requests an hour.

## Project layout

```
apps/
  api/          FastAPI backend: link scan, repo scan, Chat mail runs
  gravecast/    The website, Lantern (its own page and offline cache), and the Groove UI docs
packages/
  grave-ui/     Groove UI, the component library
docs/
  guide/        Feature guides and this page
  *.md          Vision, specs, kit scripts and the deploy plan
.kiro/          Steering files and hooks for building with Kiro
.github/        CI and the API deploy workflow
```
