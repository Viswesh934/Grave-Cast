/**
 * Backwards tokens: the round's length, how lines are made and scored, and how
 * typing looks. The window around it comes from gameDialogTokens.
 * @module components/effects/Backwards/tokens
 */
import { palette, typography } from '../../../tokens';

export const backwardsTokens = {
  /** How long a round lasts, in seconds. */
  roundSeconds: 30,
  /** How often the clock on screen is updated, in ms. */
  tickMs: 200,
  /** The usual measure for typing speed: five characters count as one word. */
  charsPerWord: 5,
  /** Lines given by the app (`lines`) longer than this many words are left out, so a line fits a round. */
  maxLineWords: 10,
  /** How often a line is taken from `lines` instead of being made up, from 0 to 1. */
  linesChance: 0.15,
  /** How often a made-up line gets its longer form, with a describing word and a way of doing it. */
  longChance: 0.6,
  /** How many tries the game gives itself to avoid showing the same line twice in a row. */
  freshTries: 6,
  /** How loud each sound is, from 0 to 1. */
  volume: { line: 0.25, end: 0.4 },

  /** The line to read, and what you type. */
  font: typography.families.epitaph,
  lineSize: '1.35rem',
  typeSize: '1.35rem',
  lineHeight: 1.6,
  fieldPadding: '0.6rem 0.75rem',
  fieldBackground: palette.grove[900],
  /** The typing field shows this many lines, so long answers wrap instead of scrolling. */
  fieldRows: 2,
  /** Room for those lines: two line heights, plus the padding above and below. */
  fieldMinHeight: 'calc(3.2em + 1.2rem)',
  /** A space typed where it shouldn't be is shown as this mark, so it can be seen. */
  wrongSpaceMark: '\u00b7',
  colors: {
    line: palette.grove.bone100,
    right: palette.grove.bone100,
    /** A wrong letter: this colour, and always underlined, so colour is never the only sign. */
    wrong: palette.haunt.serious,
    caret: palette.grove.glow,
  },
  /** The wavy underline under a wrong letter. */
  wrongUnderline: 'underline wavy',
  wrongUnderlineOffset: '0.2em',
} as const;
