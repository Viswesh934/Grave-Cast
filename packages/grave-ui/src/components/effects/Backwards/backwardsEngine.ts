/**
 * Backwards' rules: making lines to type, turning their word order around, and
 * scoring what was typed. Pure data and functions, so the game can be tested
 * and any word lists plugged in.
 * @module components/effects/Backwards/backwardsEngine
 */
import { backwardsTokens as t } from './tokens';

/** A source of random numbers from 0 up to 1. Pass a fixed one to replay a round. */
export type BackwardsRandom = () => number;

/**
 * The word lists lines are made from: "The {who} {does} the {kind} {thing} {how}".
 * Each list should have whole words that fit its place, such as verbs that take an object for `does`.
 */
export interface BackwardsWords {
  who: readonly string[];
  does: readonly string[];
  kind: readonly string[];
  thing: readonly string[];
  how: readonly string[];
}

/** The game's own word lists, a night in the graveyard. With twelve words in each, they make about 250,000 lines. */
export const BACKWARDS_WORDS: BackwardsWords = {
  who: ['raven', 'ghost', 'witch', 'wolf', 'owl', 'spider', 'bat', 'vampire', 'mummy', 'goblin', 'skeleton', 'cat'],
  does: ['watches', 'follows', 'guards', 'circles', 'haunts', 'finds', 'hides', 'carries', 'buries', 'wakes', 'calls', 'counts'],
  kind: ['old', 'quiet', 'broken', 'hollow', 'silver', 'cold', 'crooked', 'empty', 'dusty', 'misty', 'ancient', 'lonely'],
  thing: ['gate', 'grave', 'candle', 'bell', 'lantern', 'key', 'tower', 'mirror', 'coffin', 'bridge', 'clock', 'door'],
  how: ['quietly', 'slowly', 'tonight', 'again', 'alone', 'softly', 'at midnight', 'before dawn', 'in the fog', 'every night', 'once more', 'by moonlight'],
};

const SECONDS_PER_MINUTE = 60;
const PERCENT = 100;

/** The fixed numbers of the mulberry32 generator, as its author published them. */
const MULBERRY = { step: 0x6d2b79f5, shiftA: 15, shiftB: 7, shiftC: 14, oddA: 1, oddB: 61, range: 2 ** 32 } as const;

/**
 * A random source that gives the same numbers every time for the same seed
 * (mulberry32), so a round can be replayed or tested.
 */
export const backwardsRandom = (seed: number): BackwardsRandom => {
  let state = seed >>> 0;
  return () => {
    state = (state + MULBERRY.step) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> MULBERRY.shiftA), mixed | MULBERRY.oddA);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> MULBERRY.shiftB), mixed | MULBERRY.oddB);
    return ((mixed ^ (mixed >>> MULBERRY.shiftC)) >>> 0) / MULBERRY.range;
  };
};

const pick = <T,>(random: BackwardsRandom, list: readonly T[]): T => list[Math.min(list.length - 1, Math.floor(random() * list.length))];

/** A line's words, without punctuation. Letters, digits, apostrophes and hyphens stay; capitals are kept. */
export const lineWords = (text: string): string[] =>
  text
    .replace(/[^\p{L}\p{N}'\s-]/gu, ' ')
    .split(/\s+/)
    .filter((word) => word !== '');

/** A line as the game shows it: its words with single spaces, and no punctuation to trip on. */
export const cleanLine = (text: string): string => lineWords(text).join(' ');

/** The answer to a line: its words in reverse order, each word unchanged. "How are you" becomes "you are How". */
export const reverseWords = (text: string): string => lineWords(text).reverse().join(' ');

/** Makes up a line from the word lists, such as "The raven watches the old gate quietly". */
export const makeBackwardsLine = (random: BackwardsRandom, words: BackwardsWords = BACKWARDS_WORDS): string => {
  const who = pick(random, words.who);
  const does = pick(random, words.does);
  const thing = pick(random, words.thing);
  if (random() >= t.longChance) return `The ${who} ${does} the ${thing}`;
  return `The ${who} ${does} the ${pick(random, words.kind)} ${thing} ${pick(random, words.how)}`;
};

/** The fewest words a line needs for its order to be turned around. */
const MIN_LINE_WORDS = 2;

/** The app's own lines that fit a round: cleaned, at least two words, and no longer than `maxLineWords`. */
export const usableLines = (lines: readonly string[]): string[] =>
  lines.map(cleanLine).filter((line) => {
    const count = line.split(' ').length;
    return line !== '' && count >= MIN_LINE_WORDS && count <= t.maxLineWords;
  });

/**
 * The next line to type. Now and then it comes from `lines` (already passed
 * through `usableLines`), otherwise it is made up. It tries not to repeat `previous`.
 */
export const nextBackwardsLine = (
  random: BackwardsRandom,
  lines: readonly string[] = [],
  previous = '',
  words: BackwardsWords = BACKWARDS_WORDS
): string => {
  let line = '';
  for (let attempt = 0; attempt < t.freshTries; attempt++) {
    line = lines.length > 0 && random() < t.linesChance ? pick(random, lines) : makeBackwardsLine(random, words);
    if (line !== previous) break;
  }
  return line;
};

/** How each typed letter compares with the answer. */
export type BackwardsMark = 'right' | 'wrong';

/** Marks each typed letter right or wrong against the answer. Letters typed past its end are wrong. */
export const markTyping = (answer: string, typed: string): BackwardsMark[] =>
  Array.from(typed, (char, i) => (char === answer[i] ? 'right' : 'wrong'));

/** How many letters at the start of `typed` match the answer, before the first mistake. */
export const rightSoFar = (answer: string, typed: string): number => {
  let count = 0;
  while (count < typed.length && typed[count] === answer[count]) count++;
  return count;
};

/** Words a minute, the usual way: every five right characters count as one word. */
export const wordsPerMinute = (rightChars: number, seconds: number): number =>
  seconds > 0 ? Math.round(rightChars / t.charsPerWord / (seconds / SECONDS_PER_MINUTE)) : 0;

/** The share of key presses that were right, as a whole percentage. 100 before any key is pressed. */
export const accuracyPercent = (rightKeys: number, allKeys: number): number =>
  allKeys > 0 ? Math.round((rightKeys / allKeys) * PERCENT) : PERCENT;
