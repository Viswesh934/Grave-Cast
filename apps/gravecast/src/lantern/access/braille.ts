/**
 * The braille pad's messages. Each one is keyed by the braille letter of its key
 * word, so a braille reader already knows the codes. Dots are numbered the
 * standard way: 1, 2, 3 down the left column, 4, 5, 6 down the right.
 */

export type Dot = 1 | 2 | 3 | 4 | 5 | 6

/** Letters of the English braille alphabet (grade 1) that the pad uses, as their dots. */
const LETTER_DOTS = {
  a: [1],
  b: [1, 2],
  d: [1, 4, 5],
  h: [1, 2, 5],
  l: [1, 2, 3],
  n: [1, 3, 4, 5],
  s: [2, 3, 4],
  t: [2, 3, 4, 5],
  w: [2, 4, 5, 6],
  y: [1, 3, 4, 5, 6],
} as const satisfies Record<string, readonly Dot[]>

export type PadLetter = keyof typeof LETTER_DOTS

export interface PadMessage {
  letter: PadLetter
  dots: readonly Dot[]
  /** What the pad says and shows. `null` for the letter that lists them all. */
  text: string | null
}

/** In the order the list reads them. The ambulance call takes the single dot, the easiest to enter. */
export const PAD_MESSAGES: readonly PadMessage[] = (
  [
    ['a', 'Please call an ambulance for me.'],
    ['h', 'I need help.'],
    ['d', 'I need a doctor.'],
    ['w', 'I need water.'],
    ['s', 'Where is the nearest shelter?'],
    ['b', 'I am blind. Please tell me what is happening.'],
    ['y', 'Yes.'],
    ['n', 'No.'],
    ['t', 'Thank you.'],
    ['l', null],
  ] as const
).map(([letter, text]) => ({ letter, dots: LETTER_DOTS[letter], text }))

/** All six dots at once: the distress signal. No braille letter uses all six, so it can't be hit by mistake. */
export const SOS_DOTS: readonly Dot[] = [1, 2, 3, 4, 5, 6]

/** The dots as a key that doesn't depend on the order they were touched: "1-4-5". */
export const dotsKey = (dots: Iterable<Dot>): string => [...new Set(dots)].sort((a, b) => a - b).join('-')

const BY_DOTS = new Map(PAD_MESSAGES.map((m) => [dotsKey(m.dots), m]))

/** The message for a set of touched dots, or `undefined` if no message uses them. */
export const messageFor = (dots: Iterable<Dot>): PadMessage | undefined => BY_DOTS.get(dotsKey(dots))

/** "dots 1, 4 and 5", for speech. */
export const spokenDots = (dots: readonly Dot[]): string => {
  if (dots.length === 1) return `dot ${dots[0]}`
  return `dots ${dots.slice(0, -1).join(', ')} and ${dots[dots.length - 1]}`
}

/** Whether the touched dots are the distress signal. */
export const isSos = (dots: Iterable<Dot>): boolean => dotsKey(dots) === dotsKey(SOS_DOTS)

/** What the pad says for the list letter: every message with its letter and dots, then the distress signal. */
export const spokenList = (): string =>
  [...PAD_MESSAGES.filter((m) => m.text).map((m) => `${m.letter.toUpperCase()}, ${spokenDots(m.dots)}: ${m.text}`), 'All six dots: help signal.'].join(' ')
