/**
 * Radio teletype (RTTY): text as the two-tone warble that ships, news agencies
 * and radio amateurs sent over shortwave. Text becomes 5-bit ITA2 (Baudot-Murray)
 * codes, each code becomes a start bit, five data bits and a stop bit, and each
 * bit becomes one of two tones. Made on the phone with Web Audio; no library.
 * @module signal/rtty
 */
import { getAudioContext, getMasterBus, resumeAudioContext } from '../audio/context';
import type { SignalPlayback } from './sound';
import { signalTokens } from './tokens';

/** Data bits in one ITA2 code. */
const DATA_BITS = 5;

/** The ITA2 code that switches the receiver to letters. */
const LETTERS_SHIFT = 0b11111;
/** The ITA2 code that switches the receiver to figures (digits and marks). */
const FIGURES_SHIFT = 0b11011;
/** The space code, the same in both shifts. */
const SPACE_CODE = 0b00100;

/** Letters in ITA2, as the 5-bit code each one is sent with. */
const LETTER_CODES: ReadonlyMap<string, number> = new Map([
  ['E', 1], ['A', 3], ['S', 5], ['I', 6], ['U', 7], ['D', 9], ['R', 10], ['J', 11],
  ['N', 12], ['F', 13], ['C', 14], ['K', 15], ['T', 16], ['Z', 17], ['L', 18], ['W', 19],
  ['H', 20], ['Y', 21], ['P', 22], ['Q', 23], ['O', 24], ['B', 25], ['G', 26], ['M', 28],
  ['X', 29], ['V', 30],
]);

/**
 * Digits and marks in ITA2's international figures shift. The codes that
 * countries used for their own symbols (the bell, "who are you", and others)
 * are left out, so everything here means the same on any teleprinter.
 */
const FIGURE_CODES: ReadonlyMap<string, number> = new Map([
  ['3', 1], ['-', 3], ["'", 5], ['8', 6], ['7', 7], ['4', 10], [',', 12], [':', 14],
  ['(', 15], ['5', 16], ['+', 17], [')', 18], ['2', 19], ['6', 21], ['0', 22], ['1', 23],
  ['9', 24], ['?', 25], ['.', 28], ['/', 29], ['=', 30],
]);

/** Text written as ITA2 codes. */
export interface BaudotText {
  /** The 5-bit codes, in order, including the letter and figure shifts. */
  codes: number[];
  /** How many characters ITA2 has no code for. They are left out. */
  skipped: number;
}

/**
 * Writes text as ITA2 codes. Capitals, digits, space and `- ' , : ( ) + ? . / =`
 * can be sent. Lower case is sent as capitals, any run of white space as one
 * space, and everything else (accents, emoji and other marks) is skipped and counted.
 * It starts with the letters shift, and adds shifts only where the text changes
 * between letters and figures.
 *
 * @example
 * toBaudot('SOS 12').codes // [31, 5, 24, 5, 4, 27, 23, 19]
 */
export const toBaudot = (text: string): BaudotText => {
  const codes: number[] = [LETTERS_SHIFT];
  let shift: 'letters' | 'figures' = 'letters';
  let skipped = 0;
  let spaceNext = false;
  for (const raw of text.trim().toUpperCase()) {
    if (/\s/.test(raw)) {
      spaceNext = true;
      continue;
    }
    const letter = LETTER_CODES.get(raw);
    const figure = FIGURE_CODES.get(raw);
    if (letter === undefined && figure === undefined) {
      skipped += 1;
      continue;
    }
    if (spaceNext) {
      codes.push(SPACE_CODE);
      spaceNext = false;
    }
    if (letter !== undefined) {
      if (shift !== 'letters') codes.push(LETTERS_SHIFT);
      shift = 'letters';
      codes.push(letter);
    } else if (figure !== undefined) {
      if (shift !== 'figures') codes.push(FIGURES_SHIFT);
      shift = 'figures';
      codes.push(figure);
    }
  }
  return { codes, skipped };
};

/** One stretch of RTTY: a tone held for some bit lengths. */
export interface RttySegment {
  /** `true` for the mark tone (a 1 bit, or idle), `false` for the space tone (a 0 bit). */
  mark: boolean;
  /** How long it lasts, in bit lengths. A stop bit is 1.5. */
  bits: number;
}

/**
 * Turns ITA2 codes into tones. Each code is sent as a space start bit, five data
 * bits with the least significant first, then a mark stop bit. The line idles on
 * mark before and after. Neighbouring bits of the same tone merge into one segment.
 */
export const rttySegments = (codes: readonly number[]): RttySegment[] => {
  const { leadBits, tailBits, stopBits } = signalTokens.rtty;
  const segments: RttySegment[] = [];
  const add = (mark: boolean, bits: number) => {
    const last = segments[segments.length - 1];
    if (last && last.mark === mark) last.bits += bits;
    else segments.push({ mark, bits });
  };
  add(true, leadBits);
  for (const code of codes) {
    add(false, 1);
    for (let bit = 0; bit < DATA_BITS; bit += 1) add(((code >> bit) & 1) === 1, 1);
    add(true, stopBits);
  }
  add(true, tailBits);
  return segments;
};

/** How long a pattern lasts, in milliseconds. */
export const rttyDurationMs = (segments: readonly RttySegment[]): number =>
  (segments.reduce((total, segment) => total + segment.bits, 0) * 1000) / signalTokens.rtty.baud;

/** Options for {@link playRtty}. */
export interface PlayRttyOptions {
  /** Loudness from 0 to 1. Defaults to {@link signalTokens.rtty}'s volume. */
  volume?: number;
  /** Called once, when the message has finished playing. It is not called if stopped early. */
  onEnd?: () => void;
}

/**
 * Plays an RTTY pattern as sound, once. One steady oscillator changes pitch at each
 * bit boundary, all booked ahead on the audio clock, so it keeps time on a busy phone.
 * Call it from a tap or key press: browsers keep sound off until then.
 *
 * @returns The playback, or `null` where the browser has no Web Audio.
 * @example
 * const { codes } = toBaudot('HELP AT THE SCHOOL')
 * const radio = playRtty(rttySegments(codes), { onEnd: () => setPlaying(false) })
 */
export const playRtty = (segments: readonly RttySegment[], options: PlayRttyOptions = {}): SignalPlayback | null => {
  const ctx = getAudioContext();
  if (!ctx || segments.length === 0) return null;
  void resumeAudioContext();
  const { baud, markHz, spaceHz, volume: defaultVolume } = signalTokens.rtty;
  const { rampMs, scheduler } = signalTokens;
  const bit = 1 / baud;
  const ramp = rampMs / 1000;
  const volume = options.volume ?? defaultVolume;

  const oscillator = ctx.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.value = markHz;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  oscillator.connect(gain).connect(getMasterBus(ctx));
  const start = ctx.currentTime + scheduler.startDelayMs / 1000;
  oscillator.start(start);

  let at = start;
  for (const segment of segments) {
    oscillator.frequency.setValueAtTime(segment.mark ? markHz : spaceHz, at);
    at += segment.bits * bit;
  }
  const end = at;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + ramp);
  gain.gain.setValueAtTime(volume, end - ramp);
  gain.gain.linearRampToValueAtTime(0, end);
  oscillator.stop(end + ramp);
  oscillator.onended = () => gain.disconnect();

  let finished = false;
  const endTimer = setTimeout(() => {
    finished = true;
    options.onEnd?.();
  }, (end - ctx.currentTime) * 1000);

  return {
    stop: () => {
      clearTimeout(endTimer);
      if (finished) return;
      finished = true;
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + ramp);
      try {
        oscillator.stop(now + ramp * 2);
      } catch {
        // Already stopped.
      }
    },
  };
};
