/**
 * Backwards: a typing game where each line is typed with its words in reverse order.
 * @module components/effects/Backwards
 */
export { Backwards, type BackwardsProps, type BackwardsSounds } from './Backwards';
export {
  BACKWARDS_WORDS,
  accuracyPercent,
  cleanLine,
  lineWords,
  makeBackwardsLine,
  markTyping,
  nextBackwardsLine,
  reverseWords,
  rightSoFar,
  backwardsRandom,
  usableLines,
  wordsPerMinute,
  type BackwardsMark,
  type BackwardsRandom,
  type BackwardsWords,
} from './backwardsEngine';
export { backwardsTokens } from './tokens';
