/**
 * Small text helpers for the studio.
 *
 * @module components/effects/VoiceStudio/format
 */

import { studioTokens } from './tokens';

/** Seconds in a minute. */
const SECONDS_PER_MINUTE = 60;

/** Characters in a two-digit number. */
const TWO_DIGITS = 2;

/** Base of the decimal system, used to cut a number to a few decimals. */
const DECIMAL_BASE = 10;

/** Turns a 0-1 share into a percentage. */
const PERCENT = 100;

/**
 * Formats a time like a recorder's clock: `MM:SS.s`. Negative or invalid
 * input shows as zero.
 *
 * @example
 * ```ts
 * formatClock(65.37); // '01:05.3'
 * ```
 */
export const formatClock = (seconds: number, decimals: number = studioTokens.clockDecimals): string => {
  const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const minutes = Math.floor(safe / SECONDS_PER_MINUTE);
  const factor = DECIMAL_BASE ** decimals;
  const rest = Math.floor((safe - minutes * SECONDS_PER_MINUTE) * factor) / factor;
  const restText = rest.toFixed(decimals).padStart(decimals > 0 ? TWO_DIGITS + 1 + decimals : TWO_DIGITS, '0');
  return `${String(minutes).padStart(TWO_DIGITS, '0')}:${restText}`;
};

/** Rounds a time to the clock's precision, for screen readers. */
export const roundToClock = (seconds: number, decimals: number = studioTokens.clockDecimals): number => {
  const factor = DECIMAL_BASE ** decimals;
  return Math.round(seconds * factor) / factor;
};

/** Describes a stereo position: "Centre", "40% left", "100% right". */
export const formatPan = (pan: number): string => {
  const percent = Math.round(Math.abs(pan) * PERCENT);
  if (percent === 0) return 'Centre';
  return `${percent}% ${pan < 0 ? 'left' : 'right'}`;
};

/** Describes a pitch change in semitones: "+3 st", "-12 st", "0 st". */
export const formatSemitones = (semitones: number): string =>
  `${semitones > 0 ? '+' : ''}${Math.round(semitones)} st`;
