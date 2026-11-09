/**
 * Cached noise buffers.
 *
 * Noise is generated once per color and sample rate, then every layer reads
 * from the same buffer at a random offset. Generating a fresh buffer on every
 * play was the main cost of the original sound effects.
 *
 * @module audio/effects/noise
 */

import type { NoiseColor } from './types';

/** Seconds of noise per buffer. Long enough that most layers never loop. */
const NOISE_SECONDS = 4;

/** Paul Kellet's economy pink noise filter coefficients. */
const PINK = {
  poles: [0.99886, 0.99332, 0.969, 0.8665, 0.55, -0.7616] as const,
  inputs: [0.0555179, 0.0750759, 0.153852, 0.3104856, 0.5329522, -0.016898] as const,
  direct: 0.5362,
  tail: 0.115926,
  scale: 0.11,
} as const;

/** Leaky integrator settings for brown noise. */
const BROWN = { leak: 1.02, step: 0.02, scale: 3.5 } as const;

const cache = new Map<string, AudioBuffer>();

const fillWhite = (data: Float32Array): void => {
  for (let i = 0; i < data.length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
};

const fillPink = (data: Float32Array): void => {
  const state = [0, 0, 0, 0, 0, 0];
  let tail = 0;
  for (let i = 0; i < data.length; i += 1) {
    const white = Math.random() * 2 - 1;
    let sum = 0;
    for (let k = 0; k < state.length; k += 1) {
      state[k] = PINK.poles[k] * state[k] + white * PINK.inputs[k];
      sum += state[k];
    }
    data[i] = (sum + tail + white * PINK.direct) * PINK.scale;
    tail = white * PINK.tail;
  }
};

const fillBrown = (data: Float32Array): void => {
  let last = 0;
  for (let i = 0; i < data.length; i += 1) {
    const white = Math.random() * 2 - 1;
    last = (last + BROWN.step * white) / BROWN.leak;
    data[i] = last * BROWN.scale;
  }
};

/**
 * Gets the shared noise buffer for a color, generating it on first use.
 */
export const getNoiseBuffer = (ctx: BaseAudioContext, color: NoiseColor): AudioBuffer => {
  const key = `${color}:${ctx.sampleRate}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * NOISE_SECONDS), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  if (color === 'white') fillWhite(data);
  else if (color === 'pink') fillPink(data);
  else fillBrown(data);

  cache.set(key, buffer);
  return buffer;
};
