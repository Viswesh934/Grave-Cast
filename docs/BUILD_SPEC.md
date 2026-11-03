# Gravecast — Build Specification

> **Kiroween 2026** · A repository graveyard that turns real code problems into a place you can explore and a signal you can decode.

## 1. Product

Paste a public GitHub repository URL. Gravecast scans its source and history, then renders the findings as a 3D graveyard:

- **Districts** represent folders.
- **Tombstones** represent dead or unused code.
- **Wooden crosses** represent old TODO/FIXME notes.
- **Cursed graves** represent vulnerable dependencies and suspicious code patterns.
- **Epitaphs** show real last-commit metadata: message, author and date.
- **The Gravekeeper** answers questions using only the scan's verified findings.
- **The Numbers Station** turns repository findings into a cryptic, decodable radio transmission.

The experience should be atmospheric, but every technical finding and every epitaph must be traceable to real repository evidence.

## 2. Product principles

1. **Evidence before AI.** The scanner is the source of truth.
2. **No custom ML and no mandatory LLM.** Search and answer common questions deterministically.
3. **Small infrastructure.** One Python API, one SQLite database, one React frontend.
4. **Decode, don't hallucinate.** Signal encoding must be reversible and preserve source evidence.
5. **Bounded scans.** Public repositories only, with time, size, file-count and request limits.
6. **Graceful degradation.** A scan should still produce useful districts, TODOs and commit epitaphs when language-specific analysis is unavailable.

## 3. Stack

### Frontend

| Concern | Choice | Use |
|---|---|---|
| App | React + Vite | Single-page application |
| Language | TypeScript | Shared scan contracts and safer UI state |
| 3D | Three.js + React Three Fiber | Graveyard world and scene |
| 3D helpers | @react-three/drei | Camera, text, controls and scene helpers |
| Effects | @react-three/postprocessing | Fog, bloom, vignette and atmosphere |
| Styling | Tailwind CSS | HUD, chat, radio and responsive layout |
| State | Zustand | Selected grave, camera target, chat and radio state |
| Audio | Web Audio API + SpeechSynthesis | Static, tuning noise, tones and synthetic voice |

Use browser-generated sound. Do not depend on hosted audio assets for the MVP.

### Backend

| Concern | Choice | Use |
|---|---|---|
| Runtime/API | Python + FastAPI | One small HTTP service |
| Validation | Pydantic | Request, response and scan schema |
| Git history | GitPython or `git` subprocess | Last commit per file and age |
| GitHub metadata | GitHub REST API | Repo metadata and optional archive access |
| JS/TS dead code | Knip CLI | Detect unused files/exports/dependencies |
| TODOs | Python regex + pathlib | Find TODO/FIXME/HACK comments |
| Vulnerabilities | OSV.dev API | Check dependency versions |
| Search | SQLite FTS5 | Local full-text search over findings |
| Persistence | SQLite | Scan metadata and compressed scan payloads |
| Compression | Python `gzip` (stdlib) | Compact storage and transfer |
| Tests | pytest | Scanner, codec and API tests |

**Important:** Knip is a Node-based CLI. The Python backend can invoke it as a bounded subprocess for JavaScript/TypeScript repositories. Do not reimplement its analysis in Python. If Knip cannot run, mark dead-code analysis as unavailable rather than inventing results.

### No mandatory LLM

The Gravekeeper is initially a deterministic retrieval-and-response system:

- Intent matching for common questions.
- SQLite FTS5 for free-text search.
- Severity and age sorting for questions such as "most dangerous" and "oldest TODO".
- Templates that turn verified findings into concise answers.
- Every answer returns the IDs of the graves it references.

No external model API is required. If a conversational model is tested later, it is optional and receives only retrieved evidence; it never decides what is true.

## 4. Architecture

```text
                  Browser
       React UI / 3D graveyard / radio
                    |
               HTTPS / JSON
                    |
                 FastAPI
                    |
       +------------+-------------+
       |            |             |
    Scanner      Gravekeeper   Signal codec
       |            |             |
       |         SQLite FTS5      |
       |                          |
 GitHub / Git                 gzip + JSON
       |
 +-----+---------------------+
 |            |              |
Knip       TODO parser      OSV.dev
 |
 |
Normalized findings
       |
 Shared ScanResult schema
       |
 SQLite scan store
```

One scan creates one canonical `ScanResult`. The frontend renders that result; it does not independently infer code problems.

## 5. Repository scanning

### Input and safety

Accept only public GitHub repository URLs. Normalize and validate the URL before fetching.

Apply hard limits:

- Maximum repository download size.
- Maximum scan duration.
- Maximum file count and file size.
- Skip binary files, generated output, vendored dependencies and common build folders.
- Do not execute repository code, package scripts or install dependencies.
- Invoke external analyzers with timeouts and restricted working directories.
- Rate-limit scan creation and prevent duplicate concurrent scans for the same repository/revision.

Prefer GitHub archive downloads for source inspection and a shallow Git fetch when commit history is required. Never trust archive paths; reject path traversal and symlinks that escape the extraction root.

### Scan stages

1. **Resolve repository:** owner, name, default branch and current commit SHA.
2. **Download bounded source:** shallow clone or archive with strict limits.
3. **Read Git history once:** map each tracked file to its latest commit, author, timestamp and subject.
4. **Find TODO crosses:** detect TODO/FIXME/HACK comments and calculate age from the relevant commit or blame/history data. Label the age source accurately.
5. **Find dead-code tombstones:** run Knip for JS/TS projects. Other languages receive no unsupported dead-code claim.
6. **Find cursed dependencies:** parse supported lockfiles/manifests and query OSV.dev in batches where possible.
7. **Find suspicious patterns:** use a small explicit ruleset. Label these `suspicious`, never as confirmed vulnerabilities.
8. **Normalize and score:** assign stable grave IDs, severity, evidence and district.
9. **Persist:** store canonical JSON plus a compressed representation and searchable fields.

### Epitaph integrity

An epitaph must come from actual Git metadata. Store:

- Commit SHA
- Commit subject/message
- Author name
- Commit timestamp
- File path

If metadata is missing, show "No commit metadata available." Never generate a plausible author, date or commit message.

### Initial language support

- **JavaScript/TypeScript:** TODOs, Git epitaphs, Knip dead-code findings and dependency vulnerability checks.
- **Other languages:** TODOs and Git epitaphs only, plus dependency checks when a supported manifest/lockfile parser is available.

## 6. Canonical scan schema

Keep one explicit schema shared by scanner, API, frontend and signal codec. Version it from the beginning.

Example:

```json
{
  "schema_version": 1,
  "scan_id": "scn_01...",
  "repo": {
    "full_name": "owner/repository",
    "url": "https://github.com/owner/repository",
    "commit_sha": "abc123",
    "default_branch": "main"
  },
  "created_at": "2026-11-03T12:00:00Z",
  "health_score": 72,
  "summary": {
    "grave_count": 18,
    "dead_code_count": 4,
    "todo_count": 9,
    "vulnerable_dependency_count": 2,
    "suspicious_pattern_count": 3
  },
  "districts": [
    {
      "id": "district-src",
      "path": "src",
      "name": "Source District",
      "grave_ids": ["grave-001"]
    }
  ],
  "graves": [
    {
      "id": "grave-001",
      "district_id": "district-src",
      "kind": "vulnerable_dependency",
      "severity": "critical",
      "title": "Known vulnerable dependency",
      "description": "Evidence-based finding summary",
      "file_path": "package-lock.json",
      "line_start": null,
      "line_end": null,
      "evidence": {
        "dependency": "example-package",
        "version": "1.2.3",
        "osv_ids": ["GHSA-xxxx-yyyy-zzzz"]
      },
      "epitaph": {
        "commit_sha": "abc123",
        "message": "Update dependency",
        "author": "Contributor",
        "committed_at": "2025-01-10T10:00:00Z"
      },
      "position": {
        "x": 0,
        "y": 0,
        "z": 0
      }
    }
  ]
}
```

Positions can be generated deterministically from district/grave IDs by the frontend. They do not need to be persisted in the scan unless layout stability requires it.

Use enums for `kind` and `severity`. Keep evidence structured and source-specific. Add `source` and `confidence` fields where useful; do not imply that a heuristic is a confirmed defect.

## 7. Gravekeeper without an LLM

### Retrieval tools

Implement small deterministic functions:

- `search_graves(query, filters)`
- `get_grave(grave_id)`
- `get_district(district_id)`
- `get_most_dangerous(limit)`
- `get_oldest_todos(limit)`
- `get_vulnerable_dependencies()`
- `get_dead_code_findings()`

Index titles, descriptions, paths, dependency names, TODO text and epitaph messages with SQLite FTS5.

### Question flow

```text
User question
     |
Intent / keyword detection
     |
Relevant retrieval function
     |
Rank and filter verified records
     |
Template response + grave IDs
     |
Frontend displays answer and flies camera to those graves
```

Example response:

```json
{
  "answer": "The highest-severity finding is in the dependency manifest. Two vulnerable dependency records need review.",
  "grave_ids": ["grave-001", "grave-014"],
  "answer_type": "most_dangerous",
  "evidence_count": 2
}
```

For an unknown or unsupported question, say that the scan does not contain enough evidence. Do not fabricate an answer.

## 8. Gravecast Signal: reversible encoding and compact storage

The radio should feel like a mysterious signal, but the underlying data must remain decodable and verifiable.

There are two related but distinct outputs:

1. **Compact scan representation:** optimized for storage, sharing and retrieval.
2. **Radio transmission:** a theatrical, human-hearable summary derived from the scan.

Do not confuse obfuscation with compression or encryption.

### 8.1 Canonical data stays canonical

The canonical `ScanResult` JSON is the source of truth. The codec is a transport/storage representation, not a new source of facts.

Suggested MVP pipeline:

```text
ScanResult JSON
      |
Canonical serialization
      |
UTF-8 bytes
      |
gzip compression
      |
Base64URL (only when text transport is needed)
      |
Stored payload / share transport
      |
Base64URL decode
      |
gzip decompress
      |
JSON parse + Pydantic validation
      |
Original ScanResult
```

For SQLite, store compressed bytes directly as a BLOB. Do not Base64-encode data just to store it in a database; Base64 makes the payload larger.

### 8.2 Signal packet envelope

Define a small envelope:

```json
{
  "codec": "gravecast-gzip-json",
  "codec_version": 1,
  "schema_version": 1,
  "content_encoding": "gzip",
  "sha256": "checksum-of-uncompressed-canonical-json",
  "payload": "base64url-compressed-bytes"
}
```

The checksum detects corruption; it is not authentication. A public share ID should point to a server-stored scan rather than putting a large payload in the URL.

### 8.3 Can this save LLM tokens?

Potentially, but only if an LLM is introduced later and the compact representation is decoded by a tool or wrapper before the model needs to reason over it.

- Compression reduces bytes on disk and over the network.
- Base64 does **not** reduce size; it adds overhead.
- Short field keys and dictionary IDs can reduce textual payload size.
- A model may tokenize compact codes unpredictably; fewer characters do not guarantee fewer tokens.
- If the model needs the actual text, it must be decoded or retrieved. Encoding does not magically remove the information cost of reasoning over it.

Since the MVP does not require an LLM, optimize for small storage and reliable decoding first—not token savings.

### 8.4 Radio signal format

Generate a separate deterministic transmission script from the scan summary. Example:

```text
GC/1
REPO: OWNER/REPOSITORY
HEALTH: 072
CURSED: 002
DEAD: 004
CROSSES: 009
DISTRICT: SRC
OLDEST: GRAVE-031
CHECK: 8F2A
END
```

Then render it as:
- Synthetic spoken phrases using browser SpeechSynthesis.
- Morse-like beeps or short/long pulses using Web Audio API.
- Static/noise based on health score.
- Captions that reveal the exact decoded text.

The radio's "tuning" can progressively reveal the transmission. The transmission is derived from actual scan data, not randomly generated lore.

For a later version, define a compact binary packet with a magic header, version, dictionary-coded enums, varint counts, UTF-8 text fields and checksum. Only build a custom binary codec if measurements show gzip JSON is too large. A custom format creates compatibility and debugging costs.

### 8.5 Decoder requirements

Build `encode_scan()` and `decode_scan()` as pure functions. Test:

- Round-trip equality: `decode_scan(encode_scan(scan)) == scan`.
- Schema-version mismatch.
- Unsupported codec version.
- Truncated/corrupt payload.
- Checksum mismatch.
- Unicode paths and commit messages.
- Large payload limits.

Never deserialize untrusted data with `pickle` or execute decoded content.

## 9. API outline

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/scans` | Start a scan for a public repo |
| GET | `/api/scans/{scan_id}` | Scan status and summary |
| GET | `/api/scans/{scan_id}/result` | Canonical scan result |
| GET | `/api/scans/{scan_id}/signal` | Compact signal envelope |
| GET | `/api/scans/{scan_id}/radio` | Radio transmission script |
| POST | `/api/scans/{scan_id}/decode` | Decode a supplied signal packet, if needed |
| POST | `/api/scans/{scan_id}/ask` | Deterministic Gravekeeper search |
| GET | `/s/{share_id}` | Public share page |

Use a background task or a simple in-process job queue for scans. Keep scan execution bounded. A persistent job queue is not needed for the first demo.

## 10. Suggested repository layout

```text
gravecast/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── scene/
│   │   │   ├── graveyard/
│   │   │   ├── gravekeeper/
│   │   │   ├── radio/
│   │   │   ├── components/
│   │   │   └── store/
│   │   └── package.json
│   └── api/
│       ├── app/
│       │   ├── main.py
│       │   ├── api/
│       │   ├── schemas/
│       │   ├── scanner/
│       │   ├── analyzers/
│       │   ├── gravekeeper/
│       │   ├── signal/
│       │   └── storage/
│       ├── tests/
│       └── pyproject.toml
├── shared/
│   └── scan-schema/
│       ├── schema.json
│       └── fixtures/
├── docs/
│   └── SIGNAL_FORMAT.md
└── README.md
```

## 11. Build plan

### Phase 0 — Agree on the contract

- Create `schema.json` and Pydantic models.
- Create one realistic sample scan fixture.
- Agree on grave types, severity levels, evidence and epitaph fields.
- Build a tiny frontend renderer against the fixture.
- Add schema versioning from day one.

**Done when:** frontend and backend can work independently against the same sample.

### Phase 1 — Scanner MVP

- Accept and validate public GitHub URLs.
- Fetch repository source within limits.
- Read Git history and map last commits to files.
- Parse TODO/FIXME/HACK comments.
- Integrate Knip for JS/TS.
- Parse dependency lockfiles and query OSV.dev.
- Produce deterministic `ScanResult` JSON.

**Done when:** at least two public JS/TS repositories produce useful, evidence-backed scan results.

### Phase 2 — Graveyard world

- Build a low-poly graveyard scene.
- Map folders to districts.
- Map grave records to tombstone/cross/cursed-grave variants.
- Add labels and epitaph panels.
- Add selection and camera fly-to.
- Cap visible graves around 600; prioritize critical/high severity and representative findings.

**Done when:** the sample scan can be explored without a live backend.

### Phase 3 — Persistence and sharing

- Save scan metadata and compressed JSON in SQLite.
- Add scan IDs and stable share IDs.
- Add scan status and result endpoints.
- Add expiration/cleanup policy for stored scans.
- Make shared links render the same scan.

**Done when:** a scan link works in a separate browser session.

### Phase 4 — Gravekeeper

- Add SQLite FTS5 indexes.
- Implement deterministic intents and retrieval functions.
- Return answer text plus grave IDs.
- Connect answer selection to camera fly-to.
- Add graceful "not enough evidence" responses.

**Done when:** questions about danger, old TODOs, vulnerable dependencies and dead code reliably point to real graves.

### Phase 5 — Signal codec and radio

- Implement gzip JSON encode/decode.
- Store compressed bytes as SQLite BLOBs.
- Add checksum and version checks.
- Generate a deterministic radio script from scan facts.
- Add tuning noise, beeps, synthetic voice and captions.
- Add a shareable radio view.

**Done when:** signal round-trips to the exact scan result and the radio transmission matches its source data.

### Phase 6 — Polish and demo

- Add a digging/progress sequence (30–60 seconds maximum; show real stages).
- Pre-scan two or three demo repositories.
- Tune scene performance and accessibility.
- Test rate limits, timeouts, malformed URLs and corrupted signal payloads.
- Record a short demo and prepare the submission.

### Stretch: Exhume

For a vulnerable dependency, show:
- The affected package and version.
- OSV advisory references.
- A suggested safe version or remediation path when source data supports it.
- A manual fix plan.

Do not automatically edit files or open pull requests in the MVP.

## 12. Team split

| Workstream | Ownership | Deliverable |
|---|---|---|
| Contract + integration | Shared | Schema, fixtures, API contract |
| Scanner | Backend contributor | Repo scan and normalized findings |
| World | Frontend contributor | 3D scene, districts, graves, camera |
| Gravekeeper + signal | Backend contributor | Search, deterministic answers, codec and radio script |
| Radio UI + integration | Frontend contributor | Tuning interaction, audio, captions, share view |

Parallelize only after the schema and fixture exist.

## 13. Demo story

1. Paste a public GitHub URL.
2. Watch the digging sequence as scan stages complete.
3. Enter the graveyard and inspect a district.
4. Approach a cursed grave and reveal its real advisory/evidence.
5. Ask the Gravekeeper what is most dangerous; camera flies to the cited graves.
6. Tune the Numbers Station and hear a cryptic summary.
7. Open the shared link and decode the same transmission/scan.

Use pre-scanned repositories as a fallback if a live scan fails during judging.

## 14. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Live scan fails | Pre-scanned demo repositories |
| Huge repository | Size, time and file-count caps |
| Too many objects | Prioritize and cap visible graves |
| False positives | Label heuristic patterns as suspicious; show evidence |
| Unsupported language | Still show TODOs and Git epitaphs; mark other analyzers unavailable |
| LLM hallucination | No mandatory LLM; deterministic answers only |
| Signal corruption | Versioned codec, checksum and round-trip tests |
| Signal mistaken for encryption | Document that encoding/compression is not encryption |
| Git metadata missing | Explicitly show unavailable metadata |
| API abuse | Public URLs only, rate limits, timeouts and bounded downloads |

## 15. Out of scope for MVP

- Private repositories and GitHub account authorization.
- Custom ML models.
- Mandatory hosted LLM APIs.
- Kubernetes, microservices and heavy infrastructure.
- Full multi-language dead-code analysis.
- Automatic code modification or pull requests.
- Multiplayer.
- Custom binary protocol before compression measurements justify it.

## 16. Definition of done

- A public repository URL can be scanned within enforced resource limits.
- The scanner emits a versioned, validated `ScanResult`.
- Every grave has a stable ID, type, severity and evidence reference.
- Epitaph metadata is real Git data or explicitly unavailable.
- The frontend renders districts and graves from the shared schema.
- Gravekeeper answers supported questions without an LLM and returns grave IDs.
- Camera fly-to works from Gravekeeper answers.
- Scan data can be compressed, stored, decoded and round-tripped.
- Radio captions and audio are generated from actual scan facts.
- A share link opens the same saved scan.
- The demo can run from pre-scanned fixtures if external services fail.
