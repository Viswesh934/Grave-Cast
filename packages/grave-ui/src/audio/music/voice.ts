/**
 * Voice engine: renders an instrument definition at a frequency.
 *
 * This is the only place in the music system that touches Web Audio nodes.
 * Everything above it (synth, hooks, components) deals in notes and scales.
 *
 * @module audio/music/voice
 */

import { getAudioContext } from '../SpookyAudio';
import type { InstrumentDefinition } from './instruments';

/** Hard cap on simultaneous voices. New notes beyond this are dropped. */
export const MAX_VOICES = 48;

/** Default note loudness, 0-1. */
export const DEFAULT_VOLUME = 0.5;

/** Default hold time in seconds before a note is released. */
export const DEFAULT_NOTE_DURATION = 0.6;

/** Floor for gain values, because exponential ramps cannot reach zero. */
const MIN_GAIN = 0.0001;

/** Scales loudness down so stacked notes leave headroom. */
const PEAK_SCALE = 0.35;

/** How many exponential time constants fit in the release time. */
const RELEASE_TIME_CONSTANTS = 4;

/** Lowest filter cutoff in Hz. */
const MIN_FILTER_HZ = 20;

/** Fraction of the sample rate treated as the highest safe frequency. */
const NYQUIST_SAFETY = 0.45;

/** Seconds over which vibrato fades in once its delay has passed. */
const VIBRATO_FADE_IN = 0.4;

/** Shared output stage: a gentle compressor so chords and drones never clip. */
const MASTER_BUS = {
  gain: 0.8,
  threshold: -18,
  knee: 24,
  ratio: 6,
  attack: 0.005,
  release: 0.25,
} as const;

/**
 * Options for a single voice.
 */
export interface VoiceOptions {
  /** Loudness, 0-1. @default 0.5 */
  volume?: number;
  /**
   * Seconds to hold before releasing. Use `Infinity` to hold until
   * `stop()` is called. Percussive instruments ring out on their own.
   * @default 0.6
   */
  duration?: number;
  /** Seconds from now before the note starts. @default 0 */
  when?: number;
}

/**
 * Handle to a sounding voice.
 */
export interface VoiceHandle {
  /** Frequency of the note in Hz. */
  readonly frequency: number;
  /** Releases the voice. Safe to call more than once. */
  stop: () => void;
}

let activeVoices = 0;
let bus: { ctx: AudioContext; input: GainNode } | null = null;

const getBus = (ctx: AudioContext): GainNode => {
  if (bus && bus.ctx === ctx) return bus.input;

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = MASTER_BUS.threshold;
  compressor.knee.value = MASTER_BUS.knee;
  compressor.ratio.value = MASTER_BUS.ratio;
  compressor.attack.value = MASTER_BUS.attack;
  compressor.release.value = MASTER_BUS.release;

  const input = ctx.createGain();
  input.gain.value = MASTER_BUS.gain;
  input.connect(compressor);
  compressor.connect(ctx.destination);

  bus = { ctx, input };
  return input;
};

/**
 * Plays an instrument at a frequency.
 *
 * Low-level: most code should use {@link createSynth} or the
 * `useSpookyMusic` hook instead, which add scales, tuning, and the global
 * audio switch.
 *
 * @returns A handle for early release, or `null` if audio is unavailable or
 * the voice limit has been reached.
 */
export const playVoice = (
  frequency: number,
  instrument: InstrumentDefinition,
  options: VoiceOptions = {}
): VoiceHandle | null => {
  const ctx = getAudioContext();
  if (!ctx || activeVoices >= MAX_VOICES || !Number.isFinite(frequency) || frequency <= 0) {
    return null;
  }

  const { volume = DEFAULT_VOLUME, duration = DEFAULT_NOTE_DURATION, when = 0 } = options;
  const { envelope, layers, filter: filterSpec, vibrato } = instrument;

  const startTime = ctx.currentTime + Math.max(0, when);
  const ceiling = ctx.sampleRate * NYQUIST_SAFETY;

  // Drop partials that would alias above the audible range.
  const audible = layers.filter((layer) => frequency * (layer.ratio ?? 1) < ceiling);
  if (audible.length === 0) return null;
  const totalWeight = audible.reduce((sum, layer) => sum + (layer.gain ?? 1), 0);

  const peak = Math.max(MIN_GAIN, volume * (instrument.gain ?? 1) * PEAK_SCALE);
  const sustainLevel = Math.max(MIN_GAIN, peak * envelope.sustain);
  const sustainStart = startTime + envelope.attack + envelope.decay;
  const releaseConstant = envelope.release / RELEASE_TIME_CONSTANTS;

  // Signal path: oscillators -> mix -> [filter] -> amp -> bus
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(0, startTime);
  amp.gain.linearRampToValueAtTime(peak, startTime + envelope.attack);
  amp.gain.exponentialRampToValueAtTime(sustainLevel, sustainStart);

  const mix = ctx.createGain();
  const nodes: AudioNode[] = [mix, amp];

  if (filterSpec) {
    const filter = ctx.createBiquadFilter();
    const cutoffHz = (multiple: number) =>
      Math.min(ceiling, Math.max(MIN_FILTER_HZ, frequency * multiple));
    filter.type = filterSpec.type;
    filter.Q.value = filterSpec.q ?? 1;
    filter.frequency.setValueAtTime(cutoffHz(filterSpec.cutoff), startTime);
    if (filterSpec.sweepTo !== undefined) {
      filter.frequency.exponentialRampToValueAtTime(
        cutoffHz(filterSpec.sweepTo),
        startTime + (filterSpec.sweepTime ?? envelope.decay)
      );
    }
    mix.connect(filter);
    filter.connect(amp);
    nodes.push(filter);
  } else {
    mix.connect(amp);
  }
  amp.connect(getBus(ctx));

  const oscillators = audible.map((layer) => {
    const osc = ctx.createOscillator();
    osc.type = layer.type;
    osc.frequency.value = frequency * (layer.ratio ?? 1);
    osc.detune.value = layer.detune ?? 0;

    const layerGain = ctx.createGain();
    layerGain.gain.value = (layer.gain ?? 1) / totalWeight;
    osc.connect(layerGain);
    layerGain.connect(mix);
    nodes.push(layerGain);

    osc.start(startTime);
    return osc;
  });

  const sources: OscillatorNode[] = [...oscillators];

  if (vibrato) {
    const lfo = ctx.createOscillator();
    lfo.frequency.value = vibrato.rate;

    const depth = ctx.createGain();
    const delay = vibrato.delay ?? 0;
    depth.gain.setValueAtTime(0, startTime);
    depth.gain.setValueAtTime(0, startTime + delay);
    depth.gain.linearRampToValueAtTime(vibrato.depth, startTime + delay + VIBRATO_FADE_IN);

    lfo.connect(depth);
    oscillators.forEach((osc) => depth.connect(osc.detune));
    lfo.start(startTime);

    nodes.push(depth);
    sources.push(lfo);
  }

  activeVoices += 1;
  let finished = false;
  oscillators[0].onended = () => {
    finished = true;
    activeVoices -= 1;
    sources.forEach((source) => source.disconnect());
    nodes.forEach((node) => node.disconnect());
  };

  if (Number.isFinite(duration)) {
    const releaseAt = Math.max(startTime + Math.max(0, duration), sustainStart);
    amp.gain.setValueAtTime(sustainLevel, releaseAt);
    amp.gain.setTargetAtTime(0, releaseAt, releaseConstant);
    sources.forEach((source) => source.stop(releaseAt + envelope.release));
  }

  const stop = () => {
    if (finished) return;
    const now = Math.max(ctx.currentTime, startTime);
    amp.gain.cancelScheduledValues(now);
    amp.gain.setValueAtTime(amp.gain.value, now);
    amp.gain.setTargetAtTime(0, now, releaseConstant);
    sources.forEach((source) => source.stop(now + envelope.release));
  };

  return { frequency, stop };
};
