/**
 * Haunting tokens: the glow, grain and darkness laid over a 3D graveyard, the
 * sky above it, the eyes in the trees, and the colour each grave glows in.
 * Distances are in scene units (about a metre each).
 *
 * @module components/horror3d/Haunting/tokens
 */
import { palette } from '../../../tokens/colors';
import type { TombstoneWeathering } from '../../crypt/TombstoneCard/TombstoneCard';

/** The colour a grave glows in, by its weathering: the more worn, the more serious the finding. */
export const graveGlow: Record<TombstoneWeathering, { color: string; strength: number }> = {
  crumbling: { color: palette.haunt.serious, strength: 1 },
  cracked: { color: palette.haunt.risky, strength: 0.85 },
  aged: { color: palette.haunt.unusual, strength: 0.7 },
  pristine: { color: palette.haunt.note, strength: 0.55 },
};

/** The look laid over the whole picture. */
export const hauntEffects = {
  bloom: {
    /** Only things brighter than this glow: lanterns, eyes, the moon and the graves' candles. */
    threshold: 0.6,
    smoothing: 0.25,
    intensity: 1.15,
    radius: 0.7,
  },
  vignette: { offset: 0.22, darkness: 0.82 },
  /** Film grain. Off when motion is reduced, because it moves every frame. */
  grain: 0.12,
} as const;

/** The soft spot every glow and cloud is drawn with: white in the middle, fading to nothing. */
export const hauntSoftSpot = {
  /** Size of the texture, in pixels. */
  size: 128,
  /** How strong it still is halfway out, from 0 to 1. */
  middle: 0.35,
} as const;

/** A dark dome of sky: near-black overhead, with a sick glow low on the horizon. */
export const hauntSky = {
  radius: 70,
  segments: [32, 16] as const,
  /** From the top of the dome down to the horizon. */
  top: palette.witch.void,
  middle: palette.grove[950],
  horizon: palette.grove[700],
  /** Where the middle colour sits between the top (0) and the horizon (1). */
  middleAt: 0.55,
  /** How tall the gradient is drawn, in pixels. */
  textureHeight: 256,
  stars: {
    count: 420,
    /** Stars sit a little inside the dome, as a share of its radius. */
    radiusShare: 0.85,
    /** Stars only show above this height, so none sit in the ground. */
    minHeight: 6,
    size: 0.18,
    color: palette.bone[200],
    opacity: 0.85,
  },
} as const;

/** Low black clouds dragging slowly across the moon. */
export const hauntClouds = {
  count: 5,
  width: 18,
  height: 5,
  color: palette.witch.void,
  opacity: 0.72,
  /** How far each drifts either way, and how fast. */
  drift: 9,
  speed: 0.018,
  /** Spread round the point they hang over. */
  spreadX: 22,
  spreadY: 4,
  /** Smallest size, and how much bigger a cloud can be. */
  minScale: 0.5,
  scaleRange: 1,
  /** Clouds are flatter than they are wide: their height's share of their width's scale. */
  flatness: 0.5,
  /** Gap between cloud layers, so they never flicker through each other. */
  layerGap: 0.02,
} as const;

/** Pairs of eyes in the dark beyond the fence, that burn, watch, and blink. */
export const hauntEyes = {
  pairs: 7,
  /** How high they hang, and how far apart the two eyes of a pair are. */
  height: 1.25,
  heightJitter: 0.9,
  gap: 0.08,
  size: 0.045,
  segments: [8, 6] as const,
  /** How bright they burn: above 1, so the glow picks them up. */
  brightness: 4,
  colors: [palette.haunt.serious, palette.witch.gold, palette.haunt.serious] as const,
  /** Seconds between blinks, how long a blink lasts, and how shut the eyes get. */
  blinkEvery: 4.5,
  blinkLength: 0.18,
  shut: 0.05,
} as const;

/** The glow round a grave: a soft light behind the stone, a pool on the ground, and a candle. */
export const hauntAura = {
  /** The light behind the stone. */
  behind: { width: 2.4, height: 2.6, y: 0.7, z: -0.25, opacity: 0.55 },
  /** The pool of light on the ground in front of it. */
  pool: { radius: 1.25, lift: 0.02, z: 0.45, opacity: 0.45 },
  /** A small candle at the foot of the stone. */
  candle: {
    x: -0.32,
    z: 0.32,
    radius: 0.035,
    height: 0.16,
    segments: 8,
    wax: palette.bone[300],
    waxRoughness: 0.7,
    flame: 0.045,
    flameSegments: [8, 6] as const,
    /** How bright the flame burns: above 1, so the glow picks it up. */
    brightness: 6,
    /** How much it flickers, and the two speeds it flickers at, in radians a second. */
    flicker: 0.12,
    flickerSpeeds: [7.3, 13.1] as const,
  },
  /** The light the grave you point at, or have reached, throws on its stone. */
  light: { intensity: 2.4, distance: 4, y: 0.9, z: 1 },
} as const;
