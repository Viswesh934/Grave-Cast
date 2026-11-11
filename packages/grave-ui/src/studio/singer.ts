/**
 * The lyric singer: a small formant synthesizer built from Web Audio nodes.
 *
 * One buzzing voice runs through three resonant filters that move from vowel
 * to vowel, and a band of hiss makes the consonants. Everything is scheduled
 * ahead on the audio clock, so pitch and timing are exact. The same graph
 * plays live or renders offline.
 *
 * It sounds robotic on purpose. It is a talking machine, not a recording.
 *
 * @module studio/singer
 */

import { equalFrequency } from '../audio/music/theory';
import { createSeededRandom } from '../voice/dsp';
import { CONSONANT_SPECS, VOWEL_SPECS, type Formants } from './lyrics/formants';
import type { LyricSyllable } from './lyrics/lyrics';
import type { Melody } from './lyrics/melody';
import { isVowelPhoneme, type Phoneme } from './lyrics/phonemes';
import { SECONDS_PER_MINUTE } from './timeline';

/** How the singer sounds. */
export const SINGER_TOKENS = {
  /** Loudness of each formant band. The first carries most of the energy. */
  formantGains: [1, 0.5, 0.25],
  /** Sharpness of each formant band. */
  formantQ: [8, 12, 14],
  /** The most of a note that consonants may take. The vowel keeps the rest. */
  maxConsonantShare: 0.6,
  /** Seconds to glide from one note to the next. */
  glideSeconds: 0.03,
  /** Seconds for each sound to fade in and out, so nothing clicks. */
  fadeSeconds: 0.012,
  /** Vibrato speed in Hz and depth in cents. */
  vibratoHz: 5.5,
  vibratoCents: 20,
  /** Overall level of the voice, and of the hiss. */
  voiceLevel: 0.7,
  noiseLevel: 0.6,
  /**
   * Buzz of a voiced consonant such as m, l, or z, relative to a vowel. Kept
   * low because a nasal's first resonance sits near low voices and boosts them.
   */
  voicedConsonantLevel: 0.25,
  /** Share of a stop (p, t, k) that is silence before the burst. */
  stopClosureShare: 0.5,
  /** Length of the looping hiss, in seconds, and its seed so it always sounds the same. */
  noiseSeconds: 2,
  noiseSeed: 0x5eed,
  /** Formants are kept below this share of the highest frequency the context can play. */
  nyquistShare: 0.9,
  /** Seconds of quiet left after the last note before the sources stop. */
  tailSeconds: 0.1,
} as const;

/**
 * One timed sound inside a syllable.
 */
export interface SungSegment {
  phoneme: Phoneme;
  /** Start, in seconds from the start of the note. */
  start: number;
  /** End, in seconds from the start of the note. */
  end: number;
}

/**
 * Places a syllable's sounds inside a note: consonants before the vowel at
 * the start, the vowel held through the middle, and consonants after it at
 * the end. Consonants shrink to fit short notes, so the vowel always sounds.
 *
 * @param syllable - The sounds to place.
 * @param duration - Length of the note in seconds.
 */
export const layoutSyllable = (
  syllable: Pick<LyricSyllable, 'onset' | 'nucleus' | 'coda'>,
  duration: number
): SungSegment[] => {
  const length = (phoneme: Phoneme): number => (isVowelPhoneme(phoneme) ? 0 : CONSONANT_SPECS[phoneme].seconds);
  const consonantTime = [...syllable.onset, ...syllable.coda].reduce((sum, phoneme) => sum + length(phoneme), 0);
  const room = Math.max(0, duration) * SINGER_TOKENS.maxConsonantShare;
  const scale = consonantTime > room && consonantTime > 0 ? room / consonantTime : 1;

  const segments: SungSegment[] = [];
  let cursor = 0;
  for (const phoneme of syllable.onset) {
    const end = cursor + length(phoneme) * scale;
    segments.push({ phoneme, start: cursor, end });
    cursor = end;
  }

  const codaTime = syllable.coda.reduce((sum, phoneme) => sum + length(phoneme) * scale, 0);
  const vowelEnd = Math.max(cursor, duration - codaTime);
  segments.push({ phoneme: syllable.nucleus, start: cursor, end: vowelEnd });
  cursor = vowelEnd;

  for (const phoneme of syllable.coda) {
    const end = cursor + length(phoneme) * scale;
    segments.push({ phoneme, start: cursor, end });
    cursor = end;
  }
  return segments;
};

/**
 * Options for {@link singLyrics}.
 */
export interface SingOptions {
  /** Tempo in beats per minute. */
  bpm: number;
  /** When the first beat sounds, in the context's clock. @default 0 */
  when?: number;
  /** Semitones to shift every note. @default 0 */
  transpose?: number;
  /** Where the voice goes. @default the context's speakers */
  destination?: AudioNode;
}

/**
 * A scheduled performance.
 */
export interface SingerHandle {
  /** When the last note ends, in the context's clock. */
  endTime: number;
  /** Stops every sound now, or at a given time. */
  stop: (when?: number) => void;
}

/** A gain that is silent except during the given spans, with short fades so nothing clicks. */
const scheduleSpans = (param: AudioParam, spans: { start: number; end: number; level: number }[]): void => {
  param.setValueAtTime(0, 0);
  for (const span of spans) {
    const fade = Math.min(SINGER_TOKENS.fadeSeconds, (span.end - span.start) / 2);
    if (!(fade > 0)) continue;
    param.setValueAtTime(0, span.start);
    param.linearRampToValueAtTime(span.level, span.start + fade);
    param.setValueAtTime(span.level, span.end - fade);
    param.linearRampToValueAtTime(0, span.end);
  }
};

/**
 * Schedules a sung lyric on an audio context. Nothing is heard until the
 * context's clock reaches `when`.
 *
 * @example
 * ```ts
 * const syllables = parseLyrics('Hush now');
 * const melody = buildMelody(syllables, { scale: 'minor', tonic: 'C3' });
 * singLyrics(ctx, syllables, melody, { bpm: 90, when: ctx.currentTime + 0.1 });
 * ```
 */
export const singLyrics = (
  ctx: BaseAudioContext,
  syllables: readonly LyricSyllable[],
  melody: Melody,
  options: SingOptions
): SingerHandle => {
  const { bpm, when = 0, transpose = 0, destination = ctx.destination } = options;
  const secondsPerBeat = SECONDS_PER_MINUTE / bpm;
  const ceiling = (ctx.sampleRate / 2) * SINGER_TOKENS.nyquistShare;
  const endTime = when + melody.endBeat * secondsPerBeat;

  // The voice: a buzzing tone with a gentle vibrato.
  const voice = ctx.createOscillator();
  voice.type = 'sawtooth';
  const vibrato = ctx.createOscillator();
  vibrato.frequency.value = SINGER_TOKENS.vibratoHz;
  const vibratoDepth = ctx.createGain();
  vibratoDepth.gain.value = SINGER_TOKENS.vibratoCents;
  vibrato.connect(vibratoDepth);
  vibratoDepth.connect(voice.detune);

  const voiceGate = ctx.createGain();
  voice.connect(voiceGate);

  const mix = ctx.createGain();
  mix.gain.value = SINGER_TOKENS.voiceLevel;
  mix.connect(destination);

  // Three resonances shape the buzz into vowels.
  const formants = SINGER_TOKENS.formantGains.map((level, index) => {
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = SINGER_TOKENS.formantQ[index];
    const gain = ctx.createGain();
    gain.gain.value = level;
    voiceGate.connect(filter);
    filter.connect(gain);
    gain.connect(mix);
    return filter;
  });

  // The hiss behind consonants.
  const random = createSeededRandom(SINGER_TOKENS.noiseSeed);
  const noiseLength = Math.max(1, Math.round(ctx.sampleRate * SINGER_TOKENS.noiseSeconds));
  const noiseBuffer = ctx.createBuffer(1, noiseLength, ctx.sampleRate);
  const noiseData = new Float32Array(noiseLength);
  for (let i = 0; i < noiseLength; i += 1) noiseData[i] = random() * 2 - 1;
  noiseBuffer.copyToChannel(noiseData, 0);
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  const noiseGate = ctx.createGain();
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGate);
  noiseGate.connect(mix);

  const setFormants = (target: Formants, time: number, ramp: boolean): void => {
    [target.f1, target.f2, target.f3].forEach((hz, index) => {
      const value = Math.min(ceiling, hz);
      if (ramp) formants[index].frequency.linearRampToValueAtTime(value, time);
      else formants[index].frequency.setValueAtTime(value, time);
    });
  };

  const voiceSpans: { start: number; end: number; level: number }[] = [];
  const noiseSpans: { start: number; end: number; level: number }[] = [];

  let previousHz: number | null = null;

  melody.notes.forEach((note, index) => {
    const syllable = syllables[index];
    if (!syllable) return;
    const noteStart = when + note.startBeat * secondsPerBeat;
    const noteLength = note.durationBeats * secondsPerBeat;
    const hz = equalFrequency(note.midi + transpose);

    // Each glide is anchored at the old pitch first. Unanchored curves are
    // handled differently between browsers, and some hold the wrong pitch.
    if (previousHz === null) {
      voice.frequency.setValueAtTime(hz, noteStart);
    } else {
      const glide = Math.min(SINGER_TOKENS.glideSeconds, noteLength / 2);
      voice.frequency.setValueAtTime(previousHz, noteStart);
      voice.frequency.exponentialRampToValueAtTime(hz, noteStart + glide);
    }
    previousHz = hz;

    for (const segment of layoutSyllable(syllable, noteLength)) {
      const start = noteStart + segment.start;
      const end = noteStart + segment.end;
      if (!(end > start)) continue;

      if (isVowelPhoneme(segment.phoneme)) {
        const spec = VOWEL_SPECS[segment.phoneme];
        setFormants(spec.start, start, false);
        if (spec.end) setFormants(spec.end, end, true);
        voiceSpans.push({ start, end, level: 1 });
        continue;
      }

      const spec = CONSONANT_SPECS[segment.phoneme];
      if (spec.formants) setFormants(spec.formants, start, false);
      if (spec.voiced) voiceSpans.push({ start, end, level: SINGER_TOKENS.voicedConsonantLevel });
      if (spec.noise) {
        const burstStart = spec.kind === 'stop' ? start + (end - start) * SINGER_TOKENS.stopClosureShare : start;
        noiseFilter.frequency.setValueAtTime(Math.min(ceiling, spec.noise.hz), burstStart);
        noiseFilter.Q.setValueAtTime(spec.noise.q, burstStart);
        noiseSpans.push({ start: burstStart, end, level: spec.noise.gain * SINGER_TOKENS.noiseLevel });
      }
    }
  });

  scheduleSpans(voiceGate.gain, voiceSpans);
  scheduleSpans(noiseGate.gain, noiseSpans);

  const sources: AudioScheduledSourceNode[] = [voice, vibrato, noise];
  const stopAt = endTime + SINGER_TOKENS.tailSeconds;
  sources.forEach((source) => {
    source.start(when);
    source.stop(stopAt);
  });

  return {
    endTime,
    stop: (at) => {
      sources.forEach((source) => {
        try {
          source.stop(at ?? 0);
        } catch {
          // Already stopped.
        }
      });
    },
  };
};
