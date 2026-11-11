/**
 * Timeline math: beats, seconds, and where clips and lyrics end.
 *
 * Pure TypeScript with no DOM dependency.
 *
 * @module studio/timeline
 */

import { semitonesToRate } from '../voice/dsp';
import { estimateRenderSeconds, type PersonaEffects } from '../voice/personas';
import { buildMelody, type Melody } from './lyrics/melody';
import { parseLyrics, type LyricSyllable } from './lyrics/lyrics';
import { audibleTracks, type StudioClip, type StudioProject, type StudioTake, type StudioTrack } from './project';

/** Seconds in a minute. */
export const SECONDS_PER_MINUTE = 60;

/** Default grid for snapping, in beats. A quarter of a beat is a sixteenth note. */
export const DEFAULT_GRID_BEATS = 0.25;

/** Length of a bar, in beats. */
export const BEATS_PER_BAR = 4;

/** Seconds per beat at a tempo. */
export const secondsPerBeat = (bpm: number): number => SECONDS_PER_MINUTE / bpm;

/** Converts beats to seconds at a tempo. */
export const beatsToSeconds = (beats: number, bpm: number): number => beats * secondsPerBeat(bpm);

/** Converts seconds to beats at a tempo. */
export const secondsToBeats = (seconds: number, bpm: number): number => seconds / secondsPerBeat(bpm);

/** Rounds a beat position to the nearest grid line. */
export const snapBeat = (beat: number, grid: number = DEFAULT_GRID_BEATS): number =>
  grid > 0 ? Math.round(beat / grid) * grid : beat;

/**
 * Playback speed of a recorded voice: its persona speed combined with the
 * track's pitch setting. Speed and pitch move together.
 */
export const voiceRate = (track: StudioTrack): number => track.effects.rate * semitonesToRate(track.semitones);

/** Playback speed of the second voice layered under a recording. */
export const voiceLayerRate = (track: StudioTrack): number => track.effects.layerRate * semitonesToRate(track.semitones);

/** How long a clip lasts on the timeline, in seconds, after speed changes. */
export const clipLengthSeconds = (clip: StudioClip, take: StudioTake, track: StudioTrack): number => {
  const usable = Math.max(0, take.durationSeconds - clip.offsetSeconds);
  const slowest = track.effects.layerMix > 0 ? Math.min(voiceRate(track), voiceLayerRate(track)) : voiceRate(track);
  return usable / Math.max(slowest, Number.EPSILON);
};

/**
 * What the singer does for a lyrics track: its syllables and its tune.
 */
export interface LyricsPlan {
  syllables: LyricSyllable[];
  melody: Melody;
}

/** Reads a lyrics track's words and builds its tune. */
export const planLyrics = (track: StudioTrack): LyricsPlan => {
  const { text, scale, tonic, style, seed, stretch, notes } = track.lyrics;
  const syllables = parseLyrics(text);
  return { syllables, melody: buildMelody(syllables, { scale, tonic, style, seed, stretch, notes }) };
};

/**
 * The knobs applied to a lyrics track. The singer makes its own pitch, so
 * the persona's speed becomes a transposition and the second voice is left out.
 */
export const lyricsEffects = (track: StudioTrack): PersonaEffects => ({ ...track.effects, rate: 1, layerMix: 0 });

/** Transposition of a lyrics track in semitones: its pitch setting plus its persona's speed change. */
export const lyricsTranspose = (track: StudioTrack): number =>
  track.semitones + (track.effects.rate > 0 ? 12 * Math.log2(track.effects.rate) : 0);

/** Where a track's sound ends on the timeline, in seconds, before echoes and reverb ring out. */
export const trackEndSeconds = (track: StudioTrack, bpm: number, takes: Readonly<Record<string, StudioTake>>): number => {
  if (track.kind === 'lyrics') {
    const { melody } = planLyrics(track);
    return melody.notes.length === 0 ? 0 : beatsToSeconds(track.lyrics.startBeat + melody.endBeat, bpm);
  }
  return track.clips.reduce((end, clip) => {
    const take = takes[clip.takeId];
    return take ? Math.max(end, beatsToSeconds(clip.startBeat, bpm) + clipLengthSeconds(clip, take, track)) : end;
  }, 0);
};

/**
 * Where the whole song ends, in seconds, including the time echoes and
 * reverb take to die away.
 */
export const projectEndSeconds = (project: StudioProject, takes: Readonly<Record<string, StudioTake>>): number =>
  audibleTracks(project.tracks).reduce((end, track) => {
    const own = trackEndSeconds(track, project.bpm, takes);
    if (own === 0) return end;
    const effects = track.kind === 'lyrics' ? lyricsEffects(track) : track.effects;
    return Math.max(end, own + estimateRenderSeconds(0, effects));
  }, 0);
