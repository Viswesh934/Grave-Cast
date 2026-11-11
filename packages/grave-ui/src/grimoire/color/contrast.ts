/**
 * Blending colors and checking contrast against WCAG 2.
 * @module grimoire/color/contrast
 */

import type { Rgba } from './parse';
import { srgbToLinear } from './spaces';

const CHANNEL_MAX = 255;

/** Opaque white, the default page canvas. */
export const WHITE: Rgba = Object.freeze({ r: CHANNEL_MAX, g: CHANNEL_MAX, b: CHANNEL_MAX, a: 1 });

/** Opaque black. */
export const BLACK: Rgba = Object.freeze({ r: 0, g: 0, b: 0, a: 1 });

/**
 * Paints `top` over `bottom`, the way a browser does with see-through colors.
 *
 * @example
 * ```ts
 * compositeOver({ r: 0, g: 0, b: 0, a: 0.5 }, WHITE); // mid grey
 * ```
 */
export const compositeOver = (top: Rgba, bottom: Rgba): Rgba => {
  const alpha = top.a + bottom.a * (1 - top.a);
  if (alpha === 0) return { r: 0, g: 0, b: 0, a: 0 };
  const mix = (front: number, back: number) => (front * top.a + back * bottom.a * (1 - top.a)) / alpha;
  return { r: mix(top.r, bottom.r), g: mix(top.g, bottom.g), b: mix(top.b, bottom.b), a: alpha };
};

/** WCAG 2 weights for how bright each channel looks. */
const LUMINANCE_WEIGHTS = { r: 0.2126, g: 0.7152, b: 0.0722 } as const;

/** Added to both luminances in the contrast formula, for screen flare. */
const FLARE = 0.05;

/**
 * How bright a color looks, from 0 (black) to 1 (white), as defined by WCAG 2.
 * Alpha is ignored; blend see-through colors first with {@link compositeOver}.
 */
export const relativeLuminance = (color: Rgba): number =>
  LUMINANCE_WEIGHTS.r * srgbToLinear(color.r / CHANNEL_MAX) +
  LUMINANCE_WEIGHTS.g * srgbToLinear(color.g / CHANNEL_MAX) +
  LUMINANCE_WEIGHTS.b * srgbToLinear(color.b / CHANNEL_MAX);

/**
 * The WCAG 2 contrast ratio between text and its background, from 1 (none)
 * to 21 (black on white).
 *
 * See-through colors are handled the way they look: the background is placed
 * on white if it is see-through, then the text is blended over it.
 *
 * @example
 * ```ts
 * contrastRatio(parseColor('#777')!, WHITE); // 4.47…, just under AA
 * ```
 */
export const contrastRatio = (foreground: Rgba, background: Rgba): number => {
  const solidBackground = background.a < 1 ? compositeOver(background, WHITE) : background;
  const solidForeground = foreground.a < 1 ? compositeOver(foreground, solidBackground) : foreground;
  const a = relativeLuminance(solidForeground);
  const b = relativeLuminance(solidBackground);
  return (Math.max(a, b) + FLARE) / (Math.min(a, b) + FLARE);
};

/**
 * WCAG 2 minimum contrast ratios.
 *
 * - `aa` and `aaa`: normal text
 * - `aaLarge` and `aaaLarge`: large text (see {@link isLargeText})
 * - `nonText`: icons, borders of inputs, and other visual parts of controls
 */
export const CONTRAST_THRESHOLDS = {
  aa: 4.5,
  aaa: 7,
  aaLarge: 3,
  aaaLarge: 4.5,
  nonText: 3,
} as const;

/** WCAG 2 "large text": 24px and up, or about 18.66px (14pt) and up when bold. */
export const LARGE_TEXT_PX = 24;
export const LARGE_BOLD_TEXT_PX = 18.66;
export const BOLD_FONT_WEIGHT = 700;

/** Whether text counts as large for WCAG 2, from its size in px and its weight. */
export const isLargeText = (fontSizePx: number, fontWeight: number): boolean =>
  fontSizePx >= LARGE_TEXT_PX || (fontSizePx >= LARGE_BOLD_TEXT_PX && fontWeight >= BOLD_FONT_WEIGHT);

/**
 * The best WCAG 2 level a contrast ratio meets.
 *
 * - `AAA`: enhanced contrast
 * - `AA`: the usual minimum
 * - `fail`: below the minimum
 */
export type ContrastRating = 'AAA' | 'AA' | 'fail';

/**
 * Rates a contrast ratio for normal or large text.
 *
 * @example
 * ```ts
 * rateContrast(4.6);         // 'AA'
 * rateContrast(3.2, true);   // 'AA' (large text needs only 3:1)
 * ```
 */
export const rateContrast = (ratio: number, large = false): ContrastRating => {
  const aaa = large ? CONTRAST_THRESHOLDS.aaaLarge : CONTRAST_THRESHOLDS.aaa;
  const aa = large ? CONTRAST_THRESHOLDS.aaLarge : CONTRAST_THRESHOLDS.aa;
  if (ratio >= aaa) return 'AAA';
  if (ratio >= aa) return 'AA';
  return 'fail';
};

/** Decimal places shown in a ratio. */
const RATIO_DECIMALS = 2;

/**
 * Writes a ratio for people, such as `4.49:1`. It rounds down, never up, so a
 * ratio that fails is never shown as one that passes.
 */
export const formatContrastRatio = (ratio: number): string => {
  const factor = 10 ** RATIO_DECIMALS;
  return `${(Math.floor(ratio * factor) / factor).toFixed(RATIO_DECIMALS)}:1`;
};
