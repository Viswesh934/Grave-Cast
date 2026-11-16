/**
 * Lantern's look, in one place: calm cards on the site's green night,
 * one bright accent for the main action, large type and large tap targets.
 * No animation. Every colour is a theme colour, so nothing here picks its own.
 */
export const ui = {
  h1: 'm-0 text-3xl leading-tight font-bold text-grave-bone-100 sm:text-4xl',
  h2: 'm-0 text-2xl font-bold text-grave-bone-100',
  lead: 'mt-3 mb-0 text-lg leading-relaxed text-grave-mist-100',
  muted: 'text-base leading-relaxed text-grave-mist-200',
  card: 'rounded-2xl border border-grave-dark-700 bg-grave-dark-900 p-5',
  cardLink:
    'block rounded-2xl border border-grave-dark-700 bg-grave-dark-900 p-5 text-grave-bone-200 no-underline hover:border-grave-grove-glow',
  primary:
    'inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl border-2 border-grave-grove-glow bg-grave-grove-glow px-6 text-lg font-semibold text-grave-dark-950 disabled:cursor-not-allowed disabled:opacity-60',
  secondary:
    'inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl border-2 border-grave-mist-400 bg-transparent px-5 text-lg text-grave-bone-100 hover:border-grave-bone-100 disabled:cursor-not-allowed disabled:opacity-60',
  field:
    'block w-full rounded-xl border-2 border-grave-mist-400 bg-grave-dark-950 px-4 py-3 text-lg text-grave-bone-100 placeholder:text-grave-mist-300',
  link: 'text-grave-grove-glow underline underline-offset-4',
  /** A small label above a title, such as a group name. */
  eyebrow: 'm-0 text-sm font-semibold tracking-widest text-grave-grove-glow uppercase',
} as const