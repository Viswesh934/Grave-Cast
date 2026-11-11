/**
 * Converting pixels to text.
 *
 * Pure functions with no DOM dependency, so they work on canvas data, video
 * frames, or any RGBA buffer, and can be tested in Node.
 *
 * @module ascii/convert
 */

import { resolveRamp, type RampName } from './ramps';

/**
 * How tall a text character is compared with how wide, as a ratio of width to
 * height. Characters are taller than wide, so a picture must be squashed to
 * look right in text.
 */
export const ASCII_CHAR_ASPECT = 0.5;

/** Rec. 709 weights for turning red, green, and blue into brightness. */
const LUMA = { r: 0.2126, g: 0.7152, b: 0.0722 } as const;

/** Largest value of an 8-bit color channel. */
const CHANNEL_MAX = 255;

/** Midpoint that contrast pivots around. */
const MIDPOINT = 0.5;

/**
 * Options for turning pixels into text.
 */
export interface AsciiConvertOptions {
  /** A built-in ramp name or your own characters, darkest first. @default 'standard' */
  ramp?: RampName | string;
  /** Flip the ramp, for dark text on a light background. @default false */
  invert?: boolean;
  /** Stretches (above 1) or flattens (below 1) the range of brightness. @default 1 */
  contrast?: number;
  /** Adds to brightness, from -1 (darker) to 1 (brighter). @default 0 */
  brightness?: number;
}

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/**
 * Brightness of one pixel from 0 to 1. Transparent pixels count as dark, so
 * an image with a transparent background shows only its shape.
 */
export const lumaOf = (r: number, g: number, b: number, a: number = CHANNEL_MAX): number =>
  ((LUMA.r * r + LUMA.g * g + LUMA.b * b) / CHANNEL_MAX) * (a / CHANNEL_MAX);

/**
 * Works out the text grid for a picture so it keeps its shape.
 *
 * @param sourceWidth - Width of the picture in any unit.
 * @param sourceHeight - Height of the picture in the same unit.
 * @param cols - Number of characters across.
 * @param charAspect - Width over height of one character. @default 0.5
 */
export const fitAsciiSize = (
  sourceWidth: number,
  sourceHeight: number,
  cols: number,
  charAspect: number = ASCII_CHAR_ASPECT
): { cols: number; rows: number } => {
  const safeCols = Math.max(1, Math.round(cols));
  if (!(sourceWidth > 0) || !(sourceHeight > 0)) return { cols: safeCols, rows: 1 };
  return { cols: safeCols, rows: Math.max(1, Math.round((safeCols * sourceHeight * charAspect) / sourceWidth)) };
};

/**
 * Turns RGBA pixels into lines of text.
 *
 * @param data - RGBA bytes, four per pixel, row by row (as from `ImageData`).
 * @param width - Pixels per row.
 * @param height - Number of rows.
 * @returns One string per row, each `width` characters long.
 *
 * @example
 * ```ts
 * const { data } = ctx.getImageData(0, 0, 80, 40);
 * const lines = pixelsToAscii(data, 80, 40, { ramp: 'blocks' });
 * ```
 */
export const pixelsToAscii = (
  data: ArrayLike<number>,
  width: number,
  height: number,
  options: AsciiConvertOptions = {}
): string[] => {
  const { ramp = 'standard', invert = false, contrast = 1, brightness = 0 } = options;
  const characters = resolveRamp(ramp);
  const last = characters.length - 1;

  const lines: string[] = [];
  for (let y = 0; y < height; y += 1) {
    let line = '';
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      let value = lumaOf(data[i], data[i + 1], data[i + 2], data[i + 3]);
      value = clamp01((value - MIDPOINT) * contrast + MIDPOINT + brightness);
      if (invert) value = 1 - value;
      line += characters[Math.round(value * last)];
    }
    lines.push(line);
  }
  return lines;
};
