/**
 * Scales and ragas.
 *
 * A scale is just a list of semitone offsets from the tonic. Picking the right
 * one does most of the work of setting a mood: Phrygian and Locrian feel
 * unstable, whole tone floats, and ragas like Todi and Marwa sound eerie
 * because of their flattened second and raised fourth.
 *
 * @module audio/music/scales
 */

import { DEFAULT_TONIC, SEMITONES_PER_OCTAVE, resolveTonic, type NoteInput } from './theory';

/**
 * Built-in scale library as semitone offsets from the tonic.
 *
 * Western modes and scales, plus a few Indian ragas (thaats) whose names are
 * given in their usual sargam spelling.
 */
export const SCALE_INTERVALS = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  phrygianDominant: [0, 1, 4, 5, 7, 8, 10],
  pentatonicMajor: [0, 2, 4, 7, 9],
  pentatonicMinor: [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
  wholeTone: [0, 2, 4, 6, 8, 10],
  diminished: [0, 2, 3, 5, 6, 8, 9, 11],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  hirajoshi: [0, 2, 3, 7, 8],
  insen: [0, 1, 5, 7, 10],
  /** Sa re Ga Ma Pa dha Ni */
  bhairav: [0, 1, 4, 5, 7, 8, 11],
  /** Sa re ga Ma# Pa dha Ni */
  todi: [0, 1, 3, 6, 7, 8, 11],
  /** Sa re Ga Ma# Dha Ni (no Pa) */
  marwa: [0, 1, 4, 6, 9, 11],
  /** Sa re Ga Ma# Pa dha Ni */
  purvi: [0, 1, 4, 6, 7, 8, 11],
} as const;

/** Name of a built-in scale. */
export type ScaleName = keyof typeof SCALE_INTERVALS;

/** Every built-in scale name, handy for building pickers. */
export const SCALE_NAMES = Object.keys(SCALE_INTERVALS) as ScaleName[];

/**
 * A scale rooted at a specific tonic.
 */
export interface Scale {
  /** Scale name, or `custom` when built from raw intervals. */
  readonly name: string;
  /** Sorted semitone offsets from the tonic within one octave. */
  readonly intervals: readonly number[];
  /** MIDI number of the tonic (Sa / Do). */
  readonly tonic: number;
  /** Number of notes per octave. */
  readonly size: number;
  /**
   * MIDI number of a scale degree. Index 0 is the tonic. Indexes wrap into
   * higher octaves, and negative indexes reach below the tonic.
   */
  degree: (index: number) => number;
  /** Whether a MIDI number belongs to the scale, in any octave. */
  contains: (midi: number) => boolean;
  /** The nearest in-scale MIDI number to any pitch. */
  quantize: (midi: number) => number;
}

/**
 * Builds a scale rooted at a tonic.
 *
 * @param input - A built-in scale name, or custom semitone offsets.
 * @param tonic - Tonic as a letter note (`C3`) or MIDI number.
 *
 * @example
 * ```ts
 * const scale = createScale('todi', 'D3');
 * scale.degree(0); // D3
 * scale.degree(7); // D4, one octave up
 * ```
 */
export const createScale = (
  input: ScaleName | readonly number[] = 'minor',
  tonic: NoteInput = DEFAULT_TONIC
): Scale => {
  const root = resolveTonic(tonic);
  const name = typeof input === 'string' ? input : 'custom';
  const source: readonly number[] = typeof input === 'string' ? SCALE_INTERVALS[input] : input;

  const intervals = Array.from(new Set(source.map((value) => Math.round(value))))
    .filter((value) => value >= 0 && value < SEMITONES_PER_OCTAVE)
    .sort((a, b) => a - b);

  if (intervals.length === 0) {
    throw new Error('[grave-ui] A scale needs at least one interval between 0 and 11.');
  }

  const size = intervals.length;

  const degree = (index: number): number => {
    const whole = Math.floor(index);
    const octaves = Math.floor(whole / size);
    return root + intervals[whole - octaves * size] + octaves * SEMITONES_PER_OCTAVE;
  };

  const contains = (midi: number): boolean => {
    if (!Number.isInteger(midi)) return false;
    const step = (((midi - root) % SEMITONES_PER_OCTAVE) + SEMITONES_PER_OCTAVE) % SEMITONES_PER_OCTAVE;
    return intervals.includes(step);
  };

  const quantize = (midi: number): number => {
    const octave = Math.floor((midi - root) / SEMITONES_PER_OCTAVE);
    let best = degree(octave * size);
    let bestDistance = Math.abs(midi - best);
    for (let index = (octave - 1) * size; index <= (octave + 2) * size; index += 1) {
      const candidate = degree(index);
      const distance = Math.abs(midi - candidate);
      if (distance < bestDistance) {
        best = candidate;
        bestDistance = distance;
      }
    }
    return best;
  };

  return { name, intervals, tonic: root, size, degree, contains, quantize };
};
