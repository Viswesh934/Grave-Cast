# Grave UI — Color Theory & Psychological Horror UI Architecture

> **Engineering Standard & Interface Guidelines**  
> Moving past generic "spooky" palettes to mechanics-driven color choices, cognitive unease, and strict interface uniformity.

---

## 1. Mechanics-Driven Color Choices

In an interactive digital interface, color is not passive decoration—it commands user focus, signals system states, and creates psychological friction. 

```
┌────────────────────────────────────────────────────────────────────────┐
│                        THREE-STATE COLOR ENGINE                        │
├──────────────────────────┬─────────────────────────┬───────────────────┤
│ 1. BASELINE "SAFE" STATE │ 2. REACTION SHOCK STATE │ 3. SUBCONSCIOUS   │
│                          │                         │    CHAMBER STATE  │
├──────────────────────────┼─────────────────────────┼───────────────────┤
│ Deep muted tones         │ Hyper-saturated bursts  │ Temperature split │
│ Tinted darks (60-70% lum)│ Neon crimson / flash    │ Emerald vs Void   │
│ Resting cognitive state  │ Sympathetic nerve hit   │ Zone partition    │
└──────────────────────────┴─────────────────────────┴───────────────────┘
```

### The Three State Classes

1. **The Baseline "Safe" State (Deep Muted Tones)**
   - **Rule:** Backgrounds must never use pure `#000000` pitch black. Pure black crushes depth and fatigues the eye.
   - **Implementation:** Dominate screens in deeply tinted darks:
     - Bruised obsidian navy: `#0B0E14`
     - Muted terminal coal: `#0B0E08`
     - Abyssal ritual violet: `#0F0A14`
   - **Body Text Luminosity:** Rest body text at **60–70% luminosity** (`#98A6B5`, `#94A3B8`, `#CBD5E1`). This guarantees high readability without washing out shadows, preserving maximum dynamic headroom for trigger flashes.

2. **The Reaction State (Jarring Shock Colors)**
   - **Rule:** When an error occurs, a destructive action is executed, or a horror state triggers, the interface must deliver an abrupt chromatic rupture.
   - **Implementation:** Pierce through the desaturated baseline with hyper-saturated raw crimson (`#FF3333` / `#FF1744`) or blinding sterile glitch-white (`#FFFFFF` with `#00F0FF` / `#FF003C` chromatic fringe).
   - **Psychological Effect:** Mimics a sudden adrenaline spike and physical shock to the optical nervous system.

3. **The Subconscious State (Chamber & Archetype Isolation)**
   - **Rule:** Differentiate application domains or system states by color temperature rather than generic grey cards.
   - **Implementation:**
     - Corrupted / Unstable processes: Sickly Phosphor Green (`#4AF2A1` on `#0B0E08`).
     - Detached / Forensic wisdom: Cold Sterile Slate Blue (`#98A6B5` on `#12161A`).
     - Occult / Relic invocations: Tarnished Gold (`#D4AF37`) & Abyssal Purple (`#7B1FA2` on `#0F0A14`).

---

## 2. Visual Archetype Hexadecimal Palettes

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ARCHETYPE            │ BASE BACKGROUND │ INTERACTIVE / TEXT │ TRIGGER / SCARE │ VIBE   │
├──────────────────────┼─────────────────┼────────────────────┼─────────────────┼────────┤
│ 1. Haunted Terminal  │ #0B0E08         │ #4AF2A1            │ #FF3333         │ Corrupt│
│    (Dead Tech)       │ Muted Obsidian  │ Phosphor Green     │ Crimson Glitch  │ Anomaly│
├──────────────────────┼─────────────────┼────────────────────┼─────────────────┼────────┤
│ 2. Clinical Isol.    │ #12161A         │ #98A6B5            │ #FFFFFF         │ Liminal│
│    (Psychological)   │ Cold Charcoal   │ Slate Blue         │ Sterile Flash   │ Cold   │
├──────────────────────┼─────────────────┼────────────────────┼─────────────────┼────────┤
│ 3. Occult / Ritual   │ #0F0A14         │ #D4AF37            │ #7B1FA2 / #FF17 │ Ancient│
│    (Supernatural)    │ Abyssal Violet  │ Tarnished Gold     │ Electric Pulse  │ Relic  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Design Token Mapping

```css
:root {
  /* Baseline Darks */
  --grave-void-base: #0a0b10;
  --grave-void-surface: #10121a;
  --grave-void-elevated: #161824;
  --grave-void-border: #23263b;

  /* Typography Luminosity Scale */
  --grave-text-primary: #f1f5f9;      /* 95% - Headers & active metrics */
  --grave-text-body: #94a3b8;         /* 65% - Baseline body copy */
  --grave-text-muted: #64748b;        /* 45% - Captions & labels */

  /* Archetype 1: Haunted Terminal */
  --grave-terminal-bg: #0b0e08;
  --grave-terminal-phosphor: #4af2a1;
  --grave-terminal-glitch: #ff3333;

  /* Archetype 2: Clinical Isolation */
  --grave-clinical-bg: #12161a;
  --grave-clinical-slate: #98a6b5;
  --grave-clinical-flash: #ffffff;

  /* Archetype 3: Occult / Ritual */
  --grave-occult-bg: #0f0a14;
  --grave-occult-gold: #d4af37;
  --grave-occult-purple: #7b1fa2;
  --grave-occult-crimson: #ff1744;
}
```

---

## 3. Anti-"Vibe-Coding" Standard

> **Problem:** Generic spooky libraries rely on casual emojis, random purple gradients, messy inconsistent margins, and bloated placeholder prose.
> **Solution:** Enforce strict production-grade engineering principles.

```
WHAT TO REMOVE (Vibe-Coded)        │ WHAT TO ENFORCE (Production Horror UI)
───────────────────────────────────┼──────────────────────────────────────────
Useless emojis (🪦, 🧪, 🐺, 🗿, 🚪)│ Clean SVG iconography or text tags
Raw '✕' buttons in drawers         │ Precision minimal SVG close glyphs
Walls of lore text nobody reads    │ Punchy 1-line description + props contract
Random mismatched borders          │ Strict 1px border scale with tinted alpha
Generic pitch-black #000000 cards  │ 3-tier tinted darks (safe / surface / shock)
Jump scare clutter                 │ Sustained chiaroscuro & psychological friction
```

### Mandatory Rules for Every Component

1. **Zero Emojis in Technical UI:**
   - Buttons, badges, toggles, and headers must never use decorative emojis.
   - Use clean monospace tags: `[3D WEBGL]` / `[2D SURFACE]`, `VITALITY`, `CRITICAL`.
2. **Concise Documentation:**
   - Eliminate verbose paragraphs. Developers want:
     - Live interactive canvas
     - Copyable CLI installation command
     - Precision Props table with types and defaults
     - Interactive controls (sliders, toggles)
3. **Uniformity Across 3D & 2D Modes:**
   - Every component provides a segmented `[ 3D WebGL (Default) ]` vs `[ 2D Surface ]` switch.
   - The 3D view renders in a high-visibility chiaroscuro WebGL canvas.
   - The 2D view renders the lightweight semantic HTML primitive.
4. **Clean Interactive Dismissals:**
   - No raw text `✕`. Drawers and dialogs use a clean 14px vector cross icon with accessible `aria-label`.

---

## 4. UI/UX Unease Techniques

1. **Subtle Chromatic Aberration (`.fx-chromatic`):**
   - Renders a 1px cyan/magenta edge offset on trigger states, evoking optical disorientation or malfunctioning CRT displays.
2. **Break Visual Hierarchy on Failure:**
   - Normal state: eye travels smoothly from title to action.
   - Error state: the border violently flashes `--grave-terminal-glitch` (`#FF3333`), while non-critical elements drop to 20% opacity.
3. **Controlled Luminosity:**
   - Resting text at 65% brightness ensures that when a 100% luminous trigger or torchlight passes over it, the contrast dynamic range is maximized.

