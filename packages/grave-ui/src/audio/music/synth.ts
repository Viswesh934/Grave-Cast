/**
 * Synth: scale-aware note playing.
 *
 * A synth binds a scale, tonic, tuning, and default instrument together so
 * callers can say what to play (`Sa`, `Pa`, degree 3) and never think about
 * frequencies or envelopes.
 *
 * @module audio/music/synth
 */

import { createScale, type Scale, type ScaleName } from './scales';
import { resolveInstrument, type InstrumentDefinition, type InstrumentName } from './instruments';
import {
  DEFAULT_TONIC,
  SEMITONES_PER_OCTAVE,
  midiToFrequency,
  noteName,
  resolveNote,
  resolveTonic,
  type NoteInput,
  type NoteSystem,
  type Tuning,
} from './theory';
import { DEFAULT_VOLUME, playVoice, type VoiceHandle } from './voice';

/** Seconds between notes in an arpeggio. */
const DEFAULT_ARPEGGIO_INTERVAL = 0.12;

/** Beats per minute for phrases. */
const DEFAULT_TEMPO = 90;

/** Notes in a chord built on a scale degree (a triad). */
const DEFAULT_CHORD_SIZE = 3;

/** Fraction of a beat that phrase notes are held, leaving a small gap. */
const PHRASE_LEGATO = 0.95;

/** Semitones from the tonic to the fifth (Pa), used by drones. */
const FIFTH_SEMITONES = 7;

/** An instrument by name, or a custom definition. */
export type InstrumentInput = InstrumentName | InstrumentDefinition;

/**
 * Options for playing a note.
 */
export interface NoteOptions {
  /** Instrument for this note. Defaults to the synth instrument. */
  instrument?: InstrumentInput;
  /** Loudness, 0-1. Defaults to the synth volume. */
  volume?: number;
  /** Seconds to hold. `Infinity` holds until the handle is stopped. */
  duration?: number;
  /** Seconds from now before the note starts. */
  when?: number;
}

/**
 * Configuration for {@link createSynth}.
 */
export interface SynthConfig {
  /** Built-in scale name or custom semitone offsets. @default 'minor' */
  scale?: ScaleName | readonly number[];
  /** Tonic (Sa / Do) as a letter note or MIDI number. @default 'C3' */
  tonic?: NoteInput;
  /** Tuning system. @default 'equal' */
  tuning?: Tuning;
  /** Default instrument. @default 'bell' */
  instrument?: InstrumentInput;
  /** Default loudness, 0-1. @default 0.5 */
  volume?: number;
}

/** Options for {@link Synth.arpeggio}. */
export interface ArpeggioOptions extends NoteOptions {
  /** Seconds between notes. @default 0.12 */
  interval?: number;
}

/** Options for {@link Synth.chordOnDegree}. */
export interface ChordOnDegreeOptions extends NoteOptions {
  /** Number of stacked notes. @default 3 */
  size?: number;
}

/**
 * One step of a phrase.
 */
export interface PhraseStep {
  /** A note, several notes (a chord), or nothing for a rest. */
  note?: NoteInput | readonly NoteInput[] | null;
  /** Length in beats. @default 1 */
  beats?: number;
}

/** Options for {@link Synth.phrase}. */
export interface PhraseOptions extends NoteOptions {
  /** Beats per minute. @default 90 */
  tempo?: number;
}

/**
 * A scale-aware player.
 */
export interface Synth {
  /** The scale in use. */
  readonly scale: Scale;
  /** MIDI number of the tonic. */
  readonly tonic: number;
  /** The tuning system in use. */
  readonly tuning: Tuning;
  /** Resolves any note notation to a MIDI number. */
  midiOf: (input: NoteInput) => number;
  /** Resolves any note notation to a frequency in Hz under the synth tuning. */
  frequencyOf: (input: NoteInput) => number;
  /** Names a note in the chosen system. Defaults to sargam. */
  noteName: (input: NoteInput, system?: NoteSystem) => string;
  /** Plays a note. */
  note: (input: NoteInput, options?: NoteOptions) => VoiceHandle | null;
  /** Plays a scale degree. 0 is the tonic and indexes wrap into higher octaves. */
  degree: (index: number, options?: NoteOptions) => VoiceHandle | null;
  /** Plays several notes together. */
  chord: (inputs: readonly NoteInput[], options?: NoteOptions) => VoiceHandle[];
  /** Plays a chord stacked in scale thirds on a degree. */
  chordOnDegree: (index: number, options?: ChordOnDegreeOptions) => VoiceHandle[];
  /** Plays notes one after another. Returns the total length in seconds. */
  arpeggio: (inputs: readonly NoteInput[], options?: ArpeggioOptions) => number;
  /** Plays a sequence of steps. Returns the total length in seconds. */
  phrase: (steps: readonly PhraseStep[], options?: PhraseOptions) => number;
  /** Holds a tanpura-style drone (low Sa, Sa, Pa) until the handle is stopped. */
  drone: (options?: NoteOptions) => VoiceHandle | null;
}

/**
 * Creates a synth bound to a scale, tonic, tuning, and instrument.
 *
 * @example
 * ```ts
 * const synth = createSynth({ scale: 'todi', tonic: 'D3', instrument: 'bell' });
 *
 * synth.note('Sa');                       // the tonic
 * synth.note('re');                       // komal Re
 * synth.degree(4);                        // fifth note of Todi
 * synth.chordOnDegree(0);                 // tonic triad
 * synth.phrase([{ note: 'Sa' }, { note: 'Pa' }, { note: 'Sa+', beats: 2 }]);
 * ```
 */
export const createSynth = (config: SynthConfig = {}): Synth => {
  const tonic = resolveTonic(config.tonic ?? DEFAULT_TONIC);
  const scale = createScale(config.scale ?? 'minor', tonic);
  const tuning = config.tuning ?? 'equal';
  const defaultInstrument = resolveInstrument(config.instrument ?? 'bell');
  const defaultVolume = config.volume ?? DEFAULT_VOLUME;

  const midiOf = (input: NoteInput): number => resolveNote(input, tonic);

  const frequencyOf = (input: NoteInput): number => midiToFrequency(midiOf(input), tonic, tuning);

  const voice = (midi: number, options: NoteOptions = {}): VoiceHandle | null =>
    playVoice(
      midiToFrequency(midi, tonic, tuning),
      options.instrument ? resolveInstrument(options.instrument) : defaultInstrument,
      {
        volume: options.volume ?? defaultVolume,
        duration: options.duration,
        when: options.when,
      }
    );

  const present = (handles: (VoiceHandle | null)[]): VoiceHandle[] =>
    handles.filter((handle): handle is VoiceHandle => handle !== null);

  const note: Synth['note'] = (input, options) => voice(midiOf(input), options);

  const degree: Synth['degree'] = (index, options) => voice(scale.degree(index), options);

  const chord: Synth['chord'] = (inputs, options) =>
    present(inputs.map((input) => voice(midiOf(input), options)));

  const chordOnDegree: Synth['chordOnDegree'] = (index, options = {}) => {
    const size = options.size ?? DEFAULT_CHORD_SIZE;
    return present(
      Array.from({ length: size }, (_, step) => voice(scale.degree(index + step * 2), options))
    );
  };

  const arpeggio: Synth['arpeggio'] = (inputs, options = {}) => {
    const interval = options.interval ?? DEFAULT_ARPEGGIO_INTERVAL;
    const start = options.when ?? 0;
    inputs.forEach((input, position) => {
      voice(midiOf(input), { ...options, when: start + position * interval });
    });
    return inputs.length * interval;
  };

  const phrase: Synth['phrase'] = (steps, options = {}) => {
    const secondsPerBeat = 60 / (options.tempo ?? DEFAULT_TEMPO);
    const start = options.when ?? 0;
    let cursor = start;

    steps.forEach((step) => {
      const beats = step.beats ?? 1;
      const { note: stepNote } = step;
      if (stepNote !== undefined && stepNote !== null) {
        const inputs: readonly NoteInput[] =
          typeof stepNote === 'string' || typeof stepNote === 'number' ? [stepNote] : stepNote;
        inputs.forEach((input) => {
          voice(midiOf(input), {
            ...options,
            when: cursor,
            duration: beats * secondsPerBeat * PHRASE_LEGATO,
          });
        });
      }
      cursor += beats * secondsPerBeat;
    });

    return cursor - start;
  };

  const drone: Synth['drone'] = (options = {}) => {
    const handles = present(
      [tonic - SEMITONES_PER_OCTAVE, tonic, tonic + FIFTH_SEMITONES].map((midi) =>
        voice(midi, { instrument: 'drone', ...options, duration: Infinity })
      )
    );
    if (handles.length === 0) return null;
    return {
      frequency: handles[0].frequency,
      stop: () => handles.forEach((handle) => handle.stop()),
    };
  };

  return {
    scale,
    tonic,
    tuning,
    midiOf,
    frequencyOf,
    noteName: (input, system = 'sargam') => noteName(midiOf(input), tonic, system),
    note,
    degree,
    chord,
    chordOnDegree,
    arpeggio,
    phrase,
    drone,
  };
};
