/**
 * Offline rendering: turn an effect into an audio file.
 *
 * Uses the same engine as live playback, scheduled on an offline context, so
 * downloads sound exactly like the previews.
 *
 * @module audio/effects/render
 */

import { EFFECTS, type EffectName } from './catalog';
import { scheduleEffect } from './engine';
import { encodeWav, normalizeSamples } from './wav';
import type { EffectDefinition } from './types';

/** Samples per second for rendered files. */
const RENDER_SAMPLE_RATE = 44100;

/** Extra seconds rendered after the effect so tails are not cut off. */
const RENDER_TAIL = 0.2;

/** Full-scale volume for rendering. Files are normalised afterwards. */
const RENDER_VOLUME = 1;

/**
 * Options for rendering an effect.
 */
export interface RenderEffectOptions {
  /** Pitch multiplier. @default 1 */
  rate?: number;
  /** Samples per second. @default 44100 */
  sampleRate?: number;
}

const resolve = (effect: EffectName | EffectDefinition): EffectDefinition => {
  const definition = typeof effect === 'string' ? EFFECTS[effect] : effect;
  if (!definition) {
    throw new Error(`[grave-ui] Unknown sound effect "${String(effect)}".`);
  }
  return definition;
};

/**
 * Renders an effect to an audio buffer without playing it.
 *
 * @throws Where `OfflineAudioContext` is unavailable.
 */
export const renderEffect = async (
  effect: EffectName | EffectDefinition,
  options: RenderEffectOptions = {}
): Promise<AudioBuffer> => {
  if (typeof OfflineAudioContext === 'undefined') {
    throw new Error('[grave-ui] Rendering sound effects needs a browser with OfflineAudioContext.');
  }

  const definition = resolve(effect);
  const sampleRate = options.sampleRate ?? RENDER_SAMPLE_RATE;
  const frames = Math.ceil((definition.duration + RENDER_TAIL) * sampleRate);

  const offline = new OfflineAudioContext(1, frames, sampleRate);
  scheduleEffect(offline, offline.destination, definition, {
    volume: RENDER_VOLUME,
    rate: options.rate,
  });

  return offline.startRendering();
};

/**
 * Renders an effect to a WAV file, normalised to a consistent loudness.
 */
export const effectToWav = async (
  effect: EffectName | EffectDefinition,
  options: RenderEffectOptions = {}
): Promise<Blob> => {
  const buffer = await renderEffect(effect, options);
  return encodeWav([normalizeSamples(buffer.getChannelData(0))], buffer.sampleRate);
};

/**
 * Renders an effect and saves it as a WAV file through the browser.
 *
 * @param effect - A built-in effect name, or a definition from `createEffect`.
 * @param filename - File name. Defaults to the effect name.
 *
 * @example
 * ```ts
 * await downloadEffect('coffinCreak'); // saves coffinCreak.wav
 * ```
 */
export const downloadEffect = async (
  effect: EffectName | EffectDefinition,
  filename?: string,
  options: RenderEffectOptions = {}
): Promise<void> => {
  const definition = resolve(effect);
  const blob = await effectToWav(definition, options);
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename ?? `${definition.name}.wav`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
