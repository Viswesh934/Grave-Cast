/**
 * Collecting every color a page actually paints.
 * @module grimoire/dom/palette
 */

import { colorKey, parseColor, type ParsedColor } from '../color/parse';
import { isGrimoireNode } from './marker';

/**
 * Where a color is used.
 *
 * - `text`: the color of text the element itself shows
 * - `background`: a background color
 * - `border`: a visible border
 * - `outline`: a visible outline
 * - `fill` and `stroke`: SVG shapes
 */
export type ColorUse = 'text' | 'background' | 'border' | 'outline' | 'fill' | 'stroke';

/**
 * One color on the page, from {@link collectColors}.
 */
export interface PageColor {
  /** The rounded hex, used to group identical colors. */
  key: string;
  color: ParsedColor;
  /** How many times it is used, across every use. */
  count: number;
  /** How many times for each use. */
  uses: Partial<Record<ColorUse, number>>;
  /** Some of the elements that use it, at most `sampleSize`. */
  elements: Element[];
}

/**
 * Options for {@link collectColors}.
 */
export interface CollectColorsOptions {
  /** Which uses to count. @default every use */
  uses?: readonly ColorUse[];
  /** Stop after this many elements, to stay quick on large pages. @default PALETTE_MAX_ELEMENTS */
  maxElements?: number;
  /** Elements kept per color. @default PALETTE_SAMPLE_SIZE */
  sampleSize?: number;
  /** Count fully transparent colors too. @default false */
  includeTransparent?: boolean;
}

/**
 * The result of {@link collectColors}.
 */
export interface PagePalette {
  /** Every color, most used first. */
  colors: PageColor[];
  /** How many elements were looked at. */
  scanned: number;
  /** `true` when `maxElements` was reached before the end of the page. */
  truncated: boolean;
}

/** Default limit on elements scanned. */
export const PALETTE_MAX_ELEMENTS = 5000;

/** Default number of example elements kept per color. */
export const PALETTE_SAMPLE_SIZE = 12;

const ALL_USES: readonly ColorUse[] = ['text', 'background', 'border', 'outline', 'fill', 'stroke'];
const SIDES = ['top', 'right', 'bottom', 'left'] as const;
const SVG_SHAPES = new Set(['path', 'circle', 'rect', 'ellipse', 'line', 'polyline', 'polygon', 'text', 'tspan']);
const SKIPPED_TAGS = new Set(['script', 'style', 'noscript', 'template', 'head', 'meta', 'link', 'title']);

/** `true` when the element shows text of its own, so its text color is really painted. */
const hasOwnText = (element: Element): boolean =>
  [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== '');

/**
 * Lists every color a page actually paints and how often: text colors only
 * where an element has its own text (not inherited colors nobody sees),
 * backgrounds that are not transparent, and only borders and outlines that
 * are drawn. Hidden elements are skipped, and so are Grimoire's overlays.
 *
 * Colors written in any CSS syntax are brought into sRGB and grouped by how
 * they look, so `#fff`, `white`, and `rgb(255 255 255)` count as one.
 *
 * Shadows, gradients, and images are not included.
 *
 * @example
 * ```ts
 * const { colors } = collectColors(document.body);
 * colors.slice(0, 8).forEach(({ key, count }) => console.log(key, count));
 * ```
 */
export const collectColors = (root: Element = document.body, options: CollectColorsOptions = {}): PagePalette => {
  const {
    uses = ALL_USES,
    maxElements = PALETTE_MAX_ELEMENTS,
    sampleSize = PALETTE_SAMPLE_SIZE,
    includeTransparent = false,
  } = options;
  const wanted = new Set(uses);
  const found = new Map<string, PageColor>();

  const record = (value: string, use: ColorUse, element: Element, seen: Set<string>) => {
    const color = parseColor(value);
    if (!color || (!includeTransparent && color.a === 0)) return;
    const key = colorKey(color);
    let entry = found.get(key);
    if (!entry) {
      entry = { key, color, count: 0, uses: {}, elements: [] };
      found.set(key, entry);
    }
    entry.count += 1;
    entry.uses[use] = (entry.uses[use] ?? 0) + 1;
    if (!seen.has(key) && entry.elements.length < sampleSize) entry.elements.push(element);
    seen.add(key);
  };

  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      const element = node as Element;
      if (SKIPPED_TAGS.has(element.localName) || isGrimoireNode(element)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let scanned = 0;
  let truncated = false;
  for (let node: Node | null = root.matches?.(':not(script)') ? root : walker.nextNode(); node; node = walker.nextNode()) {
    if (scanned >= maxElements) {
      truncated = true;
      break;
    }
    const element = node as Element;
    if (isGrimoireNode(element)) continue;
    const style = getComputedStyle(element);
    if (style.display === 'none') continue;
    scanned += 1;
    if (style.visibility === 'hidden' || style.visibility === 'collapse') continue;

    const seen = new Set<string>();
    if (wanted.has('text') && hasOwnText(element)) record(style.color, 'text', element, seen);
    if (wanted.has('background')) record(style.backgroundColor, 'background', element, seen);
    if (wanted.has('border')) {
      const borderColors = new Set<string>();
      for (const side of SIDES) {
        const width = parseFloat(style.getPropertyValue(`border-${side}-width`)) || 0;
        const lineStyle = style.getPropertyValue(`border-${side}-style`);
        if (width > 0 && lineStyle !== 'none' && lineStyle !== 'hidden') borderColors.add(style.getPropertyValue(`border-${side}-color`));
      }
      borderColors.forEach((value) => record(value, 'border', element, seen));
    }
    if (wanted.has('outline')) {
      const width = parseFloat(style.outlineWidth) || 0;
      if (width > 0 && style.outlineStyle && style.outlineStyle !== 'none') record(style.outlineColor, 'outline', element, seen);
    }
    if (SVG_SHAPES.has(element.localName)) {
      if (wanted.has('fill') && style.fill && !style.fill.startsWith('url(')) record(style.fill, 'fill', element, seen);
      if (wanted.has('stroke') && style.stroke && style.stroke !== 'none' && !style.stroke.startsWith('url(')) {
        record(style.stroke, 'stroke', element, seen);
      }
    }
  }

  const colors = [...found.values()].sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
  return { colors, scanned, truncated };
};
