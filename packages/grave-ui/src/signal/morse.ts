/**
 * International Morse code: letters to dots and dashes, and dots and dashes to a
 * timed on/off pattern that a light, a speaker or a vibration motor can play.
 * @module signal/morse
 */
import { FLASH_LIMIT_PER_SECOND, MORSE_UNITS } from './tokens';

/** Letters and digits in International Morse code (ITU-R M.1677-1). */
export const MORSE_CODE: Readonly<Record<string, string>> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..',
  J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
  S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
};

/** One stretch of a Morse pattern: on (a dot or dash) or off (a gap), in Morse units. */
export interface MorseSegment {
  on: boolean;
  units: number;
}

/** Options for {@link morseSegments}. */
export interface MorseOptions {
  /**
   * Send each word as one sign, with no letter gaps, the way the distress signal
   * SOS is sent (`...---...`). Defaults to `false`.
   */
  joined?: boolean;
  /** End with a word gap, so the pattern can be repeated back to back. Defaults to `false`. */
  repeatable?: boolean;
}

const words = (text: string): string[] => text.toUpperCase().trim().split(/\s+/).filter(Boolean);

/**
 * Writes text as dots and dashes, letters split by spaces and words by ` / `.
 * Characters that Morse code doesn't have are skipped.
 *
 * @example
 * toMorse('SOS') // '... --- ...'
 */
export const toMorse = (text: string): string =>
  words(text)
    .map((word) => [...word].map((char) => MORSE_CODE[char]).filter(Boolean).join(' '))
    .filter(Boolean)
    .join(' / ');

/**
 * Turns text into a timed on/off pattern. Gaps that meet are merged, so the
 * pattern always alternates on and off, starting with on.
 *
 * @example
 * // The distress signal, ready to loop.
 * const sos = morseSegments('SOS', { joined: true, repeatable: true })
 */
export const morseSegments = (text: string, options: MorseOptions = {}): MorseSegment[] => {
  const segments: MorseSegment[] = [];
  const gap = (units: number) => {
    if (segments.length === 0) return;
    const last = segments[segments.length - 1];
    if (last.on) segments.push({ on: false, units });
    else last.units = Math.max(last.units, units);
  };
  for (const word of words(text)) {
    gap(MORSE_UNITS.wordGap);
    const letters = [...word].map((char) => MORSE_CODE[char]).filter(Boolean);
    letters.forEach((code, letterIndex) => {
      if (letterIndex > 0) gap(options.joined ? MORSE_UNITS.partGap : MORSE_UNITS.letterGap);
      [...code].forEach((symbol, symbolIndex) => {
        if (symbolIndex > 0) gap(MORSE_UNITS.partGap);
        segments.push({ on: true, units: symbol === '-' ? MORSE_UNITS.dash : MORSE_UNITS.dot });
      });
    });
  }
  if (options.repeatable) gap(MORSE_UNITS.wordGap);
  return segments;
};

/** The distress signal SOS as one sign, ready to repeat. */
export const SOS_SEGMENTS: readonly MorseSegment[] = morseSegments('SOS', { joined: true, repeatable: true });

/** How long a pattern lasts, in units. */
export const morseUnits = (segments: readonly MorseSegment[]): number =>
  segments.reduce((total, segment) => total + segment.units, 0);

/**
 * The shortest Morse unit a light may use and still flash no more than
 * {@link FLASH_LIMIT_PER_SECOND} times a second (a dot and its gap are 2 units).
 */
export const minimumLightUnitMs = (limitPerSecond: number = FLASH_LIMIT_PER_SECOND): number =>
  Math.ceil(1000 / (limitPerSecond * (MORSE_UNITS.dot + MORSE_UNITS.partGap)));

/**
 * A pattern as a vibration list for `navigator.vibrate`: on and off times in
 * milliseconds, starting with on.
 */
export const morseVibration = (segments: readonly MorseSegment[], unitMs: number): number[] =>
  segments.map((segment) => segment.units * unitMs);
