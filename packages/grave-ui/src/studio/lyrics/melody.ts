/**
 * Giving lyrics a tune.
 *
 * The melody walks along a scale with a seeded random contour, so the same
 * seed always gives the same tune, and "re-roll" is just a new seed. A typed
 * list of notes overrides the generated tune.
 *
 * Pure TypeScript with no DOM dependency.
 *
 * @module studio/lyrics/melody
 */

import { createScale, type ScaleName } from '../../audio/music/scales';
import { DEFAULT_TONIC, parseAbsoluteNote, type NoteInput } from '../../audio/music/theory';
import { createSeededRandom } from '../../voice/dsp';
import type { LyricSyllable } from './lyrics';

/**
 * How the words are delivered.
 *
 * - `sing`: a flowing tune that rises and falls
 * - `chant`: a steady, repeating pattern
 * - `talk`: one note, quick, like a robot reading
 */
export type MelodyStyle = 'sing' | 'chant' | 'talk';

/** Every style, for pickers. */
export const MELODY_STYLES: readonly MelodyStyle[] = ['sing', 'chant', 'talk'];

/** Timing for each style, in beats. */
export const STYLE_TIMING: Record<MelodyStyle, { syllable: number; lineEnd: number }> = {
  sing: { syllable: 1, lineEnd: 2 },
  chant: { syllable: 0.75, lineEnd: 1.5 },
  talk: { syllable: 0.5, lineEnd: 1 },
};

/** How far the tune may move between syllables, in scale steps. Repeats make steps more likely. */
const SING_STEPS = [-2, -1, -1, 0, 1, 1, 2] as const;

/** The repeating pattern of a chant, in scale steps above the tonic. */
const CHANT_PATTERN = [0, 0, 1, 0, 2, 0, 1, 0] as const;

/** How far above one octave a sung tune may climb, in scale steps. */
const SING_HEADROOM = 2;

/** Chance a line starts, or ends, on the tonic rather than a nearby note. */
const HOME_CHANCE = 0.6;

/** The scale step a line starts on when it does not start at home. */
const ALTERNATE_START = 2;

/** The fifth sits about four sevenths of the way up a scale. */
const FIFTH_FRACTION = 4 / 7;

/**
 * Options for {@link buildMelody}.
 */
export interface MelodyOptions {
  /** Scale to sing in. @default 'minor' */
  scale?: ScaleName;
  /** The home note, such as `C3`. @default 'C3' */
  tonic?: NoteInput;
  /** How the words are delivered. @default 'sing' */
  style?: MelodyStyle;
  /** Changes the tune. The same seed always gives the same tune. @default 1 */
  seed?: number;
  /** Speed multiplier for note lengths: 1 is normal, 2 is twice as long. @default 1 */
  stretch?: number;
  /** Notes typed by the user, such as `C3 E3 G3`. They repeat to cover every syllable. Replaces the generated tune. */
  notes?: string;
}

/**
 * One note of the tune.
 */
export interface MelodyNote {
  /** MIDI note number. */
  midi: number;
  /** When the note starts, in beats from the start of the lyric. */
  startBeat: number;
  /** How long the note lasts, in beats. */
  durationBeats: number;
}

/**
 * A finished tune.
 */
export interface Melody {
  /** One note per syllable, in order. */
  notes: MelodyNote[];
  /** Beat where the lyric ends, including the final rest. */
  endBeat: number;
}

/**
 * Reads a typed list of notes such as `C3 D#3 G3`. Anything that is not a
 * note is skipped. Octave numbers are required, and `#` and `b` are allowed.
 */
export const parseNoteList = (text: string): number[] =>
  text
    .split(/[\s,]+/)
    // Accept "d#3" as well as "D#3". Only the letter is capitalized, so "Eb3" keeps its flat.
    .map((token) => parseAbsoluteNote(token.charAt(0).toUpperCase() + token.slice(1)))
    .filter((midi): midi is number => midi !== null);

/**
 * Gives each syllable a pitch and a length.
 *
 * @example
 * ```ts
 * const melody = buildMelody(parseLyrics('Hush now'), { scale: 'phrygian', tonic: 'D3', seed: 4 });
 * melody.notes[0].midi; // a D phrygian note
 * ```
 */
export const buildMelody = (syllables: readonly LyricSyllable[], options: MelodyOptions = {}): Melody => {
  const { scale: scaleName = 'minor', tonic = DEFAULT_TONIC, style = 'sing', seed = 1, stretch = 1, notes = '' } = options;

  const scale = createScale(scaleName, tonic);
  const random = createSeededRandom(seed);
  const typed = parseNoteList(notes);
  const timing = STYLE_TIMING[style];
  const fifth = Math.round(scale.size * FIFTH_FRACTION);
  const topDegree = scale.size + SING_HEADROOM;

  let degree = 0;
  let beat = 0;
  let chantIndex = 0;
  const result: MelodyNote[] = [];

  syllables.forEach((syllable, index) => {
    const firstOfLine = index === 0 || syllables[index - 1].lineIndex !== syllable.lineIndex;

    if (style === 'sing') {
      if (firstOfLine) {
        degree = random() < HOME_CHANCE ? 0 : ALTERNATE_START;
      } else if (syllable.lastInLine) {
        degree = random() < HOME_CHANCE ? 0 : fifth;
      } else {
        const step = SING_STEPS[Math.floor(random() * SING_STEPS.length)];
        degree = Math.min(topDegree, Math.max(0, degree + step));
      }
    } else if (style === 'chant') {
      degree = CHANT_PATTERN[chantIndex % CHANT_PATTERN.length];
      chantIndex += 1;
    } else {
      degree = 0;
    }

    const midi = typed.length > 0 ? typed[index % typed.length] : scale.degree(degree);
    const length = (syllable.lastInLine ? timing.lineEnd : timing.syllable) * stretch;

    result.push({ midi, startBeat: beat, durationBeats: length });
    beat += length + syllable.pauseAfterBeats * stretch;
  });

  return { notes: result, endBeat: beat };
};
