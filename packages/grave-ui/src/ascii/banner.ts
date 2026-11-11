/**
 * Banner font: big block letters made of characters.
 *
 * A small hand-drawn five-row font. `#` is ink and `.` is empty.
 *
 * @module ascii/banner
 */

/** Rows in every glyph. */
export const BANNER_HEIGHT = 5;

/** Ink character in the font data. */
const INK = '#';

/** Glyphs by character. Each is five rows of equal width. */
const GLYPHS: Readonly<Record<string, readonly string[]>> = {
  A: ['.###.', '#...#', '#####', '#...#', '#...#'],
  B: ['####.', '#...#', '####.', '#...#', '####.'],
  C: ['.####', '#....', '#....', '#....', '.####'],
  D: ['####.', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '####.', '#....', '#####'],
  F: ['#####', '#....', '####.', '#....', '#....'],
  G: ['.####', '#....', '#..##', '#...#', '.###.'],
  H: ['#...#', '#...#', '#####', '#...#', '#...#'],
  I: ['#####', '..#..', '..#..', '..#..', '#####'],
  J: ['..###', '...#.', '...#.', '#..#.', '.##..'],
  K: ['#...#', '#..#.', '###..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '####.', '#....', '#....'],
  Q: ['.###.', '#...#', '#.#.#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '####.', '#..#.', '#...#'],
  S: ['.####', '#....', '.###.', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'],
  X: ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
  Y: ['#...#', '.#.#.', '..#..', '..#..', '..#..'],
  Z: ['#####', '...#.', '..#..', '.#...', '#####'],
  '0': ['.###.', '#..##', '#.#.#', '##..#', '.###.'],
  '1': ['..#..', '.##..', '..#..', '..#..', '.###.'],
  '2': ['.###.', '#...#', '...#.', '..#..', '#####'],
  '3': ['####.', '....#', '.###.', '....#', '####.'],
  '4': ['#..#.', '#..#.', '#####', '...#.', '...#.'],
  '5': ['#####', '#....', '####.', '....#', '####.'],
  '6': ['.###.', '#....', '####.', '#...#', '.###.'],
  '7': ['#####', '...#.', '..#..', '.#...', '.#...'],
  '8': ['.###.', '#...#', '.###.', '#...#', '.###.'],
  '9': ['.###.', '#...#', '.####', '....#', '.###.'],
  ' ': ['...', '...', '...', '...', '...'],
  '!': ['..#..', '..#..', '..#..', '.....', '..#..'],
  '.': ['.....', '.....', '.....', '.....', '..#..'],
  '-': ['.....', '.....', '.###.', '.....', '.....'],
  '?': ['.###.', '#...#', '...#.', '.....', '..#..'],
  "'": ['..#..', '..#..', '.....', '.....', '.....'],
  ':': ['.....', '..#..', '.....', '..#..', '.....'],
};

/** Shown for characters the font does not have. */
const FALLBACK = '?';

/** Every character the banner font can draw. */
export const BANNER_CHARACTERS: readonly string[] = Object.keys(GLYPHS);

/**
 * Options for {@link renderBanner}.
 */
export interface BannerOptions {
  /** Character drawn for ink. @default '█' */
  fill?: string;
  /** Character drawn for empty space. @default ' ' */
  empty?: string;
  /** Empty columns between letters. @default 1 */
  gap?: number;
  /**
   * Wrap onto more lines when the text would be wider than this many
   * characters. Words are never split. Leave unset for a single row.
   */
  maxCols?: number;
}

const glyphFor = (character: string): readonly string[] =>
  GLYPHS[character.toUpperCase()] ?? GLYPHS[FALLBACK];

const renderWord = (word: string, fill: string, empty: string, gap: number): string[] => {
  const rows = Array.from({ length: BANNER_HEIGHT }, () => '');
  const characters = Array.from(word);

  characters.forEach((character, index) => {
    const glyph = glyphFor(character);
    for (let row = 0; row < BANNER_HEIGHT; row += 1) {
      rows[row] += Array.from(glyph[row], (cell) => (cell === INK ? fill : empty)).join('');
      if (index < characters.length - 1) rows[row] += empty.repeat(gap);
    }
  });

  return rows;
};

const widthOf = (rows: readonly string[]): number => Array.from(rows[0] ?? '').length;

/**
 * Draws text as big block letters.
 *
 * Letters are upper-cased. Characters the font does not have show as `?`.
 *
 * @returns Five lines per row of text. Wrapped rows are separated by a blank line.
 *
 * @example
 * ```ts
 * renderBanner('RIP').join('\n');
 * // ████   █████ ████
 * // █   █    █   █   █
 * // ...
 * ```
 */
export const renderBanner = (text: string, options: BannerOptions = {}): string[] => {
  const { fill = '█', empty = ' ', gap = 1, maxCols } = options;
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const spaceWidth = widthOf(renderWord(' ', fill, empty, gap)) + gap;
  const wordRows = words.map((word) => renderWord(word, fill, empty, gap));

  const groups: string[][][] = [[]];
  let used = 0;
  wordRows.forEach((rows) => {
    const width = widthOf(rows);
    const current = groups[groups.length - 1];
    const needed = current.length === 0 ? width : used + spaceWidth + width;

    if (maxCols !== undefined && current.length > 0 && needed > maxCols) {
      groups.push([rows]);
      used = width;
    } else {
      current.push(rows);
      used = needed;
    }
  });

  const lines: string[] = [];
  groups.forEach((group, groupIndex) => {
    if (groupIndex > 0) lines.push('');
    for (let row = 0; row < BANNER_HEIGHT; row += 1) {
      lines.push(group.map((rows) => rows[row]).join(empty.repeat(spaceWidth)));
    }
  });
  return lines;
};
