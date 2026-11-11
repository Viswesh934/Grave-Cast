/**
 * Reading and writing CSS colors.
 * @module grimoire/color/parse
 */

import { namedColorHex } from './named';
import {
  displayP3ToSrgb,
  hslToSrgb,
  hwbToSrgb,
  labToSrgb,
  lchToSrgb,
  linearSrgbToSrgb,
  oklabToSrgb,
  oklchToSrgb,
  rec2020ToSrgb,
  xyzD50ToSrgb,
  xyzD65ToSrgb,
  type Triple,
} from './spaces';

/**
 * An sRGB color. Channels are 0-255 (not rounded) and alpha is 0-1.
 */
export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * A parsed color, with a note on whether it had to be pulled into sRGB.
 */
export interface ParsedColor extends Rgba {
  /**
   * `true` when the original color was outside what sRGB can show (common
   * with vivid `oklch()` or `display-p3` colors) and was clipped to fit.
   */
  clipped: boolean;
}

const CHANNEL_MAX = 255;
const PERCENT = 100;
const DEGREES_PER_TURN = 360;
const HEX_RADIX = 16;
const BYTE_HEX_DIGITS = 2;

/** Units an angle may be written in, as degrees per unit. */
const DEGREES_PER_UNIT: Record<string, number> = {
  deg: 1,
  grad: DEGREES_PER_TURN / 400,
  rad: 180 / Math.PI,
  turn: DEGREES_PER_TURN,
};

/** What 100% means for each axis of the Lab-style spaces (CSS Color 4). */
const PERCENT_REFERENCE = {
  labAxis: 125,
  lchChroma: 150,
  oklabLightness: 1,
  oklabAxis: 0.4,
  oklchChroma: 0.4,
} as const;

/**
 * How far outside 0-1 a channel may be before it counts as clipped: half a
 * step of 8-bit color, which nobody can see. Colors written to a few
 * decimals often land just outside sRGB from rounding alone.
 */
const GAMUT_TOLERANCE = 0.5 / CHANNEL_MAX;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

/** A plain number, a percentage (0-1 scaled to `percentOf`), or `none` (0). */
const readNumber = (token: string, percentOf = 1): number | null => {
  if (token === 'none') return 0;
  const percent = token.endsWith('%');
  const value = Number(percent ? token.slice(0, -1) : token);
  if (!Number.isFinite(value) || token === '') return null;
  return percent ? (value / PERCENT) * percentOf : value;
};

/** An angle in degrees, from a bare number or any CSS angle unit. */
const readHue = (token: string): number | null => {
  if (token === 'none') return 0;
  const match = /^(-?[\d.]+(?:e-?\d+)?)([a-z]*)$/.exec(token);
  if (!match) return null;
  const perUnit = match[2] === '' ? 1 : DEGREES_PER_UNIT[match[2]];
  const value = Number(match[1]);
  if (perUnit === undefined || !Number.isFinite(value)) return null;
  return (((value * perUnit) % DEGREES_PER_TURN) + DEGREES_PER_TURN) % DEGREES_PER_TURN;
};

/** Alpha from a number or percentage, clamped to 0-1. Missing means opaque. */
const readAlpha = (token: string | undefined): number | null => {
  if (token === undefined) return 1;
  const value = readNumber(token);
  return value === null ? null : clamp(value, 0, 1);
};

/**
 * Splits function arguments in either syntax: `1, 2, 3, 0.5` or `1 2 3 / 0.5`.
 * Returns the channels and the alpha token.
 */
const splitArguments = (body: string): { channels: string[]; alpha: string | undefined } | null => {
  if (body.includes(',')) {
    const parts = body.split(',').map((part) => part.trim());
    if (parts.length < 3 || parts.length > 4 || parts.some((part) => part === '')) return null;
    return { channels: parts.slice(0, 3), alpha: parts[3] };
  }
  const [main, alpha, extra] = body.split('/').map((part) => part.trim());
  if (extra !== undefined || alpha === '') return null;
  const channels = main.split(/\s+/).filter(Boolean);
  return { channels, alpha };
};

/** Turns 0-1 channels into a parsed color, clipping anything sRGB cannot show. */
const fromUnit = ([r, g, b]: Triple, a: number): ParsedColor => {
  const clipped = [r, g, b].some((value) => value < -GAMUT_TOLERANCE || value > 1 + GAMUT_TOLERANCE);
  return {
    r: clamp(r, 0, 1) * CHANNEL_MAX,
    g: clamp(g, 0, 1) * CHANNEL_MAX,
    b: clamp(b, 0, 1) * CHANNEL_MAX,
    a,
    clipped,
  };
};

const parseHex = (hex: string): ParsedColor | null => {
  if (!/^[0-9a-f]+$/.test(hex) || ![3, 4, 6, 8].includes(hex.length)) return null;
  const full = hex.length <= 4 ? [...hex].map((digit) => digit + digit).join('') : hex;
  const byte = (index: number) => parseInt(full.slice(index * BYTE_HEX_DIGITS, (index + 1) * BYTE_HEX_DIGITS), HEX_RADIX);
  const alpha = full.length === 8 ? byte(3) / CHANNEL_MAX : 1;
  return { r: byte(0), g: byte(1), b: byte(2), a: alpha, clipped: false };
};

/** Spaces accepted inside `color(…)`, each with its conversion to sRGB. */
const COLOR_FUNCTION_SPACES: Partial<Record<string, (channels: Triple) => Triple>> = {
  srgb: (channels) => channels,
  'srgb-linear': linearSrgbToSrgb,
  'display-p3': displayP3ToSrgb,
  rec2020: rec2020ToSrgb,
  xyz: xyzD65ToSrgb,
  'xyz-d65': xyzD65ToSrgb,
  'xyz-d50': xyzD50ToSrgb,
};

const parseFunction = (name: string, body: string): ParsedColor | null => {
  if (name === 'color') {
    const [space, ...rest] = body.trim().split(/\s+/);
    const convert = COLOR_FUNCTION_SPACES[space];
    const args = convert ? splitArguments(rest.join(' ')) : null;
    if (!convert || !args || args.channels.length !== 3) return null;
    const channels = args.channels.map((token) => readNumber(token));
    const alpha = readAlpha(args.alpha);
    if (channels.some((value) => value === null) || alpha === null) return null;
    return fromUnit(convert(channels as unknown as Triple), alpha);
  }

  const args = splitArguments(body);
  if (!args || args.channels.length !== 3) return null;
  const alpha = readAlpha(args.alpha);
  if (alpha === null) return null;
  const [first, second, third] = args.channels;

  switch (name) {
    case 'rgb':
    case 'rgba': {
      const channels = [first, second, third].map((token) => readNumber(token, CHANNEL_MAX));
      if (channels.some((value) => value === null)) return null;
      const [r, g, b] = channels as number[];
      return fromUnit([r / CHANNEL_MAX, g / CHANNEL_MAX, b / CHANNEL_MAX], alpha);
    }
    case 'hsl':
    case 'hsla':
    case 'hwb': {
      const hue = readHue(first);
      // Percent and bare numbers both mean 0-100 here.
      const x = readNumber(second.endsWith('%') ? second : `${second}%`);
      const y = readNumber(third.endsWith('%') ? third : `${third}%`);
      if (hue === null || x === null || y === null) return null;
      const rgb = name === 'hwb' ? hwbToSrgb(hue, clamp(x, 0, 1), clamp(y, 0, 1)) : hslToSrgb(hue, clamp(x, 0, 1), clamp(y, 0, 1));
      return fromUnit(rgb, alpha);
    }
    case 'lab':
    case 'oklab': {
      const ok = name === 'oklab';
      const l = readNumber(first, ok ? PERCENT_REFERENCE.oklabLightness : PERCENT);
      const a = readNumber(second, ok ? PERCENT_REFERENCE.oklabAxis : PERCENT_REFERENCE.labAxis);
      const b = readNumber(third, ok ? PERCENT_REFERENCE.oklabAxis : PERCENT_REFERENCE.labAxis);
      if (l === null || a === null || b === null) return null;
      return fromUnit(ok ? oklabToSrgb([l, a, b]) : labToSrgb([l, a, b]), alpha);
    }
    case 'lch':
    case 'oklch': {
      const ok = name === 'oklch';
      const l = readNumber(first, ok ? PERCENT_REFERENCE.oklabLightness : PERCENT);
      const c = readNumber(second, ok ? PERCENT_REFERENCE.oklchChroma : PERCENT_REFERENCE.lchChroma);
      const h = readHue(third);
      if (l === null || c === null || h === null) return null;
      return fromUnit(ok ? oklchToSrgb([l, Math.max(0, c), h]) : lchToSrgb([l, Math.max(0, c), h]), alpha);
    }
    default:
      return null;
  }
};

/**
 * Reads any CSS color into sRGB: hex, names, `rgb()`, `hsl()`, `hwb()`,
 * `lab()`, `lch()`, `oklab()`, `oklch()`, and `color()` in the `srgb`,
 * `srgb-linear`, `display-p3`, `rec2020`, and `xyz` spaces.
 *
 * Returns `null` for anything it cannot turn into one fixed color, such as
 * `currentcolor`, system colors, `var(…)`, or `color-mix(…)`. Values read
 * from `getComputedStyle` are already resolved, so those rarely appear.
 *
 * @example
 * ```ts
 * parseColor('#8b5cf6');                // { r: 139, g: 92, b: 246, a: 1, clipped: false }
 * parseColor('oklch(70% 0.25 300)');    // brought into sRGB, clipped: true if it was too vivid
 * parseColor(getComputedStyle(el).color);
 * ```
 */
export const parseColor = (input: string): ParsedColor | null => {
  const text = input.trim().toLowerCase();
  if (text === '') return null;
  if (text === 'transparent') return { r: 0, g: 0, b: 0, a: 0, clipped: false };
  if (text.startsWith('#')) return parseHex(text.slice(1));

  const named = namedColorHex(text);
  if (named) return parseHex(named);

  const match = /^([a-z0-9-]+)\((.*)\)$/s.exec(text);
  return match ? parseFunction(match[1], match[2]) : null;
};

const toHexByte = (value: number): string =>
  Math.round(clamp(value, 0, CHANNEL_MAX)).toString(HEX_RADIX).padStart(BYTE_HEX_DIGITS, '0');

/**
 * Writes a color as hex: `#rrggbb`, or `#rrggbbaa` when it is see-through.
 *
 * @example
 * ```ts
 * formatHex({ r: 139, g: 92, b: 246, a: 1 });   // '#8b5cf6'
 * formatHex({ r: 0, g: 0, b: 0, a: 0.5 });       // '#00000080'
 * ```
 */
export const formatHex = (color: Rgba): string => {
  const base = `#${toHexByte(color.r)}${toHexByte(color.g)}${toHexByte(color.b)}`;
  const alpha = Math.round(clamp(color.a, 0, 1) * CHANNEL_MAX);
  return alpha === CHANNEL_MAX ? base : `${base}${toHexByte(alpha)}`;
};

/** Decimal places kept for alpha in text output. */
const ALPHA_DECIMALS = 3;

/** Writes a color as modern CSS `rgb(r g b)` or `rgb(r g b / a)`. */
export const formatRgb = (color: Rgba): string => {
  const [r, g, b] = [color.r, color.g, color.b].map((value) => Math.round(clamp(value, 0, CHANNEL_MAX)));
  const alpha = Number(clamp(color.a, 0, 1).toFixed(ALPHA_DECIMALS));
  return alpha === 1 ? `rgb(${r} ${g} ${b})` : `rgb(${r} ${g} ${b} / ${alpha})`;
};

/**
 * A color as hue (degrees), saturation (0-100), and lightness (0-100).
 */
export interface Hsl {
  h: number;
  s: number;
  l: number;
}

/** Hue sectors of the color wheel, in degrees. */
const HUE_SECTOR_DEGREES = 60;
const HUE_SECTORS = 6;

/** Converts a color to HSL, for showing people or sorting a palette by hue. */
export const toHsl = (color: Rgba): Hsl => {
  const r = color.r / CHANNEL_MAX;
  const g = color.g / CHANNEL_MAX;
  const b = color.b / CHANNEL_MAX;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const delta = max - min;
  if (delta === 0) return { h: 0, s: 0, l: lightness * PERCENT };

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let sector: number;
  if (max === r) sector = ((g - b) / delta) % HUE_SECTORS;
  else if (max === g) sector = (b - r) / delta + 2;
  else sector = (r - g) / delta + 4;
  const hue = (sector * HUE_SECTOR_DEGREES + DEGREES_PER_TURN) % DEGREES_PER_TURN;
  return { h: hue, s: saturation * PERCENT, l: lightness * PERCENT };
};

/** Writes a color as CSS `hsl(h s% l%)`, rounded for reading. */
export const formatHsl = (color: Rgba): string => {
  const { h, s, l } = toHsl(color);
  const alpha = Number(clamp(color.a, 0, 1).toFixed(ALPHA_DECIMALS));
  const body = `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
  return alpha === 1 ? `hsl(${body})` : `hsl(${body} / ${alpha})`;
};

/**
 * A stable key for grouping colors that look the same: the rounded hex.
 * Two colors with the same key are the same on screen.
 */
export const colorKey = (color: Rgba): string => formatHex(color);
