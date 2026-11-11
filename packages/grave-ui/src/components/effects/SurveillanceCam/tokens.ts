/**
 * SurveillanceCam component tokens.
 *
 * Every color and font comes from the shared token system. Sizes, counts, and
 * timings are component-specific and named here so the component holds no raw
 * numbers.
 *
 * @module components/effects/SurveillanceCam/tokens
 */

import { palette } from '../../../tokens/colors';
import { typography } from '../../../tokens/typography';
import type { HorrorIntensity } from '../../../tokens/types';
import type { CamGrade } from '../../../video/grades';

/** CSS class on the camera root. */
export const CAM_CLASS = 'grave-cam';

/** Prefix for animation names and generated ids. */
export const CAM_PREFIX = 'grave-cam';

/** Camera name shown when none is given. */
export const CAM_DEFAULT_LABEL = 'CAM 01';

/** Default picture shape, width over height. */
export const CAM_DEFAULT_ASPECT = '4 / 3';

/** Name of each animation, shared by the keyframes and the components that use them. */
export const camAnimations = {
  grain: `${CAM_PREFIX}-grain`,
  blink: `${CAM_PREFIX}-blink`,
  glitch: `${CAM_PREFIX}-glitch`,
} as const;

/**
 * How strongly each intensity roughs up the picture.
 */
export interface CamIntensityToken {
  /** Red and blue channel split in px. 0 turns the effect off. */
  aberration: number;
  /** Strength of the scanlines, in percent of black. */
  scanlines: number;
  /** Strength of the dark corners, in percent. */
  vignette: number;
  /** Opacity of the film grain, 0-1. */
  grain: number;
  /** Strength of the passing glitch band, in percent. */
  glitch: number;
}

export const camIntensity: Record<HorrorIntensity, CamIntensityToken> = {
  ghastly: { aberration: 1, scanlines: 18, vignette: 55, grain: 0.12, glitch: 6 },
  cursed: { aberration: 2, scanlines: 28, vignette: 70, grain: 0.2, glitch: 10 },
  abyssal: { aberration: 4, scanlines: 40, vignette: 85, grain: 0.32, glitch: 16 },
};

/** The small label and color a grade shows in the corner. */
export interface CamGradeToken {
  label: string;
  color: string;
}

export const camGradeTokens: Record<CamGrade, CamGradeToken> = {
  none: { label: 'LIVE', color: palette.bone[200] },
  vhs: { label: 'VHS', color: palette.bone[200] },
  night: { label: 'NIGHT', color: palette.witch.emerald },
  infrared: { label: 'IR', color: palette.sanguine.plasma },
  mono: { label: 'B/W', color: palette.mist[100] },
};

export const camTokens = {
  /** Colors outside the grades. */
  colors: {
    base: palette.dark[950],
    hud: palette.bone[100],
    rec: palette.sanguine.plasma,
    glitch: palette.bone[100],
  },
  /** On-screen text. */
  hud: {
    font: typography.families.epitaph,
    size: typography.scale.murmur,
    padding: '0.75em',
    gap: '0.75em',
    letterSpacing: '0.08em',
    /** Soft dark halo that keeps text readable on bright pictures, in px. */
    shadowBlur: 3,
  },
  /** Scanlines: the line is `line` px thick and repeats every `period` px. */
  scanlines: { line: 1, period: 3 },
  /** Dark corners: how much of the middle stays clear, in percent. */
  vignetteClear: 45,
  /** Film grain: size of one noise tile in px, noise detail, and seconds per full cycle. */
  grain: {
    tile: 160,
    frequency: 0.8,
    octaves: 2,
    seconds: 0.6,
    /** Where the tile jumps to at each step, in px. */
    jumps: [
      [0, 0],
      [-37, 21],
      [29, -43],
      [-61, -17],
      [13, 52],
      [47, -29],
    ],
  },
  /**
   * The recording dot: diameter, corner radius, seconds per blink, opacity
   * while dim, and glow strength in percent.
   */
  rec: { dot: '0.6em', radius: '50%', blinkSeconds: 1.2, dimmed: 0.15, glow: 70 },
  /**
   * The passing band: height in percent of the picture, seconds between
   * passes, and where in the cycle (percent) it appears and finishes crossing.
   */
  glitch: { height: 9, seconds: 7, startAt: 2, endAt: 12 },
} as const;
