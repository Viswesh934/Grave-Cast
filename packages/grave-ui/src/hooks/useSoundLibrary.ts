/**
 * useSoundLibrary - Browse, preview, and download the sound effect catalog
 * @module hooks/useSoundLibrary
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { downloadEffect, listEffects, playEffect, resumeAudioContext, useSpookyAudio } from '../audio';
import type { EffectCategory, EffectDefinition, EffectName, EffectPlayback } from '../audio';

/**
 * Options for {@link useSoundLibrary}.
 */
export interface SoundLibraryOptions {
  /** Only list effects in this category. @default 'all' */
  category?: EffectCategory | 'all';
  /** Search phrase matched against names, descriptions, and tags. */
  query?: string;
  /** Preview loudness, 0-1. Defaults to the engine default. */
  volume?: number;
}

/**
 * Return value of {@link useSoundLibrary}.
 */
export interface SoundLibraryReturn {
  /** Effects matching the current category and search. */
  effects: readonly EffectDefinition[];
  /** Name of the effect currently previewing, or `null`. */
  playing: EffectName | null;
  /** Previews an effect, replacing any that is already playing. */
  play: (name: EffectName) => void;
  /** Stops the current preview. */
  stop: () => void;
  /** Starts the effect, or stops it if it is the one playing. */
  toggle: (name: EffectName) => void;
  /** Renders the effect and saves it as a WAV file. */
  download: (name: EffectName) => Promise<void>;
}

/**
 * The state behind a sound browser: filtering, one-at-a-time previews, and
 * downloads. Previews respect the global audio switch from `AudioProvider`.
 *
 * Use this to build your own sound picker, or use the ready-made
 * `SoundLibrary` component.
 *
 * @example
 * ```tsx
 * const { effects, playing, toggle } = useSoundLibrary({ category: 'doors' });
 *
 * return effects.map((effect) => (
 *   <button key={effect.name} onClick={() => toggle(effect.name as EffectName)}>
 *     {playing === effect.name ? 'Stop' : 'Play'} {effect.label}
 *   </button>
 * ));
 * ```
 */
export const useSoundLibrary = (options: SoundLibraryOptions = {}): SoundLibraryReturn => {
  const { category = 'all', query = '', volume } = options;

  const { isEnabled } = useSpookyAudio();
  const isEnabledRef = useRef(isEnabled);
  isEnabledRef.current = isEnabled;

  const effects = useMemo(() => listEffects({ category, query }), [category, query]);

  const [playing, setPlaying] = useState<EffectName | null>(null);
  const playbackRef = useRef<EffectPlayback | null>(null);
  const timerRef = useRef<number | undefined>(undefined);

  const halt = useCallback(() => {
    playbackRef.current?.stop();
    playbackRef.current = null;
    window.clearTimeout(timerRef.current);
  }, []);

  const stop = useCallback(() => {
    halt();
    setPlaying(null);
  }, [halt]);

  const play = useCallback(
    (name: EffectName) => {
      halt();
      if (!isEnabledRef.current()) {
        setPlaying(null);
        return;
      }

      void resumeAudioContext();
      const playback = playEffect(name, { volume });
      if (!playback) {
        setPlaying(null);
        return;
      }

      playbackRef.current = playback;
      setPlaying(name);
      timerRef.current = window.setTimeout(() => {
        playbackRef.current = null;
        setPlaying((current) => (current === name ? null : current));
      }, playback.duration * 1000);
    },
    [halt, volume]
  );

  const toggle = useCallback(
    (name: EffectName) => {
      if (playing === name) stop();
      else play(name);
    },
    [playing, play, stop]
  );

  const download = useCallback((name: EffectName) => downloadEffect(name), []);

  // Silence any preview still running when the component unmounts.
  useEffect(() => halt, [halt]);

  return { effects, playing, play, stop, toggle, download };
};
