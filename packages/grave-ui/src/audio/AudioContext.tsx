import React, { createContext, useContext, useMemo, useRef, useCallback, type ReactNode } from 'react';
import { playSound, resumeAudioContext } from './SpookyAudio';
import type { SoundEffectType } from './SpookyAudio';

export type SpookySound = SoundEffectType;

interface AudioContextValue {
  playSound: (sound: SpookySound, volume?: number) => void;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  /**
   * Live read of the global audio switch. Unlike `enabled`, which is a
   * snapshot from the last render, this always reflects the current state.
   * Without a provider it returns `true`, matching how `playSound` behaves.
   */
  isEnabled: () => boolean;
}

const AudioContext = createContext<AudioContextValue | null>(null);

interface AudioProviderProps {
  children: ReactNode;
  initialEnabled?: boolean;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ 
  children, 
  initialEnabled = false 
}) => {
  const enabledRef = useRef(initialEnabled);
  const initializedRef = useRef(false);

  // Initialize audio context on first interaction when enabled
  const ensureInitialized = useCallback(async () => {
    if (!initializedRef.current) {
      await resumeAudioContext();
      initializedRef.current = true;
    }
  }, []);

  const play = useCallback(async (sound: SpookySound, volume: number = 0.5) => {
    if (enabledRef.current) {
      await ensureInitialized();
      playSound(sound, volume);
    }
  }, [ensureInitialized]);

  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
  }, []);

  const isEnabled = useCallback(() => enabledRef.current, []);

  const value: AudioContextValue = {
    playSound: play,
    enabled: enabledRef.current,
    setEnabled,
    isEnabled,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

let warnedNoProvider = false;

/**
 * Access the spooky audio controls.
 *
 * Works with or without an {@link AudioProvider}. Inside a provider you get the
 * shared, globally-mutable audio state. Outside one, this returns a safe
 * fallback: `enabled` is `false` (audio stays opt-in), but calling `playSound`
 * still works so standalone components never crash just because audio wasn't
 * wired up. Wrap your app in `AudioProvider` to control audio globally.
 */
export const useSpookyAudio = (): AudioContextValue => {
  const context = useContext(AudioContext);

  // Provider-less fallback: never throw, just behave as muted-by-default.
  const fallback = useMemo<AudioContextValue>(
    () => ({
      playSound: (sound: SpookySound, volume: number = 0.5) => {
        void resumeAudioContext().then(() => playSound(sound, volume));
      },
      enabled: false,
      setEnabled: () => {},
      isEnabled: () => true,
    }),
    []
  );

  if (!context) {
    if (!warnedNoProvider) {
      warnedNoProvider = true;
      console.warn(
        '[grave-ui] useSpookyAudio is being used outside an AudioProvider. ' +
          'Audio is disabled by default; wrap your app in <AudioProvider> to enable global control.'
      );
    }
    return fallback;
  }

  return context;
};
