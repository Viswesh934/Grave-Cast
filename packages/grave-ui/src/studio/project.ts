/**
 * The studio project: tracks, clips, and the history of changes to them.
 *
 * A project is a plain, serializable object. Recorded audio is not part of
 * it: clips point at takes by id, and the audio lives in memory elsewhere.
 * Every change goes through {@link reduceStudio}, which also keeps undo and
 * redo history, so the whole thing is pure and easy to test.
 *
 * Pure TypeScript with no DOM dependency.
 *
 * @module studio/project
 */

import { SCALE_INTERVALS, type ScaleName } from '../audio/music/scales';
import { parseAbsoluteNote } from '../audio/music/theory';
import { PERSONAS, type PersonaEffects, type VoicePersona } from '../voice/personas';
import { MELODY_STYLES, type MelodyStyle } from './lyrics/melody';

/**
 * The kinds of track.
 *
 * - `voice`: recorded takes, placed on the timeline
 * - `lyrics`: typed words that the studio sings
 */
export type StudioTrackKind = 'voice' | 'lyrics';

/** Limits that keep a project a sensible size. */
export const STUDIO_LIMITS = {
  maxTracks: 8,
  minBpm: 40,
  maxBpm: 220,
  maxGain: 1.5,
  maxSemitones: 24,
  maxLatencyMs: 500,
  maxLyricsLength: 4000,
  maxNotesLength: 400,
  maxNameLength: 40,
  minStretch: 0.25,
  maxStretch: 4,
  historyDepth: 100,
} as const;

/** Tempo of a new project, in beats per minute. */
export const DEFAULT_BPM = 90;

/** Words a new lyrics track starts with. */
export const DEFAULT_LYRICS_TEXT = 'Hush now, the moon is rising\nBones beneath the willow';

/** The allowed range of every voice knob. */
export const EFFECT_RANGES: Record<keyof PersonaEffects, readonly [number, number]> = {
  rate: [0.25, 4],
  highpassHz: [20, 2000],
  lowpassHz: [200, 20000],
  distortion: [0, 1],
  ringHz: [0, 2000],
  ringMix: [0, 1],
  echoSeconds: [0, 2],
  echoFeedback: [0, 0.95],
  echoMix: [0, 1],
  reverbSeconds: [0, 6],
  reverbMix: [0, 1],
  layerRate: [0.25, 4],
  layerMix: [0, 1],
  gain: [0, 2],
};

/**
 * A recording placed on a voice track.
 */
export interface StudioClip {
  id: string;
  /** Which take (recording) this plays. */
  takeId: string;
  /** Where it starts, in beats. */
  startBeat: number;
  /** Seconds trimmed from the start of the recording. Used to cancel recording delay. */
  offsetSeconds: number;
}

/**
 * Details of a recording held in memory.
 */
export interface StudioTake {
  id: string;
  /** A name for the take. */
  name: string;
  /** Length of the recording, in seconds. */
  durationSeconds: number;
  /** A coarse outline of the waveform, 0-1 per bucket, for drawing. */
  peaks: number[];
}

/**
 * The words, tune, and timing of a lyrics track.
 */
export interface LyricsSettings {
  /** The lyrics. See `parseLyrics` for hyphens, respelling, and rests. */
  text: string;
  /** Where the first word starts, in beats. */
  startBeat: number;
  /** Scale the tune is written in. */
  scale: ScaleName;
  /** The home note, such as `C3`. */
  tonic: string;
  /** How the words are delivered. */
  style: MelodyStyle;
  /** Changes the generated tune. */
  seed: number;
  /** Note length multiplier. */
  stretch: number;
  /** Typed notes that replace the generated tune, such as `C3 E3 G3`. */
  notes: string;
}

/**
 * One track in the studio.
 */
export interface StudioTrack {
  id: string;
  name: string;
  kind: StudioTrackKind;
  /** Volume, 0 up to {@link STUDIO_LIMITS.maxGain}. */
  gain: number;
  /** Stereo position, -1 (left) to 1 (right). */
  pan: number;
  muted: boolean;
  soloed: boolean;
  /** The preset the knobs started from. */
  persona: VoicePersona;
  /** Raise or lower the pitch, in semitones. Recorded voices speed up or slow down with it. */
  semitones: number;
  /** The voice knobs. Changing the persona resets these to its preset. */
  effects: PersonaEffects;
  /** Recordings on the timeline. Used by voice tracks. */
  clips: StudioClip[];
  /** Words and tune. Used by lyrics tracks. */
  lyrics: LyricsSettings;
}

/**
 * A whole song.
 */
export interface StudioProject {
  name: string;
  /** Tempo in beats per minute. */
  bpm: number;
  /** Delay between pressing record and the sound arriving, trimmed from new takes. */
  latencyMs: number;
  tracks: StudioTrack[];
}

/**
 * The project plus what is needed to undo and redo.
 */
export interface StudioHistory {
  past: StudioProject[];
  present: StudioProject;
  future: StudioProject[];
  /** Counter used to name new tracks and clips. */
  nextId: number;
  /** Edits with the same key are merged into one undo step, such as a slider drag. */
  lastKey: string | null;
}

/** Tracks that can be edited. */
export type StudioTrackPatch = Partial<Pick<StudioTrack, 'name' | 'gain' | 'pan' | 'muted' | 'soloed' | 'semitones'>>;

/**
 * Everything that can happen to a project.
 */
export type StudioAction =
  | { type: 'addTrack'; kind: StudioTrackKind }
  | { type: 'removeTrack'; trackId: string }
  | { type: 'updateTrack'; trackId: string; patch: StudioTrackPatch; key?: string }
  | { type: 'setPersona'; trackId: string; persona: VoicePersona }
  | { type: 'setEffect'; trackId: string; effect: keyof PersonaEffects; value: number; key?: string }
  | { type: 'updateLyrics'; trackId: string; patch: Partial<LyricsSettings>; key?: string }
  | { type: 'addClip'; trackId: string; takeId: string; startBeat: number; offsetSeconds?: number }
  | { type: 'moveClip'; trackId: string; clipId: string; startBeat: number; key?: string }
  | { type: 'removeClip'; trackId: string; clipId: string }
  | { type: 'setBpm'; bpm: number; key?: string }
  | { type: 'setLatency'; ms: number }
  | { type: 'rename'; name: string; key?: string }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'reset'; project?: StudioProject };

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
const finite = (value: number, fallback: number): number => (Number.isFinite(value) ? value : fallback);

/** Lyrics settings for a new lyrics track. */
export const createLyricsSettings = (): LyricsSettings => ({
  text: DEFAULT_LYRICS_TEXT,
  startBeat: 0,
  scale: 'minor',
  tonic: 'C3',
  style: 'sing',
  seed: 1,
  stretch: 1,
  notes: '',
});

/** A new track with the clean `natural` voice. */
export const createTrack = (id: string, kind: StudioTrackKind, name: string): StudioTrack => ({
  id,
  name,
  kind,
  gain: 1,
  pan: 0,
  muted: false,
  soloed: false,
  persona: 'natural',
  semitones: 0,
  effects: { ...PERSONAS.natural.effects },
  clips: [],
  lyrics: createLyricsSettings(),
});

/** An empty project. */
export const createProject = (name: string = 'Untitled song'): StudioProject => ({
  name,
  bpm: DEFAULT_BPM,
  latencyMs: 0,
  tracks: [],
});

/** Reads the counter from a generated id such as `t3` or `c12`. */
const GENERATED_ID = /^[tc](\d+)$/;

/**
 * The first id counter no track or clip in the project already uses, so a
 * project passed in from outside never gets a duplicate id.
 */
const firstFreeId = (project: StudioProject): number => {
  const ids = project.tracks.flatMap((track) => [track.id, ...track.clips.map((clip) => clip.id)]);
  return ids.reduce((next, id) => {
    const match = GENERATED_ID.exec(id);
    return match ? Math.max(next, Number(match[1]) + 1) : next;
  }, 1);
};

/** Wraps a project with empty history. */
export const createHistory = (project: StudioProject = createProject()): StudioHistory => ({
  past: [],
  present: project,
  future: [],
  nextId: firstFreeId(project),
  lastKey: null,
});

/** Finds a track by id. */
export const findTrack = (project: StudioProject, trackId: string): StudioTrack | undefined =>
  project.tracks.find((track) => track.id === trackId);

/**
 * The tracks that make sound: if any track is soloed only those play,
 * otherwise everything that is not muted.
 */
export const audibleTracks = (tracks: readonly StudioTrack[]): StudioTrack[] => {
  const soloing = tracks.some((track) => track.soloed);
  return tracks.filter((track) => (soloing ? track.soloed : !track.muted));
};

const mapTrack = (project: StudioProject, trackId: string, change: (track: StudioTrack) => StudioTrack): StudioProject => {
  let touched = false;
  const tracks = project.tracks.map((track) => {
    if (track.id !== trackId) return track;
    const next = change(track);
    if (next !== track) touched = true;
    return next;
  });
  return touched ? { ...project, tracks } : project;
};

/** Records a new present state, merging repeated edits that share a key. */
const commit = (state: StudioHistory, next: StudioProject, key?: string): StudioHistory => {
  if (next === state.present) return state;
  if (key !== undefined && key === state.lastKey) return { ...state, present: next };
  return {
    ...state,
    past: [...state.past, state.present].slice(-STUDIO_LIMITS.historyDepth),
    present: next,
    future: [],
    lastKey: key ?? null,
  };
};

const sanitizePatch = (patch: StudioTrackPatch): StudioTrackPatch => {
  const clean: StudioTrackPatch = {};
  if (patch.name !== undefined) clean.name = patch.name.slice(0, STUDIO_LIMITS.maxNameLength);
  if (patch.gain !== undefined) clean.gain = clamp(finite(patch.gain, 1), 0, STUDIO_LIMITS.maxGain);
  if (patch.pan !== undefined) clean.pan = clamp(finite(patch.pan, 0), -1, 1);
  if (patch.muted !== undefined) clean.muted = patch.muted;
  if (patch.soloed !== undefined) clean.soloed = patch.soloed;
  if (patch.semitones !== undefined) {
    clean.semitones = clamp(finite(patch.semitones, 0), -STUDIO_LIMITS.maxSemitones, STUDIO_LIMITS.maxSemitones);
  }
  return clean;
};

const sanitizeLyrics = (patch: Partial<LyricsSettings>): Partial<LyricsSettings> => {
  const clean: Partial<LyricsSettings> = { ...patch };
  // Values that would break the tune are refused, so a typo can never stop the studio.
  if (patch.tonic !== undefined && parseAbsoluteNote(patch.tonic.trim()) === null) delete clean.tonic;
  else if (patch.tonic !== undefined) clean.tonic = patch.tonic.trim();
  if (patch.scale !== undefined && !Object.prototype.hasOwnProperty.call(SCALE_INTERVALS, patch.scale)) delete clean.scale;
  if (patch.style !== undefined && !MELODY_STYLES.includes(patch.style)) delete clean.style;
  if (patch.text !== undefined) clean.text = patch.text.slice(0, STUDIO_LIMITS.maxLyricsLength);
  if (patch.notes !== undefined) clean.notes = patch.notes.slice(0, STUDIO_LIMITS.maxNotesLength);
  if (patch.startBeat !== undefined) clean.startBeat = Math.max(0, finite(patch.startBeat, 0));
  if (patch.seed !== undefined) clean.seed = Math.floor(finite(patch.seed, 1));
  if (patch.stretch !== undefined) {
    clean.stretch = clamp(finite(patch.stretch, 1), STUDIO_LIMITS.minStretch, STUDIO_LIMITS.maxStretch);
  }
  return clean;
};

/**
 * Applies an action to a project and its history. Pure: the same inputs
 * always give the same result, and the old state is never changed.
 */
export const reduceStudio = (state: StudioHistory, action: StudioAction): StudioHistory => {
  const { present } = state;

  switch (action.type) {
    case 'addTrack': {
      if (present.tracks.length >= STUDIO_LIMITS.maxTracks) return state;
      const sameKind = present.tracks.filter((track) => track.kind === action.kind).length + 1;
      const name = `${action.kind === 'voice' ? 'Voice' : 'Lyrics'} ${sameKind}`;
      const track = createTrack(`t${state.nextId}`, action.kind, name);
      return { ...commit(state, { ...present, tracks: [...present.tracks, track] }), nextId: state.nextId + 1 };
    }
    case 'removeTrack': {
      const tracks = present.tracks.filter((track) => track.id !== action.trackId);
      return tracks.length === present.tracks.length ? state : commit(state, { ...present, tracks });
    }
    case 'updateTrack': {
      const patch = sanitizePatch(action.patch);
      return commit(state, mapTrack(present, action.trackId, (track) => ({ ...track, ...patch })), action.key);
    }
    case 'setPersona': {
      if (!Object.prototype.hasOwnProperty.call(PERSONAS, action.persona)) return state;
      return commit(
        state,
        mapTrack(present, action.trackId, (track) => ({
          ...track,
          persona: action.persona,
          effects: { ...PERSONAS[action.persona].effects },
        }))
      );
    }
    case 'setEffect': {
      const range = EFFECT_RANGES[action.effect];
      if (!range) return state;
      const value = clamp(finite(action.value, range[0]), range[0], range[1]);
      return commit(
        state,
        mapTrack(present, action.trackId, (track) => ({ ...track, effects: { ...track.effects, [action.effect]: value } })),
        action.key
      );
    }
    case 'updateLyrics': {
      const patch = sanitizeLyrics(action.patch);
      return commit(
        state,
        mapTrack(present, action.trackId, (track) => ({ ...track, lyrics: { ...track.lyrics, ...patch } })),
        action.key
      );
    }
    case 'addClip': {
      const track = findTrack(present, action.trackId);
      if (!track || track.kind !== 'voice') return state;
      const clip: StudioClip = {
        id: `c${state.nextId}`,
        takeId: action.takeId,
        startBeat: Math.max(0, finite(action.startBeat, 0)),
        offsetSeconds: Math.max(0, finite(action.offsetSeconds ?? 0, 0)),
      };
      const next = mapTrack(present, action.trackId, (t) => ({ ...t, clips: [...t.clips, clip] }));
      return { ...commit(state, next), nextId: state.nextId + 1 };
    }
    case 'moveClip': {
      const startBeat = Math.max(0, finite(action.startBeat, 0));
      return commit(
        state,
        mapTrack(present, action.trackId, (track) => ({
          ...track,
          clips: track.clips.map((clip) => (clip.id === action.clipId ? { ...clip, startBeat } : clip)),
        })),
        action.key
      );
    }
    case 'removeClip':
      return commit(
        state,
        mapTrack(present, action.trackId, (track) => ({ ...track, clips: track.clips.filter((clip) => clip.id !== action.clipId) }))
      );
    case 'setBpm':
      return commit(
        state,
        { ...present, bpm: clamp(finite(action.bpm, DEFAULT_BPM), STUDIO_LIMITS.minBpm, STUDIO_LIMITS.maxBpm) },
        action.key
      );
    case 'setLatency':
      return commit(state, { ...present, latencyMs: clamp(finite(action.ms, 0), 0, STUDIO_LIMITS.maxLatencyMs) });
    case 'rename':
      return commit(state, { ...present, name: action.name.slice(0, STUDIO_LIMITS.maxNameLength) }, action.key);
    case 'undo': {
      if (state.past.length === 0) return state;
      const past = state.past.slice(0, -1);
      return { ...state, past, present: state.past[state.past.length - 1], future: [present, ...state.future], lastKey: null };
    }
    case 'redo': {
      if (state.future.length === 0) return state;
      const [next, ...future] = state.future;
      return { ...state, past: [...state.past, present], present: next, future, lastKey: null };
    }
    case 'reset': {
      const fresh = createHistory(action.project ?? createProject());
      return { ...fresh, nextId: Math.max(state.nextId, fresh.nextId) };
    }
    default:
      return state;
  }
};
