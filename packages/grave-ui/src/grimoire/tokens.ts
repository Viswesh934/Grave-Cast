/**
 * Grimoire color tokens.
 *
 * The Grimoire is styled like an old spellbook: ink-black pages, vellum
 * panels, a dark binding, and parchment text, lit by the color of each rite.
 * Colors anchor to the shared `palette` wherever it has a match; the few
 * shades it lacks are named once in {@link grimoireShades}.
 *
 * @module grimoire/tokens
 */

import { palette, withAlpha } from '../tokens/colors';

/**
 * Shades the core palette has no equivalent for. Rites and their overlays
 * pick from these names instead of inventing new hex values.
 */
export const grimoireShades = {
  /** Deepest page black, a touch warmer than the abyss. */
  ink: '#07060b',
  /** Panel surface, like old vellum in candlelight. */
  vellum: '#13111a',
  /** Raised panel surface. */
  vellumRaised: '#1c1925',
  /** Borders and dividers, like a book's leather binding. */
  binding: '#3a3047',
  /** Primary text, like aged parchment. */
  parchment: '#ece2cc',
  /** Pale glowing green of ectoplasm. */
  ectoplasm: '#7dffb3',
  /** Cold blue moonlight. */
  moonlight: '#9ec5ff',
  /** Cyan will-o'-the-wisp fire. */
  soulfire: '#5ee7f0',
  /** Warm orange of a dying ember. */
  ember: '#ff8a3d',
  /** Fresh blood, light enough for red text on dark panels (the darker plasma is not). */
  freshBlood: '#ff5a67',
} as const;

/**
 * The glow each rite is lit by. A rite only names its accent; badges,
 * outlines, and focus rings take the color from here.
 *
 * - `witchfire`: inspection and seeing through things
 * - `ectoplasm`: watching and observing
 * - `blood`: changing and possessing the page
 * - `candle`: storage and keeping things
 * - `moonlight`: timing and performance
 * - `soulfire`: talking across tabs and windows
 * - `ember`: warnings and attention
 * - `bone`: quiet, neutral rites
 */
export const grimoireAccents = {
  witchfire: palette.witch.fire,
  ectoplasm: grimoireShades.ectoplasm,
  blood: palette.sanguine.plasma,
  candle: palette.witch.gold,
  moonlight: grimoireShades.moonlight,
  soulfire: grimoireShades.soulfire,
  ember: grimoireShades.ember,
  bone: palette.bone[200],
} as const;

/** The name of one rite accent. */
export type GrimoireAccent = keyof typeof grimoireAccents;

/** Every accent name, handy for pickers and showcases. */
export const GRIMOIRE_ACCENT_NAMES = Object.keys(grimoireAccents) as GrimoireAccent[];

/**
 * Surfaces and text for Grimoire panels. Text pairs are chosen to pass WCAG
 * AA on every surface here: `text` and `muted` on `page`, `panel`, and
 * `raised`.
 */
export const grimoireSurface = {
  page: grimoireShades.ink,
  panel: grimoireShades.vellum,
  raised: grimoireShades.vellumRaised,
  border: grimoireShades.binding,
  text: grimoireShades.parchment,
  muted: palette.mist[300],
  /** Decorative only: too faint for text that must be read. */
  faint: palette.mist[500],
  focus: palette.witch.gold,
} as const;

/** How strongly the box-model areas are tinted, in percent of their color. */
export const INSPECTOR_FILL_STRENGTH = {
  margin: 28,
  border: 40,
  padding: 30,
  content: 24,
} as const;

/**
 * Colors for page inspection overlays. The box model keeps the order people
 * know from browser devtools (warm margin, gold border, green padding, blue
 * content) in Grimoire shades.
 */
export const inspectorColors = {
  margin: grimoireShades.ember,
  border: palette.witch.gold,
  padding: grimoireShades.ectoplasm,
  content: grimoireShades.moonlight,
  /** Outline around the element being pointed at. */
  outline: palette.witch.fire,
  /** Guide lines and rulers. */
  guide: palette.mist[400],
  label: {
    background: grimoireShades.ink,
    text: grimoireShades.parchment,
    accent: palette.witch.gold,
    border: grimoireShades.binding,
  },
} as const;

/** The box-model tints, ready to use as backgrounds. */
export const inspectorFills = {
  margin: withAlpha(inspectorColors.margin, INSPECTOR_FILL_STRENGTH.margin),
  border: withAlpha(inspectorColors.border, INSPECTOR_FILL_STRENGTH.border),
  padding: withAlpha(inspectorColors.padding, INSPECTOR_FILL_STRENGTH.padding),
  content: withAlpha(inspectorColors.content, INSPECTOR_FILL_STRENGTH.content),
} as const;

/** Colors for contrast verdicts from `rateContrast`, each readable as text on Grimoire panels. */
export const contrastVerdictColors = {
  AAA: palette.witch.emerald,
  AA: grimoireShades.ectoplasm,
  fail: grimoireShades.freshBlood,
} as const;
