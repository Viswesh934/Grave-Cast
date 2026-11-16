import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { zLayers } from 'groove-ui'
import { CommandPalette } from '../docs/components/docs/CommandPalette'
import { SearchIcon } from '../docs/components/docs/DocsIcons'

/**
 * The sections in the top bar. Each one appears here only once it works.
 * Order: Graveyard, Emergency, Live demo, Docs, and Our story last.
 */
const SECTIONS: readonly { label: string; to: string; matches: (path: string) => boolean; page?: boolean }[] = [
  { label: 'Graveyard', to: '/', matches: (path) => path === '/' },
  // Its own page with its own bundle, so it opens with a full page load, not the router.
  { label: 'Emergency', to: '/emergency/', matches: () => false, page: true },
  { label: 'Live demo', to: '/demo', matches: (path) => path.startsWith('/demo') },
  { label: 'Docs', to: '/docs/introduction', matches: (path) => path.startsWith('/docs') },
  { label: 'Our story', to: '/story', matches: (path) => path.startsWith('/story') },
]

const linkClass = (active: boolean) =>
  [
    'rounded-md px-3 py-1.5 text-sm transition-colors',
    active ? 'bg-grave-dark-800 text-grave-bone-100' : 'text-grave-mist-300 hover:text-grave-bone-100',
  ].join(' ')

/** The one top bar for the whole site. */
export function SiteHeader() {
  const { pathname } = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const inDocs = pathname.startsWith('/docs')

  return (
    <header
      className="sticky top-0 h-14 w-full border-b border-grave-dark-700 bg-grave-dark-950/90 backdrop-blur-md"
      style={{ zIndex: zLayers.raised }}
    >
      <div className="mx-auto flex h-full max-w-[1600px] items-center gap-6 px-4 sm:px-8">
        <Link to="/" className="font-serif text-base tracking-[0.3em] text-grave-bone-100 uppercase">
          Gravecast
        </Link>

        <nav aria-label="Sections" className="flex min-w-0 items-center gap-1 overflow-x-auto">
          {SECTIONS.map((section) => {
            const active = section.matches(pathname)
            if (section.page) {
              return (
                <a key={section.to} href={section.to} className={linkClass(false)}>
                  {section.label}
                </a>
              )
            }
            return (
              <Link key={section.to} to={section.to} aria-current={active ? 'page' : undefined} className={linkClass(active)}>
                {section.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {inDocs && (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-md border border-grave-dark-700 bg-grave-dark-900 px-3 py-1.5 text-xs text-grave-mist-300 hover:text-grave-bone-100"
              aria-keyshortcuts="Control+K Meta+K"
            >
              <SearchIcon size={14} />
              <span className="hidden sm:inline">Search the docs</span>
            </button>
          )}
        </div>
      </div>
      {inDocs && <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />}
    </header>
  )
}