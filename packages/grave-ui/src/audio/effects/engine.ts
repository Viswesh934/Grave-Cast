/**
 * Effect engine: turns a recipe into sound.
 *
 * One small function schedules every layer, so adding a new effect never
 * means writing new audio code. Efficiency choices:
 * - noise buffers are generated once and shared (see `noise.ts`)
 * - every effect plays through one shared output bus
 * - rapid retriggers of the same effect are throttled
 * - the number of live layers is capped
 *
 * @module audio/effects/engine
 */

import { getAudioContext, getMasterBus } from '../context';
import { EFFECTS, type EffectName } from './catalog';
import { getNoiseBuffer } from './noise';
import type { EffectDefinition, EffectLayer, NoiseColor, Sweep } from './types';

/** Scales every effect down so layered sounds leave headroom. */
export const EFFECT_HEADROOM = 0.5;

/** Default loudness, 0-1. */
export const DEFAULT_EFFECT_VOLUME = 0.5;

/** Cap on simultaneously sounding layers. Extra layers are skipped. */
export const MAX_ACTIVE_LAYERS = 96;

/** Minimum milliseconds between plays of the same effect. */
const RETRIGGER_MS = 30;

/** Floor for gain, because exponential ramps cannot reach zero. */
const MIN_GAIN = 0.0001;

/** Lowest frequency used for pitch and filter sweeps, in Hz. */
const MIN_HZ = 1;

/** Pitch for a tone layer that does not give one, in Hz. */
const DEFAULT_TONE_HZ = 440;

/** Default fade-in for decay and hold shapes, in seconds. */
const DEFAULT_ATTACK = 0.005;

/** Extra seconds a source keeps running past its layer length. */
const TAIL = 0.05;

/** Where a swell peaks, as a fraction of the layer length. */
const SWELL_PEAK = 0.55;

/** A held layer fades out over this fraction of its length, up to the cap below. */
const HOLD_RELEASE_FRACTION = 0.25;
const HOLD_RELEASE_MAX = 0.15;

/** Time constant for the quick fade when an effect is stopped, in seconds. */
const STOP_FADE = 0.015;

/** Seconds after a stop before sources are cut. */
const STOP_CUT = 0.08;

/**
 * Options for scheduling an effect.
 */
export interface ScheduleOptions {
  /** Loudness, 0-1. @default 0.5 */
  volume?: number;
  /** Pitch multiplier. 2 is an octave up. @default 1 */
  rate?: number;
  /** Seconds from now before the effect starts. @default 0 */
  delay?: number;
  /** Count layers against the live-layer cap. Real-time playback only. @default false */
  track?: boolean;
}

/**
 * Options for playing an effect.
 */
export interface PlayEffectOptions {
  /** Loudness, 0-1. @default 0.5 */
  volume?: number;
  /** Pitch multiplier. 2 is an octave up, 0.5 is an octave down. @default 1 */
  rate?: number;
  /** Seconds from now before the effect starts. @default 0 */
  delay?: number;
}

/**
 * Handle to a playing effect.
 */
export interface EffectPlayback {
  /** Length of the effect in seconds. */
  readonly duration: number;
  /** Fades the effect out quickly and stops it. */
  stop: () => void;
}

/**
 * The result of scheduling an effect.
 */
export interface ScheduledEffect {
  /** Output node for the whole effect. */
  output: GainNode;
  /** Every source started, for stopping early. */
  sources: AudioScheduledSourceNode[];
}

let activeLayers = 0;
const lastPlayed = new Map<string, number>();

const isNoise = (source: EffectLayer['source']): source is NoiseColor =>
  source === 'white' || source === 'pink' || source === 'brown';

const sweepStart = (sweep: Sweep): number => (typeof sweep === 'number' ? sweep : sweep[0]);

const sweepParam = (
  param: AudioParam,
  sweep: Sweep,
  at: number,
  length: number,
  scale: number
): void => {
  const [from, to] = typeof sweep === 'number' ? [sweep, sweep] : sweep;
  const start = Math.max(MIN_HZ, from * scale);
  const end = Math.max(MIN_HZ, to * scale);
  param.setValueAtTime(start, at);
  if (end !== start) param.exponentialRampToValueAtTime(end, at + length);
};

const applyEnvelope = (
  param: AudioParam,
  shape: NonNullable<EffectLayer['shape']>,
  peak: number,
  at: number,
  length: number,
  attack: number
): void => {
  const level = Math.max(MIN_GAIN, peak);
  param.setValueAtTime(0, at);

  if (shape === 'swell') {
    param.linearRampToValueAtTime(level, at + length * SWELL_PEAK);
    param.exponentialRampToValueAtTime(MIN_GAIN, at + length);
    return;
  }

  const rise = Math.min(attack, length / 2);
  param.linearRampToValueAtTime(level, at + rise);

  if (shape === 'hold') {
    const release = Math.min(HOLD_RELEASE_MAX, length * HOLD_RELEASE_FRACTION);
    param.setValueAtTime(level, at + length - release);
    param.linearRampToValueAtTime(0, at + length);
    return;
  }

  param.exponentialRampToValueAtTime(MIN_GAIN, at + length);
};

interface LayerTarget {
  ctx: BaseAudioContext;
  out: AudioNode;
  sources: AudioScheduledSourceNode[];
  track: boolean;
}

const addLayer = (
  target: LayerTarget,
  layer: EffectLayer,
  at: number,
  gain: number,
  pitch: number
): void => {
  const { ctx, out, sources, track } = target;
  const end = at + layer.length + TAIL;

  const amp = ctx.createGain();
  applyEnvelope(amp.gain, layer.shape ?? 'decay', gain, at, layer.length, layer.attack ?? DEFAULT_ATTACK);
  amp.connect(out);
  const nodes: AudioNode[] = [amp];

  let input: AudioNode = amp;
  if (layer.filter) {
    const filter = ctx.createBiquadFilter();
    filter.type = layer.filter.type;
    filter.Q.value = layer.filter.q ?? 1;
    sweepParam(filter.frequency, layer.filter.freq, at, layer.length, pitch);
    filter.connect(amp);
    nodes.push(filter);
    input = filter;
  }

  let main: AudioScheduledSourceNode;

  if (isNoise(layer.source)) {
    const source = ctx.createBufferSource();
    const buffer = getNoiseBuffer(ctx, layer.source);
    source.buffer = buffer;
    source.loop = true;
    source.connect(input);
    source.start(at, Math.random() * Math.max(0, buffer.duration - layer.length));
    source.stop(end);
    main = source;
  } else {
    const osc = ctx.createOscillator();
    const freq = layer.freq ?? DEFAULT_TONE_HZ;
    osc.type = layer.source;
    sweepParam(osc.frequency, freq, at, layer.length, pitch);
    osc.connect(input);

    if (layer.vibrato) {
      const lfo = ctx.createOscillator();
      const depth = ctx.createGain();
      lfo.frequency.value = layer.vibrato.rate;
      depth.gain.value = layer.vibrato.depth;
      lfo.connect(depth);
      depth.connect(osc.detune);
      lfo.start(at);
      lfo.stop(end);
      sources.push(lfo);
      nodes.push(depth);
    }

    if (layer.fm) {
      const baseHz = sweepStart(freq) * pitch;
      const modulator = ctx.createOscillator();
      const deviation = ctx.createGain();
      modulator.frequency.value = Math.max(MIN_HZ, baseHz * layer.fm.ratio);
      deviation.gain.value = baseHz * layer.fm.depth;
      modulator.connect(deviation);
      deviation.connect(osc.frequency);
      modulator.start(at);
      modulator.stop(end);
      sources.push(modulator);
      nodes.push(deviation);
    }

    osc.start(at);
    osc.stop(end);
    main = osc;
  }

  sources.push(main);
  if (track) activeLayers += 1;
  main.onended = () => {
    if (track) activeLayers -= 1;
    nodes.forEach((node) => node.disconnect());
  };
};

/**
 * Schedules every layer of an effect on any audio context, real-time or
 * offline. Most code should use {@link playEffect} instead.
 *
 * @param ctx - The context to schedule on.
 * @param destination - Where the effect's output is connected.
 * @param effect - The effect to schedule.
 * @param options - Volume, pitch, delay, and layer tracking.
 */
export const scheduleEffect = (
  ctx: BaseAudioContext,
  destination: AudioNode,
  effect: EffectDefinition,
  options: ScheduleOptions = {}
): ScheduledEffect => {
  const { volume = DEFAULT_EFFECT_VOLUME, rate = 1, delay = 0, track = false } = options;
  const start = ctx.currentTime + Math.max(0, delay);

  const output = ctx.createGain();
  output.gain.value = volume * EFFECT_HEADROOM;
  output.connect(destination);

  const sources: AudioScheduledSourceNode[] = [];
  const target: LayerTarget = { ctx, out: output, sources, track };

  effect.layers.forEach((layer) => {
    const repeat = layer.repeat;
    const count = repeat ? Math.max(1, Math.floor(repeat.count)) : 1;

    for (let index = 0; index < count; index += 1) {
      if (track && activeLayers >= MAX_ACTIVE_LAYERS) return;

      const interval = repeat?.interval ?? 0;
      const wobble = repeat?.jitter ? (Math.random() * 2 - 1) * repeat.jitter * interval : 0;
      const offset = index === 0 ? 0 : Math.max(0, index * interval + wobble);
      const pitchWobble = repeat?.pitchJitter ? (Math.random() * 2 - 1) * repeat.pitchJitter : 0;

      addLayer(
        target,
        layer,
        start + (layer.start ?? 0) + offset,
        (layer.gain ?? 1) * Math.pow(repeat?.fade ?? 1, index),
        rate * (1 + pitchWobble)
      );
    }
  });

  return { output, sources };
};

/**
 * Plays a sound effect.
 *
 * Does nothing where Web Audio is unavailable, and ignores the same effect
 * if it was started less than 30 ms ago.
 *
 * @param effect - A built-in effect name, or a definition from `createEffect`.
 * @param options - Volume, pitch, and delay.
 * @returns A handle for stopping early, or `null` if nothing played.
 *
 * @example
 * ```ts
 * playEffect('coffinCreak');
 * playEffect('thunder', { volume: 0.8, rate: 0.9 });
 * const playback = playEffect('windHowl');
 * playback?.stop();
 * ```
 */
export const playEffect = (
  effect: EffectName | EffectDefinition,
  options: PlayEffectOptions = {}
): EffectPlayback | null => {
  const ctx = getAudioContext();
  const definition = typeof effect === 'string' ? EFFECTS[effect] : effect;
  if (!ctx || !definition) return null;

  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const last = lastPlayed.get(definition.name);
  if (last !== undefined && now - last < RETRIGGER_MS) return null;
  lastPlayed.set(definition.name, now);

  const { output, sources } = scheduleEffect(ctx, getMasterBus(ctx), definition, {
    ...options,
    track: true,
  });

  return {
    duration: definition.duration,
    stop: () => {
      const stopAt = ctx.currentTime;
      output.gain.cancelScheduledValues(stopAt);
      output.gain.setTargetAtTime(0, stopAt, STOP_FADE);
      sources.forEach((source) => {
        try {
          source.stop(stopAt + STOP_CUT);
        } catch {
          // The source already ended.
        }
      });
    },
  };
};
