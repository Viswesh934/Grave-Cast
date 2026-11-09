/**
 * SpookyAudio - Simple sound effect playback
 *
 * `playSound` plays any effect from the catalog by name. The catalog lives in
 * `./effects`, and the shared audio context in `./context`.
 *
 * @module audio/SpookyAudio
 */

import { playEffect } from './effects/engine';
import type { EffectName } from './effects/catalog';

export { getAudioContext, resumeAudioContext } from './context';

/**
 * Name of any sound effect in the catalog, such as `boneClick` or `thunder`.
 */
export type SoundEffectType = EffectName;

/**
 * Global volume control (0-1)
 */
let globalVolume = 0.5;

/**
 * Plays a sound effect by name.
 *
 * @param effect - Any catalog effect name.
 * @param volume - Loudness from 0 to 1. Defaults to the global volume.
 *
 * @example
 * ```ts
 * playSound('coffinCreak');
 * playSound('thunder', 0.8);
 * ```
 */
export const playSound = (effect: SoundEffectType, volume?: number): void => {
  playEffect(effect, { volume: volume ?? globalVolume });
};

/**
 * Set global volume (0-1)
 */
export const setGlobalVolume = (volume: number): void => {
  globalVolume = Math.max(0, Math.min(1, volume));
};

/**
 * Get current global volume
 */
export const getGlobalVolume = (): number => {
  return globalVolume;
};
