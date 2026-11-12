/**
 * WitchOnBroom component tokens
 *
 * Line colors come from the core palette. Timings and motion distances are
 * named here so the drawing and its stylesheet stay in step.
 *
 * @module components/coven/WitchOnBroom/tokens
 */

import { palette } from '../../../tokens';

/** How fast the witch flies: a lazy glide, a steady hunt, or a frantic warp. */
export type WitchFlightSpeed = 'glide' | 'hunt' | 'warp';

/** Preset widths of the drawing. */
export type WitchSize = 'sm' | 'md' | 'lg';

/** Line and glow colors of the drawing. */
export const witchLine = {
  /** The witch, her broom, and the stars. */
  ink: palette.bone[200],
  /** Quieter lines: the moon's craters and far stars. */
  faint: palette.mist[300],
  moon: palette.witch.gold,
  /** The sparks in her wake and the spell ring, unless `spellColor` is given. */
  spell: palette.witch.fire,
  /** Focus ring around the drawing. */
  focus: palette.witch.fire,
  /** Line widths, in drawing units. */
  stroke: 1.6,
  thin: 1,
  /** How strongly the moon's disc is filled, from 0 to 1. */
  moonFill: 0.08,
  /** How strongly the moon's craters show, from 0 to 1. */
  craterOpacity: 0.55,
  /** The keyboard focus ring. */
  focusRing: { width: '2px', offset: '4px' },
  /** Corner rounding of the focusable area. */
  radius: '0.75rem',
} as const;

/** Animation lengths for each flight speed. */
export const witchFlightTiming: Record<WitchFlightSpeed, { bob: string; flutter: string; trail: string }> = {
  glide: { bob: '4.2s', flutter: '1.6s', trail: '2.4s' },
  hunt: { bob: '2.8s', flutter: '1.1s', trail: '1.6s' },
  warp: { bob: '1.6s', flutter: '0.6s', trail: '0.9s' },
};

/** How far things move, in drawing units and degrees. */
export const witchMotion = {
  /** Up and down drift of the whole flight. */
  bob: 4,
  /** Nose-up and nose-down tilt while bobbing. */
  tilt: 2.5,
  /** Most the flight leans toward the pointer. */
  bank: 8,
  /** How hard the cloak and hair snap in the wind. */
  flutter: 7,
  /** How far sparks drift behind the broom before fading. */
  trailDrift: 34,
  /** How long the spell ring lasts, in ms. */
  spellMs: 900,
  /** How quickly the flight settles into a new lean. */
  bankEase: '0.35s ease-out',
  /** One twinkle of a star, and how dim it gets. */
  twinkle: '3s',
  twinkleDim: 0.25,
  /** The spell ring grows from this scale to that one as it fades. */
  spellScale: { from: 0.2, to: 2.4 },
  spellOpacity: 0.9,
} as const;

/** Widths of the size presets, in px. Height follows the drawing's shape. */
export const witchSizes: Record<WitchSize, number> = { sm: 180, md: 300, lg: 440 };

/** The drawing's own coordinate space. */
export const WITCH_VIEWBOX = { width: 240, height: 160 } as const;
