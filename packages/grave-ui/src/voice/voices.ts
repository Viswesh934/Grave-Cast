/**
 * Choosing a speech voice and preparing text for it.
 *
 * Pure TypeScript with no DOM dependency: voices are described by the small
 * {@link VoiceLike} shape, which `SpeechSynthesisVoice` satisfies.
 *
 * @module voice/voices
 */

import type { VoiceTone } from './personas';

/** The parts of a speech voice that matter for choosing one. */
export interface VoiceLike {
  name: string;
  lang: string;
  default: boolean;
  localService: boolean;
  voiceURI: string;
}

/**
 * What to look for in a voice.
 */
export interface VoicePreference {
  /** A language tag such as `en-GB` or `en`. An exact match beats a language-only match. */
  lang?: string;
  /** Prefer a voice that tends to sound deep or bright. This is a guess from the voice's name. */
  tone?: VoiceTone;
  /** The exact name or `voiceURI` of a voice to use if it is installed. */
  name?: string;
}

/** Points awarded when ranking voices. */
export const VOICE_SCORES = {
  exactName: 100,
  exactLang: 50,
  sameLanguage: 30,
  tone: 10,
  local: 5,
  isDefault: 2,
} as const;

/**
 * Words in voice names that suggest a deep or bright voice. Browsers do not
 * say which a voice is, so this is a rough guide that favors well-known names.
 */
const TONE_HINTS: Record<Exclude<VoiceTone, 'any'>, RegExp> = {
  deep: /\b(david|daniel|alex|fred|mark|james|guy|george|ryan|male|bass)\b/i,
  bright: /\b(zira|samantha|karen|victoria|susan|aria|jenny|hazel|moira|female|child)\b/i,
};

/** Splits a language tag like `en-GB` into its language part, `en`. */
const primaryLanguage = (tag: string): string => tag.toLowerCase().split(/[-_]/)[0];

const scoreVoice = (voice: VoiceLike, preference: VoicePreference): number => {
  let score = 0;

  if (preference.name && (voice.name === preference.name || voice.voiceURI === preference.name)) {
    score += VOICE_SCORES.exactName;
  }

  if (preference.lang) {
    if (voice.lang.toLowerCase().replace('_', '-') === preference.lang.toLowerCase().replace('_', '-')) {
      score += VOICE_SCORES.exactLang;
    } else if (primaryLanguage(voice.lang) === primaryLanguage(preference.lang)) {
      score += VOICE_SCORES.sameLanguage;
    }
  }

  if (preference.tone && preference.tone !== 'any' && TONE_HINTS[preference.tone].test(voice.name)) {
    score += VOICE_SCORES.tone;
  }

  if (voice.localService) score += VOICE_SCORES.local;
  if (voice.default) score += VOICE_SCORES.isDefault;
  return score;
};

/**
 * Sorts voices from best to worst match. The input is not changed. Ties keep
 * the browser's order.
 */
export const rankVoices = <T extends VoiceLike>(voices: readonly T[], preference: VoicePreference = {}): T[] =>
  voices
    .map((voice, index) => ({ voice, index, score: scoreVoice(voice, preference) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.voice);

/**
 * The best matching voice, or `null` if there are none. If a language is
 * requested and no installed voice speaks it, the best voice overall is still
 * returned so there is something to say it with.
 */
export const pickVoice = <T extends VoiceLike>(voices: readonly T[], preference: VoicePreference = {}): T | null =>
  rankVoices(voices, preference)[0] ?? null;

/** Longest piece of text sent to the speech engine at once. */
export const SPEECH_CHUNK_CHARS = 180;

/**
 * Splits text into pieces that are safe to speak one after another. Some
 * browsers stop speaking a long passage partway through, so each piece stays
 * short. It splits at sentence ends first, then at spaces, and never inside a word
 * unless a single word is longer than the limit.
 */
export const chunkText = (text: string, maxChars: number = SPEECH_CHUNK_CHARS): string[] => {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return [];

  const sentences = clean.match(/[^.!?…]+[.!?…]*\s*/g) ?? [clean];
  const chunks: string[] = [];
  let current = '';

  const flush = () => {
    const piece = current.trim();
    if (piece) chunks.push(piece);
    current = '';
  };

  for (const sentence of sentences) {
    if (current.length + sentence.length <= maxChars) {
      current += sentence;
      continue;
    }
    flush();
    if (sentence.length <= maxChars) {
      current = sentence;
      continue;
    }
    for (const word of sentence.split(' ')) {
      if (word.length > maxChars) {
        flush();
        for (let i = 0; i < word.length; i += maxChars) chunks.push(word.slice(i, i + maxChars));
        continue;
      }
      if ((current + ' ' + word).trim().length > maxChars) flush();
      current = current ? `${current} ${word}` : word;
    }
  }
  flush();
  return chunks;
};
