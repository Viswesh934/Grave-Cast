/**
 * Playing and mixing a whole project.
 *
 * {@link scheduleStudio} wires every audible track into one graph: recorded
 * clips or sung lyrics, then each track's voice effects, pan, and volume. It
 * works on a live context (for playback) and an offline one (for export), so
 * what is heard is exactly what is kept.
 *
 * @module studio/mix
 */

import { encodeWav } from '../audio/effects/wav';
import { buildEffectsStage, getOfflineAudioContext, RENDER_CHANNELS } from '../voice/chain';
import type { LyricSyllable } from './lyrics/lyrics';
import type { Melody } from './lyrics/melody';
import { audibleTracks, type StudioProject, type StudioTake, type StudioTrack } from './project';
import { singLyrics } from './singer';
import {
  beatsToSeconds,
  lyricsEffects,
  lyricsTranspose,
  planLyrics,
  projectEndSeconds,
  secondsPerBeat,
  voiceLayerRate,
  voiceRate,
} from './timeline';

/** Mixing settings. */
export const MIX_TOKENS = {
  /** Sample rate of an exported song. */
  sampleRate: 44100,
  /** Overall level, a little under full so many tracks have headroom. */
  masterGain: 0.9,
  /** Longest song that can be exported, in seconds. */
  maxSeconds: 600,
} as const;

/** Recorded audio for each take, by take id. */
export type TakeBuffers = Readonly<Record<string, AudioBuffer>>;

/**
 * Options for {@link scheduleStudio}.
 */
export interface ScheduleStudioOptions {
  /** Audio of every take used by a clip. */
  buffers: TakeBuffers;
  /** When the song should begin playing, in the context's clock. @default 0 */
  when?: number;
  /** Where in the song to start, in seconds. Earlier sounds are skipped. @default 0 */
  fromSeconds?: number;
  /** Where the mix goes. @default the context's speakers */
  destination?: AudioNode;
}

/**
 * A scheduled song.
 */
export interface StudioPlayback {
  /** The master volume node, for meters or a final effect. */
  output: GainNode;
  /** Stops everything now, or at a given time. */
  stop: (when?: number) => void;
}

/** Keeps the lyric notes that begin at or after a point, retimed to start from it. */
const lyricsFrom = (
  syllables: readonly LyricSyllable[],
  melody: Melody,
  skipBeats: number
): { syllables: LyricSyllable[]; melody: Melody } => {
  if (skipBeats <= 0) return { syllables: [...syllables], melody };
  const kept: LyricSyllable[] = [];
  const notes: Melody['notes'] = [];
  melody.notes.forEach((note, index) => {
    if (note.startBeat < skipBeats) return;
    kept.push(syllables[index]);
    notes.push({ ...note, startBeat: note.startBeat - skipBeats });
  });
  return { syllables: kept, melody: { notes, endBeat: Math.max(0, melody.endBeat - skipBeats) } };
};

/** Builds one track's effects, pan, and volume, and returns where its sound should enter. */
const buildTrackStrip = (
  ctx: BaseAudioContext,
  track: StudioTrack,
  master: AudioNode
): { input: GainNode; start: (when: number) => void } => {
  const gain = ctx.createGain();
  gain.gain.value = track.gain;
  gain.connect(master);

  let panTarget: AudioNode = gain;
  if (typeof ctx.createStereoPanner === 'function') {
    const panner = ctx.createStereoPanner();
    panner.pan.value = track.pan;
    panner.connect(gain);
    panTarget = panner;
  }

  const input = ctx.createGain();
  const effects = track.kind === 'lyrics' ? lyricsEffects(track) : track.effects;
  const stage = buildEffectsStage(ctx, input, effects, panTarget);
  return { input, start: stage.start };
};

/**
 * Schedules a whole project on an audio context.
 *
 * @example
 * ```ts
 * const playback = scheduleStudio(ctx, project, { buffers, when: ctx.currentTime + 0.1 });
 * // later
 * playback.stop();
 * ```
 */
export const scheduleStudio = (
  ctx: BaseAudioContext,
  project: StudioProject,
  options: ScheduleStudioOptions
): StudioPlayback => {
  const { buffers, when = 0, fromSeconds = 0, destination = ctx.destination } = options;
  const from = Math.max(0, fromSeconds);
  const beat = secondsPerBeat(project.bpm);

  const master = ctx.createGain();
  master.gain.value = MIX_TOKENS.masterGain;
  master.connect(destination);

  const stoppers: ((at?: number) => void)[] = [];

  for (const track of audibleTracks(project.tracks)) {
    const strip = buildTrackStrip(ctx, track, master);
    strip.start(when);

    if (track.kind === 'lyrics') {
      const plan = planLyrics(track);
      const lyricStart = beatsToSeconds(track.lyrics.startBeat, project.bpm);
      const skipBeats = Math.max(0, (from - lyricStart) / beat);
      const { syllables, melody } = lyricsFrom(plan.syllables, plan.melody, skipBeats);
      if (melody.notes.length === 0) continue;
      const singer = singLyrics(ctx, syllables, melody, {
        bpm: project.bpm,
        when: when + Math.max(0, lyricStart - from),
        transpose: lyricsTranspose(track),
        destination: strip.input,
      });
      stoppers.push(singer.stop);
      continue;
    }

    const layers: { rate: number; level: number }[] = [{ rate: voiceRate(track), level: 1 }];
    if (track.effects.layerMix > 0) layers.push({ rate: voiceLayerRate(track), level: track.effects.layerMix });

    for (const clip of track.clips) {
      const buffer = buffers[clip.takeId];
      if (!buffer) continue;
      const clipStart = beatsToSeconds(clip.startBeat, project.bpm);

      for (const layer of layers) {
        // How much of the recording has already gone by when playback begins.
        const late = Math.max(0, from - clipStart);
        const offset = clip.offsetSeconds + late * layer.rate;
        if (offset >= buffer.duration) continue;

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = layer.rate;
        const level = ctx.createGain();
        level.gain.value = layer.level;
        source.connect(level);
        level.connect(strip.input);
        source.start(when + Math.max(0, clipStart - from), offset);
        stoppers.push((at) => {
          try {
            source.stop(at ?? 0);
          } catch {
            // Already stopped.
          }
        });
      }
    }
  }

  return {
    output: master,
    stop: (at) => stoppers.forEach((stop) => stop(at)),
  };
};

/**
 * Options for {@link renderStudio}.
 */
export interface RenderStudioOptions {
  /** Audio of every take used by a clip. */
  buffers: TakeBuffers;
  /** Details of every take, used to work out the song's length. */
  takes: Readonly<Record<string, StudioTake>>;
  /** Samples per second. @default 44100 */
  sampleRate?: number;
}

/**
 * Mixes a whole project into stereo audio, faster than real time and
 * without playing anything. Returns `null` when nothing would be heard.
 *
 * @throws If the browser has no offline audio rendering.
 */
export const renderStudio = async (project: StudioProject, options: RenderStudioOptions): Promise<AudioBuffer | null> => {
  const Offline = getOfflineAudioContext();
  if (!Offline) throw new Error('This browser cannot render audio.');

  const { buffers, takes, sampleRate = MIX_TOKENS.sampleRate } = options;
  const seconds = Math.min(MIX_TOKENS.maxSeconds, projectEndSeconds(project, takes));
  if (!(seconds > 0)) return null;

  const ctx = new Offline(RENDER_CHANNELS, Math.ceil(seconds * sampleRate), sampleRate);
  scheduleStudio(ctx, project, { buffers });
  return ctx.startRendering();
};

/** Turns mixed audio into a WAV file. */
export const studioToWav = (buffer: AudioBuffer): Blob => {
  const channels: Float32Array[] = [];
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) channels.push(buffer.getChannelData(channel));
  return encodeWav(channels, buffer.sampleRate);
};
