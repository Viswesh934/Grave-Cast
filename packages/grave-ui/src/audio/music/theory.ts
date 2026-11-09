/**
 * Music theory foundation: note names, tuning, and pitch math.
 *
 * Everything here is pure TypeScript with no Web Audio dependency, so it can
 * be tested, reused, or tree-shaken independently of the synth engine.
 *
 * ## Note notation
 *
 * Three naming systems resolve to the same pitch model (semitones from a
 * tonic), so they can be mixed freely:
 *
 * - **Sargam** (relative to the tonic): `Sa Re Ga Ma Pa Dha Ni`.
 *   Komal (flat) variants are lowercase: `re ga dha ni`. Tivra Ma is `Ma#`.
 * - **Solfege** (relative to the tonic): `Do Re Mi Fa Sol La Ti`.
 * - **Letters** (absolute): `C4`, `F#3`, `Bb2`. Middle C is `C4`.
 *
 * Relative names take octave marks: `Sa+` is one octave up, `Pa--` is two
 * octaves down. Numbers are always treated as MIDI note numbers.
 *
 * @module audio/music/theory
 */

/** Semitones in one octave. */
export const SEMITONES_PER_OCTAVE = 12;

/** Concert pitch reference for A4, in Hz. */
export const REFERENCE_A4_HZ = 440;

/** MIDI note number of A4. */
export const MIDI_A4 = 69;

/** Default tonic (Sa / Do) used when none is given. A low register keeps things dark. */
export const DEFAULT_TONIC = 'C3';

/** MIDI numbering puts C4 at 60, so octave 0 starts at MIDI 12. */
const MIDI_OCTAVE_OFFSET = 1;

/**
 * Tuning systems.
 *
 * - `equal`: 12-tone equal temperament, the Western standard.
 * - `just`: 5-limit just intonation measured from the tonic, closer to the
 *   pure ratios used in Indian classical music (Pa is exactly 3/2 above Sa).
 */
export type Tuning = 'equal' | 'just';

/** Naming systems for displaying a note. */
export type NoteSystem = 'letters' | 'sargam' | 'solfege';

/**
 * A note as accepted by the music API: a note name string, or a MIDI number.
 * Fractional MIDI numbers give microtonal pitches.
 */
export type NoteInput = string | number;

/** 5-limit just intonation ratios for the 12 chromatic steps above the tonic. */
export const JUST_RATIOS: readonly number[] = [
  1,
  16 / 15,
  9 / 8,
  6 / 5,
  5 / 4,
  4 / 3,
  45 / 32,
  3 / 2,
  8 / 5,
  5 / 3,
  9 / 5,
  15 / 8,
];

const LETTER_OFFSETS: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** Semitone offset from the tonic for every relative name. */
const RELATIVE_OFFSETS: Record<string, number> = {
  Sa: 0,
  re: 1,
  Re: 2,
  ga: 3,
  Ga: 4,
  Ma: 5,
  Pa: 7,
  dha: 8,
  Dha: 9,
  ni: 10,
  Ni: 11,
  Do: 0,
  Mi: 4,
  Fa: 5,
  Sol: 7,
  So: 7,
  La: 9,
  Ti: 11,
};

const LETTER_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
const SARGAM_NAMES = ['Sa', 're', 'Re', 'ga', 'Ga', 'Ma', 'Ma#', 'Pa', 'dha', 'Dha', 'ni', 'Ni'] as const;
const SOLFEGE_NAMES = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Ti'] as const;

const RELATIVE_PATTERN = /^(Sa|Re|Ga|Ma|Pa|Dha|Ni|re|ga|dha|ni|Do|Mi|Fa|Sol|So|La|Ti)([#b]?)([+-]*)$/;
const ABSOLUTE_PATTERN = /^([A-G])([#b]?)(-?\d+)$/;

const accidentalToSemitones = (symbol: string): number => {
  if (symbol === '#') return 1;
  if (symbol === 'b') return -1;
  return 0;
};

/**
 * Parses an absolute letter note such as `C4` or `F#3` into a MIDI number.
 *
 * @returns The MIDI number, or `null` if the text is not a letter note.
 */
export const parseAbsoluteNote = (note: string): number | null => {
  const match = ABSOLUTE_PATTERN.exec(note);
  if (!match) return null;
  const [, letter, accidental, octave] = match;
  return (
    (Number(octave) + MIDI_OCTAVE_OFFSET) * SEMITONES_PER_OCTAVE +
    LETTER_OFFSETS[letter] +
    accidentalToSemitones(accidental)
  );
};

/**
 * Resolves a tonic to a MIDI number. Tonics must be absolute: a MIDI number
 * or a letter note like `C3`.
 *
 * @throws If a string is not a valid letter note.
 */
export const resolveTonic = (input: NoteInput): number => {
  if (typeof input === 'number') return input;
  const midi = parseAbsoluteNote(input.trim());
  if (midi === null) {
    throw new Error(`[grave-ui] Invalid tonic "${input}". Use a letter note such as "C3" or a MIDI number.`);
  }
  return midi;
};

/**
 * Resolves any supported note notation to a MIDI number.
 *
 * @param input - A note name (`Sa`, `Do`, `C4`, `Ma#+`) or a MIDI number.
 * @param tonic - MIDI number of the tonic that relative names count from.
 * @throws If the string is not a recognised note name.
 *
 * @example
 * ```ts
 * resolveNote('Pa', 48);  // 55  (a fifth above C3)
 * resolveNote('Sa+', 48); // 60  (one octave up)
 * resolveNote('C4', 48);  // 60
 * ```
 */
export const resolveNote = (input: NoteInput, tonic: number): number => {
  if (typeof input === 'number') return input;

  const text = input.trim();
  const relative = RELATIVE_PATTERN.exec(text);
  if (relative) {
    const [, name, accidental, marks] = relative;
    let octaves = 0;
    for (const mark of marks) {
      octaves += mark === '+' ? 1 : -1;
    }
    return (
      tonic +
      RELATIVE_OFFSETS[name] +
      accidentalToSemitones(accidental) +
      octaves * SEMITONES_PER_OCTAVE
    );
  }

  const absolute = parseAbsoluteNote(text);
  if (absolute !== null) return absolute;

  throw new Error(
    `[grave-ui] Unrecognised note "${input}". Try "Sa", "re", "Ma#", "Do", "Sol", or "C4".`
  );
};

/** Equal-tempered frequency in Hz for a (possibly fractional) MIDI number. */
export const equalFrequency = (midi: number): number =>
  REFERENCE_A4_HZ * Math.pow(2, (midi - MIDI_A4) / SEMITONES_PER_OCTAVE);

/**
 * Converts a MIDI number to a frequency in Hz under the chosen tuning.
 *
 * Just intonation is measured from the tonic, so the tonic is always
 * equal-tempered and every other note is a pure ratio above it.
 *
 * @param midi - Pitch as a MIDI number (fractions allowed).
 * @param tonic - MIDI number of the tonic. Only used by `just` tuning.
 * @param tuning - Tuning system. Defaults to `equal`.
 */
export const midiToFrequency = (
  midi: number,
  tonic: number,
  tuning: Tuning = 'equal'
): number => {
  if (tuning === 'equal') return equalFrequency(midi);

  const offset = midi - tonic;
  const octaves = Math.floor(offset / SEMITONES_PER_OCTAVE);
  const within = offset - octaves * SEMITONES_PER_OCTAVE;
  const step = Math.min(Math.floor(within), SEMITONES_PER_OCTAVE - 1);
  const fraction = within - step;

  const lower = JUST_RATIOS[step];
  const upper = step === SEMITONES_PER_OCTAVE - 1 ? 2 : JUST_RATIOS[step + 1];
  const ratio = lower * Math.pow(upper / lower, fraction);

  return equalFrequency(tonic) * ratio * Math.pow(2, octaves);
};

/**
 * Names a pitch in the chosen system.
 *
 * @param midi - Pitch as a MIDI number (rounded to the nearest semitone).
 * @param tonic - MIDI number of the tonic, used for `sargam` and `solfege`.
 * @param system - Naming system. Defaults to `letters`.
 *
 * @example
 * ```ts
 * noteName(55, 48, 'sargam');  // 'Pa'
 * noteName(60, 48, 'solfege'); // 'Do+'
 * noteName(60, 48);            // 'C4'
 * ```
 */
export const noteName = (midi: number, tonic: number, system: NoteSystem = 'letters'): string => {
  const rounded = Math.round(midi);

  if (system === 'letters') {
    const octave = Math.floor(rounded / SEMITONES_PER_OCTAVE) - MIDI_OCTAVE_OFFSET;
    return `${LETTER_NAMES[((rounded % SEMITONES_PER_OCTAVE) + SEMITONES_PER_OCTAVE) % SEMITONES_PER_OCTAVE]}${octave}`;
  }

  const offset = rounded - Math.round(tonic);
  const octaves = Math.floor(offset / SEMITONES_PER_OCTAVE);
  const step = offset - octaves * SEMITONES_PER_OCTAVE;
  const names = system === 'sargam' ? SARGAM_NAMES : SOLFEGE_NAMES;
  const marks = octaves >= 0 ? '+'.repeat(octaves) : '-'.repeat(-octaves);
  return `${names[step]}${marks}`;
};
