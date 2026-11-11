/**
 * useStudio - A small recording studio: tracks, takes, playback, recording, and export
 * @module hooks/useStudio
 */

import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type Dispatch } from 'react';
import { MIC_ANALYSIS, getAudioContext, levelFromRms, resumeAudioContext, rmsOf } from '../audio';
import { getMasterBus } from '../audio/context';
import {
  computePeaks,
  createHistory,
  createProject,
  findTrack,
  projectEndSeconds,
  reduceStudio,
  renderStudio,
  scheduleStudio,
  secondsToBeats,
  studioToWav,
  type StudioAction,
  type StudioPlayback,
  type StudioProject,
  type StudioTake,
} from '../studio';
import { useKeepsake, type Keepsake } from './useKeepsake';

/** Timing and limits used by the studio hook. */
export const STUDIO_HOOK_TOKENS = {
  /** Seconds between asking for playback and hearing it, so nothing is cut off. */
  leadSeconds: 0.05,
  /** How many times per second the playhead and meter update. */
  updateHz: 20,
  /** Milliseconds to wait after an edit before replaying with it. */
  rescheduleDelayMs: 150,
  /** Longest recording or imported file, in seconds, so memory stays bounded. */
  maxTakeSeconds: 300,
  /** Smallest level change worth re-rendering the meter for. */
  levelEpsilon: 0.01,
} as const;

/** Milliseconds in a second. */
const MS_PER_SECOND = 1000;

/** File name used when a song has no usable name. */
const FALLBACK_FILE_NAME = 'song';

/** Messages for each thing that can go wrong. */
export const STUDIO_MESSAGES = {
  noAudio: 'This browser cannot play audio here.',
  noRecorder: 'This browser cannot record audio here.',
  noMicrophone: 'Turn the microphone on before recording.',
  notVoiceTrack: 'Recordings go on voice tracks.',
  decode: 'That audio could not be read.',
  tooLong: 'That audio is too long for the studio.',
  nothingToExport: 'There is nothing to export yet. Add lyrics or a recording.',
  exportFailed: 'The song could not be exported.',
} as const;

/** What the studio is busy with, if anything. */
export type StudioBusy = 'decoding' | 'exporting' | null;

/**
 * Options for {@link useStudio}.
 */
export interface StudioOptions {
  /** A microphone stream, for example from `useMediaStream({ audio: true })`. Needed to record. */
  stream?: MediaStream | null;
  /** The project to start with. @default an empty project */
  initialProject?: StudioProject;
}

/**
 * Return value of {@link useStudio}.
 */
export interface StudioReturn {
  /** The song as it is now. */
  project: StudioProject;
  /** Applies any change to the song. See `StudioAction`. */
  dispatch: Dispatch<StudioAction>;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;

  /** Every recording held in memory, by id. */
  takes: Readonly<Record<string, StudioTake>>;
  /** Length of the song in seconds, including echo and reverb tails. */
  duration: number;

  /** `true` while the song is playing. */
  playing: boolean;
  /** Where the playhead is, in seconds. */
  position: number;
  /** Loudness of the mix while playing, 0-1. */
  level: number;
  /** Start again from the top when the song ends. */
  loop: boolean;
  setLoop: (loop: boolean) => void;
  /** Plays from the playhead, or from a given time. */
  play: (fromSeconds?: number) => void;
  /** Stops and keeps the playhead where it is. */
  pause: () => void;
  /** Stops and returns the playhead to the start. */
  stop: () => void;
  /** Moves the playhead. Keeps playing if it was playing. */
  seek: (seconds: number) => void;

  /** Whether recording is possible right now. */
  canRecord: boolean;
  /** The track being recorded onto, or `null`. */
  recordingTrackId: string | null;
  /** Starts recording onto a voice track at the playhead, playing the rest of the song along with it. */
  record: (trackId: string) => void;
  /** Stops recording and places the take on the timeline. */
  stopRecording: () => void;
  /** Adds an audio file to a voice track at the playhead. */
  addAudio: (trackId: string, audio: Blob, name?: string) => Promise<StudioTake | null>;

  /** What the studio is busy with. */
  busy: StudioBusy;
  /** A readable explanation of the last problem, or `null`. */
  error: string | null;
  clearError: () => void;

  /** Mixes the song to a WAV file held in memory. */
  exportMix: () => Promise<Keepsake | null>;
  /** The exported song, held in memory only, or `null`. */
  exported: Keepsake | null;
  /** Saves the exported song to the user's device. */
  keepExport: () => void;
  /** Lets go of the exported song. */
  discardExport: () => void;
}

interface Session {
  playback: StudioPlayback;
  analyser: AnalyserNode;
  /** Context time when playback begins. */
  when: number;
  /** Song time playback began from. */
  from: number;
  /** Song time where playback stops by itself. */
  end: number;
  frame: number;
}

interface Recording {
  recorder: MediaRecorder;
  trackId: string;
  /** Song time recording began at. */
  from: number;
  /** `false` when the take should be thrown away. */
  keep: boolean;
}

/** Turns a song name into a safe file name. */
const toFileName = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || FALLBACK_FILE_NAME;

/**
 * Runs a small multitrack studio in the browser: voice tracks that hold
 * recordings, lyrics tracks that the studio sings, a mixer, and export.
 *
 * Privacy:
 * - Recordings, imported files, and exports live in memory only. Nothing is
 *   uploaded or stored. `keepExport()` is the only way audio leaves, as a
 *   download the user sees.
 * - The microphone is never played through the speakers, so there is no
 *   feedback. Recording plays the rest of the song so you can sing along;
 *   use headphones so it is not recorded too.
 *
 * Editing while the song plays re-cues playback from the playhead, so changes
 * are heard straight away.
 *
 * @example
 * ```tsx
 * const mic = useMediaStream({ audio: true });
 * const studio = useStudio({ stream: mic.stream });
 *
 * studio.dispatch({ type: 'addTrack', kind: 'lyrics' });
 * studio.play();
 * ```
 */
export const useStudio = (options: StudioOptions = {}): StudioReturn => {
  const { stream = null, initialProject } = options;

  const [history, dispatch] = useReducer(reduceStudio, initialProject, (project?: StudioProject) =>
    createHistory(project ?? createProject())
  );
  const project = history.present;

  const [takes, setTakes] = useState<Record<string, StudioTake>>({});
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [level, setLevel] = useState(0);
  const [loop, setLoop] = useState(false);
  const [recordingTrackId, setRecordingTrackId] = useState<string | null>(null);
  const [busy, setBusy] = useState<StudioBusy>(null);
  const [error, setError] = useState<string | null>(null);
  const keepsake = useKeepsake();

  const projectRef = useRef(project);
  projectRef.current = project;
  const takesRef = useRef(takes);
  takesRef.current = takes;
  const loopRef = useRef(loop);
  loopRef.current = loop;

  const buffersRef = useRef(new Map<string, AudioBuffer>());
  const sessionRef = useRef<Session | null>(null);
  const recordingRef = useRef<Recording | null>(null);
  const positionRef = useRef(0);
  const takeCounter = useRef(0);
  const mountedRef = useRef(true);

  const duration = useMemo(() => projectEndSeconds(project, takes), [project, takes]);

  /** Where the playhead is right now, read from the audio clock while playing. */
  const currentPosition = useCallback((): number => {
    const session = sessionRef.current;
    const ctx = getAudioContext();
    if (!session || !ctx) return positionRef.current;
    return session.from + Math.max(0, ctx.currentTime - session.when);
  }, []);

  /** Ends the current playback session without touching React state. */
  const endSession = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return;
    sessionRef.current = null;
    cancelAnimationFrame(session.frame);
    session.playback.stop();
    session.playback.output.disconnect();
    session.analyser.disconnect();
  }, []);

  const halt = useCallback(
    (toStart: boolean) => {
      const at = currentPosition();
      endSession();
      positionRef.current = toStart ? 0 : at;
      if (!mountedRef.current) return;
      setPlaying(false);
      setLevel(0);
      setPosition(positionRef.current);
    },
    [currentPosition, endSession]
  );

  const startRef = useRef<(from: number) => boolean>(() => false);

  const start = useCallback(
    (from: number): boolean => {
      const ctx = getAudioContext();
      if (!ctx) {
        setError(STUDIO_MESSAGES.noAudio);
        return false;
      }
      void resumeAudioContext();
      endSession();

      const begin = Math.max(0, from);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = MIC_ANALYSIS.fftSize;
      // Through the shared limiter, like every other Grave-UI sound.
      analyser.connect(getMasterBus(ctx));

      const when = ctx.currentTime + STUDIO_HOOK_TOKENS.leadSeconds;
      const playback = scheduleStudio(ctx, projectRef.current, {
        buffers: Object.fromEntries(buffersRef.current),
        when,
        fromSeconds: begin,
        destination: analyser,
      });
      const end = projectEndSeconds(projectRef.current, takesRef.current);
      const session: Session = { playback, analyser, when, from: begin, end, frame: 0 };
      sessionRef.current = session;
      positionRef.current = begin;
      setPlaying(true);
      setPosition(begin);

      const samples = new Float32Array(analyser.fftSize);
      const publishEvery = MS_PER_SECOND / STUDIO_HOOK_TOKENS.updateHz;
      let lastPublish = -Infinity;
      let published = 0;

      const tick = (now: number) => {
        if (sessionRef.current !== session) return;
        session.frame = requestAnimationFrame(tick);
        const at = begin + Math.max(0, ctx.currentTime - when);
        positionRef.current = at;

        // While recording the song keeps going, even past its end.
        if (!recordingRef.current && at >= session.end) {
          if (loopRef.current && session.end > 0) startRef.current(0);
          else halt(true);
          return;
        }

        if (now - lastPublish < publishEvery) return;
        lastPublish = now;
        setPosition(at);
        analyser.getFloatTimeDomainData(samples);
        const next = levelFromRms(rmsOf(samples));
        if (Math.abs(next - published) >= STUDIO_HOOK_TOKENS.levelEpsilon) {
          published = next;
          setLevel(next);
        }
      };
      session.frame = requestAnimationFrame(tick);
      return true;
    },
    [endSession, halt]
  );
  startRef.current = start;

  const play = useCallback((fromSeconds?: number) => {
    startRef.current(fromSeconds ?? currentPosition());
  }, [currentPosition]);
  const pause = useCallback(() => halt(false), [halt]);
  const stop = useCallback(() => halt(true), [halt]);
  const seek = useCallback(
    (seconds: number) => {
      const target = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
      if (sessionRef.current) {
        startRef.current(target);
        return;
      }
      positionRef.current = target;
      setPosition(target);
    },
    []
  );

  // Edits while playing are heard straight away: replay from the playhead.
  useEffect(() => {
    if (!sessionRef.current) return undefined;
    const timer = window.setTimeout(() => {
      if (sessionRef.current) startRef.current(currentPosition());
    }, STUDIO_HOOK_TOKENS.rescheduleDelayMs);
    return () => window.clearTimeout(timer);
  }, [project, currentPosition]);

  const addAudioAt = useCallback(
    async (trackId: string, audio: Blob, name: string | undefined, atSeconds: number, offsetSeconds: number) => {
      const ctx = getAudioContext();
      if (!ctx) {
        setError(STUDIO_MESSAGES.noAudio);
        return null;
      }
      const track = findTrack(projectRef.current, trackId);
      if (!track || track.kind !== 'voice') {
        setError(STUDIO_MESSAGES.notVoiceTrack);
        return null;
      }

      setBusy('decoding');
      try {
        const buffer = await ctx.decodeAudioData(await audio.arrayBuffer());
        if (buffer.duration > STUDIO_HOOK_TOKENS.maxTakeSeconds) {
          if (mountedRef.current) setError(STUDIO_MESSAGES.tooLong);
          return null;
        }
        if (!mountedRef.current) return null;

        takeCounter.current += 1;
        const take: StudioTake = {
          id: `k${takeCounter.current}`,
          name: name ?? `Take ${takeCounter.current}`,
          durationSeconds: buffer.duration,
          peaks: computePeaks(buffer.getChannelData(0)),
        };
        buffersRef.current.set(take.id, buffer);
        takesRef.current = { ...takesRef.current, [take.id]: take };
        setTakes(takesRef.current);
        dispatch({
          type: 'addClip',
          trackId,
          takeId: take.id,
          startBeat: secondsToBeats(atSeconds, projectRef.current.bpm),
          offsetSeconds: Math.min(offsetSeconds, Math.max(0, buffer.duration)),
        });
        setError(null);
        return take;
      } catch {
        if (mountedRef.current) setError(STUDIO_MESSAGES.decode);
        return null;
      } finally {
        if (mountedRef.current) setBusy(null);
      }
    },
    []
  );

  const addAudio = useCallback(
    (trackId: string, audio: Blob, name?: string) => addAudioAt(trackId, audio, name, currentPosition(), 0),
    [addAudioAt, currentPosition]
  );

  const canRecord = Boolean(stream) && typeof MediaRecorder !== 'undefined' && getAudioContext() !== null;

  const record = useCallback(
    (trackId: string) => {
      if (recordingRef.current) return;
      if (!stream) {
        setError(STUDIO_MESSAGES.noMicrophone);
        return;
      }
      if (typeof MediaRecorder === 'undefined') {
        setError(STUDIO_MESSAGES.noRecorder);
        return;
      }
      const track = findTrack(projectRef.current, trackId);
      if (!track || track.kind !== 'voice') {
        setError(STUDIO_MESSAGES.notVoiceTrack);
        return;
      }

      const from = currentPosition();
      const parts: Blob[] = [];
      const recorder = new MediaRecorder(stream);
      const session: Recording = { recorder, trackId, from, keep: true };
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) parts.push(event.data);
      };
      recorder.onstop = () => {
        if (!session.keep || !mountedRef.current) return;
        const latency = projectRef.current.latencyMs / MS_PER_SECOND;
        void addAudioAt(trackId, new Blob(parts, { type: recorder.mimeType }), undefined, from, latency);
      };
      recorder.start();
      recordingRef.current = session;
      setRecordingTrackId(trackId);
      setError(null);
      startRef.current(from);
    },
    [stream, currentPosition, addAudioAt]
  );

  const stopRecording = useCallback(() => {
    const session = recordingRef.current;
    if (!session) return;
    recordingRef.current = null;
    setRecordingTrackId(null);
    if (session.recorder.state !== 'inactive') session.recorder.stop();
    halt(false);
  }, [halt]);

  // If the microphone goes away mid-take, keep what was recorded.
  useEffect(() => {
    if (!stream && recordingRef.current) stopRecording();
  }, [stream, stopRecording]);

  const exportMix = useCallback(async (): Promise<Keepsake | null> => {
    setBusy('exporting');
    try {
      const buffer = await renderStudio(projectRef.current, {
        buffers: Object.fromEntries(buffersRef.current),
        takes: takesRef.current,
      });
      if (!mountedRef.current) return null;
      if (!buffer) {
        setError(STUDIO_MESSAGES.nothingToExport);
        return null;
      }
      setError(null);
      return keepsake.hold(studioToWav(buffer), {
        filename: `${toFileName(projectRef.current.name)}.wav`,
        durationMs: buffer.duration * MS_PER_SECOND,
        label: projectRef.current.name,
      });
    } catch {
      if (mountedRef.current) setError(STUDIO_MESSAGES.exportFailed);
      return null;
    } finally {
      if (mountedRef.current) setBusy(null);
    }
  }, [keepsake]);

  useEffect(() => {
    mountedRef.current = true;
    const buffers = buffersRef.current;
    return () => {
      mountedRef.current = false;
      const recording = recordingRef.current;
      if (recording) {
        recording.keep = false;
        recordingRef.current = null;
        if (recording.recorder.state !== 'inactive') recording.recorder.stop();
      }
      endSession();
      buffers.clear();
    };
  }, [endSession]);

  return {
    project,
    dispatch,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    undo: useCallback(() => dispatch({ type: 'undo' }), []),
    redo: useCallback(() => dispatch({ type: 'redo' }), []),
    takes,
    duration,
    playing,
    position,
    level,
    loop,
    setLoop,
    play,
    pause,
    stop,
    seek,
    canRecord,
    recordingTrackId,
    record,
    stopRecording,
    addAudio,
    busy,
    error,
    clearError: useCallback(() => setError(null), []),
    exportMix,
    exported: keepsake.item,
    keepExport: keepsake.keep,
    discardExport: keepsake.discard,
  };
};
