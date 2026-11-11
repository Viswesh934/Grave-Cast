/**
 * How each speech sound is made: the vocal tract resonances (formants) of
 * vowels, and the noise or hum behind consonants.
 *
 * The values are textbook averages for a mid-range voice. They are rough on
 * purpose: this is a robotic singer, not a recording of a person.
 *
 * Pure TypeScript with no DOM dependency.
 *
 * @module studio/lyrics/formants
 */

import type { ConsonantPhoneme, VowelPhoneme } from './phonemes';

/** The three strongest resonances of a sound, in Hz. */
export interface Formants {
  f1: number;
  f2: number;
  f3: number;
}

/** A vowel: where it starts, and where it glides to if it is a diphthong. */
export interface VowelSpec {
  start: Formants;
  /** Present for sounds that move, like the "ay" in "night". */
  end?: Formants;
}

const AA: Formants = { f1: 800, f2: 1150, f3: 2900 };
const AO: Formants = { f1: 570, f2: 840, f3: 2410 };
const EH: Formants = { f1: 530, f2: 1840, f3: 2480 };
const IH: Formants = { f1: 390, f2: 1990, f3: 2550 };
const UH: Formants = { f1: 440, f2: 1020, f3: 2240 };

export const VOWEL_SPECS: Record<VowelPhoneme, VowelSpec> = {
  AA: { start: AA },
  AE: { start: { f1: 660, f2: 1720, f3: 2410 } },
  AH: { start: { f1: 640, f2: 1190, f3: 2390 } },
  AO: { start: AO },
  AW: { start: AA, end: UH },
  AY: { start: AA, end: IH },
  EH: { start: EH },
  ER: { start: { f1: 490, f2: 1350, f3: 1690 } },
  EY: { start: EH, end: IH },
  IH: { start: IH },
  IY: { start: { f1: 270, f2: 2290, f3: 3010 } },
  OW: { start: AO, end: UH },
  OY: { start: AO, end: IH },
  UH: { start: UH },
  UW: { start: { f1: 300, f2: 870, f3: 2240 } },
};

/**
 * How a consonant is made.
 *
 * - `stop`: the air is blocked, then released in a burst (p, t, k)
 * - `fricative`: air hisses through a gap (s, f)
 * - `affricate`: a stop that ends in a hiss (ch, j)
 * - `aspirate`: a breath of air (h)
 * - `nasal`: the voice hums through the nose (m, n)
 * - `approximant`: the voice glides through a vowel-like shape (l, r, w, y)
 */
export type ConsonantKind = 'stop' | 'fricative' | 'affricate' | 'aspirate' | 'nasal' | 'approximant';

/** The noise behind a consonant: a band of hiss. */
export interface NoiseSpec {
  /** Centre of the hissing band, in Hz. */
  hz: number;
  /** Sharpness of the band. Higher is narrower. */
  q: number;
  /** Loudness, 0-1. */
  gain: number;
}

/** One consonant in full. */
export interface ConsonantSpec {
  kind: ConsonantKind;
  /** Whether the voice buzzes along with it. */
  voiced: boolean;
  /** How long it lasts, in seconds, when there is room. */
  seconds: number;
  /** The hiss or burst, for kinds that have one. */
  noise?: NoiseSpec;
  /** The resonances while the voice hums through, for nasals and approximants. */
  formants?: Formants;
}

export const CONSONANT_SPECS: Record<ConsonantPhoneme, ConsonantSpec> = {
  P: { kind: 'stop', voiced: false, seconds: 0.07, noise: { hz: 1200, q: 0.8, gain: 0.5 } },
  B: { kind: 'stop', voiced: true, seconds: 0.07, noise: { hz: 800, q: 0.8, gain: 0.3 } },
  T: { kind: 'stop', voiced: false, seconds: 0.07, noise: { hz: 4500, q: 1.5, gain: 0.5 } },
  D: { kind: 'stop', voiced: true, seconds: 0.07, noise: { hz: 3500, q: 1.5, gain: 0.3 } },
  K: { kind: 'stop', voiced: false, seconds: 0.08, noise: { hz: 2000, q: 1, gain: 0.5 } },
  G: { kind: 'stop', voiced: true, seconds: 0.08, noise: { hz: 1800, q: 1, gain: 0.3 } },
  F: { kind: 'fricative', voiced: false, seconds: 0.11, noise: { hz: 5000, q: 0.5, gain: 0.25 } },
  V: { kind: 'fricative', voiced: true, seconds: 0.09, noise: { hz: 5000, q: 0.5, gain: 0.15 } },
  TH: { kind: 'fricative', voiced: false, seconds: 0.1, noise: { hz: 5500, q: 0.5, gain: 0.15 } },
  DH: { kind: 'fricative', voiced: true, seconds: 0.07, noise: { hz: 5500, q: 0.5, gain: 0.1 } },
  S: { kind: 'fricative', voiced: false, seconds: 0.12, noise: { hz: 7000, q: 2, gain: 0.5 } },
  Z: { kind: 'fricative', voiced: true, seconds: 0.1, noise: { hz: 7000, q: 2, gain: 0.3 } },
  SH: { kind: 'fricative', voiced: false, seconds: 0.12, noise: { hz: 3200, q: 1.5, gain: 0.5 } },
  ZH: { kind: 'fricative', voiced: true, seconds: 0.1, noise: { hz: 3200, q: 1.5, gain: 0.3 } },
  HH: { kind: 'aspirate', voiced: false, seconds: 0.08, noise: { hz: 1500, q: 0.3, gain: 0.3 } },
  CH: { kind: 'affricate', voiced: false, seconds: 0.11, noise: { hz: 3200, q: 1.2, gain: 0.5 } },
  JH: { kind: 'affricate', voiced: true, seconds: 0.11, noise: { hz: 3200, q: 1.2, gain: 0.3 } },
  M: { kind: 'nasal', voiced: true, seconds: 0.09, formants: { f1: 250, f2: 1100, f3: 2200 } },
  N: { kind: 'nasal', voiced: true, seconds: 0.09, formants: { f1: 250, f2: 1700, f3: 2600 } },
  NG: { kind: 'nasal', voiced: true, seconds: 0.09, formants: { f1: 250, f2: 2000, f3: 2700 } },
  L: { kind: 'approximant', voiced: true, seconds: 0.08, formants: { f1: 360, f2: 1300, f3: 2800 } },
  R: { kind: 'approximant', voiced: true, seconds: 0.08, formants: { f1: 310, f2: 1060, f3: 1380 } },
  W: { kind: 'approximant', voiced: true, seconds: 0.07, formants: { f1: 300, f2: 610, f3: 2200 } },
  Y: { kind: 'approximant', voiced: true, seconds: 0.07, formants: { f1: 270, f2: 2100, f3: 3000 } },
};
