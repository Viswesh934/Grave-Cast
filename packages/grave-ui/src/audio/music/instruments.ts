/**
 * Instrument definitions: timbre as data.
 *
 * An instrument is a recipe (oscillator layers, an ADSR envelope, an optional
 * filter and vibrato) that the voice engine renders at any pitch. Add a new
 * sound by writing a new definition, with no new audio code.
 *
 * @module audio/music/instruments
 */

/**
 * One oscillator in an instrument's stack.
 */
export interface OscillatorLayer {
  /** Waveform. */
  type: OscillatorType;
  /** Frequency multiplier relative to the note. 2 is an octave up, 0.5 an octave down. @default 1 */
  ratio?: number;
  /** Detune in cents. @default 0 */
  detune?: number;
  /** Relative loudness within the stack. @default 1 */
  gain?: number;
}

/**
 * ADSR amplitude envelope. Times are in seconds, sustain is a 0-1 level.
 * A sustain of 0 makes a percussive sound that rings out on its own.
 */
export interface EnvelopeSpec {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

/**
 * Filter that follows the pitch. Cutoffs are multiples of the note's
 * fundamental, so high and low notes keep the same brightness.
 */
export interface FilterSpec {
  type: BiquadFilterType;
  /** Cutoff as a multiple of the note frequency. */
  cutoff: number;
  /** Resonance. @default 1 */
  q?: number;
  /** Optional cutoff multiple to sweep towards, for plucks and swells. */
  sweepTo?: number;
  /** Seconds taken by the sweep. Defaults to the envelope decay. */
  sweepTime?: number;
}

/**
 * Pitch wobble, ramped in after an optional delay.
 */
export interface VibratoSpec {
  /** Speed in Hz. */
  rate: number;
  /** Depth in cents. */
  depth: number;
  /** Seconds before the vibrato starts. @default 0 */
  delay?: number;
}

/**
 * A complete instrument recipe.
 */
export interface InstrumentDefinition {
  name: string;
  layers: readonly OscillatorLayer[];
  envelope: EnvelopeSpec;
  filter?: FilterSpec;
  vibrato?: VibratoSpec;
  /** Overall loudness trim. @default 1 */
  gain?: number;
}

/** Names of the built-in instruments. */
export type InstrumentName =
  | 'cpu'
  | 'terminal'
  | 'mechanical'
  | 'floppy'
  | 'bell'
  | 'glass'
  | 'tick'
  | 'pluck'
  | 'organ'
  | 'hollow'
  | 'pad'
  | 'ghost'
  | 'drone';

/**
 * Built-in instruments.
 *
 * - `bell`, `glass`, `tick`, `pluck`: short and percussive.
 * - `organ`, `hollow`: steady while held.
 * - `pad`, `ghost`, `drone`: slow, atmospheric, and long.
 */
export const INSTRUMENTS: Record<InstrumentName, InstrumentDefinition> = {
  cpu: {
    name: 'cpu',
    layers: [
      { type: 'square', ratio: 1, gain: 0.9 },
      { type: 'square', ratio: 2, gain: 0.4 },
      { type: 'triangle', ratio: 0.5, gain: 0.3 },
    ],
    envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.04 },
    filter: { type: 'lowpass', cutoff: 6, sweepTo: 2, sweepTime: 0.08 },
  },
  terminal: {
    name: 'terminal',
    layers: [
      { type: 'sine', ratio: 1, gain: 1 },
      { type: 'square', ratio: 1, gain: 0.35 },
    ],
    envelope: { attack: 0.002, decay: 0.18, sustain: 0, release: 0.06 },
    filter: { type: 'bandpass', cutoff: 2.2, q: 4 },
  },
  mechanical: {
    name: 'mechanical',
    layers: [
      { type: 'triangle', ratio: 1, gain: 0.8 },
      { type: 'sine', ratio: 3.5, gain: 0.4 },
    ],
    envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.03 },
    filter: { type: 'highpass', cutoff: 1.5 },
  },
  floppy: {
    name: 'floppy',
    layers: [
      { type: 'sawtooth', ratio: 1, gain: 0.7 },
      { type: 'square', ratio: 0.5, gain: 0.5 },
    ],
    envelope: { attack: 0.004, decay: 0.14, sustain: 0, release: 0.05 },
    filter: { type: 'bandpass', cutoff: 1.8, q: 3 },
  },
  bell: {
    name: 'bell',
    layers: [
      { type: 'sine', ratio: 1, gain: 1 },
      { type: 'sine', ratio: 2.76, gain: 0.5 },
      { type: 'sine', ratio: 5.4, gain: 0.25 },
      { type: 'sine', ratio: 8.93, gain: 0.12 },
    ],
    envelope: { attack: 0.003, decay: 2.4, sustain: 0, release: 0.4 },
  },
  glass: {
    name: 'glass',
    layers: [
      { type: 'sine', ratio: 1, gain: 1 },
      { type: 'sine', ratio: 3, detune: 6, gain: 0.3 },
      { type: 'sine', ratio: 4.2, gain: 0.15 },
    ],
    envelope: { attack: 0.01, decay: 1.6, sustain: 0, release: 0.3 },
  },
  tick: {
    name: 'tick',
    layers: [
      { type: 'triangle', ratio: 1, gain: 1 },
      { type: 'sine', ratio: 2, gain: 0.4 },
    ],
    envelope: { attack: 0.001, decay: 0.09, sustain: 0, release: 0.05 },
  },
  pluck: {
    name: 'pluck',
    layers: [
      { type: 'triangle', ratio: 1, gain: 1 },
      { type: 'sine', ratio: 2, gain: 0.4 },
    ],
    envelope: { attack: 0.005, decay: 0.45, sustain: 0, release: 0.1 },
    filter: { type: 'lowpass', cutoff: 8, sweepTo: 2, sweepTime: 0.35 },
  },
  organ: {
    name: 'organ',
    layers: [
      { type: 'sine', ratio: 0.5, gain: 0.5 },
      { type: 'sine', ratio: 1, gain: 1 },
      { type: 'sine', ratio: 2, gain: 0.6 },
      { type: 'sine', ratio: 3, gain: 0.35 },
      { type: 'sine', ratio: 4, gain: 0.2 },
    ],
    envelope: { attack: 0.03, decay: 0.05, sustain: 0.9, release: 0.15 },
  },
  hollow: {
    name: 'hollow',
    layers: [{ type: 'square', ratio: 1, gain: 1 }],
    envelope: { attack: 0.02, decay: 0.3, sustain: 0.5, release: 0.4 },
    filter: { type: 'lowpass', cutoff: 2, q: 2 },
  },
  pad: {
    name: 'pad',
    layers: [
      { type: 'sawtooth', ratio: 1, detune: -9, gain: 0.5 },
      { type: 'sawtooth', ratio: 1, detune: 9, gain: 0.5 },
      { type: 'sine', ratio: 0.5, gain: 0.4 },
    ],
    envelope: { attack: 0.6, decay: 0.4, sustain: 0.8, release: 1.4 },
    filter: { type: 'lowpass', cutoff: 3, q: 0.7 },
    vibrato: { rate: 4.5, depth: 6, delay: 0.5 },
  },
  ghost: {
    name: 'ghost',
    layers: [
      { type: 'sine', ratio: 1, gain: 1 },
      { type: 'sine', ratio: 2, detune: 14, gain: 0.25 },
    ],
    envelope: { attack: 0.5, decay: 0.3, sustain: 0.7, release: 1.8 },
    vibrato: { rate: 5.5, depth: 28, delay: 0.3 },
  },
  drone: {
    name: 'drone',
    layers: [
      { type: 'sawtooth', ratio: 1, gain: 0.5 },
      { type: 'sawtooth', ratio: 1, detune: 7, gain: 0.4 },
      { type: 'sine', ratio: 0.5, gain: 0.6 },
    ],
    envelope: { attack: 1.2, decay: 0.5, sustain: 1, release: 2 },
    filter: { type: 'lowpass', cutoff: 2.5, q: 1 },
    vibrato: { rate: 0.25, depth: 12 },
  },
};

/** Every built-in instrument name, handy for building pickers. */
export const INSTRUMENT_NAMES = Object.keys(INSTRUMENTS) as InstrumentName[];

/**
 * Resolves an instrument name or custom definition to a definition.
 */
export const resolveInstrument = (
  input: InstrumentName | InstrumentDefinition
): InstrumentDefinition => (typeof input === 'string' ? INSTRUMENTS[input] : input);
