/**
 * HorrorBackground component tokens.
 *
 * Every color comes from the shared palette. Sizes, counts, and timings are
 * component-specific and named here so the layers hold no raw numbers.
 *
 * @module components/effects/HorrorBackground/tokens
 */

import { palette } from '../../../tokens/colors';
import type { HorrorIntensity } from '../../../tokens/types';

/**
 * The available backdrops.
 */
export type HorrorBackgroundVariant =
  | 'fog'
  | 'storm'
  | 'ritual-circle'
  | 'blizzard'
  | 'candlelit'
  | 'hypnotic';

/** Default stacking order. Behind its container; the container needs `isolation: isolate`. */
export const BACKGROUND_Z_INDEX = -1;

/** CSS class on the background root. */
export const BACKGROUND_CLASS = 'grave-bg';

/**
 * How strongly each intensity plays a backdrop.
 */
export interface BackgroundIntensityToken {
  /** Overall opacity of the backdrop. */
  opacity: number;
  /** Animation speed multiplier. */
  speed: number;
  /** Particle density multiplier, for snow. */
  density: number;
}

export const intensityTokens: Record<HorrorIntensity, BackgroundIntensityToken> = {
  ghastly: { opacity: 0.55, speed: 0.7, density: 0.5 },
  cursed: { opacity: 0.8, speed: 1, density: 1 },
  abyssal: { opacity: 1, speed: 1.4, density: 1.7 },
};

export const backgroundColors = {
  fog: palette.mist[300],
  rain: palette.mist[200],
  lightning: palette.bone[100],
  stormSky: { top: palette.dark[950], bottom: palette.dark[800] },
  ritual: palette.sanguine.crimson,
  snow: palette.bone[100],
  snowSky: { top: palette.dark[900], bottom: palette.dark[700] },
  candle: palette.witch.gold,
  vignette: palette.dark[950],
  hypnotic: {
    primary: palette.witch.fire,
    secondary: palette.sanguine.crimson,
    base: palette.dark[800],
    edge: palette.dark[950],
  },
} as const;

// Lives in the shared color tokens now; re-exported so existing imports keep working.
export { withAlpha } from '../../../tokens/colors';

export const fogTokens = {
  /** How opaque the fog color is inside each blob, in percent. */
  blobStrength: 55,
  /** Soft blobs repeated across each bank, positioned in percent of one tile. */
  blobs: [
    { x: 25, y: 50, reach: 60 },
    { x: 75, y: 40, reach: 55 },
  ],
  /** Three drifting banks. Durations are seconds for one full slide. */
  layers: [
    { top: '0%', height: '60%', duration: 70, opacity: 0.35, reverse: false },
    { top: '30%', height: '70%', duration: 110, opacity: 0.5, reverse: true },
    { top: '55%', height: '55%', duration: 150, opacity: 0.4, reverse: false },
  ],
} as const;

export const stormTokens = {
  /** Seconds between lightning strikes. */
  flashPeriod: 9,
  /** How strong the sky flash is, in percent of the lightning color. */
  flashStrength: 30,
  /** Rain is drawn as two layers at different speeds and densities. */
  rain: {
    /** Height of one streak and of one repeat, in px. */
    streak: 40,
    tile: 130,
    /** Tilt of the rain, in degrees, and how far the layer overshoots its box, in percent. */
    angle: 10,
    overshoot: -25,
    layers: [
      { spacing: 23, duration: 0.7, opacity: 0.5 },
      { spacing: 41, duration: 1.1, opacity: 0.3 },
    ],
  },
  bolt: { left: '68%', width: '14%', height: '70%' },
} as const;

export const ritualTokens = {
  /** Seconds for one turn of the outer and inner rings, and one glow pulse. */
  outerSpin: 140,
  innerSpin: 100,
  pulse: 5,
  /** Blur radius of the glow, in px. */
  glow: 6,
  /** Ring radii in a 200 by 200 drawing. */
  rings: [95, 91],
  tickInner: 82,
  tickOuter: 88,
  tickCount: 48,
  /** Every nth tick is longer. */
  longTickEvery: 4,
  longTickExtra: 4,
  runeRadius: 76,
  runeCount: 12,
  starRadius: 68,
  innerRing: 70,
  core: 28,
  strokeWidth: 0.4,
} as const;

export const candleTokens = {
  /** Seconds for each glow's flicker cycle, and the second glow's head start. */
  primaryFlicker: 4.3,
  secondaryFlicker: 6.1,
  secondaryOffset: -2.4,
  /** Glow strength in percent of the candle color. */
  primaryStrength: 45,
  secondaryStrength: 32,
  /** Glow shapes: center and size in percent of the box, and where it fades out. */
  primary: { x: 50, y: 105, width: 60, height: 55, reach: 70 },
  secondary: { x: 18, y: 100, width: 40, height: 42, reach: 70 },
  /** Vignette: center height, how much of the middle stays clear, and edge opacity, in percent. */
  vignette: { y: 55, clear: 30, strength: 92 },
} as const;

/**
 * The hypnotic backdrop is deliberately slow and low in contrast. Fast,
 * high-contrast spirals can trigger discomfort in people who are sensitive to
 * flashing or motion, so nothing here strobes, and everything stops under
 * `prefers-reduced-motion`.
 */
export const hypnoticTokens = {
  /** Where the dark edge of the base gradient is reached, in percent. */
  baseReach: 75,
  /** How far the spoke layers overshoot the box so rotation never shows corners, in percent. */
  spokeOvershoot: -50,
  /** Radial mask on the spokes: clear center, solid band, and where they fade out, in percent. */
  mask: { clear: 4, solid: 30, fade: 70 },
  /** Two spoke patterns turning opposite ways to make a moire shimmer. Step is degrees per stripe. */
  spokes: [
    { tone: 'primary', step: 9, strength: 35, duration: 90, reverse: false },
    { tone: 'secondary', step: 5, strength: 22, duration: 130, reverse: true },
  ],
  /** Rings that rush toward the viewer. Period is seconds for one ring to cross, size is percent of the width. */
  rings: { count: 7, period: 18, size: 150, border: 2, strength: 55 },
  /** The glowing center. */
  core: { strength: 40, reach: 45, pulse: 7 },
} as const;
