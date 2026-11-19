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
  crumbling: { color: palette.haunt.serious, strength: 0.8 },
  cracked: { color: palette.haunt.risky, strength: 0.68 },
  aged: { color: palette.haunt.unusual, strength: 0.56 },
  pristine: { color: palette.haunt.note, strength: 0.45 },
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
  vignette: { offset: 0.18, darkness: 0.92 },
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

/**
 * The moon in its real phase: a cratered face drawn on the device, lit on the
 * side the sun is, with the dark part still faintly there (earthshine).
 */
export const hauntMoon = {
  /** Size of the face's texture, in pixels. */
  textureSize: 256,
  /** The face's radius as a share of half the texture, leaving room for a soft edge. */
  faceShare: 0.94,
  face: palette.bone[200],
  /** The darker seas and craters on the face. */
  seas: palette.bone.decayed,
  craters: palette.bone[300],
  /** The face during a blood moon. */
  blood: palette.sanguine.crimson,
  bloodSeas: palette.sanguine.coagulated,
  /** Seas: count, smallest and extra radius, and how dark, as shares of the face. */
  sea: { count: 7, minRadius: 0.1, radiusRange: 0.18, opacity: 0.55, spread: 0.55 },
  crater: { count: 22, minRadius: 0.02, radiusRange: 0.05, opacity: 0.5, spread: 0.8, rim: 0.35 },
  /** How much of the unlit part still shows. */
  earthshine: 0.13,
  /** How bright the lit part burns: above 1, so the glow picks it up. */
  brightness: 1.6,
  /** The halo's strength follows how much is lit, but never drops below this share. */
  haloFloor: 0.25,
  /** Places the craters, so the moon always has the same face. */
  seed: 1969,
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
  colors: [palette.sanguine.crimson, palette.witch.gold, palette.sanguine.crimson] as const,
  /** Seconds between blinks, how long a blink lasts, and how shut the eyes get. */
  blinkEvery: 4.5,
  blinkLength: 0.18,
  shut: 0.05,
} as const;

/** The glow round a grave: a soft light behind the stone, a pool on the ground, and a candle. */
export const hauntAura = {
  /** The light behind the stone. */
  behind: { width: 2.4, height: 2.6, y: 0.7, z: -0.25, opacity: 0.35 },
  /** The pool of light on the ground in front of it. */
  pool: { radius: 1.25, lift: 0.02, z: 0.45, opacity: 0.28 },
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
    brightness: 3,
    /** How much it flickers, and the two speeds it flickers at, in radians a second. */
    flicker: 0.12,
    flickerSpeeds: [7.3, 13.1] as const,
  },
  /** The light the grave you point at, or have reached, throws on its stone. */
  light: { intensity: 1.6, distance: 4, y: 0.9, z: 1 },
} as const;

/**
 * The haunted ground: worn earth instead of a clean floor. A mottled soil
 * texture, bare patches, tufts of dead grass, fallen leaves and loose stones.
 * Sizes are in scene units; counts are per 100 square units of ground.
 */
export const hauntGround = {
  texture: {
    /** Size of one tile of the soil texture, in pixels, and how much ground it covers. */
    size: 512,
    tileUnits: 6,
    base: palette.soil.dark,
    /** Soft blotches of other earth: how many, their size in pixels, and how strong. */
    blotches: 260,
    blotchMin: 6,
    blotchRange: 34,
    blotchAlpha: 0.2,
    blotchAlphaRange: 0.3,
    blotchColors: [palette.soil.loam, palette.soil.moss, palette.soil.deadGrass, palette.soil.loam] as const,
    /** Fine grit: how many specks, their size in pixels, and how strong. */
    specks: 2200,
    speckMax: 2,
    speckAlpha: 0.5,
    speckColors: [palette.soil.grit, palette.soil.pebble, palette.soil.leafBrown] as const,
    roughness: 1,
  },
  /** Patches of bare, turned earth. */
  patches: { per100: 4, minSize: 0.9, sizeRange: 1.6, opacity: 0.55, color: palette.soil.loam, lift: 0.006 },
  /** Tufts of dead grass: thin leaning blades. */
  grass: { per100: 90, radius: 0.025, height: 0.26, heightRange: 0.22, lean: 0.35, sides: 3, colors: [palette.soil.deadGrass, palette.soil.grass, palette.soil.deadGrass] as const },
  /** Fallen leaves lying flat, a little lifted so they never flicker into the ground. */
  leaves: { per100: 55, width: 0.14, length: 0.09, lift: 0.008, colors: [palette.soil.leafRust, palette.soil.leafOchre, palette.soil.leafBrown] as const },
  /** Loose stones half sunk in the earth. */
  stones: { per100: 18, minSize: 0.04, sizeRange: 0.09, sink: 0.4, colors: [palette.soil.pebble, palette.soil.grit] as const, roughness: 0.95 },
  /** The cover spreads this far past the bounds it is given, into the fog. */
  spread: 6,
  /** Tries to place one piece before giving up on it, when the spot is kept clear. */
  attempts: 4,
} as const;
