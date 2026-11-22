# 🪦 The graveyard

Paste a link on the [home page](https://grave-cast.vercel.app). Every problem Gravecast finds rises as a grave. The more worn the stone, the more serious the problem. Walk through the yard in 3D as a witch on a broom, or read every grave as a plain list.

## What it checks

**On your device, before anything is sent:**

- An `@` in the address that hides where it really goes
- Letters from another alphabet that look like normal ones
- A number instead of a site name
- No encryption (http instead of https)
- An unusual port
- A name that isn't a public site

**On our server, the way a browser would see it:**

- Where the link really leads, following every redirect
- Which security protections the site is missing
- How old the site's domain is, from its WHOIS record (a days-old site asking for money is a warning sign)

## Honest results

Gravecast never says a link is safe. It says what it found, and lists what it didn't check. It only looks, the way your browser would: it never probes a site or tries to break in.

## Dev mode: a graveyard for your repo

Turn on **Dev mode** and paste a public GitHub repo. Gravecast reads the code and raises a grave for:

- Leaked keys and passwords (it shows where they are, never the secret itself)
- Dependencies with known security problems
- Risky code in Python and JavaScript
- Risky setup files, such as Docker and CI
- Protections the whole project is missing

Findings of the same kind share one grave, so the yard stays easy to walk.

For how the repo scan works inside, see [REPO_SCAN_DESIGN.md](../REPO_SCAN_DESIGN.md).
