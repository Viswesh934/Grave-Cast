import React, { createContext, useContext, useRef, useCallback, type ReactNode } from 'react';
import { playSound, resumeAudioContext } from './SpookyAudio';
import type { SoundEffectType } from './SpookyAudio';

export type SpookySound = SoundEffectType;

interface AudioContextValue {
  playSound: (sound: SpookySound, volume?: number) => void;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
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

  const value: AudioContextValue = {
    playSound: play,
    enabled: enabledRef.current,
    setEnabled,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

export const useSpookyAudio = (): AudioContextValue => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useSpookyAudio must be used within an AudioProvider');
  }
  return context;
};
