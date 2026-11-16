---
inclusion: fileMatch
fileMatchPattern: 'apps/gravecast/**'
---

# Gravecast app conventions

The Gravecast app is a React + Vite + TypeScript website in `apps/gravecast`. The Groove UI docs live inside it, under `/docs` (`src/docs`), with their routes in `src/docs/routes/DocsRoutes.tsx`.

Routes are defined in `src/App.tsx`. Every page sits under `SiteLayout`, so they all share one top bar (`src/site/SiteHeader.tsx`). A section joins the top bar only once it works.

The app has two parts:

- **Website:** the link scan and developer mode. Online only and never cached for offline use.
- **Emergency section:** the survival kit, Board, Chat, and Radio, under `/emergency`. This is the only installable part. Its manifest `scope` and `start_url` and its service worker scope are `/emergency/`. Code for the website must not be imported into the Emergency section's bundle.

## Rules

- **Groove UI first.**
  - Import visuals, sound, tokens, and hooks from `groove-ui`.
  - If something is missing, build it in `packages/grave-ui` under its rules, then use it here.
  - Don't copy Groove UI code into the app.
- **Tokens only.** Use `palette`, `zLayers`, and the other tokens. No raw hex colors or hand-picked z-index values.
- **Clean and calm look** (vision doc §4):
  - Dark neutral background, bone and mist text, at most one muted accent.
  - No bright or neon colors, glows, or saturated reds and purples.
  - Show severity with weathering and words, never color alone.
  - Large text, generous spacing, one main action per screen.
  - Soft, short motion and no flashing (except the SOS light tool).
  - If a Groove UI piece is too loud, add a quieter option to Groove UI rather than restyling it in the app.
- **Plain and fast (Emergency section).** It is used in real emergencies, so:
  - No animation, transitions, 3D, horror effects, or decorative sound. Only sounds that do a job play (the CPR beat, SOS).
  - Plain Groove UI pieces only (text, buttons, inputs, lists). Nothing that loads three.js or the 3D components.
  - The website (link scan, developer mode, "Our story") may still show off.
- **Little internet first (Emergency section).**
  - Open from the cache and never block startup on the network.
  - Keep requests small.
  - Every network action needs three states: loading, offline/failed (with a retry), and stale data with a "last updated" time.
- **Outbox for anything sent.** Messages go to the IndexedDB outbox first, then send through Background Sync, or on the next open where it isn't supported. Each message gets an ID made on the device.
- **The grave card is one shared format.** QR, haunted radio, and the channel all use the same versioned encoder and decoder. Never add a separate format per channel.
- **Accessibility (the driving factor, above looks or extra features):**
  - In the Emergency section, accessibility wins every trade-off.
  - Large tap targets, readable text at 200% zoom, and AA contrast at least (AAA for kit cards and tools).
  - Every control works from the keyboard and has a label.
  - Respect reduced motion.
  - Announce scan results and incoming messages through `useAriaAnnounce`.
  - Every dial or visual control needs a plain list alternative.
- **Words:**
  - Use the shared terms from the vision doc (grave, grave card, outbox, and so on).
  - Follow the content-guidelines steering for UI text.
  - Verdicts never say "safe".

## Before saying it's done

From `apps/gravecast`, run:

1. `npm run build`
2. `npm run lint`

If Groove UI changed, also run its type check and build in `packages/grave-ui`.
