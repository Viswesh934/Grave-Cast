/**
 * The sections of the whole site, in the order the top bar shows them. A section
 * appears here only once it works. The website and Lantern read
 * this one list, so their top bars always agree.
 */
export interface SiteSection {
  label: string
  /** Where the section opens. */
  to: string
  /** Where the section's pages start, for marking it as the current one. */
  prefix: string
  /** Its own page with its own bundle: it opens with a full page load, not the router. */
  page?: boolean
}

export const SITE_SECTIONS: readonly SiteSection[] = [
  { label: 'Graveyard', to: '/', prefix: '/' },
  { label: 'Lantern', to: '/lantern/', prefix: '/lantern', page: true },
  { label: 'Docs', to: '/docs/introduction', prefix: '/docs' },
  { label: 'Our story', to: '/story', prefix: '/story' },
]

/** Whether `path` is inside `section`. */
export const isCurrentSection = (section: SiteSection, path: string): boolean =>
  section.prefix === '/' ? path === '/' : path.startsWith(section.prefix)

/** Shared looks for the top bar, so the website and Lantern match: plain text links, the current one lit like a candle. */
export const NAV_STYLE = {
  bar: 'w-full border-b border-emerald-900/60 bg-grave-dark-950/90 shadow-[0_1px_12px_rgba(16,185,129,0.08)]',
  inner: 'flex w-full flex-wrap items-center gap-x-10 gap-y-1 px-5 py-2 sm:h-14 sm:flex-nowrap sm:py-0 sm:px-10',
  brand: 'font-serif text-base tracking-[0.3em] text-grave-bone-100 uppercase',
  list: 'order-last flex w-full min-w-0 items-center gap-2 overflow-x-auto sm:order-none sm:w-auto sm:gap-4',
  link: (active: boolean) =>
    [
      'shrink-0 border-b-2 px-2 py-2 font-serif text-sm tracking-wider transition-colors sm:py-1.5',
      active
        ? 'border-emerald-400 text-emerald-200 [text-shadow:0_0_10px_rgba(52,211,153,0.45)]'
        : 'border-transparent text-grave-mist-200 hover:border-emerald-800 hover:text-grave-bone-100',
    ].join(' '),
} as const