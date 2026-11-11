/**
 * Speech sounds used by the lyric singer.
 *
 * The names follow the widely used ARPAbet style (for example `AY` is the
 * vowel in "night" and `SH` is the start of "shadow").
 *
 * Pure TypeScript with no DOM dependency.
 *
 * @module studio/lyrics/phonemes
 */

/** Every vowel sound the singer knows. */
export const VOWEL_PHONEMES = ['AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'ER', 'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW'] as const;

/** Every consonant sound the singer knows. */
export const CONSONANT_PHONEMES = [
  'B', 'CH', 'D', 'DH', 'F', 'G', 'HH', 'JH', 'K', 'L', 'M', 'N', 'NG', 'P', 'R', 'S', 'SH', 'T', 'TH', 'V', 'W', 'Y', 'Z', 'ZH',
] as const;

/** A vowel sound. */
export type VowelPhoneme = (typeof VOWEL_PHONEMES)[number];

/** A consonant sound. */
export type ConsonantPhoneme = (typeof CONSONANT_PHONEMES)[number];

/** Any speech sound. */
export type Phoneme = VowelPhoneme | ConsonantPhoneme;

const VOWEL_SET: ReadonlySet<string> = new Set(VOWEL_PHONEMES);
const CONSONANT_SET: ReadonlySet<string> = new Set(CONSONANT_PHONEMES);

/** Whether a sound is a vowel. */
export const isVowelPhoneme = (value: string): value is VowelPhoneme => VOWEL_SET.has(value);

/** Whether a sound is a consonant. */
export const isConsonantPhoneme = (value: string): value is ConsonantPhoneme => CONSONANT_SET.has(value);

/**
 * Reads sounds written as capital codes separated by spaces, such as
 * `"HH AY"`. Anything that is not a known sound is skipped.
 */
export const parsePhonemes = (text: string): Phoneme[] =>
  text
    .trim()
    .split(/\s+/)
    .filter((code): code is Phoneme => VOWEL_SET.has(code) || CONSONANT_SET.has(code));
