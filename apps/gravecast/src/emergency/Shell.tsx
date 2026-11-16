import { useEffect, useRef, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { linkBase } from './styles'
import { useInstall } from './useInstall'
import { useOfflineReady, useOnline, type OfflineState } from './useAppStatus'

/** What the person is told about offline use, in plain words. */
const OFFLINE_TEXT: Record<OfflineState, string> = {
  saving: 'Saving the guides on this device\u2026',
  ready: 'The guides are saved on this device. They work with no internet.',
  failed: 'The guides could not be saved for offline use. Reload the page to try again.',
  unsupported: 'This browser can\u2019t keep the guides offline. Offline use needs a secure (https) connection and a current browser.',
  dev: 'Offline use is only on in the built app.',
}

/** The sections of the Emergency section. Each one appears here only once it works. */
const TABS: readonly { label: string; to: string; matches: (path: string) => boolean }[] = [
  { label: 'Survival kit', to: '/', matches: (path) => path === '/' || path.startsWith('/kit') },
  { label: 'Chat', to: '/chat', matches: (path) => path.startsWith('/chat') },
]

/** The page's frame: skip link, status, install help, the tabs, and the page itself. */
export function Shell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const online = useOnline()
  const offline = useOfflineReady()
  const { installed, canPrompt, install } = useInstall()
  const main = useRef<HTMLElement>(null)
  const first = useRef(true)

  // Moving to another page moves focus to it, so a screen reader starts at the top of the new page.
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
        Skip to the guide
      </a>

      <header className="border-b border-grave-dark-600 bg-grave-dark-900">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <p className="m-0 text-xl font-bold tracking-wide text-grave-bone-100">Gravecast Emergency</p>
          <p role="status" className="mt-2 mb-0 text-base text-grave-mist-200">
            {online ? '' : 'You are offline. '}
            {OFFLINE_TEXT[offline]}
          </p>
          {!installed && (
            <p className="mt-2 mb-0 text-base text-grave-mist-200">
              {canPrompt ? (
                <button
                  type="button"
                  onClick={() => void install()}
                  className="min-h-12 cursor-pointer rounded-md border-2 border-grave-bone-200 bg-grave-bone-100 px-5 text-lg font-semibold text-grave-dark-950"
                >
                  Install on this device
                </button>
              ) : (
                'To install it, use your browser\u2019s menu and choose Install app or Add to Home Screen.'
              )}
            </p>
          )}
        </div>
        <nav aria-label="Emergency sections" className="mx-auto max-w-3xl px-2 pb-2">
          <ul className="m-0 flex list-none flex-wrap gap-1 p-0">
            {TABS.map((tab) => (
              <li key={tab.to}>
                <Link
                  to={tab.to}
                  aria-current={tab.matches(pathname) ? 'page' : undefined}
                  className={`${linkBase} text-grave-bone-100 aria-[current=page]:bg-grave-dark-700 aria-[current=page]:font-semibold`}
                >
                  {tab.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="main" ref={main} tabIndex={-1} className="mx-auto max-w-3xl px-4 py-8 outline-none">
        {children}
      </main>
    </>
  )
}
