/**
 * Named values for the signal tools, so no number in them is a magic one.
 * @module signal/tokens
 */

/** International Morse code timing, in units (ITU-R M.1677-1). */
export const MORSE_UNITS = {
  dot: 1,
  dash: 3,
  /** Between the dots and dashes of one letter. */
  partGap: 1,
  letterGap: 3,
  wordGap: 7,
} as const;

/** The most flashes in any one second that WCAG 2.3.1 allows. */
export const FLASH_LIMIT_PER_SECOND = 3;

export const signalTokens = {
  /** One Morse unit for a light: a dot and its gap take 500 ms, so it flashes at most 2 times a second. */
  lightUnitMs: 250,
  /** One Morse unit for sound. */
  soundUnitMs: 120,
  /** A high, piercing pitch that carries, like a whistle. */
  whistleHz: 2800,
  /** Loudness for alarm tones, before the shared limiter. */
  alarmVolume: 0.9,
  /** Fade in and out of each tone, so it starts and stops without a click. */
  rampMs: 5,
  beat: {
    clickHz: 1000,
    accentHz: 1600,
    clickMs: 40,
    volume: 0.8,
  },
  scheduler: {
    /** How often the scheduler wakes up. */
    tickMs: 25,
    /** How far ahead it books sounds on the audio clock, so a slow phone never makes it stumble. */
    lookAheadMs: 200,
    /** Delay before the first sound, so the first one is not cut short. */
    startDelayMs: 50,
  },
  /** Degrees of tilt under which the phone counts as level. */
  levelToleranceDeg: 2,
} as const;
