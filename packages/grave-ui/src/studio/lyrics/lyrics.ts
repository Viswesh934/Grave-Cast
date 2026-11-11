/**
 * Reading lyrics: turning typed words into a list of syllables to sing.
 *
 * Writing tips for the singer:
 * - A hyphen forces a syllable break: `hal-low-een`.
 * - Braces respell a word the rules get wrong: `queue{kyoo}`.
 * - Commas and full stops add a short rest. A new line adds a longer one.
 *
 * Pure TypeScript with no DOM dependency.
 *
 * @module studio/lyrics/lyrics
 */

import { wordToPhonemes } from './g2p';
import type { Phoneme, VowelPhoneme } from './phonemes';
import { splitSyllables } from './syllables';

/** The most syllables read from one lyric, so a huge paste cannot freeze rendering. */
export const MAX_LYRIC_SYLLABLES = 600;

/** Rest lengths in beats. */
export const LYRIC_PAUSES = { comma: 0.5, sentence: 1, line: 1 } as const;

/**
 * One syllable of the lyrics, ready to be given a note.
 */
export interface LyricSyllable {
  /** Text to show for this syllable. Empty for the later parts of a word. */
  label: string;
  /** Consonants sung before the vowel. */
  onset: Phoneme[];
  /** The vowel held for the length of the note. */
  nucleus: VowelPhoneme;
  /** Consonants sung after the vowel. */
  coda: Phoneme[];
  /** Position of the word in the whole lyric. */
  wordIndex: number;
  /** Position of the line. */
  lineIndex: number;
  /** `true` for the first syllable of a word. */
  firstInWord: boolean;
  /** `true` for the last syllable of a word. */
  lastInWord: boolean;
  /** `true` for the last syllable of a line. */
  lastInLine: boolean;
  /** Rest to leave after this syllable, in beats. */
  pauseAfterBeats: number;
}

const TRAILING_PUNCTUATION = /[.,;:!?…]+$/;
const RESPELLING = /^(.*)\{([^}]*)\}$/;

const pauseFor = (punctuation: string): number => {
  if (/[.!?…]/.test(punctuation)) return LYRIC_PAUSES.sentence;
  if (punctuation.length > 0) return LYRIC_PAUSES.comma;
  return 0;
};

/**
 * Reads lyrics into syllables. Unknown symbols are ignored.
 *
 * @example
 * ```ts
 * parseLyrics('Hush now,\nthe moon is rising').map((s) => s.label);
 * ```
 */
export const parseLyrics = (text: string): LyricSyllable[] => {
  const result: LyricSyllable[] = [];
  let wordIndex = 0;

  text.split(/\r?\n/).forEach((line, lineIndex) => {
    const lineStart = result.length;

    for (const token of line.trim().split(/\s+/).filter(Boolean)) {
      if (result.length >= MAX_LYRIC_SYLLABLES) break;

      const punctuation = token.match(TRAILING_PUNCTUATION)?.[0] ?? '';
      let body = punctuation ? token.slice(0, -punctuation.length) : token;

      let respelling: string | null = null;
      const braces = body.match(RESPELLING);
      if (braces) {
        body = braces[1];
        respelling = braces[2];
      }

      const display = body.replace(/[^A-Za-z-]/g, '');
      const labels = display.split('-').filter((part) => /[A-Za-z]/.test(part));
      const sources = (respelling ?? display).split('-').filter((part) => /[A-Za-z]/.test(part));
      if (sources.length === 0) continue;

      const wordStart = result.length;
      sources.forEach((source, partIndex) => {
        splitSyllables(wordToPhonemes(source)).forEach((syllable, indexInPart) => {
          result.push({
            label: indexInPart === 0 ? labels[partIndex] ?? labels[0] ?? display : '',
            ...syllable,
            wordIndex,
            lineIndex,
            firstInWord: false,
            lastInWord: false,
            lastInLine: false,
            pauseAfterBeats: 0,
          });
        });
      });

      if (result.length === wordStart) continue;
      result[wordStart].firstInWord = true;
      result[result.length - 1].lastInWord = true;
      result[result.length - 1].pauseAfterBeats = pauseFor(punctuation);
      wordIndex += 1;
    }

    if (result.length > lineStart) {
      const last = result[result.length - 1];
      last.lastInLine = true;
      last.pauseAfterBeats = Math.max(last.pauseAfterBeats, LYRIC_PAUSES.line);
    }
  });

  return result.slice(0, MAX_LYRIC_SYLLABLES);
};
