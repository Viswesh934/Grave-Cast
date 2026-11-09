/**
 * Sound effect types.
 *
 * A sound effect is a short list of layers. Each layer is either a tone or
 * a burst of filtered noise, with a pitch or filter sweep and an envelope.
 * That is enough to describe clicks, creaks, bells, wind, and growls without
 * any audio files.
 *
 * @module audio/effects/types
 */

/** Waveforms usable for a tonal layer. */
export type ToneWave = Exclude<OscillatorType, 'custom'>;

/** Colors of noise. White is bright, pink is natural, brown is a deep rumble. */
export type NoiseColor = 'white' | 'pink' | 'brown';

/**
 * A value in Hz that is either fixed or sweeps from one value to another over
 * the layer's length. Sweeps are exponential, which sounds natural for pitch.
 */
export type Sweep = number | readonly [from: number, to: number];

/**
 * Filter applied to a layer. Sweeping the cutoff shapes how a sound opens or
 * closes, like wind rising or a door creaking.
 */
export interface LayerFilter {
  type: BiquadFilterType;
  /** Cutoff or center frequency in Hz. */
  freq: Sweep;
  /** Resonance. @default 1 */
  q?: number;
}

/**
 * Loudness shape of a layer.
 *
 * - `decay`: instant attack, then fades out. Impacts, clicks, bells.
 * - `swell`: rises to a peak just past the middle, then fades. Wind, moans.
 * - `hold`: fades in, stays level, then fades out. Drones, growls.
 */
export type EnvelopeShape = 'decay' | 'swell' | 'hold';

/**
 * Repeats a layer, for patterns like ticking, bubbling, or rattling.
 */
export interface LayerRepeat {
  /** Total plays, including the first. */
  count: number;
  /** Seconds between plays. */
  interval: number;
  /** Gain multiplier applied per repeat. 0.9 fades by 10% each time. @default 1 */
  fade?: number;
  /** Random timing offset as a fraction of the interval. @default 0 */
  jitter?: number;
  /** Random pitch offset as a fraction of the pitch. @default 0 */
  pitchJitter?: number;
}

/**
 * One layer of a sound effect.
 */
export interface EffectLayer {
  /** A waveform for a tone, or a noise color. */
  source: ToneWave | NoiseColor;
  /** Pitch in Hz, tones only. @default 440 */
  freq?: Sweep;
  /** Optional filter. */
  filter?: LayerFilter;
  /** Loudness from 0 to 1, relative to the other layers. @default 1 */
  gain?: number;
  /** Seconds after the effect starts. @default 0 */
  start?: number;
  /** Seconds the layer sounds for. */
  length: number;
  /** Loudness shape. @default 'decay' */
  shape?: EnvelopeShape;
  /** Seconds to fade in for `decay` and `hold` shapes. @default 0.005 */
  attack?: number;
  /** Pitch wobble in cents, tones only. */
  vibrato?: { rate: number; depth: number };
  /**
   * Frequency modulation for metallic or bell-like timbres, tones only.
   * `ratio` is the modulator pitch relative to the tone, `depth` is the
   * pitch deviation as a multiple of the tone pitch.
   */
  fm?: { ratio: number; depth: number };
  /** Repeat this layer. */
  repeat?: LayerRepeat;
}

/**
 * Browsable groups, like genres in a ringtone store.
 */
export type EffectCategory =
  | 'taps'
  | 'doors'
  | 'impacts'
  | 'magic'
  | 'creatures'
  | 'ambience'
  | 'alerts'
  | 'machines';

/**
 * What you write to add a sound effect.
 */
export interface EffectSpec {
  /** Display name. */
  label: string;
  /** Group the effect belongs to. */
  category: EffectCategory;
  /** One line describing how it sounds. */
  description: string;
  /** The recipe. */
  layers: readonly EffectLayer[];
  /** Extra search words. */
  tags?: readonly string[];
}

/**
 * A ready-to-play sound effect.
 */
export interface EffectDefinition extends EffectSpec {
  /** Unique id. */
  name: string;
  /** Total length in seconds, worked out from the layers. */
  duration: number;
}
