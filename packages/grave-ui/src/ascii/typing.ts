/**
 * Typing effect helpers: reveal text gradually, in reading order.
 *
 * @module ascii/typing
 */

/** Milliseconds in a second. */
const MS_PER_SECOND = 1000;

/** The block drawn at the typing position. */
export const TYPING_CURSOR = '█';

/**
 * How many characters should be showing after some time has passed.
 *
 * @param total - Characters in the whole text.
 * @param elapsedMs - Milliseconds since typing began.
 * @param charsPerSecond - Typing speed.
 */
export const visibleCharCount = (total: number, elapsedMs: number, charsPerSecond: number): number =>
  Math.max(0, Math.min(total, Math.floor((elapsedMs / MS_PER_SECOND) * charsPerSecond)));

/**
 * How many characters count toward typing. Spaces are free, so a banner full
 * of padding does not pause on empty space.
 */
export const countTypeable = (lines: readonly string[]): number => {
  let count = 0;
  for (const line of lines) {
    for (const character of line) {
      if (character !== ' ') count += 1;
    }
  }
  return count;
};

/**
 * Shows the first `count` visible characters of some lines and blanks the rest,
 * so the layout never jumps as text appears.
 *
 * @param count - How many non-space characters to show.
 * @param cursor - Draw a block at the next position while typing is unfinished.
 */
export const revealLines = (lines: readonly string[], count: number, cursor: boolean = false): string[] => {
  let remaining = count;
  let cursorPlaced = !cursor;

  return lines.map((line) => {
    let result = '';
    for (const character of line) {
      if (character === ' ') {
        result += character;
      } else if (remaining > 0) {
        result += character;
        remaining -= 1;
      } else if (!cursorPlaced) {
        result += TYPING_CURSOR;
        cursorPlaced = true;
      } else {
        result += ' ';
      }
    }
    return result;
  });
};
