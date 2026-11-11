/**
 * Small signal-processing helpers for voice effects.
 *
 * Pure TypeScript with no DOM dependency, so each can be tested on its own.
 *
 * @module voice/dsp
 */

import { SEMITONES_PER_OCTAVE } from '../audio/music/theory';

/** How many points the distortion curve is sampled at. */
export const DISTORTION_CURVE_POINTS = 1024;
 
/** How hard the strongest distortion pushes the signal into the curve. */
const MAX_DRIVE = 20;

/** Seed for the reverb noise, so a room always sounds the same. */
export const REVERB_SEED = 0x9e3779b9;

/** Shape of the reverb fade. Higher dies away faster. */
export const REVERB_DECAY = 3;

/**
 * Playback rate that raises the pitch by `semitones` (negative lowers it).
 * Pitch and speed move together at this rate.
 */
export const semitonesToRate = (semitones: number): number => Math.pow(2, semitones / SEMITONES_PER_OCTAVE);

/** The number of semitones a playback rate shifts the pitch by. */
export const rateToSemitones = (rate: number): number =>
  rate > 0 ? SEMITONES_PER_OCTAVE * Math.log2(rate) : Number.NEGATIVE_INFINITY;

/**
 * A curve for a waveshaper that adds crunch. Higher `amount` squashes the
 * signal harder. Returns `null` for 0, meaning no shaping is needed.
 *
 * @param amount - 0 (clean) to 1 (heavy).
 */
export const distortionCurve = (amount: number, points: number = DISTORTION_CURVE_POINTS): Float32Array | null => {
  const clamped = Math.min(1, Math.max(0, amount));
  if (clamped === 0) return null;

  const drive = 1 + clamped * (MAX_DRIVE - 1);
  const norm = Math.tanh(drive);
  const curve = new Float32Array(points);
  for (let i = 0; i < points; i += 1) {
    const x = (i / (points - 1)) * 2 - 1;
    curve[i] = Math.tanh(drive * x) / norm;
  }
  return curve;
};

/** A tiny, fast random number generator that always gives the same sequence for a seed. */
export const createSeededRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * Builds a simple room reverb as decaying noise.
 *
 * @param seconds - How long the room rings.
 * @param sampleRate - Samples per second.
 * @param channels - Number of channels. Each gets different noise, which widens the sound.
 * @returns One array of samples per channel.
 */
export const buildImpulse = (
  seconds: number,
  sampleRate: number,
  channels: number = 2,
  decay: number = REVERB_DECAY
): Float32Array[] => {
  const length = Math.max(1, Math.round(seconds * sampleRate));
  const random = createSeededRandom(REVERB_SEED);
  const out: Float32Array[] = [];
  for (let channel = 0; channel < channels; channel += 1) {
    const samples = new Float32Array(length);
    for (let i = 0; i < length; i += 1) {
      const fade = Math.pow(1 - i / length, decay);
      samples[i] = (random() * 2 - 1) * fade;
    }
    out.push(samples);
  }
  return out;
};
