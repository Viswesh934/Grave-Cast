/**
 * Finding the color behind an element, and the contrast of its text.
 * @module grimoire/dom/background
 */

import { WHITE, compositeOver, contrastRatio, isLargeText, rateContrast, type ContrastRating } from '../color/contrast';
import { parseColor, type Rgba } from '../color/parse';

/**
 * Why a background reading might not match what is on screen.
 *
 * - `image`: a background image or gradient is involved
 * - `media`: the element itself is an image, video, or canvas
 * - `positioned`: positioned elements may sit over things that are not their parents
 * - `opacity`: something is partly see-through, which blends with what is behind it
 * - `filter`: a filter or backdrop filter changes the colors
 * - `blend`: a blend mode mixes the colors
 * - `scheme`: the page is in dark mode with no background, so the browser's dark canvas was assumed
 */
export type BackgroundDoubt = 'image' | 'media' | 'positioned' | 'opacity' | 'filter' | 'blend' | 'scheme';

/**
 * The color behind an element, from {@link effectiveBackground}.
 */
export interface BackgroundReading {
  /** The solid color behind the element's content. */
  color: Rgba;
  /** `true` when nothing below suggests the screen looks different. */
  certain: boolean;
  /** What could make the screen look different. Empty when `certain`. */
  doubts: BackgroundDoubt[];
  /** The nearest element with a solid background, or `null` if the page canvas showed through. */
  source: Element | null;
}

/** The browser's page color in dark mode, when the page sets none (Chrome and Firefox use this). */
export const DARK_CANVAS: Rgba = Object.freeze({ r: 18, g: 18, b: 18, a: 1 });

const MEDIA_TAGS = new Set(['img', 'video', 'canvas', 'picture', 'iframe', 'svg', 'object', 'embed']);
const POSITIONED = new Set(['absolute', 'fixed', 'sticky']);

/** The page canvas: white, or dark when the root asks only for dark mode. */
const canvasFor = (element: Element, doubts: Set<BackgroundDoubt>): Rgba => {
  const root = element.ownerDocument.documentElement;
  const scheme = getComputedStyle(root).colorScheme ?? '';
  if (scheme.includes('dark') && !scheme.includes('light')) {
    doubts.add('scheme');
    return DARK_CANVAS;
  }
  return WHITE;
};

/**
 * Works out the solid color an element's content is drawn on, by blending
 * its own and its ancestors' background colors until one is opaque, then
 * the page canvas.
 *
 * Browsers do not say what is visually behind an element, so this is an
 * estimate. When images, gradients, positioned layers, transparency,
 * filters, or blend modes are involved, `certain` is `false` and `doubts`
 * says why, so interfaces can say "about" instead of stating it as fact.
 *
 * @example
 * ```ts
 * const { color, certain } = effectiveBackground(heading);
 * ```
 */
export const effectiveBackground = (element: Element): BackgroundReading => {
  const doubts = new Set<BackgroundDoubt>();
  const layers: Rgba[] = [];
  let source: Element | null = null;

  if (MEDIA_TAGS.has(element.localName)) doubts.add('media');

  for (let current: Element | null = element; current; current = current.parentElement) {
    const style = getComputedStyle(current);
    if (style.backgroundImage && style.backgroundImage !== 'none') doubts.add('image');
    if (POSITIONED.has(style.position)) doubts.add('positioned');
    if (style.opacity !== '' && parseFloat(style.opacity) < 1) doubts.add('opacity');
    if ((style.filter && style.filter !== 'none') || (style.backdropFilter && style.backdropFilter !== 'none')) doubts.add('filter');
    if (style.mixBlendMode && style.mixBlendMode !== 'normal') doubts.add('blend');

    const background = parseColor(style.backgroundColor);
    if (background && background.a > 0) {
      layers.push(background);
      if (background.a >= 1) {
        source = current;
        break;
      }
    }
  }

  let color = source ? { r: 0, g: 0, b: 0, a: 0 } : canvasFor(element, doubts);
  for (let index = layers.length - 1; index >= 0; index -= 1) color = compositeOver(layers[index], color);

  return { color: { ...color, a: 1 }, certain: doubts.size === 0, doubts: [...doubts], source };
};

/**
 * The contrast of an element's text against what is behind it.
 */
export interface TextContrast {
  /** The text color as drawn (its own transparency blended in). */
  foreground: Rgba;
  background: BackgroundReading;
  /** The WCAG 2 contrast ratio. */
  ratio: number;
  /** The best WCAG 2 level it meets, for its size. */
  rating: ContrastRating;
  /** `true` when the text is large enough for the lower large-text thresholds. */
  large: boolean;
  /** Same as `background.certain`. */
  certain: boolean;
}

const NORMAL_FONT_WEIGHT = 400;
const BOLD_FONT_WEIGHT_KEYWORD = 700;

/**
 * Checks an element's text color against its background, using its font
 * size and weight to pick the right WCAG 2 threshold.
 *
 * @example
 * ```ts
 * const { ratio, rating, certain } = textContrast(paragraph);
 * label.textContent = `${formatContrastRatio(ratio)} ${rating}${certain ? '' : ' (estimate)'}`;
 * ```
 */
export const textContrast = (element: Element): TextContrast => {
  const style = getComputedStyle(element);
  const background = effectiveBackground(element);
  const text = parseColor(style.color) ?? { r: 0, g: 0, b: 0, a: 1, clipped: false };
  const foreground = compositeOver(text, background.color);

  const size = parseFloat(style.fontSize) || 0;
  const weight =
    style.fontWeight === 'bold' || style.fontWeight === 'bolder'
      ? BOLD_FONT_WEIGHT_KEYWORD
      : Number(style.fontWeight) || NORMAL_FONT_WEIGHT;
  const large = isLargeText(size, weight);
  const ratio = contrastRatio(foreground, background.color);

  return { foreground, background, ratio, rating: rateContrast(ratio, large), large, certain: background.certain };
};
