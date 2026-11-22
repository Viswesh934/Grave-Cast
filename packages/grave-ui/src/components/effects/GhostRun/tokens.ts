/**
 * GhostRun tokens: the field, the ghost's physics, and the night it drifts through,
 * in the grove palette. The window around it comes from gameDialogTokens.
 * The field is in its own units; the canvas scales it to fit.
 * @module components/effects/GhostRun/tokens
 */
import { palette, withAlpha } from '../../../tokens';

export const ghostRunTokens = {
  /** The playing field. `groundY` is where the ground line runs, measured from the top. */
  field: { width: 720, height: 240, groundY: 204 },
  /** The ghost floats near the right edge and drifts left, so the world comes at it from the left. */
  ghost: { x: 600, width: 34, height: 40 },
  /** How fast the ghost falls back, in units per second squared, and how fast a jump lifts it. */
  gravity: 1700,
  jumpSpeed: 620,
  /** How fast the world moves, in units per second: where it starts, its limit, and how much it gains each second. */
  speed: { start: 260, max: 560, gainPerSecond: 6 },
  /** A tombstone's size range. The tallest can still be cleared at full speed. */
  tombstone: { minWidth: 22, maxWidth: 34, minHeight: 28, maxHeight: 54, capRadius: 9 },
  /**
   * Seconds of travel between tombstones. Each gap is picked between `min` and a
   * longest gap that starts at `max` and tightens to `tightMax` at full speed.
   * `min` stays longer than a jump, so every gap can be landed in. `first` is the
   * wait before the first one.
   */
  stoneGap: { min: 0.85, max: 1.9, tightMax: 1.15, first: 1.4 },
  /** Coins: their size, how high they hang (low ones are taken by staying down, high ones by jumping), and how often a row appears. */
  coin: { radius: 8, groundLift: 34, airLift: 104, rowChance: 0.75, rowMax: 3, spacing: 26, airChance: 0.5 },
  /** Each coin adds this much to the score, on top of the metres travelled. */
  coinScore: 10,
  /** Units of travel per metre on the score. */
  unitsPerMetre: 24,
  /** One frame never moves the game more than this, so a slow frame can't skip through a tombstone. */
  maxStepSeconds: 1 / 30,
  /** Hit boxes are this much smaller than the drawings, so near misses count as misses. */
  hitInset: 5,
  /** How far past the right edge things go before they are dropped. */
  offscreen: 60,
  /** The ghost bobs gently while it waits on the ground: how far, and how fast (not with reduced motion). */
  bob: { lift: 3, perSecond: 2.4 },
  /** The moon in the corner: its centre and size in field units. */
  moon: { x: 70, y: 52, radius: 22 },
  /** The faint wisps the ghost leaves behind it: how many, how far apart, and their size. */
  trail: { count: 3, spacing: 12, radius: 6 },
  /** The ghost's drawing: the waves along its hem, and its two eyes, set towards the left because it travels left. */
  ghostShape: { waves: 3, waveDepth: 5, eyeRadius: 3, eyeFromLeft: 9, eyeGap: 9, eyeFromTop: 15 },
  /** The outline drawn around tombstones and coins. */
  lineWidth: 1.5,
  /** The canvas draws at most this many pixels per field unit, so big screens stay fast. */
  maxPixelRatio: 2,
  /** How loud each sound is, from 0 to 1. */
  volume: { jump: 0.2, coin: 0.3, crash: 0.5 },

  /** Icon size for the launcher button. */
  iconSize: 22,

  colors: {
    sky: palette.grove[900],
    moon: withAlpha(palette.grove.bone100, 18),
    ground: palette.grove[850],
    groundLine: palette.grove[600],
    stone: palette.crypt.granite,
    stoneEdge: palette.grove.mist400,
    coin: palette.grove.brass,
    coinEdge: palette.coven.strawShade,
    ghost: palette.grove.bone100,
    ghostEyes: palette.coven.ink,
    trail: withAlpha(palette.grove.bone100, 14),
  },
} as const;
