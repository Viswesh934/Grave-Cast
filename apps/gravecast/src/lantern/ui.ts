/**
 * Lantern's look, in one place. Calm and compact: the grove's green night,
 * bone and mist text, one soft sage accent for the main action and the current
 * item, and dull brass only for what needs attention. Anything you can tap has
 * a filled surface, a border, and an arrow or a label that says what it does;
 * plain text never looks like a button.
 * No animation. Every colour is a theme colour, so nothing here picks its own.
 * Tap targets stay at least 44 px tall.
 */

const tap = 'cursor-pointer no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-grave-bone-100 disabled:cursor-not-allowed disabled:opacity-50'

export const ui = {
  h1: 'm-0 text-2xl leading-tight font-bold text-grave-bone-100 sm:text-3xl',
  h2: 'm-0 text-lg font-semibold text-grave-bone-100',
  lead: 'mt-2 mb-0 max-w-2xl text-base leading-relaxed text-grave-mist-200',
  muted: 'text-sm leading-relaxed text-grave-mist-300',
  card: 'rounded-xl border border-grave-dark-700 bg-grave-dark-850 p-4',
  /** A card that opens something: raised, with a hover edge. Put {@link ui.arrow} last inside it. */
  cardLink: `${tap} group flex items-center gap-3 rounded-xl border border-grave-dark-600 bg-grave-dark-800 px-4 py-3 text-grave-bone-100 shadow-sm shadow-black/40 hover:border-grave-grove-sage hover:bg-grave-dark-750`,
  /** The arrow at the end of a card link, so it reads as "open". */
  arrow: 'ml-auto shrink-0 text-xl leading-none text-grave-mist-300 group-hover:text-grave-grove-sage',
  primary: `${tap} inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-grave-grove-sage bg-grave-grove-sage px-5 text-base font-semibold text-grave-dark-950 shadow-sm shadow-black/40 hover:bg-grave-bone-100 hover:border-grave-bone-100`,
  secondary: `${tap} inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-grave-mist-500 bg-grave-dark-800 px-4 text-base font-medium text-grave-bone-100 hover:border-grave-grove-sage hover:bg-grave-dark-750`,
  /** Small and quiet, for actions inside a header or a message. Still 36 px tall, with room around it. */
  quiet: `${tap} inline-flex min-h-9 items-center gap-1.5 rounded-md border border-grave-dark-600 bg-grave-dark-850 px-3 text-sm text-grave-mist-100 hover:border-grave-mist-300 hover:text-grave-bone-100`,
  field:
    'block w-full rounded-lg border border-grave-mist-500 bg-grave-dark-950 px-3 py-2.5 text-base text-grave-bone-100 placeholder:text-grave-mist-400 focus:border-grave-grove-sage focus:outline-2 focus:outline-grave-grove-sage/40',
  link: 'text-grave-grove-sage underline underline-offset-4 hover:text-grave-bone-100',
  /** A tool's one main button: wide and tall, easy to hit in a hurry. */
  big: `${tap} inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-grave-grove-sage bg-grave-grove-sage px-6 text-lg font-bold text-grave-dark-950 shadow-md shadow-black/40 hover:bg-grave-bone-100 hover:border-grave-bone-100 sm:w-auto sm:min-w-56`,
  /** The same size, for a second way to start: outlined in sage, so the first stays the main one. */
  bigAlt: `${tap} inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-grave-grove-sage bg-grave-dark-800 px-6 text-lg font-bold text-grave-bone-100 hover:bg-grave-dark-750 sm:w-auto sm:min-w-56`,
  /** The same size, for Stop: plain and heavy, so it never looks like Start. */
  bigStop: `${tap} inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-grave-bone-100 bg-grave-dark-950 px-6 text-lg font-bold text-grave-bone-100 hover:bg-grave-dark-800 sm:w-auto sm:min-w-56`,
  /** A large reading, such as a heading or a distance. */
  reading: 'm-0 text-4xl leading-tight font-bold text-grave-bone-100 tabular-nums',
  /** A small label above a title, such as a group name. */
  eyebrow: 'm-0 text-xs font-semibold tracking-widest text-grave-mist-300 uppercase',
} as const

