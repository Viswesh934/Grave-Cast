import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { zLayers } from 'groove-ui'
import { CommandPalette } from '../docs/components/docs/CommandPalette'
import { SearchIcon } from '../docs/components/docs/DocsIcons'
import { isCurrentSection, NAV_STYLE, SITE_SECTIONS } from '../shared/sections'

/** The one top bar for the whole site. On a phone it wraps: the name on top, the sections below. */
export function SiteHeader() {
  const { pathname } = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const inDocs = pathname.startsWith('/docs')

  return (
    <header className={`sticky top-0 backdrop-blur-md ${NAV_STYLE.bar}`} style={{ zIndex: zLayers.raised }}>
      <div className={NAV_STYLE.inner}>
        <Link to="/" className={NAV_STYLE.brand}>
          Gravecast
        </Link>
        <nav aria-label="Sections" className={NAV_STYLE.list}>
          {SITE_SECTIONS.map((section) => {
            const active = isCurrentSection(section, pathname)
            // Lantern is its own page, so it opens with a full page load.
            if (section.page) {
              return (
                <a key={section.to} href={section.to} className={NAV_STYLE.link(false)}>
                  {section.label}
                </a>
              )
            }
            return (
              <Link key={section.to} to={section.to} aria-current={active ? 'page' : undefined} className={NAV_STYLE.link(active)}>
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
              className="flex items-center gap-2 rounded-md border-2 border-amber-400 bg-amber-300 px-3 py-1.5 text-sm font-semibold text-grave-dark-950 hover:bg-amber-200"
              aria-keyshortcuts="Control+K Meta+K"
            >
              <SearchIcon size={14} />
              <span className="hidden sm:inline">Find a component</span>
            </button>
          )}
        </div>
      </div>
      {inDocs && <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />}
    </header>
  )
}