/**
 * Letters to sounds: a small rule-based guess at how an English word is
 * pronounced.
 *
 * English spelling is irregular, so a short list of common words is looked up
 * first, and everything else follows simple rules. It will be wrong for some
 * words. Respell those: `queue{kyoo}` sings "kyoo".
 *
 * Pure TypeScript with no DOM dependency.
 *
 * @module studio/lyrics/g2p
 */

import { parsePhonemes, type Phoneme } from './phonemes';

/** Words that break the rules, written as sound codes. */
const EXCEPTIONS: Record<string, string> = {
  a: 'AH', the: 'DH AH', to: 'T UW', of: 'AH V', and: 'AE N D', i: 'AY', in: 'IH N', it: 'IH T', is: 'IH Z', its: 'IH T S',
  you: 'Y UW', your: 'Y AO R', are: 'AA R', was: 'W AH Z', were: 'W ER', be: 'B IY', me: 'M IY', he: 'HH IY', she: 'SH IY',
  we: 'W IY', they: 'DH EY', their: 'DH EH R', there: 'DH EH R', where: 'W EH R', here: 'HH IY R', what: 'W AH T',
  who: 'HH UW', whom: 'HH UW M', how: 'HH AW', now: 'N AW', do: 'D UW', does: 'D AH Z', done: 'D AH N', go: 'G OW',
  gone: 'G AO N', no: 'N OW', so: 'S OW', one: 'W AH N', once: 'W AH N S', two: 'T UW', said: 'S EH D', says: 'S EH Z',
  love: 'L AH V', come: 'K AH M', some: 'S AH M', have: 'HH AE V', has: 'HH AE Z', give: 'G IH V', live: 'L IH V',
  this: 'DH IH S', that: 'DH AE T', with: 'W IH TH', them: 'DH EH M', then: 'DH EH N', than: 'DH AE N', these: 'DH IY Z',
  those: 'DH OW Z', death: 'D EH TH', dead: 'D EH D', head: 'HH EH D', blood: 'B L AH D', heart: 'HH AA R T',
  earth: 'ER TH', soul: 'S OW L', ghost: 'G OW S T', eye: 'AY', eyes: 'AY Z', my: 'M AY', by: 'B AY', why: 'W AY',
  could: 'K UH D', would: 'W UH D', should: 'SH UH D', through: 'TH R UW', though: 'DH OW', thought: 'TH AO T',
  night: 'N AY T', light: 'L AY T', again: 'AH G EH N', every: 'EH V R IY', people: 'P IY P AH L', world: 'W ER L D',
  from: 'F R AH M', for: 'F AO R', or: 'AO R', all: 'AO L', call: 'K AO L', fall: 'F AO L', wall: 'W AO L',
  moon: 'M UW N', good: 'G UH D', book: 'B UH K', look: 'L UH K', put: 'P UH T', full: 'F UH L', pull: 'P UH L',
  hush: 'HH AH SH', sleep: 'S L IY P', dream: 'D R IY M', dreams: 'D R IY M Z', scream: 'S K R IY M', black: 'B L AE K',
  grave: 'G R EY V', graves: 'G R EY V Z', bones: 'B OW N Z', dark: 'D AA R K', darkness: 'D AA R K N AH S', fear: 'F IY R',
  tomb: 'T UW M', wind: 'W IH N D', hear: 'HH IY R', year: 'Y IY R', years: 'Y IY R Z', door: 'D AO R', floor: 'F L AO R',
  blue: 'B L UW', true: 'T R UW', new: 'N UW', few: 'F Y UW', knew: 'N UW', know: 'N OW', down: 'D AW N', town: 'T AW N',
  own: 'OW N', old: 'OW L D', cold: 'K OW L D', gold: 'G OW L D', told: 'T OW L D', hold: 'HH OW L D', roll: 'R OW L',
  money: 'M AH N IY', honey: 'HH AH N IY', other: 'AH DH ER', mother: 'M AH DH ER', brother: 'B R AH DH ER',
  father: 'F AA DH ER', water: 'W AO T ER', daughter: 'D AO T ER', laugh: 'L AE F', beautiful: 'B Y UW T AH F AH L',
};

const VOWEL_LETTERS = new Set(['a', 'e', 'i', 'o', 'u']);
const VOICELESS_ENDINGS = ['p', 'k', 'f', 's', 'x', 'h'];
const VOICED_FINAL_LETTERS = new Set(['b', 'd', 'g', 'l', 'm', 'n', 'r', 'v', 'w', 'y', 'z']);
const SOFT_C_G_FOLLOWERS = new Set(['e', 'i', 'y']);

/** Consonant pairs that act as one sound when they sit between a vowel and a silent e. */
const SINGLE_SOUND_PAIRS = new Set(['th', 'ch', 'sh']);

/** Plain consonant letters that map to one sound. */
const SIMPLE_CONSONANTS: Record<string, Phoneme[]> = {
  b: ['B'], d: ['D'], f: ['F'], h: ['HH'], j: ['JH'], k: ['K'], l: ['L'], m: ['M'], n: ['N'], p: ['P'],
  r: ['R'], t: ['T'], v: ['V'], w: ['W'], z: ['Z'], x: ['K', 'S'], q: ['K'],
};

const isVowelLetter = (letter: string | undefined): boolean => letter !== undefined && VOWEL_LETTERS.has(letter);

/** Turns the body of a word (no suffix) into sounds. */
const convertBase = (w: string): Phoneme[] => {
  const n = w.length;
  const out: Phoneme[] = [];

  const hasVowelBefore = (index: number): boolean => /[aeiou]/.test(w.slice(0, index));
  const silentE = n > 2 && w.endsWith('e') && !isVowelLetter(w[n - 2]) && hasVowelBefore(n - 2);

  /** A vowel followed by one consonant and a silent e says its own name. */
  const isLong = (index: number): boolean => {
    if (!silentE) return false;
    const middle = w.slice(index + 1, n - 1);
    return middle.length > 0 && !isVowelLetter(middle[0]) && (middle.length === 1 || SINGLE_SOUND_PAIRS.has(middle));
  };

  let i = 0;
  while (i < n) {
    const c = w[i];
    const rest = w.slice(i);
    const next = w[i + 1];

    if (silentE && i === n - 1) {
      i += 1;
      continue;
    }

    // Three-letter groups.
    if (rest.startsWith('igh')) { out.push('AY'); i += 3; continue; }
    if (rest.startsWith('tch')) { out.push('CH'); i += 3; continue; }
    if (rest.startsWith('dge')) { out.push('JH'); i += 3; continue; }
    if (rest.startsWith('air')) { out.push('EH', 'R'); i += 3; continue; }
    if (rest.startsWith('ear')) { out.push(i + 3 === n ? 'IY' : 'ER'); if (i + 3 === n) out.push('R'); i += 3; continue; }
    if (rest.startsWith('oar')) { out.push('AO', 'R'); i += 3; continue; }
    if (rest.startsWith('our')) { out.push('AW', 'ER'); i += 3; continue; }
    if (rest === 'ire') { out.push('AY', 'ER'); i += 3; continue; }
    if (rest === 'are') { out.push('EH', 'R'); i += 3; continue; }
    if (rest === 'ore') { out.push('AO', 'R'); i += 3; continue; }
    if (rest === 'ure') { out.push('Y', 'UH', 'R'); i += 3; continue; }

    // Consonant pairs.
    if (rest.startsWith('nk')) { out.push('NG', 'K'); i += 2; continue; }
    if (rest.startsWith('ng')) { out.push('NG'); i += 2; continue; }
    if (rest.startsWith('ch')) { out.push('CH'); i += 2; continue; }
    if (rest.startsWith('sh')) { out.push('SH'); i += 2; continue; }
    if (rest.startsWith('th')) { out.push('TH'); i += 2; continue; }
    if (rest.startsWith('ph')) { out.push('F'); i += 2; continue; }
    if (rest.startsWith('ck')) { out.push('K'); i += 2; continue; }
    if (rest.startsWith('wh')) { out.push('W'); i += 2; continue; }
    if (rest.startsWith('qu')) { out.push('K', 'W'); i += 2; continue; }
    if (i === 0 && rest.startsWith('kn')) { out.push('N'); i += 2; continue; }
    if (i === 0 && rest.startsWith('wr')) { out.push('R'); i += 2; continue; }
    if (rest.startsWith('gh')) { if (i === 0) out.push('G'); i += 2; continue; }
    if (rest === 'mb') { out.push('M'); i += 2; continue; }

    // Vowel pairs and vowel-plus-r.
    if (rest.startsWith('alk')) { out.push('AO', 'K'); i += 3; continue; }
    if (rest.startsWith('all')) { out.push('AO', 'L'); i += 3; continue; }
    if (rest.startsWith('ar')) { out.push('AA', 'R'); i += 2; continue; }
    if (rest.startsWith('or')) { out.push('AO', 'R'); i += 2; continue; }
    if (rest.startsWith('er') || rest.startsWith('ir') || rest.startsWith('ur')) { out.push('ER'); i += 2; continue; }
    if (rest.startsWith('ai') || rest.startsWith('ay')) { out.push('EY'); i += 2; continue; }
    if (rest.startsWith('ee') || rest.startsWith('ea')) { out.push('IY'); i += 2; continue; }
    if (rest.startsWith('oa') || rest.startsWith('oe')) { out.push('OW'); i += 2; continue; }
    if (rest.startsWith('oo')) { out.push(w[i + 2] === 'k' ? 'UH' : 'UW'); i += 2; continue; }
    if (rest.startsWith('ou')) { out.push('AW'); i += 2; continue; }
    if (rest.startsWith('ow')) { out.push(i + 2 === n ? 'OW' : 'AW'); i += 2; continue; }
    if (rest.startsWith('oi') || rest.startsWith('oy')) { out.push('OY'); i += 2; continue; }
    if (rest.startsWith('au') || rest.startsWith('aw')) { out.push('AO'); i += 2; continue; }
    if (rest.startsWith('ew') || rest.startsWith('eu')) { out.push('Y', 'UW'); i += 2; continue; }
    if (rest.startsWith('ui')) { out.push('UW'); i += 2; continue; }
    if (rest.startsWith('ie')) { out.push(i + 2 === n ? 'AY' : 'IY'); i += 2; continue; }

    // A doubled consonant makes one sound.
    if (c === next && !isVowelLetter(c) && /[a-z]/.test(c)) {
      i += 1;
      continue;
    }

    // Single vowels.
    if (c === 'a') {
      if (isLong(i)) out.push('EY');
      else if (i + 1 === n && i > 0) out.push('AH');
      else if (i > 0 && w[i - 1] === 'w' && !/^[gxk]/.test(w.slice(i + 1))) out.push('AA');
      else out.push('AE');
      i += 1;
      continue;
    }
    // A "be-" prefix before one consonant and a vowel says "bee": beneath, before, behind.
    if (c === 'e' && i === 1 && w[0] === 'b' && n > 4 && !isVowelLetter(w[2]) && w[2] !== w[3] && isVowelLetter(w[3])) {
      out.push('IY');
      i += 1;
      continue;
    }
    if (c === 'e') { out.push(isLong(i) ? 'IY' : 'EH'); i += 1; continue; }
    if (c === 'i') { out.push(isLong(i) ? 'AY' : 'IH'); i += 1; continue; }
    if (c === 'o') { out.push(isLong(i) || i + 1 === n ? 'OW' : 'AA'); i += 1; continue; }
    if (c === 'u') {
      // A long u says "yoo", except after r, l, and j: cute, use, but rude, flute, June.
      if (isLong(i)) out.push(...(i > 0 && 'rlj'.includes(w[i - 1]) ? (['UW'] as Phoneme[]) : (['Y', 'UW'] as Phoneme[])));
      else out.push('AH');
      i += 1;
      continue;
    }
    if (c === 'y') {
      // Before a vowel, y is a consonant: yes, kyoo, beyond.
      if (i === 0 || isVowelLetter(next)) out.push('Y');
      else if (i === n - 1) out.push(/[aeiou]/.test(w.slice(0, i)) ? 'IY' : 'AY');
      else out.push('IH');
      i += 1;
      continue;
    }

    // Single consonants that depend on their neighbours.
    if (c === 'c') { out.push(next !== undefined && SOFT_C_G_FOLLOWERS.has(next) ? 'S' : 'K'); i += 1; continue; }
    if (c === 'g') { out.push(next !== undefined && SOFT_C_G_FOLLOWERS.has(next) ? 'JH' : 'G'); i += 1; continue; }
    if (c === 's') { out.push(i > 0 && isVowelLetter(w[i - 1]) && isVowelLetter(next) ? 'Z' : 'S'); i += 1; continue; }

    const simple = SIMPLE_CONSONANTS[c];
    if (simple) out.push(...simple);
    i += 1;
  }
  return out;
};

/**
 * Guesses how a word sounds.
 *
 * @example
 * ```ts
 * wordToPhonemes('night'); // ['N', 'AY', 'T']
 * wordToPhonemes('candle'); // ['K', 'AE', 'N', 'D', 'AH', 'L']
 * ```
 */
export const wordToPhonemes = (input: string): Phoneme[] => {
  const word = input.toLowerCase().replace(/[^a-z]/g, '');
  if (!word) return [];

  const known = EXCEPTIONS[word];
  if (known) return parsePhonemes(known);

  const n = word.length;

  /** Sounds for the body of a word: the exceptions table first, then the rules. */
  const body = (text: string): Phoneme[] => {
    const listed = EXCEPTIONS[text];
    return listed ? parsePhonemes(listed) : convertBase(text);
  };

  /**
   * A one-vowel stem before "ing" or "ed" usually lost a silent e: rising is
   * rise + ing, hoped is hope + ed. A doubled consonant means it did not:
   * running, hopped.
   */
  const stem = (base: string): string => {
    const vowels = base.match(/[aeiou]/g)?.length ?? 0;
    const restoresE = vowels === 1 && /[^aeiou][aeiou][^aeiouwxy]$/.test(base) && !EXCEPTIONS[base];
    return restoresE ? `${base}e` : base;
  };

  // A consonant plus "le" ends in a hummed "ul": candle, little.
  if (n > 3 && /[^aeiou]le$/.test(word)) return [...body(word.slice(0, -2)), 'AH', 'L'];

  // "ing" is its own syllable.
  if (n > 4 && word.endsWith('ing') && /[aeiouy]/.test(word.slice(0, -3))) {
    return [...body(stem(word.slice(0, -3))), 'IH', 'NG'];
  }

  // "ed" says d or t, or a full syllable after t and d.
  if (n > 3 && word.endsWith('ed') && !isVowelLetter(word[n - 3])) {
    const base = word.slice(0, -2);
    const last = base[base.length - 1];
    const ending: Phoneme[] = last === 't' || last === 'd' ? ['IH', 'D'] : VOICELESS_ENDINGS.includes(last) ? ['T'] : ['D'];
    return [...body(stem(base)), ...ending];
  }

  // A plural s says z after a voiced sound. Short words like "yes" and "gas" are not plurals.
  if (n > 3 && word.endsWith('s') && !'siu'.includes(word[n - 2])) {
    const base = word.slice(0, -1);
    const last = base[base.length - 1];
    const voiced = isVowelLetter(last) || VOICED_FINAL_LETTERS.has(last);
    return [...body(base), voiced ? 'Z' : 'S'];
  }

  return convertBase(word);
};
