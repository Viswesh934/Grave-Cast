/**
 * Splitting a word's sounds into syllables.
 *
 * Every syllable has one vowel at its heart (the nucleus), consonants before
 * it (the onset), and consonants after it (the coda).
 *
 * Pure TypeScript with no DOM dependency.
 *
 * @module studio/lyrics/syllables
 */

import { isVowelPhoneme, type Phoneme, type VowelPhoneme } from './phonemes';

/**
 * One beat of a sung word.
 */
export interface SoundSyllable {
  /** Consonants sung before the vowel. */
  onset: Phoneme[];
  /** The vowel held for the length of the note. */
  nucleus: VowelPhoneme;
  /** Consonants sung after the vowel. */
  coda: Phoneme[];
}

/** Consonant groups English words can start with, so a cluster is not split in the wrong place. */
const VALID_ONSETS: ReadonlySet<string> = new Set([
  'P L', 'B L', 'K L', 'G L', 'F L', 'S L',
  'P R', 'B R', 'T R', 'D R', 'K R', 'G R', 'F R', 'TH R', 'SH R',
  'S P', 'S T', 'S K', 'S M', 'S N', 'S W', 'K W', 'T W', 'D W',
  'S P L', 'S P R', 'S T R', 'S K R', 'S K W',
]);

/** Longest consonant group that can start a syllable. */
const MAX_ONSET = 3;

/** The vowel used when a word has none at all, such as "hmm". */
const FALLBACK_VOWEL: VowelPhoneme = 'AH';

/**
 * Splits sounds into syllables. Between two vowels, the longest group that
 * can begin a word goes with the second vowel, and the rest ends the first.
 * A word with no vowel gets a neutral one so it can still be sung.
 */
export const splitSyllables = (phonemes: readonly Phoneme[]): SoundSyllable[] => {
  const nuclei: number[] = [];
  phonemes.forEach((sound, index) => {
    if (isVowelPhoneme(sound)) nuclei.push(index);
  });

  if (nuclei.length === 0) {
    return phonemes.length === 0 ? [] : [{ onset: [...phonemes], nucleus: FALLBACK_VOWEL, coda: [] }];
  }

  const syllables: SoundSyllable[] = nuclei.map((position) => ({
    onset: [],
    nucleus: phonemes[position] as VowelPhoneme,
    coda: [],
  }));

  // Consonants before the first vowel start the first syllable.
  syllables[0].onset = phonemes.slice(0, nuclei[0]);

  // Consonants after the last vowel end the last syllable.
  syllables[syllables.length - 1].coda = phonemes.slice(nuclei[nuclei.length - 1] + 1);

  // Consonants between two vowels are shared out.
  for (let k = 0; k < nuclei.length - 1; k += 1) {
    const cluster = phonemes.slice(nuclei[k] + 1, nuclei[k + 1]);
    let take = Math.min(cluster.length, MAX_ONSET);
    // Keep at least one consonant as the onset, and use the longest valid group.
    while (take > 1 && !VALID_ONSETS.has(cluster.slice(cluster.length - take).join(' '))) take -= 1;
    const split = cluster.length - take;
    syllables[k].coda = cluster.slice(0, split);
    syllables[k + 1].onset = cluster.slice(split);
  }

  return syllables;
};
