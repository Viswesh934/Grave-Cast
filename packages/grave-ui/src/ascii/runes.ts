/**
 * Rune scramble: replace characters near a point with runes.
 *
 * @module ascii/runes
 */

/** Elder Futhark runes, the characters swapped in. */
export const ELDER_FUTHARK = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';

/**
 * Terminal characters are about twice as tall as they are wide, so vertical
 * distance counts double when measuring how close a character is to a point.
 */
const ROW_WEIGHT = 2;

/**
 * Swaps characters near a point for runes. The closer a character is to the
 * point, the more likely it is to change, fading to nothing at `radius`.
 * Spaces are left alone so the shape of the picture holds.
 *
 * @param lines - The text, one string per row.
 * @param row - Row of the point.
 * @param col - Column of the point.
 * @param radius - Reach of the effect, in characters across.
 * @param random - A 0-1 random source. Pass a seeded one for repeatable results.
 */
export const scrambleAround = (
  lines: readonly string[],
  row: number,
  col: number,
  radius: number,
  random: () => number = Math.random
): string[] =>
  lines.map((line, y) => {
    let result = '';
    let x = 0;
    for (const character of line) {
      const distance = Math.hypot(x - col, (y - row) * ROW_WEIGHT);
      const strength = 1 - distance / radius;
      if (character !== ' ' && strength > 0 && random() < strength) {
        result += ELDER_FUTHARK[Math.floor(random() * ELDER_FUTHARK.length)];
      } else {
        result += character;
      }
      x += 1;
    }
    return result;
  });
