/**
 * useOccultMic - Listen to the microphone and tell whispers, voices, blows, and screams apart
 * @module hooks/useOccultMic
 */

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import {
  DEFAULT_THRESHOLDS,
  MIC_ANALYSIS,
  createSoundDetector,
  getAudioContext,
  levelFromRms,
  lowFrequencyRatio,
  resumeAudioContext,
  rmsOf,
  smoothLevel,
} from '../audio';
import type { SoundKind, SoundThresholds } from '../audio';
import { MEDIA_MESSAGES, useMediaStream, type MediaStatus } from './useMediaStream';

/** How many times per second the `level` state is refreshed. */
export const DEFAULT_LEVEL_UPDATE_HZ = 20;

/** Smallest level change worth re-rendering for. */
const LEVEL_EPSILON = 0.01;

/** Milliseconds in a second. */
const MS_PER_SECOND = 1000;

/**
 * Fraction of the whisper threshold below which the spectrum is not worth
 * analysing, which saves work during silence.
 */
const SILENCE_GATE = 0.5;

/** Message when the browser has no Web Audio, so the stream could not be analysed. */
const NO_AUDIO_MESSAGE = 'Web Audio is not available, so the microphone cannot be analysed.';

/**
 * Microphone settings for analysis. Browsers normally clean up voice calls by
 * cancelling echo, suppressing noise, and levelling volume, which would erase
 * the breaths and whispers this hook listens for.
 */
export const OCCULT_MIC_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: false,
  noiseSuppression: false,
  autoGainControl: false,
};

/**
 * Reported when a sound begins.
 */
export interface SoundEvent {
  /** What kind of sound it is. */
  kind: SoundKind;
  /** Smoothed level when it began, 0-1. */
  level: number;
  /** Time of the event in milliseconds (a `requestAnimationFrame` timestamp). */
  at: number;
}

/**
 * Options for {@link useOccultMic}.
 */
export interface OccultMicOptions {
  /** Override where each kind of sound begins. */
  thresholds?: Partial<SoundThresholds>;
  /** Milliseconds before the same kind of sound can be reported again. @default 400 */
  cooldownMs?: number;
  /** How often the `level` state refreshes. `levelRef` always updates every frame. @default 20 */
  updateHz?: number;
  /** Called once each time a sound begins. */
  onSound?: (event: SoundEvent) => void;
}

/**
 * Return value of {@link useOccultMic}.
 */
export interface OccultMicReturn {
  /** Microphone status. */
  status: MediaStatus;
  /** A readable explanation when something went wrong, otherwise `null`. */
  error: string | null;
  /** `true` while the microphone is live. */
  isListening: boolean;
  /** Smoothed loudness from 0 to 1, refreshed `updateHz` times a second. */
  level: number;
  /**
   * The same level, updated every frame without re-rendering. Read it inside
   * your own animation loop for smooth effects.
   */
  levelRef: MutableRefObject<number>;
  /** The sound happening right now, or `null`. */
  sound: SoundKind | null;
  /** Asks for the microphone. Call from a click. Resolves `true` if listening began. */
  start: () => Promise<boolean>;
  /** Turns the microphone off. */
  stop: () => void;
}

/**
 * Listens to the microphone and reports how loud it is and what kind of
 * sound it hears: a whisper, a voice, a blow (breath on the microphone), or a
 * scream.
 *
 * - Asks for permission only when `start()` is called.
 * - Analysis happens on the device. Nothing is recorded, saved, or sent, and
 *   the microphone is never connected to the speakers.
 * - Stops listening and releases the microphone on unmount.
 *
 * The blow and scream thresholds are sensible defaults, but microphones
 * differ a lot. Tune `thresholds` against the real devices you care about.
 *
 * Heads up: if you play sound through speakers in response to what the
 * microphone hears, the speakers can feed back into the microphone. Use
 * headphones, or keep triggered sounds quiet and short.
 *
 * @example
 * ```tsx
 * const mic = useOccultMic({ onSound: ({ kind }) => console.log(kind) });
 *
 * return (
 *   <button onClick={mic.isListening ? mic.stop : mic.start}>
 *     {mic.isListening ? 'Stop' : 'Listen'} ({Math.round(mic.level * 100)}%)
 *   </button>
 * );
 * ```
 */
export const useOccultMic = (options: OccultMicOptions = {}): OccultMicReturn => {
  const { thresholds, cooldownMs, updateHz = DEFAULT_LEVEL_UPDATE_HZ, onSound } = options;

  const { stream, status, error, start: startMedia, stop: stopMedia } = useMediaStream({
    audio: OCCULT_MIC_CONSTRAINTS,
  });

  const [level, setLevel] = useState(0);
  const [sound, setSound] = useState<SoundKind | null>(null);
  const [noAudio, setNoAudio] = useState(false);

  const levelRef = useRef(0);
  const onSoundRef = useRef(onSound);
  onSoundRef.current = onSound;

  // A stable key, so passing a fresh object each render does not restart listening.
  const thresholdsKey = JSON.stringify(thresholds ?? {});

  useEffect(() => {
    if (!stream) return undefined;
    const ctx = getAudioContext();
    if (!ctx) return undefined;
    void resumeAudioContext();

    const limits = { ...DEFAULT_THRESHOLDS, ...(JSON.parse(thresholdsKey) as Partial<SoundThresholds>) };
    const detector = createSoundDetector(limits, cooldownMs === undefined ? {} : { cooldown: cooldownMs });

    // Deliberately not connected to the speakers, which would cause feedback.
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = MIC_ANALYSIS.fftSize;
    analyser.smoothingTimeConstant = 0;
    source.connect(analyser);

    const timeBuffer = new Float32Array(analyser.fftSize);
    const spectrumBuffer = new Float32Array(analyser.frequencyBinCount);
    const gate = limits.whisper * SILENCE_GATE;
    const publishEvery = MS_PER_SECOND / Math.max(1, updateHz);

    let frame = 0;
    let last = performance.now();
    let lastPublish = 0;
    let smoothed = 0;
    let detected = 0;
    let published = 0;
    let lastSound: SoundKind | null = null;

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);

      analyser.getFloatTimeDomainData(timeBuffer);
      const raw = levelFromRms(rmsOf(timeBuffer));
      const elapsed = now - last;
      last = now;

      // Two views of the same reading: a slow one to show, and a quick one to
      // decide with, so the fading tail of a sound is not mistaken for a whisper.
      smoothed = smoothLevel(smoothed, raw, elapsed);
      detected = smoothLevel(detected, raw, elapsed, MIC_ANALYSIS.attackMs, MIC_ANALYSIS.detectReleaseMs);
      levelRef.current = smoothed;

      let lowRatio = 0;
      if (detected >= gate) {
        analyser.getFloatFrequencyData(spectrumBuffer);
        lowRatio = lowFrequencyRatio(spectrumBuffer, ctx.sampleRate, analyser.fftSize);
      }

      const result = detector.update({ level: detected, lowRatio, now });
      if (result.sound !== lastSound) {
        lastSound = result.sound;
        setSound(result.sound);
      }
      if (result.onset) onSoundRef.current?.({ kind: result.onset, level: detected, at: now });

      if (now - lastPublish >= publishEvery) {
        lastPublish = now;
        if (Math.abs(smoothed - published) >= LEVEL_EPSILON) {
          published = smoothed;
          setLevel(smoothed);
        }
      }
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      source.disconnect();
      analyser.disconnect();
      detector.reset();
      levelRef.current = 0;
      setLevel(0);
      setSound(null);
    };
  }, [stream, thresholdsKey, cooldownMs, updateHz]);

  const start = useCallback(async (): Promise<boolean> => {
    if (!getAudioContext()) {
      setNoAudio(true);
      return false;
    }
    setNoAudio(false);
    void resumeAudioContext();
    return (await startMedia()) !== null;
  }, [startMedia]);

  const stop = useCallback(() => {
    setNoAudio(false);
    stopMedia();
  }, [stopMedia]);

  return {
    status: noAudio ? 'unavailable' : status,
    error: noAudio ? NO_AUDIO_MESSAGE : error ?? (status === 'unavailable' ? MEDIA_MESSAGES.missing : null),
    isListening: status === 'active' && !noAudio,
    level,
    levelRef,
    sound,
    start,
    stop,
  };
};
