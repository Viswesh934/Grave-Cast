import { useEffect, useRef, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { isCurrentSection, NAV_STYLE, SITE_SECTIONS } from '../shared/sections'
import { useStatus } from './statusContext'
import { isInstalledApp } from './useInstall'

/** In a browser tab it is part of the site, so it wears the site's top bar. */
function SiteBar() {
  const path = window.location.pathname
  return (
    <header className={`${NAV_STYLE.bar} shrink-0`}>
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

/** Installed, it is the whole app: just its name. */
function AppBar() {
  return (
    <header className="shrink-0 border-b border-grave-dark-700 bg-grave-dark-900">
      <div className="flex w-full items-center gap-4 px-4 py-2.5">
        <Link to="/" className="text-base font-bold tracking-wide text-grave-bone-100 no-underline">
          Gravecast <span className="font-normal text-grave-mist-200">Lantern</span>
        </Link>
      </div>
    </header>
  )
}

const PLACES: readonly { to: string; label: string }[] = [
  { to: '/kit', label: 'Survival kit' },
  { to: '/tools', label: 'Tools' },
  { to: '/chat', label: 'Chat' },
  { to: '/radio', label: 'Radio' },
  { to: '/access', label: 'Access' },
  { to: '/help', label: 'Help near you' },
]

/**
 * The side menu, built like the docs sidebar: a group heading, then the places.
 * The current one is filled, with a sage edge on the left. On a phone the places sit in a row on top.
 */
function SideNav() {
  const { online, installed, canPrompt, install } = useStatus()
  return (
    <nav
      aria-label="Lantern"
      className="shrink-0 border-b border-grave-dark-700 bg-grave-dark-900 px-3 py-2 select-none md:sticky md:top-0 md:w-56 md:self-start md:border-r md:border-b-0 md:bg-transparent md:py-5 md:pr-3 md:pl-2"
    >
      <h2 className="m-0 mb-2 hidden px-3 font-mono text-xs font-bold tracking-wider text-grave-mist-300 uppercase md:block">Lantern</h2>
      <ul className="m-0 grid list-none grid-cols-3 gap-1.5 sm:grid-cols-6 p-0 md:grid-cols-1 md:gap-1">
        {PLACES.map((place) => (
          <li key={place.to}>
            <NavLink
              to={place.to}
              className={({ isActive }) =>
                [
                  'flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-l-4 px-2 text-center text-sm leading-tight no-underline md:justify-start md:px-3 md:text-left md:text-base',
                  'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-grave-bone-100',
                  isActive
                    ? 'border-grave-dark-600 border-l-grave-grove-sage bg-grave-dark-750 font-semibold text-grave-bone-100'
                    : 'border-grave-dark-700 border-l-grave-dark-700 bg-grave-dark-850 font-medium text-grave-mist-100 hover:border-grave-mist-500 hover:bg-grave-dark-800 hover:text-grave-bone-100',
                ].join(' ')
              }
            >
              {place.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-center justify-between gap-3 px-1 md:mt-4 md:block md:border-t md:border-grave-dark-700 md:px-3 md:pt-3">
        <p role="status" className="m-0 flex items-center gap-2 text-xs text-grave-mist-200 md:text-sm">
          <span aria-hidden className={`inline-block size-2 rounded-full ${online ? 'bg-grave-grove-sage' : 'bg-grave-grove-brass'}`} />
          {online ? 'Online' : 'Offline'}
        </p>
        {canPrompt && !installed && (
          <button
            type="button"
            onClick={() => void install()}
            className="min-h-9 cursor-pointer rounded-md border border-grave-mist-500 bg-grave-dark-850 px-3 text-sm font-semibold text-grave-bone-100 hover:bg-grave-dark-800 md:mt-3 md:w-full"
          >
            Install
          </button>
        )}
      </div>
    </nav>
  )
}

/**
 * The page's frame: skip link, the right top bar, the side menu and the screen.
 * Chat fills the window exactly, so its messages scroll and its message box stays put.
 * Every other screen scrolls as a normal page.
 */
export function Shell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const main = useRef<HTMLElement>(null)
  const first = useRef(true)
  const fill = pathname.startsWith('/chat')

  // Moving to another screen moves focus to it, so a screen reader starts at the top of the new one.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    main.current?.focus()
  }, [pathname])

  return (
    <div className={fill ? 'flex h-dvh flex-col overflow-hidden' : 'flex min-h-dvh flex-col'}>
      <a
        href="#main"
        className="absolute top-0 left-0 z-10 -translate-y-full bg-grave-bone-100 px-4 py-3 text-base font-semibold text-grave-dark-950 focus:translate-y-0"
      >
        Skip to the content
      </a>
      {isInstalledApp() ? <AppBar /> : <SiteBar />}
      <div className={`flex w-full flex-1 flex-col md:flex-row md:pr-6 md:pl-4 ${fill ? 'min-h-0' : ''}`}>
        <SideNav />
        <main
          id="main"
          ref={main}
          tabIndex={-1}
          className={fill ? 'flex min-h-0 min-w-0 flex-1 flex-col px-3 py-3 outline-none sm:px-5 md:py-5' : 'min-w-0 flex-1 px-4 py-5 outline-none sm:px-6 sm:py-8'}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
