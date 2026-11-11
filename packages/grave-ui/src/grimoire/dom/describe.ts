/**
 * Describing an element: where it is, its box model, and how it is styled.
 * @module grimoire/dom/describe
 */

import { parseColor, type ParsedColor } from '../color/parse';
import { expandRect, shrinkRect, toBoxRect, type BoxRect, type BoxSides } from './geometry';
import { isGrimoireNode } from './marker';
import { cssPath, shortSelector } from './selector';

/** Most characters of an element's text kept in a description. */
export const DESCRIBE_TEXT_LIMIT = 80;

/** The weight `normal` means, for fonts reported as a keyword. */
const NORMAL_FONT_WEIGHT = 400;
const BOLD_FONT_WEIGHT_KEYWORD = 700;

/**
 * The four nested boxes of the CSS box model, as viewport rectangles.
 */
export interface BoxModelRects {
  /** Outside edge of the margin. */
  margin: BoxRect;
  /** Outside edge of the border: what `getBoundingClientRect` returns. */
  border: BoxRect;
  /** Inside edge of the border. */
  padding: BoxRect;
  /** Inside edge of the padding: where content goes. */
  content: BoxRect;
}

/**
 * Everything worth showing about one element.
 */
export interface ElementDescription {
  element: Element;
  /** Tag name in lower case, such as `button`. */
  tag: string;
  id: string | null;
  classes: string[];
  /** A short label for people, such as `button#save`. */
  label: string;
  /** A selector that finds this element again. */
  selector: string;
  /** Margin, border, and padding widths. */
  box: { margin: BoxSides; border: BoxSides; padding: BoxSides };
  /** The four nested boxes, ready to draw. */
  rects: BoxModelRects;
  display: string;
  position: string;
  /** `auto` or a number as text, as CSS reports it. */
  zIndex: string;
  opacity: number;
  /** `false` when hidden by `display`, `visibility`, zero opacity, or zero size. */
  visible: boolean;
  font: { family: string; sizePx: number; weight: number; lineHeight: string };
  /** Text color, or `null` if it could not be read. */
  color: ParsedColor | null;
  /** The element's own background color (not what shows through it). */
  backgroundColor: ParsedColor | null;
  /** The explicit `role`, if any. */
  role: string | null;
  /** The start of its text, trimmed, for recognizing it. */
  text: string;
}

const px = (value: string): number => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Reads one box-model property's four sides from computed style. */
const readSides = (style: CSSStyleDeclaration, property: 'margin' | 'padding' | 'border'): BoxSides => {
  const read = (side: keyof BoxSides) =>
    px(style.getPropertyValue(property === 'border' ? `border-${side}-width` : `${property}-${side}`));
  return { top: read('top'), right: read('right'), bottom: read('bottom'), left: read('left') };
};

/** Turns `bold`, `normal`, or `600` into a number. */
const readWeight = (value: string): number => {
  if (value === 'bold' || value === 'bolder') return BOLD_FONT_WEIGHT_KEYWORD;
  const weight = Number(value);
  return Number.isFinite(weight) && value !== '' ? weight : NORMAL_FONT_WEIGHT;
};

/** The first font family, without quotes. */
const firstFamily = (value: string): string => value.split(',')[0]?.trim().replace(/^["']|["']$/g, '') ?? '';

/** The element's text, collapsed and shortened. */
const snippet = (element: Element): string => {
  const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim();
  return text.length > DESCRIBE_TEXT_LIMIT ? `${text.slice(0, DESCRIBE_TEXT_LIMIT - 1)}…` : text;
};

/**
 * Describes an element: its box model as drawable rectangles, its layout and
 * font, its colors, and a selector to find it again.
 *
 * Margins can be negative; the margin rectangle follows them.
 *
 * @example
 * ```ts
 * const { label, rects, font } = describeElement(event.target as Element);
 * drawBox(rects.margin, inspectorFills.margin);
 * ```
 */
export const describeElement = (element: Element): ElementDescription => {
  const style = getComputedStyle(element);
  const margin = readSides(style, 'margin');
  const border = readSides(style, 'border');
  const padding = readSides(style, 'padding');
  const borderRect = toBoxRect(element.getBoundingClientRect());
  const paddingRect = shrinkRect(borderRect, border);

  const opacity = style.opacity === '' ? 1 : px(style.opacity);
  const visible =
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.visibility !== 'collapse' &&
    opacity > 0 &&
    borderRect.width > 0 &&
    borderRect.height > 0;

  return {
    element,
    tag: element.localName || element.tagName.toLowerCase(),
    id: element.id || null,
    classes: [...element.classList],
    label: shortSelector(element),
    selector: cssPath(element),
    box: { margin, border, padding },
    rects: {
      margin: expandRect(borderRect, margin),
      border: borderRect,
      padding: paddingRect,
      content: shrinkRect(paddingRect, padding),
    },
    display: style.display,
    position: style.position,
    zIndex: style.zIndex || 'auto',
    opacity,
    visible,
    font: {
      family: firstFamily(style.fontFamily),
      sizePx: px(style.fontSize),
      weight: readWeight(style.fontWeight),
      lineHeight: style.lineHeight,
    },
    color: parseColor(style.color),
    backgroundColor: parseColor(style.backgroundColor),
    role: element.getAttribute('role'),
    text: snippet(element),
  };
};

/**
 * Every element under a point, from the top of the stack down, without
 * Grimoire's own overlays. Uses `document.elementsFromPoint`.
 *
 * @example
 * ```ts
 * const [top, ...beneath] = elementsAt(event.clientX, event.clientY);
 * ```
 */
export const elementsAt = (x: number, y: number, root: Document = document): Element[] => {
  if (typeof root.elementsFromPoint !== 'function') return [];
  return root.elementsFromPoint(x, y).filter((element) => !isGrimoireNode(element));
};

/** The top element under a point, skipping Grimoire's own overlays. */
export const elementAt = (x: number, y: number, root: Document = document): Element | null => elementsAt(x, y, root)[0] ?? null;
