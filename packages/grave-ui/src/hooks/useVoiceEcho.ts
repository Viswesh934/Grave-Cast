/**
 * useVoiceEcho - Say something and hear it repeated back in another voice
 * @module hooks/useVoiceEcho
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MIC_ANALYSIS,
  encodeWav,
  getAudioContext,
  levelFromRms,
  resumeAudioContext,
  rmsOf,
  smoothLevel,
} from '../audio';
import { getMasterBus } from '../audio/context';
import {
  PERSONAS,
  adaptPersona,
  canRenderPersona,
  createUtteranceGate,
  renderPersona,
  type UtteranceGateOptions,
  type VoiceContext,
  type VoicePersona,
} from '../voice';
import { useKeepsake, type Keepsake } from './useKeepsake';
import { isMediaSupported } from './useMediaStream';

/** Milliseconds to stay deaf after the voice finishes, so its tail is not heard as speech. */
export const ECHO_RESUME_DELAY_MS = 400;

/** How many times per second the level states refresh. */
export const ECHO_UPDATE_HZ = 20;

/** Smallest level change worth re-rendering for. */
const LEVEL_EPSILON = 0.01;

/** Milliseconds in a second. */
const MS_PER_SECOND = 1000;

/** Messages for each thing that can go wrong. */
export const ECHO_MESSAGES = {
  unsupported: 'This browser cannot record and change voices here.',
  decode: 'That recording could not be read. Try again.',
  render: 'The voice could not be changed. Try again.',
} as const;

/**
 * What the echo is doing.
 *
 * - `off`: no microphone
 * - `listening`: waiting for you to speak
 * - `recording`: capturing a phrase
 * - `processing`: changing the voice
 * - `speaking`: playing the changed voice back
 */
export type EchoState = 'off' | 'listening' | 'recording' | 'processing' | 'speaking';

/**
 * Options for {@link useVoiceEcho}.
 */
export interface VoiceEchoOptions {
  /**
   * A microphone stream, for example from `useMediaStream({ audio: true })`.
   * Leave echo cancellation on (the default) so the speakers do not feed back.
   * `null` turns the echo off.
   */
  stream: MediaStream | null;
  /** The voice to answer in. @default 'demon' */
  persona?: VoicePersona;
  /** Coarse signals the voice may adapt to. See `adaptPersona`. */
  context?: VoiceContext;
  /** When a phrase starts and ends. See `createUtteranceGate`. */
  gate?: UtteranceGateOptions;
  /** Play each phrase back as soon as it is ready. @default true */
  autoPlay?: boolean;
  /** Called each time a changed voice is ready. */
  onClip?: (clip: Keepsake) => void;
}

/**
 * Return value of {@link useVoiceEcho}.
 */
export interface VoiceEchoReturn {
  /** Whether this browser can record, change, and play voices. */
  supported: boolean;
  /** What the echo is doing. */
  state: EchoState;
  /** How loud the microphone is, 0-1. */
  level: number;
  /** How loud the changed voice is while playing, 0-1. Useful for moving a mouth. */
  outputLevel: number;
  /** A readable explanation when something went wrong, otherwise `null`. */
  error: string | null;
  /** The latest changed voice, held in memory only. `null` if none or discarded. */
  clip: Keepsake | null;
  /** Plays the last phrase again, optionally in a different persona. */
  replay: (persona?: VoicePersona) => Promise<void>;
  /** Saves the held clip to the user's device as a download. */
  keep: () => void;
  /** Lets go of the held clip and the recording it came from. */
  discard: () => void;
}

/** Whether this browser can record a microphone, render effects, and play them. */
export const isVoiceEchoSupported = (): boolean =>
  isMediaSupported() &&
  typeof MediaRecorder !== 'undefined' &&
  canRenderPersona() &&
  typeof window !== 'undefined' &&
  (typeof window.AudioContext !== 'undefined' ||
    typeof (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext !== 'undefined');

/**
 * Listens for a spoken phrase and answers with the same words in a changed
 * voice, like a talking pet that repeats what you say.
 *
 * How it works: a gate notices when you start and stop talking, the phrase is
 * recorded, the chosen persona is applied, and the result is played back.
 * While the changed voice plays, the microphone is ignored so the speakers do
 * not trigger a new phrase.
 *
 * Privacy:
 * - Everything happens in the browser. Nothing is uploaded.
 * - Nothing is saved. The latest changed voice is held in memory as `clip`,
 *   and is only saved if the user calls `keep()`, which downloads it.
 * - The microphone is never connected to the speakers. Only the changed copy
 *   is played.
 *
 * Limits: the first fraction of a second of a phrase can be clipped, because a
 * recording takes a moment to start. Use headphones for the cleanest result.
 *
 * @example
 * ```tsx
 * const mic = useMediaStream({ audio: true });
 * const echo = useVoiceEcho({ stream: mic.stream, persona: 'demon' });
 *
 * return (
 *   <>
 *     <button onClick={mic.start}>Start</button>
 *     <p>{echo.state}</p>
 *     {echo.clip && <button onClick={echo.keep}>Keep it</button>}
 *   </>
 * );
 * ```
 */
export const useVoiceEcho = (options: VoiceEchoOptions): VoiceEchoReturn => {
  const { stream, persona = 'demon', context, gate: gateOptions, autoPlay = true, onClip } = options;

  const supported = isVoiceEchoSupported();
  const { item: clip, hold, keep, discard: discardClip } = useKeepsake();

  const [state, setState] = useState<EchoState>('off');
  const [level, setLevel] = useState(0);
  const [outputLevel, setOutputLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const personaRef = useRef(persona);
  personaRef.current = persona;
  const contextRef = useRef(context);
  contextRef.current = context;
  const autoPlayRef = useRef(autoPlay);
  autoPlayRef.current = autoPlay;
  const onClipRef = useRef(onClip);
  onClipRef.current = onClip;

  const rawRef = useRef<AudioBuffer | null>(null);
  const busyRef = useRef(false);
  const recordingRef = useRef(false);
  const listeningRef = useRef(false);
  const epochRef = useRef(0);
  const resumeAtRef = useRef(0);
  const playbackRef = useRef<{ source: AudioBufferSourceNode; analyser: AnalyserNode } | null>(null);

  // A stable key, so passing a fresh object each render does not restart listening.
  const gateKey = JSON.stringify(gateOptions ?? {});

  const playRendered = useCallback((ctx: AudioContext, buffer: AudioBuffer): Promise<void> => {
    return new Promise<void>((resolve) => {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = MIC_ANALYSIS.fftSize;
      source.connect(analyser);
      // Through the shared limiter, like every other Grave-UI sound.
      analyser.connect(getMasterBus(ctx));
      playbackRef.current = { source, analyser };

      source.onended = () => {
        source.disconnect();
        analyser.disconnect();
        if (playbackRef.current?.source === source) playbackRef.current = null;
        resolve();
      };

      setState('speaking');
      void resumeAudioContext();
      source.start();
    });
  }, []);

  const runPersona = useCallback(
    async (buffer: AudioBuffer, name: VoicePersona, play: boolean): Promise<void> => {
      const ctx = getAudioContext();
      if (!ctx) return;
      const epoch = epochRef.current;

      busyRef.current = true;
      setState('processing');
      setError(null);

      try {
        const settings = adaptPersona(PERSONAS[name], contextRef.current);
        const rendered = await renderPersona(buffer, settings.effects);
        if (epoch !== epochRef.current) return;

        const lastChannel = Math.min(1, rendered.numberOfChannels - 1);
        const wav = encodeWav(
          [rendered.getChannelData(0), rendered.getChannelData(lastChannel)],
          rendered.sampleRate
        );
        const item = hold(wav, {
          filename: `${name}-voice.wav`,
          durationMs: rendered.duration * MS_PER_SECOND,
          label: PERSONAS[name].label,
        });
        onClipRef.current?.(item);

        if (play) await playRendered(ctx, rendered);
      } catch {
        if (epoch === epochRef.current) setError(ECHO_MESSAGES.render);
      } finally {
        busyRef.current = false;
        if (epoch === epochRef.current) {
          resumeAtRef.current = performance.now() + ECHO_RESUME_DELAY_MS;
          setOutputLevel(0);
          setState(listeningRef.current ? 'listening' : 'off');
        }
      }
    },
    [hold, playRendered]
  );

  useEffect(() => {
    if (!stream || !supported) return undefined;
    const ctx = getAudioContext();
    if (!ctx) return undefined;
    void resumeAudioContext();

    // Deliberately not connected to the speakers, which would cause feedback.
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = MIC_ANALYSIS.fftSize;
    analyser.smoothingTimeConstant = 0;
    source.connect(analyser);

    const gate = createUtteranceGate(JSON.parse(gateKey) as UtteranceGateOptions);
    const timeBuffer = new Float32Array(analyser.fftSize);
    const publishEvery = MS_PER_SECOND / ECHO_UPDATE_HZ;

    const handlePhrase = async (blob: Blob, epoch: number): Promise<void> => {
      let decoded: AudioBuffer;
      try {
        decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
      } catch {
        if (epoch === epochRef.current) {
          setError(ECHO_MESSAGES.decode);
          busyRef.current = false;
          resumeAtRef.current = performance.now() + ECHO_RESUME_DELAY_MS;
          setState('listening');
        }
        return;
      }
      if (epoch !== epochRef.current) {
        busyRef.current = false;
        return;
      }
      rawRef.current = decoded;
      await runPersona(decoded, personaRef.current, autoPlayRef.current);
    };

    /** Starts recording a phrase. `finish(true)` hands it on; `finish(false)` throws it away. */
    const beginCapture = (epoch: number): { finish: (keepPhrase: boolean) => void } => {
      const parts: Blob[] = [];
      let keepPhrase = false;
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) parts.push(event.data);
      };
      recorder.onstop = () => {
        if (!keepPhrase) return;
        void handlePhrase(new Blob(parts, { type: recorder.mimeType }), epoch);
      };
      recorder.start();
      return {
        finish: (keepIt) => {
          keepPhrase = keepIt;
          if (recorder.state !== 'inactive') recorder.stop();
        },
      };
    };

    const epoch = epochRef.current;
    let capture: { finish: (keepPhrase: boolean) => void } | null = null;
    let frame = 0;
    let last = performance.now();
    let lastPublish = 0;
    let published = 0;
    let smoothed = 0;
    let detected = 0;

    listeningRef.current = true;
    setState('listening');

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);

      analyser.getFloatTimeDomainData(timeBuffer);
      const raw = levelFromRms(rmsOf(timeBuffer));
      const elapsed = now - last;
      last = now;

      // A slow level to show, and a quick one to decide with.
      smoothed = smoothLevel(smoothed, raw, elapsed);
      detected = smoothLevel(detected, raw, elapsed, MIC_ANALYSIS.attackMs, MIC_ANALYSIS.detectReleaseMs);

      if (now - lastPublish >= publishEvery) {
        lastPublish = now;
        if (Math.abs(smoothed - published) >= LEVEL_EPSILON) {
          published = smoothed;
          setLevel(smoothed);
        }
      }

      // Deaf while the changed voice is being made or played.
      if (busyRef.current || now < resumeAtRef.current) return;

      const result = gate.update({ level: detected, now });
      if (result.event === 'started') {
        capture = beginCapture(epoch);
        recordingRef.current = true;
        setState('recording');
      } else if (result.event === 'ended') {
        busyRef.current = true;
        recordingRef.current = false;
        setState('processing');
        capture?.finish(true);
        capture = null;
      } else if (result.event === 'discarded') {
        recordingRef.current = false;
        capture?.finish(false);
        capture = null;
        setState('listening');
      }
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      capture?.finish(false);
      capture = null;
      recordingRef.current = false;
      listeningRef.current = false;
      epochRef.current += 1;
      try {
        playbackRef.current?.source.stop();
      } catch {
        // Already stopped.
      }
      source.disconnect();
      analyser.disconnect();
      gate.reset();
      setLevel(0);
      setOutputLevel(0);
      setState('off');
    };
  }, [stream, supported, gateKey, runPersona]);

  // Follow the changed voice's loudness while it plays, to move a mouth.
  useEffect(() => {
    if (state !== 'speaking') return undefined;
    const playback = playbackRef.current;
    if (!playback) return undefined;

    const samples = new Float32Array(playback.analyser.fftSize);
    const publishEvery = MS_PER_SECOND / ECHO_UPDATE_HZ;
    let frame = 0;
    let lastPublish = 0;
    let published = 0;

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (now - lastPublish < publishEvery) return;
      lastPublish = now;
      playback.analyser.getFloatTimeDomainData(samples);
      const next = levelFromRms(rmsOf(samples));
      if (Math.abs(next - published) >= LEVEL_EPSILON) {
        published = next;
        setOutputLevel(next);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [state]);

  // Let go of any playing voice when the component goes away.
  useEffect(
    () => () => {
      epochRef.current += 1;
      try {
        playbackRef.current?.source.stop();
      } catch {
        // Already stopped.
      }
    },
    []
  );

  const replay = useCallback(
    async (next?: VoicePersona): Promise<void> => {
      const buffer = rawRef.current;
      if (!buffer || busyRef.current || recordingRef.current) return;
      await runPersona(buffer, next ?? personaRef.current, true);
    },
    [runPersona]
  );

  const discard = useCallback(() => {
    rawRef.current = null;
    discardClip();
  }, [discardClip]);

  return {
    supported,
    state,
    level,
    outputLevel,
    error: supported ? error : ECHO_MESSAGES.unsupported,
    clip,
    replay,
    keep,
    discard,
  };
};
