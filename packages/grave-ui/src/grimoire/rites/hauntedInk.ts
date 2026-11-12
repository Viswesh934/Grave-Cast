/**
 * Haunted Ink: highlight words on a page without rewriting it.
 * @module grimoire/rites/hauntedInk
 */

import { withAlpha } from '../../tokens/colors';
import { defineCapability } from '../core/capability';
import { defineRite } from '../core/rite';
import { matchToRange, type TextMatch } from '../dom/text';
import { grimoireAccents, grimoireShades } from '../tokens';

/** The inks words can be written in. */
export type InkColor = 'ectoplasm' | 'blood' | 'candle';

/** Every ink, handy for pickers. */
export const INK_COLORS: readonly InkColor[] = ['ectoplasm', 'blood', 'candle'];

/** The color of each ink. */
export const inkValues: Record<InkColor, string> = {
  ectoplasm: grimoireShades.ectoplasm,
  blood: grimoireShades.freshBlood,
  candle: grimoireAccents.candle,
};

/** How strongly ink tints the words, in percent of its color. */
export const INK_STRENGTH = { match: 28, active: 60, glow: 70 } as const;

/** Blur of the glow around inked words, in px. */
const INK_GLOW_PX = 8;

/** Width of the outline around the current match when marks are used, in px. */
const INK_OUTLINE_PX = 1;

/** Name of the highlight that marks the current match. */
export const INK_ACTIVE = 'grimoire-ink-active';

/** Attribute on the marks used where the browser has no highlighter. */
export const INK_MARK_ATTRIBUTE = 'data-grimoire-ink';

/** Attribute on the mark of the current match. */
export const INK_MARK_ACTIVE_ATTRIBUTE = 'data-grimoire-ink-active';

/** Id of the stylesheet added to the page for the inks. */
export const INK_STYLE_ID = 'grimoire-ink-styles';

/** The highlight name for an ink. */
export const inkHighlightName = (ink: InkColor): string => `grimoire-ink-${ink}`;

const inkLook = (color: string) =>
  `background-color: ${withAlpha(color, INK_STRENGTH.match)}; text-shadow: 0 0 ${INK_GLOW_PX}px ${withAlpha(color, INK_STRENGTH.glow)};`;

const activeLook = `background-color: ${withAlpha(grimoireAccents.candle, INK_STRENGTH.active)};`;

/** The styles for every ink, for both the highlighter and the fallback marks. */
export const inkStyles = [
  ...INK_COLORS.map(
    (ink) =>
      `::highlight(${inkHighlightName(ink)}) { ${inkLook(inkValues[ink])} }\nmark[${INK_MARK_ATTRIBUTE}="${ink}"] { color: inherit; ${inkLook(inkValues[ink])} }`
  ),
  `::highlight(${INK_ACTIVE}) { ${activeLook} }`,
  `mark[${INK_MARK_ACTIVE_ATTRIBUTE}] { ${activeLook} outline: ${INK_OUTLINE_PX}px solid ${grimoireAccents.candle}; }`,
].join('\n');

/** Adds the ink styles to the page once. Safe to call many times. */
export const ensureInkStyles = (): void => {
  if (typeof document === 'undefined' || document.getElementById(INK_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = INK_STYLE_ID;
  style.textContent = inkStyles;
  document.head.appendChild(style);
};

/** Whether this browser has the CSS Custom Highlight API. */
export const supportsHighlightApi = (): boolean =>
  typeof CSS !== 'undefined' && 'highlights' in CSS && typeof (globalThis as { Highlight?: unknown }).Highlight === 'function';

/** Haunted Ink works everywhere: it falls back to marks where there is no highlighter. */
export const hauntedInkCapability = defineCapability({
  id: 'haunted-ink',
  label: 'Text highlights',
  detect: () => typeof document.createRange === 'function',
});

export const hauntedInkRite = defineRite({
  id: 'haunted-ink',
  name: 'Haunted Ink',
  tagline: 'Makes words glow wherever they hide on the page, without rewriting a single line.',
  sigil: 'quill',
  accent: 'ectoplasm',
  family: 'seeing',
  support: {
    chromium: 'full',
    firefox: 'full',
    safari: 'full',
    note: 'Browsers without the CSS highlighter get marks added around the words instead, removed when cleared.',
  },
  capability: hauntedInkCapability,
});

/**
 * How ink is put on the page.
 *
 * - `highlight`: the browser paints it; the page is not changed at all
 * - `marks`: words are wrapped in `<mark>` elements, unwrapped on clear
 */
export type InkMode = 'highlight' | 'marks';

/**
 * Inked matches, from {@link inkMatches}.
 */
export interface InkHandle {
  /** How many matches were inked. */
  readonly count: number;
  readonly mode: InkMode;
  /** Marks one match as the current one and returns what to scroll to. */
  focus: (index: number) => Range | Element | null;
  /** Removes all ink, leaving the page as it was. */
  clear: () => void;
}

interface HighlightRegistryLike {
  set: (name: string, highlight: unknown) => void;
  delete: (name: string) => boolean;
}

type HighlightConstructor = new (...ranges: Range[]) => unknown;

/** The page's highlight registry, or `null` if it has gone away, so clearing never throws. */
const highlightRegistry = (): HighlightRegistryLike | null =>
  typeof CSS === 'undefined' ? null : ((CSS as unknown as { highlights?: HighlightRegistryLike }).highlights ?? null);
const createHighlight = (ranges: Range[]): unknown =>
  new ((globalThis as unknown as { Highlight: HighlightConstructor }).Highlight)(...ranges);

const inkWithHighlights = (matches: readonly TextMatch[], ink: InkColor): InkHandle => {
  const ranges = matches.map(matchToRange);
  const name = inkHighlightName(ink);
  if (ranges.length > 0) highlightRegistry()?.set(name, createHighlight(ranges));
  return {
    count: ranges.length,
    mode: 'highlight',
    focus: (index) => {
      const range = ranges[index];
      if (!range) return null;
      highlightRegistry()?.set(INK_ACTIVE, createHighlight([range]));
      return range;
    },
    clear: () => {
      highlightRegistry()?.delete(name);
      highlightRegistry()?.delete(INK_ACTIVE);
    },
  };
};

const inkWithMarks = (matches: readonly TextMatch[], ink: InkColor): InkHandle => {
  const marks: HTMLElement[] = [];
  // Wrap from the last match back, so the offsets of earlier matches in the
  // same text node stay correct as the node is split.
  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const range = matchToRange(matches[index]);
    const mark = matches[index].node.ownerDocument.createElement('mark');
    mark.setAttribute(INK_MARK_ATTRIBUTE, ink);
    try {
      range.surroundContents(mark);
      marks.unshift(mark);
    } catch {
      // A match the browser cannot wrap is left plain.
    }
  }
  let active: HTMLElement | null = null;
  return {
    count: marks.length,
    mode: 'marks',
    focus: (index) => {
      active?.removeAttribute(INK_MARK_ACTIVE_ATTRIBUTE);
      active = marks[index] ?? null;
      active?.setAttribute(INK_MARK_ACTIVE_ATTRIBUTE, '');
      return active;
    },
    clear: () => {
      for (const mark of marks) {
        const parent = mark.parentNode;
        if (!parent) continue;
        parent.replaceChild(mark.ownerDocument.createTextNode(mark.textContent ?? ''), mark);
        parent.normalize();
      }
      marks.length = 0;
      active = null;
    },
  };
};

/**
 * Inks text matches from `findText`. Where the browser has the CSS Custom
 * Highlight API the page is not touched at all; elsewhere the words are
 * wrapped in marks, and `clear()` takes them out again.
 *
 * @example
 * ```ts
 * const handle = inkMatches(findText(document.body, 'ghost'), { ink: 'blood' });
 * handle.focus(0);
 * // later
 * handle.clear();
 * ```
 */
export const inkMatches = (
  matches: readonly TextMatch[],
  options: { ink?: InkColor; mode?: InkMode | 'auto' } = {}
): InkHandle => {
  const { ink = 'ectoplasm', mode = 'auto' } = options;
  ensureInkStyles();
  const useHighlights = mode === 'highlight' || (mode === 'auto' && supportsHighlightApi());
  return useHighlights ? inkWithHighlights(matches, ink) : inkWithMarks(matches, ink);
};
