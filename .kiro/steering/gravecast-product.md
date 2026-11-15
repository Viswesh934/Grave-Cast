---
inclusion: always
---

# Gravecast: Product Baseline

Gravecast finds what's dangerous (links, sites, repos), shows each finding as a grave, and helps people warn each other over little internet. The full baseline is in #[[file:docs/GRAVECAST_VISION.md]]. Treat it as the source of truth.

## Working agreement

These rules keep work uniform and cut down on back-and-forth.

1. **Build the current iteration only.** Check §8 of the vision doc. Don't add features, options, or polish from "Later" unless asked. If something extra seems worth it, mention it in one line at the end instead of building it.
2. **Decisions come from the doc.** If §9 settles a question, follow it without asking. If it doesn't and the choice is small and easy to undo, pick the option that best fits the principles and say what you picked. Ask only when a choice is big or hard to reverse, and then ask one clear question.
3. **When a decision changes, update the doc first.** Add or edit the row in §9, then build.
4. **Use the shared words.** Use the terms in §11 (grave, graveyard, weathering, grave card, haunted radio, outbox, Board, Chat, Radio, survival kit, kit card, base pack, location pack, echo, mail run, tester) in code names, UI text, and docs. Don't invent synonyms.
5. **Reuse before you write.** Use Groove UI for anything visual or audio. Put missing pieces in `packages/grave-ui`, not in the app. On the backend, copy the shape of the existing `github` module.
6. **Prototype quality, not throwaway quality.** Keep it small, but keep it correct, safe, and tested where it counts: the scanners, the fetcher's safety checks, and the grave card format.
7. **Verify before saying it's done.** Run the build, lint, and tests for the parts you touched. Report what you checked and what you couldn't.

## Non-negotiables

- **Passive checks only.** No port scans, probing, or exploits against sites the user doesn't own.
- **Honest verdicts.** Never call a link "safe". Say what was found and what wasn't checked.
- **Evidence before style.** Every grave comes from a real finding. Never invent facts for atmosphere.
- **Safe server-side fetching.**
  - Block private, local, and cloud-metadata addresses, and check again after every redirect.
  - Cap redirects, size, and time.
  - Never run fetched JavaScript.
- **No secrets in grave cards or logs.**
- **No made-up information.**
  - Never invent facts, phone numbers, places, statistics, or steps.
  - First aid and survival steps come only from a recognized source (IFRC, ILCOR, WHO), cited on the kit card with a review date.
  - Drawings show only what the caption says.
  - If something can't be sourced or verified, leave it out and say so.
  - Sample data is always labelled as a sample.
