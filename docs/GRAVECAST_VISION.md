# Gravecast: Vision and Baseline

> Gravecast finds what's dangerous and turns it into graves you can see, then helps you warn the people around you, even when the internet is barely holding on.

This is the baseline for all Gravecast work. If a change would contradict it, update this doc first (see [Decisions](#9-decisions)), then build.

Status: prototype. We build in small iterations and the concept matters more than completeness.

## Why we built it

Our team lives where emergencies are never far away. One of us lives in a cyclone region: in one cyclone, trees started flying through the air, and then came about two days of power cut, with no electricity, no internet, and no phone signal. With the survival skills of a mosquito, there wasn't much to do, and nothing to look up. Another of us is from Lebanon, where war can cut a place off, and another is from Florida, where hurricanes come often.

So we built something that keeps working on limited internet and holds the common emergency know-how for when there is none. That is Lantern (§3.4). The website tells this story first, on the "Our story" page, before it introduces Lantern.

---

## 1. The idea in three layers

| Layer | Works with | What it does |
| --- | --- | --- |
| **Gravecast website** | Normal internet | Scans links, sites, and repos for danger and shows the graveyard. Web only. |
| **Lantern** | Little or no internet | The installable part of the app: the channel (Chat, Radio) for little internet, and the survival kit, which works with none. |
| **Groove UI** | n/a | The horror-themed library that makes it all look and sound alive (`packages/grave-ui`). |

"Little internet" means a slow, patchy connection (2G, a weak signal, frequent drops). The channel is built for that. When there is no internet at all, the survival kit still works.

There is one app. It is a website, and its Lantern section can be installed on the phone as a PWA. People install Lantern ahead of time, like an emergency kit. They are not expected to download it during an emergency, so app size is not a hard limit. A survival kit of 5–20 MB is fine.

## 2. Who it's for

- **Everyone:** "Someone sent me this link. Is it safe?"
- **Communities:** passing warnings and updates to each other on a weak connection.
- **Anyone stuck with no network:** "Someone isn't breathing. What do I do?"
- **Site owners:** "How healthy is my website?" (later)
- **Developers:** "What's rotting in my repo?" This is the original repo graveyard, specified in [BUILD_SPEC.md](./BUILD_SPEC.md).

## 3. Features

### 3.1 Link safety scan (main feature, website)

Paste a link. Gravecast checks it and shows each finding as a grave. How weathered the grave is shows how serious the finding is.

Checks are passive, looking at the site only the way a browser would plus public records:

- **Where it really goes:** follows the redirect chain and unmasks short links.
- **Domain age:** read over **WHOIS** (port 43), the 1982 lookup protocol that ICANN retired for generic domains on 28 January 2025 in favour of RDAP. The server asks `whois.iana.org` which registry runs the domain's ending, then asks that registry, and shows the record's own "Creation Date" line. Many registries still answer; when none does, the result says domain age was not checked. A days-old site asking for donations is a red flag.
- **Lookalike domains:** look-alike spellings (`paypa1.com`) and non-English letters made to pass as normal ones (punycode). Checked locally.
- **Known-bad lists:** URLhaus. Google Safe Browsing too, after checking its usage terms.
- **HTTPS certificate:** whether it's valid, who issued it, and when.

The verdict is honest. It says "No known problems found", never "Safe".

### 3.2 Site health (later)

For site owners: security headers, HTTPS setup, third-party scripts, outdated front-end libraries. Passive checks only.

### 3.3 Repo graveyard (developer mode, website)

Paste a public GitHub repo and see its dead code, old TODOs, vulnerable dependencies, and leaked secrets as a graveyard. Ingestion already exists in `apps/api/app/modules/github`. The full design is in [BUILD_SPEC.md](./BUILD_SPEC.md).

### 3.4 Lantern (installable)

The part of the app that installs as a PWA. It has four tabs. Board, Chat, and Radio form the channel, built for little internet. The survival kit (§3.7) works with no internet at all. The link scan and developer mode are not in the installed app.

- **Access:** two tiles and one setting. The person picks their mode, and the pad's keys work for that mode; each pad explains its keys. **Can't see and can't speak:** the braille pad gives a voice to someone who is blind and mute (a blind person who can speak, speaks). The whole screen is one braille cell (dots 1-2-3 down the left, 4-5-6 down the right); touching the dots of a letter and pausing says and shows a ready message that starts with that letter (A: ambulance, H: help, D: doctor, W: water, S: shelter, B: I am blind, Y/N: yes/no, T: thank you, L: list them all; all six dots at once: distress signal). **Can't hear or can't speak:** a dial pad: keys 1 to 9 each show a ready message across the screen in very large text, 0 opens a large screen to write anything, by the person or the one they are talking to, and an SOS key starts the distress signal. **Distress signal:** started by three hard shakes or five quick taps anywhere in Lantern (each turned on in Access, off by default), or by the pads' SOS. Shakes and taps first count down 3 seconds, buzzing, and can be cancelled by holding the screen. The signal then repeats a spoken help message and the SOS tone (Loud, the default), or only vibrates (Silent, for when noise is dangerous), shows HELP across the screen, and opens the SMS app to a help contact saved on the phone, with the GPS position; the person still taps Send. It works only while Lantern is open, and five taps are ignored inside the braille pad. **Vibrate for new messages** buzzes for Chat and Radio (Android only). Each kit card can also be read aloud step by step on its own page. Access only speaks and shows; it never contacts anyone by itself. A screen reader takes over touches, so the braille pad needs it paused. Phone volume keys can't be used: browsers don't pass them to web pages. All of it works with no internet. It replaces the Board: Chat already carries notices.
- **Chat:** FidoNet-style **echomail**, the store-and-forward messaging that BBSes used over slow, on-and-off dial-up. Nobody stays connected. The phone makes a short **mail run**: one small HTTP request to Lambda that sends its queued messages and receives everything new since its last run. Public areas are **echoes**, such as `EMERGENCY`. Messages carry FidoNet-style headers (area, from, MSGID, origin line), which the Wire view shows. Pick a nickname with no sign-up form. The phone joins `EMERGENCY` by default. While the Chat tab is open, it runs every few seconds; in the background, much less often.
- **Radio:** a replica of a shortwave radio net with nine channels. It looks like a radio: a channel display, a tuning scale with a needle, a tuning control with the scale's channel buttons as its plain alternative, a volume control, a mode switch, and On and RX lamps. A message goes out like a Chat message, through the outbox and a mail run, to the tuned channel's echo (`RADIO-1` to `RADIO-9`). While the radio is on, a quiet hiss plays and each phone gives the channel's messages in one of two modes: **Voice** reads them aloud in English with the phone's own voice (the browser's speech synthesis), and **Tones** plays them as RTTY (ITA2 Baudot at 45.45 baud, 2125 Hz and 2295 Hz). No library. The message travels as text, not as live audio, and the page says so. Messages are hidden until the person opens them.

### 3.5 Sharing: the grave card

Any scan result or channel message can become a **grave card**. Cards are made on the website from scan results, or in Lantern from a note. Lantern can receive cards (QR scan, haunted radio) and keeps them offline. A card is: a small, versioned message of about 200 bytes. For example:

> ⚠ cyclone-relief-donate.xyz: 3 days old, flagged for phishing.

A card can be sent three ways:

- **QR code:** shown on screen and scanned by another phone. Works offline.
- **Haunted radio:** the card is played as eerie modem-like chirps using [ggwave](https://github.com/ggerganov/ggwave), an open-source data-over-sound library, and another phone's mic decodes it. Needs no internet, and works over a phone call, a walkie-talkie, or a real radio. It is slow (tens of bytes per second), which is fine for a card.
- **The channel:** posted to an echo in Chat, or pinned to the Board.

A card can optionally be locked with a passphrase using Groove UI's Seal before sharing.

### 3.6 Send when the network returns

A message written with no signal goes into an outbox on the phone. Background Sync sends it automatically when the connection returns, even if the app is closed. That works in Chrome and Edge. In other browsers, it sends on the next open.

The outbox is the mail run. When the connection returns, the service worker makes one mail run to Lambda. Each message carries a MSGID generated on the phone, so retries never post twice.

### 3.7 Survival kit

The fourth tab of Lantern. It works fully offline, with no network at all.

**Base pack first.** It holds guidance that is valid anywhere in the world, from international sources. It ships to everyone and is English first. Location packs come later (see §8).

Each guide is a **kit card**, drawn as a short **comic strip** in stick-figure line art:

- **One panel per step.** A stick figure shows the action, such as kneeling beside someone, hands on the centre of the chest, or pushing down. A short caption under the panel states the step.
- **A Do / Don't panel** at the end, with a tick or a cross.
- **Hand-drawn look.** Sketchy single-colour lines (bone on dark), with at most one muted accent to point at the key detail, like where the hands go. No shading and no photos, so cards stay tiny and calm.
- **The whole page shows at once**, like a comic page: every panel is framed and numbered, so nobody has to tap through steps in an emergency. Panels sit side by side when there is room and stack on a phone. They draw in quickly; with reduced motion, the finished page shows straight away.
- **Text is always there.** Every panel has its caption as real text and a description for screen readers. The drawing explains the caption and never replaces it.

Each card names its source and the date it was reviewed.

**No made-up information.** Everything on a kit card comes from the cited source:
- steps
- order
- numbers, such as push depth or how long to cool a burn
- warnings

Drawings only show what the caption says and never add a step. If something can't be sourced, it is left out, not guessed. The same rule covers the rest of the app: no invented phone numbers, places, statistics, or sample data presented as real.

| Group | Kit cards |
| --- | --- |
| **First aid** | CPR (adult, child, infant), choking, severe bleeding, burns, recovery position, shock, heart attack, stroke (FAST), seizure, fractures and sprains, drowning, electric shock, heat stroke, hypothermia, poisoning, snakebite (general), allergic reaction |
| **Survival** | Making water safe (boiling, filtering, sunlight method), signalling for help (SOS, mirror, ground signals, whistle), a simple shelter, saving phone battery, staying found when lost |
| **Disasters (general)** | Flood, cyclone or hurricane, earthquake, fire, extreme heat |

**Tools that do it for you.** The phone does the part people don't know how to do:

| Tool | What it does | Limits |
| --- | --- | --- |
| CPR metronome | Beats at about 110 per minute, with voice prompts and a timer for swapping who pushes | None |
| SOS light | Blinks SOS in Morse with the torch | The torch works only in Chrome on Android. Everywhere else, the full-brightness screen flashes. |
| SOS sound / whistle | A loud tone, or SOS in Morse | None |
| Compass and level | Reads the phone's motion sensors | iPhone needs a permission tap, and accuracy varies |
| Help message and last seen note | Writes "I need help. I am at …" with GPS coordinates when the phone has a fix, saves it on the phone with the time, and opens the SMS app ready to send | The person still picks who to send it to and taps Send |
| Lightning distance | Tap at the flash, then at the thunder: shows the rough distance (about 5 seconds per mile, 3 per km) and the advice that hearing thunder means you are within reach of lightning | Rough only |
| Emergency call | Tap to call | The kit says to use the local emergency number. It doesn't promise one number works everywhere. |

**How it ships.**
1. The base pack downloads when Lantern is installed and is cached by its service worker.
2. The app asks for persistent storage, so the browser keeps the kit.
3. Packs are versioned with a `manifest.json` (version, size, languages, checksum), so an update replaces a pack cleanly.

## 4. How it looks

**Clean and calm.** People may open this while scared, in the dark, or in bright sun, so the screen should feel quiet and readable:

- **Muted colors:** a dark neutral background, soft bone and mist text, and at most one muted accent. No bright or neon colors, glows, or saturated reds and purples.
- **Severity without loud color:** severity shows mainly through weathering and plain words ("High risk"). Color, if used at all, is a muted tint and never the only signal.
- **Little decoration:** generous spacing, large readable text, and one main action per screen. Horror atmosphere stays subtle: texture and sound, not flashing.
- **Plain motion:** short and soft. Off when reduced motion is set. Nothing flashes, except the SOS light tool, which is meant to.
- **Readable first:** text meets WCAG AA contrast at least. Kit cards and tools aim for AAA, since they may be read in poor light.

Where a Groove UI piece is louder than this, the app uses a quieter variant. That variant is added to Groove UI as an option, not restyled inside the app.

Use Groove UI first. Anything missing gets built in Groove UI, so the Gravecast app stays thin.

| Gravecast piece | Groove UI piece |
| --- | --- |
| Graves, severity | `TombstoneCard` / `TombstoneCard3D` weathering (pristine → crumbling) |
| Haunted radio | ggwave for encoding and decoding, wrapped in Groove UI with the sound engine (static, atmosphere) and `useOccultMic` (listening) |
| Locked cards | `Seal` |
| Access aids (braille pad, read aloud) | `groove-ui/signal` speech |
| Presenting | `Scribble` |
| Kit card comics | The doodle system (below), drawn with Rough.js |
| CPR metronome, SOS sound | Sound engine |
| To build | QR display, "transmitting" animation, the doodle system |

**The doodle system.** Kit card drawings are generated from data, not drawn one by one:

- **A stick figure** is a skeleton of joints (head, shoulders, elbows, hands, hips, knees, feet). A **pose** is the joint positions, stored as data.
- **Props** are reusable pieces: a lying person, a hand marker, arrows, ticks and crosses, water, a phone.
- **A doodle** is a small data file: poses plus props plus an optional highlight. Adding a doodle means adding a file, not drawing an SVG.
- **A doodle script** is what the content owner writes for each doodle: the sourced caption, the source, the view, the figures and their poses, the props, and the highlight. A script becomes one data file.
- **Rendering** uses [Rough.js](https://roughjs.com/) to SVG, with a fixed seed per doodle, so every doodle looks hand-drawn and identical on every device, in the calm palette. Rough.js is a dependency of Groove UI, not of the app.
- **The panel player** draws a strip one panel at a time, with reduced-motion and screen-reader support.

The list of doodles needed comes from the kit card content. Each doodle illustrates exactly its sourced caption.

## 5. Principles

1. **Evidence before style.** Every grave traces back to a real finding. Atmosphere never invents facts.
2. **Honest verdicts.** Say what was found and what wasn't checked. Never promise "safe".
3. **Passive only.** No port scans, probing, or exploits against sites the user doesn't own.
4. **Little internet first (Lantern).** Small requests, cache-first, never block startup on the network. The website can assume a normal connection, but still keeps pages light.
5. **Prototype first.** Build the smallest version that proves the idea, then iterate.
6. **No mandatory AI.** Deterministic checks and templates. See BUILD_SPEC.
7. **No made-up information. Life-safety content is sourced, never written by us.** First aid and survival steps come from recognized international guidance, such as the IFRC International First Aid, Resuscitation and Education Guidelines, ILCOR resuscitation guidance, and WHO. Every kit card names its source and review date. Wrong steps can kill.
8. **Revive the old tech, honestly.** Use the real formats, timings, and ideas: Gopher menus, FidoNet store-and-forward, modem tones, Morse, and shortwave. Where we change the transport (for example, Gopher menus over HTTPS instead of port 70), say so plainly in the app.

## 6. Safety rules

- **Server-side fetching:** our server fetches URLs that users type in. Block private, local, and cloud-metadata addresses. Re-check the address after each redirect. Cap the number of redirects, the response size, and the time spent. Never run the page's JavaScript.
- **Bounded work:** every scan has time, size, and request limits, configured in `app/config.py` like the GitHub limits.
- **Rate limits:** on scans and on `/send`.
- **No secrets in cards:** a leaked-secret finding shows where the secret is, never the secret itself.

## 7. Stack and layout

| Part | Choice | Where |
| --- | --- | --- |
| Backend | Python + FastAPI + Pydantic | `apps/api` |
| Repo scan | Existing module | `apps/api/app/modules/github` |
| Link scan | New module | `apps/api/app/modules/linkscan` |
| Channel (mail runs, echoes) | New module | `apps/api/app/modules/channel` |
| App | React + Vite + TypeScript website; Lantern is the installable PWA | `apps/gravecast` (new) |
| Look and sound | Groove UI | `packages/grave-ui` |
| Echo storage | DynamoDB, provisioned mode at 25 read / 25 write units (the free tier) | Behind Lambda |
| Access content | Built into Lantern (phrases, kit captions) | Cached offline with Lantern |
| Docs site | Groove UI docs, under `/docs` in the same app (moved from `apps/web`) | `apps/gravecast/src/docs` |

**One app: a website with an installable section.** There is one codebase and one build:

- **The website** holds the link scan and developer mode. It needs the internet and is not installed.
- **Lantern** lives under its own path, `/lantern`. Its web manifest and service worker are scoped to that path, so "Add to Home Screen" from there installs only Lantern, and only that section is cached for offline use. Installed, it opens straight into Lantern, including in flight mode.
- **Demo mode:** for showing the app, a demo mode runs on built-in sample data: pre-scanned links, a sample Board, and sample Chat messages. Every screen can then be shown even when the API is asleep or there is no network. Demo data is clearly labelled as a sample, so it is never mistaken for a real finding.

Hosting for the prototype:

- **Vercel:** the website, Lantern, and the Board's Gopher menu files.
- **AWS Lambda:** the API: scans, and mail runs for Chat.
- **Storage:** DynamoDB for echoes.

Nothing runs while idle. There is no always-on server, no domain to manage, and no DNS.

**Zero cost.** Everything stays inside free tiers (from each provider's pricing page, checked when written):

| Service | Free allowance | How we stay inside it |
| --- | --- | --- |
| Vercel Hobby | 1M function invocations, 100 GB data transfer, 1M CDN requests per month | Mostly static files. Going over pauses the feature for 30 days; nothing is charged. |
| AWS Lambda | 1M requests and 400,000 GB-seconds per month | Short mail runs and scans. Reserved concurrency caps how many run at once. |
| DynamoDB | 25 read and 25 write capacity units, 25 GB storage (Standard table class) | Provisioned mode fixed at 25/25, with no auto scaling. It throttles instead of billing. |
| API Gateway | Free for the first 12 months only | Not used. Lambda Function URLs give Lambda a public address. |

Our AWS account is on the **Paid plan**. Always-free allowances still apply, but usage beyond them is billed, not paused. So the guardrails are required: DynamoDB fixed at 25/25 with no auto scaling, Lambda reserved concurrency, rate limits on scans and mail runs, no API Gateway, and a billing alert at $1.

## 8. Iterations

### Iteration 1: the website

1. Link scan: redirects, domain age, lookalikes, URLhaus, HTTPS certificate.
2. Graveyard view of the results (2D tombstones).
3. Grave card and QR.
4. Demo mode with labelled sample data.

### Iteration 2: Lantern and survival kit (base pack)

5. Lantern shell at `/lantern`: installable, scoped manifest and service worker, opens offline.
6. Kit cards for first aid, survival, and general disasters, sourced from international guidance.
7. The doodle system in Groove UI (skeleton, poses, props, panel player), then the doodles from the list.
8. Tools: CPR metronome, SOS light, SOS sound, compass and level, help message, emergency call.
9. The base pack ships with the install and opens in flight mode.

### Iteration 3: the channel

10. Access: a braille pad for blind people and a dial pad for deaf people, plus vibrate for messages; read aloud lives on each kit card.
11. Chat: FidoNet-style echomail with mail runs through Lambda; the `EMERGENCY` and `DEMO` echoes.
12. Outbox + Background Sync, making a mail run when the network returns.
13. Radio: a replica radio net that reads messages aloud on the phone (built).

### Iteration 4: haunted radio (cut for the hackathon, see section 9)

14. Grave card over sound with ggwave (send and receive).

### Later

- Site health checks; Google Safe Browsing.
- Repo graveyard per BUILD_SPEC (TODOs, OSV.dev, secrets, dead code).
- Chat:
  - area echoes, such as one per city
  - moderation: read-only announcement echoes, rate limits
  - accounts created at install
- Radio:
  - recorded bulletins, a frequency guide
  - verified broadcasters
- Location packs (opt-in, one per place): local disaster pages, an offline map built from OpenStreetMap data (a vector extract per city, not bulk tile downloads), verified local contacts, local hazards, and local languages.
- More languages for the base pack.
- An Android APK wrapping Lantern (for example with PWABuilder), for the Play Store or sharing as a file.
- Updating packs quietly in the background.
- Native app only: a barometer "storm glass" (pressure trend warnings). Browsers do not expose the barometer, a web app cannot read it in the background, many phones lack one, and any warning thresholds must come from a weather service.
- 3D graveyard.

## 9. Decisions

| Decision | Status |
| --- | --- |
| Link safety scan is the main feature; repo scan is developer mode | Agreed |
| Target is little internet for the channel; the survival kit works with no internet | Agreed |
| The survival kit is part of the app, as the fourth tab of Lantern (replaces "the kit is separate") | Agreed |
| Base pack first: content valid worldwide; location packs later | Agreed |
| Life-safety content comes from recognized sources and names its source | Agreed |
| Hackathon: all kit cards ship with one prototype notice; the per-card `review: verified` gate applies only to a production release | Agreed |
| No made-up information anywhere: if it can't be sourced or verified, leave it out | Agreed |
| Kit cards are comic strips in stick-figure line art, one panel per step | Agreed |
| Installed ahead of time; size is not a hard limit | Agreed |
| FastAPI backend + React web app | Agreed |
| Share findings as grave cards via QR, haunted radio, and the channel | Agreed |
| Outbox with Background Sync; sending is a mail run | Agreed |
| Chat is FidoNet-style echomail through Lambda (replaces IRC, Ergo, and KiwiIRC) | Agreed |
| Access (renamed from the Board) has two modes, chosen by the person: a braille pad (blind or low vision) and a dial pad of messages (deaf or hard of hearing). Talk's turn-taking and saved own phrases are dropped for now; the dial pad's 0 key writes anything. Help near you is last in the side menu | Agreed |
| Access tiles are named by the problem: "Can't see and can't speak" (braille pad) and "Can't hear or can't speak" (dial pad). A distress signal (shake or five taps, off by default; or the pads' SOS) speaks and sounds for help or vibrates silently, and opens the SMS app to a saved help contact with the GPS position. Loud is the default; Silent is offered because noise can be dangerous, for example when hiding | Agreed |
| Only Vercel and Lambda: no always-on server, no Lightsail, no DNS | Agreed |
| Zero-cost deploy inside free tiers: Vercel Hobby, Lambda with Function URLs, DynamoDB provisioned at 25/25, a $1 billing alert | Agreed |
| Demo with a real tester group in a `DEMO` echo (§12) | Agreed |
| Haunted radio uses ggwave | Agreed |
| Kit drawings come from a doodle system (skeleton, poses, props as data), not hand-drawn one by one | Agreed |
| The doodle system renders with Rough.js (a new Groove UI dependency) | Agreed |
| Doodles are built in iterations: foundations first, then batches from doodle scripts | Agreed |
| A second developer builds the website (link scan, graveyard, grave card); see §13 | Agreed |
| Groove UI provides the look; missing pieces are built there | Agreed |
| One app: a website (link scan, developer mode) with an installable Lantern (channel and survival kit). No separate apps. | Agreed |
| Clean, calm UI with muted colors and no bright accents (§4) | Agreed |
| Only Lantern is a PWA, scoped to `/lantern`; the link scan and developer mode are web only (§7) | Agreed |
| Demo mode on labelled sample data for showing the app (§7) | Agreed |
| New app lives in `apps/gravecast` | Agreed |
| One site: the Groove UI docs live in the app under `/docs`, sharing the top bar; `apps/web` is retired | Agreed |
| Link scan starts with checks the browser can run on the device (address form, http, bare IP, `@` disguise, punycode, unusual port). Server checks are added with the backend, and the result always lists what was not checked. | Agreed |
| The security headers check (from §3.2 Site health) joins the link scan now: the server opens the link once, passively, and each missing header becomes a grave. Missing headers are labelled "Missing protection", not as signs of a harmful link. | Agreed |
| Developer mode is built now: the repo graveyard reads TODO, FIXME, HACK and XXX comments from the existing GitHub ingestion and shows them as a 3D graveyard with a plain list alongside | Agreed |
| Sound is on from the start. A small control shows Sound ready, on or off, and a quiet ambient drone starts after the first click or key (replaces "no sound switch") | Agreed |
| One page for both checks: a Dev mode switch turns the link check into the repo graveyard (`/dev` redirects to it). The page fits one screen: the form, a vial showing how far the scan has come, and the graveyard sit in the left column, with the 3D yard behind | Agreed |
| The graveyard is a 3D walk in third person, like a third-person game (replaces "graves play as stories" and the side-on strip). One grave stands for each finding, so 5 findings show 5 graves, scattered through a fenced yard at night with room to walk between them, worn to their weathering; nothing else in the yard looks like a grave. The person is the witch on a broom (the `WitchOnBroom` drawing, standing in the scene and turned to the camera), at the height of the graves, starting outside the gate and facing in, with the camera behind her shoulder. Holding the left mouse button and dragging turns the camera (the arrow keys turn it too); clicking a grave flies her through the gate and round the other stones to it, and once she is beside it the file and the problem show above the grave. A list of the graves does the same from the keyboard, and replaces the 3D yard when WebGL or motion is off | Agreed |
| In dev mode the drone gains a voice for each tenfold of the repo's open issues and pull requests | Agreed |
| The home page has a Scribble cannon: once, a pen is fired from the bottom left into the right end of the top bar, where it stays with a red glow. Clicking it turns on drawing; its small × turns it off, and that is remembered. The status vial is red; Lord Alucard (the bestiary vampire) is the creature in the 3D yard. Teeth bite down on the form while a scan runs | Agreed |
| The home page uses the docs' green grove palette (Groove UI `.grave-grove` and `palette.grove`), with one emerald accent. This relaxes "muted colors, no bright accents" for the website only | Agreed |
| The website tells the team's backstory on an "Our story" page: one of us in a cyclone region (flying trees, then about two days with no electricity, internet or signal), one from Lebanon (war), one from Florida (frequent hurricanes) | Agreed |
| Top bar order: Graveyard, Lantern, Docs, Our story. Lantern is the second tab once the section works; Our story is always last | Agreed |
| The installed Lantern is plain and fast: no animation, no 3D, no decorative sound, no horror effects. Only sounds that do a job (the CPR beat, SOS) play. The website may still show off | Agreed |
| Lantern is its own page (`lantern/index.html`) with its own bundle, so no website code is cached on the phone. Moving between it and the website is a full page load | Agreed |
| Its service worker is written by us and generated at build time from exactly the Lantern page's files; pages open from the cache first, and a new version takes over at once and the page reloads itself once, so an update never needs tabs closed | Agreed |
| Its manifest and icons are generated at build time from Groove UI's palette | Agreed |
| Groove UI has narrow entry points so a page loads only what it uses. The Lantern page imports `groove-ui/doodle` (the comic system), never the whole library, so no 3D code is downloaded or cached on the phone | Agreed |
| Lantern opens on the Survival kit, which works with no internet at all; the tab bar is Survival kit, then Chat. Board and Radio join as each one works | Agreed |
| Chat is live in Lantern on two echoes, EMERGENCY (the default) and DEMO (for testing). A message goes into an outbox on the phone first, and is sent in a mail run: at once when online, when the connection returns, every 5 seconds while Chat is open, and by Background Sync from the service worker even with the app closed. Messages stay readable offline. It is public: the page says not to post personal details | Agreed |
| Chat's limits: nicknames of up to 24 characters, messages of up to 500, 20 messages per mail run, and the newest 500 kept per echo. A message the server refuses is dropped from the outbox and shown to the sender with the reason, so one bad message never blocks the rest | Agreed |
| A live demo page at `/demo` is for judges: what Gravecast is, a QR code that opens Chat on the DEMO echo, and the DEMO echo live, with an option to show each message's FidoNet-style headers. It only reads, through `GET /api/channel/echoes/{area}` | Agreed |
| Prototype hosting: the app on Vercel, the API on AWS Lambda | Agreed |
| Chat storage sits behind one interface: SQLite for local development, DynamoDB when deployed. A GitHub Action deploys, and its secrets hold the AWS credentials | Agreed |
| The remaining kit card strips are built around Chat (before or after), in batches from the doodle scripts | Agreed |
| All 31 kit cards are drawn as drafts from the doodle scripts, with captions word for word. Close-ups and scenes in the scripts are Groove UI props (shape data), not poses; a placement label can override a badge's text | Agreed |
| Cut for the hackathon: grave card (QR and sharing), the `/demo` page, haunted radio with ggwave, and the streams-based Radio dial. The vision's other sections stay as the plan for later | Agreed |
| Lantern's dead tech on top is **Radio**: a replica of a shortwave radio net. A message written in Radio goes through the same outbox and mail run as Chat, to the tuned channel, one of nine built-in echoes `RADIO-1` to `RADIO-9`. Each phone that is on and tuned to that channel gives it in the mode the person picks: Voice (read aloud in English by the browser's speech synthesis, preferring a voice that works offline) or Tones (RTTY, made with Web Audio). Voice is the default; where the browser cannot speak, Voice is turned off and the page says so. No library | Agreed |
| Radio is its own place in Lantern's side menu, after Chat. Its nine channel echoes are hidden from Chat's channel list. The dial shows channel numbers, never real frequencies, so nobody tunes a real radio to a number they saw here. Radio says plainly that it is a replica: the message travels as text over the internet and is turned into sound on the phone | Agreed |
| While Radio is on (turned on by a tap, as browsers require), it reads every message on the tuned channel by itself: the newest one when it is turned on or tuned, then each new one as it arrives, including your own once it is sent. The display says who is being received. Messages are hidden by default and open with one tap, each with a Replay button. Where the browser cannot speak, the page says so and the messages are the way to read them | Agreed |
| Radio is the one exception to "no decorative sound" in Lantern: while it is on, a quiet static hiss plays so the person can hear that the set is running. It follows the volume control, fades under a message while one plays, and stops the moment Radio is turned off or the page is left. It never plays anywhere else | Agreed |
| Radio's set uses the palette's warm brass (case, dial, needle, lamps and the On button) so it reads as a radio; this is the one place brass is used for looks rather than attention. The set takes about three fifths of the width, with the channel's chat in a narrower column on its right; on narrow screens the chat sits under the set | Agreed |
| Help near you finds places with Amazon Location Service (Places SearchNearby), called from the phone with a browser API key limited to that one action, our site's addresses and an expiry date. Results are saved on the phone, so every request sets `IntendedUse` to `Storage`, as AWS's terms require. For now it covers hospitals, clinics, pharmacies, police and fire stations; AWS has no category for shelters or drinking water, so those are left out until a second source is added (Photon, OpenStreetMap data, is the candidate). Overpass is dropped: its public servers refused or timed out on this query. Gravecast's own server never sees the location. The saved list works with no internet: distances and compass directions from where it was saved, calls, and a maps link | Agreed |
| Next: Access; the spoken menu and corner button come after it | Agreed |
| The graveyard's dead tech is WHOIS: domain age is read over port 43 (root `whois.iana.org`, then the registry it names), with the same private-address blocking, a 4-second limit and a size cap. Sites under 30 days old are a warning grave, under 180 days a caution grave, each showing the WHOIS line word for word. RDAP stays a possible later fallback | Agreed |
| The website's graveyard is meant to intimidate: a painted witch (our own drawing in a classic cartoon style: green skin, hooked nose, tall hat, ragged robe, straw broom) replaces the line-art one in 2D, and in the 3D walk she is a modelled figure in the same style, riding her broom in the scene rather than a flat picture; she giggles (a short sound and a shake) when she reaches a grave, except with reduced motion. The yard is darker, with glow, film grain and a vignette, denser fog, gnarled dead trees, eyes that blink in the tree line, drifting clouds, and the moon in tonight's real phase (worked out on the device from the date, drawn with the Groove UI lunar phases). Worn graves show jagged cracks, more the worse they are, and crumbling ones shed rubble. A wrought-iron winged hourglass, the old gravestone sign that time flies, sits in the arch over the gate. Each grave glows in its severity's colour: blood red (Serious), witch-fire violet (Risky), curse gold (Unusual), ghost pale (Note). Colour is never the only sign: weathering, lean, cracks and the label still say it. Reduced motion stills it all, and the flat fallback and the list stay. Lantern is unchanged: it stays plain | Agreed |
| Accessibility is the driving factor for Lantern: when a choice trades accessibility against looks or features, accessibility wins | Agreed |
| The installable part is called **Lantern** (replaces “Emergency section”, since it will hold more than emergency tools). It lives at `/lantern/`, installs as “Gravecast Lantern”, and old `/emergency/` links redirect there. The Chat echo `EMERGENCY` keeps its name | Agreed |
| Lantern has a left side menu built like the docs sidebar (Survival kit, Help near you, Chat), with larger text and tap targets; on a phone the places sit in a row on top. No home screen. Pages one level down (a kit card, an Access mode) have a plain back arrow with no label, at the top left | Agreed |
| Lantern has a **Tools** place in its side menu, after Survival kit: SOS light, SOS sound, CPR metronome, compass and level, lightning distance, and the help message. Each tool is one screen with one big Start/Stop button | Agreed |
| The help message and the "last seen" note are one tool: a position plus a short message, saved on the phone and ready to send by SMS. Sharing it as a grave card waits for the grave card format | Agreed |
| The SOS light on screen flashes at most 2 times a second (WCAG 2.3.1 allows 3), and warns before it starts. The tools' light and beat are the only motion in Lantern | Agreed |
| Shared signal pieces (Morse timing, a clean tone player, a steady beat, torch, compass, screen wake lock) live in Groove UI as `groove-ui/signal`, so Lantern loads no 3D code | Agreed |
| Hackathon: the tools ship as drafts under the prototype notice; their numbers are checked against sources before a production release | Agreed |
| Breathing guide and the Buys Ballot storm arrow are left out. The arrow would tell people which way to walk in a storm, which official guidance does not support | Agreed |

## 10. Open questions

1. Zero cost: confirm that Lambda Function URLs add no charge; that Lambda is among the always-free services (AWS says 30+ services are always free on both the Free and Paid plans; DynamoDB is listed); and that Vercel Hobby's terms allow this project. Also confirm FidoNet details (MSGID, origin line, tear line) against the FidoNet standards (FTS documents).
2. Radio no longer uses public streams (section 9), so there is nothing to embed. Speech voices differ by phone, and some need the internet; the app prefers a voice that works offline, but this is not yet tested on real phones.
3. Google Safe Browsing terms for our use.
4. The exact grave card format. Align it with the signal envelope in BUILD_SPEC §8.
5. ggwave: check its payload limit against the grave card's size (about 200 bytes) and split or shrink the card if needed. Also confirm its JavaScript/WebAssembly build and licence.
6. Licensing for kit content. IFRC and WHO material may need permission or attribution when adapted. Check before shipping.
7. Browser-support claims in this doc are not yet verified: Background Sync, the torch API, the compass permission on iPhone, and haunted radio speed. Check each against current documentation, or test it, before building on it.

## 11. Words we use

Use these terms everywhere: code, UI, and docs.

| Term | Meaning |
| --- | --- |
| **Grave** | One finding, with evidence and a severity |
| **Graveyard** | All graves from one scan |
| **Weathering** | How serious a grave looks: pristine, aged, cracked, crumbling |
| **Grave card** | A small shareable message (finding or note), about 200 bytes |
| **Haunted radio** | Sending a grave card as sound |
| **Lantern** | The installable part of the app (PWA), at `/lantern/`. It holds the survival kit, Help near you, and the channel |
| **Channel** | Chat and Radio, inside Lantern |
| **Echo** | A public message area in Chat, such as `EMERGENCY` (FidoNet's word) |
| **Mail run** | One short request that sends queued messages and fetches new ones |
| **Tester** | A real person in the demo group who uses the `DEMO` echo |
| **Survival kit / Tools / Chat / Radio / Access / Help near you** | The places in Lantern's side menu |
| **Spoken menu** | Moving through Lantern by taps and the phone's voice, for blind people |
| **Kit card** | One offline guide, drawn as a comic strip: panels for the steps, Do / Don't, and its source |
| **Panel** | One step of a kit card: a stick-figure drawing and its caption |
| **Doodle** | The drawing in one panel, generated from a data file |
| **Doodle script** | The written spec for one doodle, from which its data file is made |
| **Pose / prop** | A reusable figure position / a reusable object in a doodle |
| **Base pack** | Kit content valid worldwide, shipped to everyone |
| **Location pack** | Opt-in kit content for one place (later) |
| **Outbox** | Messages waiting for the network |
| **Little internet** | A slow, patchy connection; our target |

## 12. Demo plan

The demo uses real people and real messages. Nothing is staged with invented content.

**A tester group.** Before the demo, a small set of real testers (the team, friends, and family) installs Lantern and uses the `DEMO` echo for a few days. Each tester picks a nickname. The echo then holds genuine messages and shows real mail runs on real phones and networks. Testers are told that the echo is for testing, so nobody posts real emergencies there. The `EMERGENCY` echo stays clean.

**On stage, about 3 minutes:**

1. **Link scan (website).** Paste a link chosen in advance for its real findings. Turn the worst grave into a grave card.
2. **QR.** A phone scans the card off the screen.
3. **Flight mode.** Open the survival kit. A CPR comic draws itself and the metronome beats.
4. **The outbox.** Still in flight mode, post to `DEMO`. The message shows as waiting for the next mail run.
5. **The line comes back.** Turn flight mode off. The phone makes a mail run, and the message appears on the big screen with its FidoNet headers in the Wire view.
6. **Audience joins.** A QR on screen opens Lantern. Judges pick a nickname and post to `DEMO`, and their messages arrive on the next mail run.
7. **Haunted radio.** The laptop plays a grave card as modem tones, and a phone decodes it with no network.

**Fallbacks:** run both devices on a phone hotspot. Use demo mode (labelled sample data) for the link scan if an outside service fails. Keep a recorded clip of haunted radio in case the room is noisy.

## 13. Who builds what

| Workstream | Owner | Covers |
| --- | --- | --- |
| **Website** | Second developer | Iteration 1: link scan (`apps/api/app/modules/linkscan`), graveyard view, grave card and QR, demo mode |
| **Lantern** | Core team | Iterations 2–4: installable shell, survival kit and doodle system, Board, Chat (mail runs), outbox, Radio, haunted radio |
| **Kit content** | Core team | Sourcing kit cards from IFRC, ILCOR, and WHO guidance, checking licences, and the list of doodles needed |

**The shared contract is the grave card.** Both sides use the same versioned format, so a card made on the website can be scanned, played over haunted radio, or posted to an echo. Agree on the format first, as one TypeScript module with tests, before either side builds on it. The second developer follows the same steering files and this doc.
