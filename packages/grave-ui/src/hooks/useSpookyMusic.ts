/**
 * useSpookyMusic - The music system as a React hook
 * @module hooks/useSpookyMusic
 */

import { useMemo, useRef } from 'react';
import { createSynth, resumeAudioContext, useSpookyAudio } from '../audio';
import type { Synth, SynthConfig } from '../audio';

/**
 * Scale-aware music playback that respects the global audio switch.
 *
 * Returns a {@link Synth}: the same API as `createSynth`, but every play
 * method is silent while audio is disabled (see `AudioProvider`) and wakes the
 * browser audio context on first use. Without an `AudioProvider` it plays,
 * matching how `useSpookyAudio().playSound` behaves.
 *
 * The synth is rebuilt only when a config value changes. Pass stable values:
 * a scale name, or a custom interval array defined outside the component.
 *
 * @example
 * ```tsx
 * const music = useSpookyMusic({ scale: 'todi', tonic: 'D3', instrument: 'bell' });
 *
 * <button onClick={() => music.note('re')}>re</button>
 * <button onClick={() => music.chordOnDegree(0)}>Chord</button>
 * ```
 *
 * @param config - Scale, tonic, tuning, instrument, and volume.
 * @returns A gated {@link Synth}.
 */
export const useSpookyMusic = (config: SynthConfig = {}): Synth => {
  const { isEnabled } = useSpookyAudio();
  const isEnabledRef = useRef(isEnabled);
  isEnabledRef.current = isEnabled;

  const { scale, tonic, tuning, instrument, volume } = config;

  return useMemo(() => {
    const synth = createSynth({ scale, tonic, tuning, instrument, volume });

    const guard =
      <Args extends unknown[], Result>(play: (...args: Args) => Result, silent: Result) =>
      (...args: Args): Result => {
        if (!isEnabledRef.current()) return silent;
        void resumeAudioContext();
        return play(...args);
      };

    return {
      ...synth,
      note: guard(synth.note, null),
      degree: guard(synth.degree, null),
      chord: guard(synth.chord, []),
      chordOnDegree: guard(synth.chordOnDegree, []),
      arpeggio: guard(synth.arpeggio, 0),
      phrase: guard(synth.phrase, 0),
      drone: guard(synth.drone, null),
    };
  }, [scale, tonic, tuning, instrument, volume]);
};
