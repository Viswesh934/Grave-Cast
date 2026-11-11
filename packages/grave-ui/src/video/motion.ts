/**
 * Motion detection by comparing one frame with the next.
 *
 * Pure TypeScript with no DOM dependency.
 *
 * @module video/motion
 */

import { lumaOf } from '../ascii/convert';

/** How easily motion is noticed. */
export type MotionSensitivity = 'low' | 'medium' | 'high';

/** Values behind one sensitivity level. */
export interface MotionSettings {
  /** How much one pixel's brightness (0-1) must change to count as moved. */
  pixelThreshold: number;
  /** What share of the picture (0-1) must move to count as motion. */
  minFraction: number;
}

/** Settings for each sensitivity level. */
export const MOTION_SENSITIVITY: Record<MotionSensitivity, MotionSettings> = {
  low: { pixelThreshold: 0.14, minFraction: 0.04 },
  medium: { pixelThreshold: 0.08, minFraction: 0.015 },
  high: { pixelThreshold: 0.04, minFraction: 0.005 },
};

/** How long motion stays reported after the picture goes still, so a badge does not flicker. */
export const MOTION_HOLD_MS = 900;

/** Number of values per pixel in canvas data: red, green, blue, alpha. */
const CHANNELS = 4;

/**
 * The share of pixels (0-1) whose brightness changed by more than `threshold`.
 * Both arrays are RGBA canvas data of the same size. Mismatched sizes give 0.
 */
export const changedFraction = (
  before: ArrayLike<number>,
  after: ArrayLike<number>,
  threshold: number
): number => {
  const length = Math.min(before.length, after.length);
  if (length < CHANNELS || before.length !== after.length) return 0;

  let changed = 0;
  for (let i = 0; i + 3 < length; i += CHANNELS) {
    const a = lumaOf(before[i], before[i + 1], before[i + 2], before[i + 3]);
    const b = lumaOf(after[i], after[i + 1], after[i + 2], after[i + 3]);
    if (Math.abs(a - b) > threshold) changed += 1;
  }
  return changed / (length / CHANNELS);
};

/** What the detector is told about each new frame. */
export interface MotionSample {
  /** Share of the picture that changed, 0-1. */
  fraction: number;
  /** Time of the frame in milliseconds. */
  now: number;
}

/** What the detector reports after each frame. */
export interface MotionResult {
  /** `true` while moving, and for {@link MOTION_HOLD_MS} after. */
  moving: boolean;
  /** How strongly the picture is changing, 0-1, for a meter. */
  level: number;
  /** `true` only on the frame where motion begins. */
  started: boolean;
}

/** A stateful motion detector. */
export interface MotionDetector {
  /** Feed in the next frame's change. */
  update: (sample: MotionSample) => MotionResult;
  /** Forget everything seen so far. */
  reset: () => void;
}

/**
 * Creates a detector that turns per-frame change into a steady
 * moving / still signal with a short hold.
 */
export const createMotionDetector = (
  settings: MotionSettings,
  holdMs: number = MOTION_HOLD_MS
): MotionDetector => {
  let lastMotion = -Infinity;
  let moving = false;

  return {
    update: ({ fraction, now }) => {
      if (fraction >= settings.minFraction) lastMotion = now;
      const next = now - lastMotion <= holdMs;
      const started = next && !moving;
      moving = next;
      const level = Math.min(1, fraction / (settings.minFraction * CHANNELS));
      return { moving, level, started };
    },
    reset: () => {
      lastMotion = -Infinity;
      moving = false;
    },
  };
};
