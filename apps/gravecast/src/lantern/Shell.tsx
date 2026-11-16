import { useEffect, useRef, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { isCurrentSection, NAV_STYLE, SITE_SECTIONS } from '../shared/sections'
import { useStatus } from './statusContext'
import { isInstalledApp } from './useInstall'

/** In a browser tab it is part of the site, so it wears the site's top bar. */
function SiteBar() {
  const path = window.location.pathname
  return (
    <header className={NAV_STYLE.bar}>
      <div className={NAV_STYLE.inner}>
        <a href="/" className={NAV_STYLE.brand}>
          Gravecast
        </a>
        <nav aria-label="Sections" className={NAV_STYLE.list}>
          {SITE_SECTIONS.map((section) => {
            const current = isCurrentSection(section, path)
            return (
              <a key={section.to} href={section.to} aria-current={current ? 'page' : undefined} className={NAV_STYLE.link(current)}>
                {section.label}
              </a>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

/** Installed, it is the whole app: just its name, and whether there is a connection. */
function AppBar() {
  return (
    <header className="border-b border-grave-dark-600 bg-grave-dark-900">
      <div className="flex w-full items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="text-lg font-bold tracking-wide text-grave-bone-100 no-underline">
          Gravecast Lantern
        </Link>
      </div>
    </header>
  )
}

const PLACES = [
  { to: '/kit', label: 'Survival kit' },
  { to: '/help', label: 'Help near you' },
  { to: '/chat', label: 'Chat' },
] as const
/**
 * The side menu, built like the docs sidebar: a group heading, then the places, the
 * current one outlined in emerald. Text and tap targets are larger than in the docs,
 * because here they are read in a hurry. On a phone the places sit in a row on top.
 */
function SideNav() {
  const { online, installed, canPrompt, install } = useStatus()
  return (
    <nav
      aria-label="Lantern"
      className="border-b border-grave-dark-700 p-3 select-none md:sticky md:top-14 md:w-60 md:shrink-0 md:self-start md:border-r md:border-b-0 md:py-5 md:pr-3 md:pl-2"
    >
      <h2 className="m-0 mb-1.5 hidden px-3 font-mono text-sm font-bold tracking-wider text-emerald-400 uppercase md:block">Lantern</h2>
      <ul className="m-0 grid list-none grid-cols-3 gap-1 p-0 md:grid-cols-1 md:gap-0.5">
        {PLACES.map((place) => (
          <li key={place.to}>
            <NavLink
              to={place.to}
              className={({ isActive }) =>
                [
                  'flex min-h-11 items-center justify-center rounded-xl border px-3 text-center text-base no-underline md:justify-start md:text-left',
                  isActive
                    ? 'border-emerald-600/60 bg-emerald-950/60 font-semibold text-emerald-200'
                    : 'border-transparent font-medium text-stone-300 hover:bg-grave-dark-800 hover:text-white',
                ].join(' ')
              }
            >
              {place.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-grave-dark-700 px-3 pt-3 md:block">
        <p role="status" className="m-0 font-mono text-sm text-stone-300">
          {online ? 'Online' : 'Offline'}
        </p>
        {canPrompt && !installed && (
          <button
            type="button"
            onClick={() => void install()}
            className="min-h-11 cursor-pointer rounded-xl border border-emerald-600/60 bg-emerald-950/60 px-4 text-base font-semibold text-emerald-200 md:mt-3 md:w-full"
          >
            Install
          </button>
        )}
      </div>
    </nav>
  )
}/** The page's frame: skip link, the right top bar, and the screen itself. */
export function Shell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const main = useRef<HTMLElement>(null)
  const first = useRef(true)

  // Moving to another screen moves focus to it, so a screen reader starts at the top of the new one.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    main.current?.focus()
  }, [pathname])

  return (
    <>
      <a
        href="#main"
        className="absolute top-0 left-0 z-10 -translate-y-full bg-grave-bone-100 px-4 py-3 text-lg font-semibold text-grave-dark-950 focus:translate-y-0"
      >
        Skip to the content
      </a>
      {isInstalledApp() ? <AppBar /> : <SiteBar />}
      <div className="flex w-full flex-1 flex-col md:flex-row md:pr-8 md:pl-6">
        <SideNav />
        <main id="main" ref={main} tabIndex={-1} className="min-w-0 flex-1 px-4 py-6 outline-none sm:px-8 sm:py-10">
          {children}
        </main>
      </div>
    </>
  )
}