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
  /** Telling a deliberate shake from ordinary movement. */
  shake: {
    /** How hard a jolt must be, in metres per second squared beyond gravity. Walking stays well under this. */
    jolt: 15,
    /** Jolts closer together than this count as one, in milliseconds. */
    minGapMs: 250,
    /** How many jolts make a shake. */
    count: 3,
    /** All of them must happen within this window, in milliseconds. */
    windowMs: 2000,
  },
  /** Reading a message aloud with the browser's own voice. */
  speech: {
    /** The language voices are chosen for. */
    lang: 'en',
    /** Speaking speed, where 1 is the voice's normal pace. A little slower, so it is easy to follow. */
    rate: 0.95,
    /** Safety net for browsers that never report the end of a sentence: allow this long per character… */
    safetyMsPerChar: 120,
    /** …plus this long, then treat it as finished. */
    safetyGraceMs: 3000,
  },
  /** Radio teletype, the way amateur stations send it: 45.45 baud, tones 170 Hz apart. */
  rtty: {
    baud: 45.45,
    /** The tone for a 1 bit, and for the idle line. */
    markHz: 2125,
    /** The tone for a 0 bit. It sits 170 Hz above the mark tone. */
    spaceHz: 2295,
    /** How long the stop bit lasts, in bit lengths. */
    stopBits: 1.5,
    /** Idle mark tone before the first character, in bit lengths, so a listener hears it start. */
    leadBits: 22,
    /** Idle mark tone after the last character, in bit lengths. */
    tailBits: 11,
    /** Loudness, before the shared limiter. Quieter than an alarm: it is a tone to listen to. */
    volume: 0.5,
    /** The hiss a receiver makes while it is on, so you can hear it is running. */
    static: {
      /** Loudness at full volume: well under the message tones, so they always stand out. */
      level: 0.12,
      /** Centre of the band the hiss is filtered to, roughly a voice radio's range. */
      centreHz: 1400,
      /** How wide the band is; lower is wider. */
      q: 0.6,
      /** How loud the hiss stays while a message plays, as a share of its normal level. */
      duck: 0.2,
      /** How long it takes to fade in, out, or under a message. */
      fadeMs: 250,
    },
  },
} as const;
