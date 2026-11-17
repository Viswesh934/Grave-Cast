import { useCallback, useEffect, useState } from 'react'
import { BackButton } from '../BackButton'
import { ui } from '../ui'
import { bigCardButton, canSpeak, say } from './aid'
import { DIAL_KEYS } from './phrases'
import { startDistress } from './distressTrigger'
import { rememberMode } from './settings'
import { BigCard, WriteScreen } from './shared'

const keyClass =
  'flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-grave-dark-600 bg-grave-dark-850 p-2 text-grave-bone-100 shadow-sm shadow-black/40 hover:border-grave-grove-sage hover:bg-grave-dark-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-grave-bone-100 sm:min-h-28'

/**
 * Can't hear or can't speak: a dial pad. Keys 1 to 9 each show a ready message across
 * the screen in very large text; 0 opens a large screen to write anything, for the
 * person or whoever they are talking to. A keyboard's number keys work too.
 */
export function DeafPage() {
  const [card, setCard] = useState<string | null>(null)
  const [writing, setWriting] = useState(false)
  const closeCard = useCallback(() => setCard(null), [])
  const closeWrite = useCallback(() => setWriting(false), [])

  useEffect(() => {
    document.title = 'Dial pad \u00b7 Access \u00b7 Gravecast Lantern'
    rememberMode('deaf')
  }, [])

  useEffect(() => {
    if (card || writing) return
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
      const n = Number(event.key)
      if ((!Number.isInteger(n) || event.key === ' ') && event.key.toLowerCase() !== 's') return
      if (event.key.toLowerCase() === 's') return startDistress({ immediate: true })
      if (n === 0) setWriting(true)
      else {
        const key = DIAL_KEYS.find((k) => k.n === n)
        if (key) setCard(key.text)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [card, writing])

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3">
        <BackButton to="/access" label="Back to Access" />
        <h1 className={`${ui.h1} min-w-0`}>Can{'\u2019'}t hear or can{'\u2019'}t speak</h1>
      </div>
      <p className={`${ui.lead} mt-3`}>Tap a key to show its message across the screen. Hold the phone up so the other person can read it.</p>

      <ul aria-label="Message keys" className="mt-5 mb-0 grid list-none grid-cols-3 gap-2 p-0 sm:gap-3">
        {DIAL_KEYS.map((key) => (
          <li key={key.n}>
            <button type="button" onClick={() => setCard(key.text)} aria-label={`${key.n}: ${key.text}`} className={`${keyClass} w-full`}>
              <span aria-hidden className="font-mono text-3xl leading-none font-bold sm:text-4xl">
                {key.n}
              </span>
              <span aria-hidden className="text-center text-sm leading-tight text-grave-mist-100 sm:text-base">
                {key.label}
              </span>
            </button>
          </li>
        ))}
        <li className="col-span-2">
          <button
            type="button"
            onClick={() => setWriting(true)}
            aria-label="0: write anything in large text"
            className={`${keyClass} w-full flex-row gap-4 border-grave-grove-sage/60`}
          >
            <span aria-hidden className="font-mono text-3xl leading-none font-bold sm:text-4xl">
              0
            </span>
            <span aria-hidden className="text-base font-semibold sm:text-lg">
              Write anything
            </span>
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => startDistress({ immediate: true })}
            aria-label="SOS: start the help signal"
            className={`${keyClass} w-full border-grave-grove-brass bg-grave-grove-brass text-grave-dark-950 hover:border-grave-bone-100 hover:bg-grave-bone-100`}
          >
            <span aria-hidden className="font-mono text-2xl leading-none font-black sm:text-3xl">
              SOS
            </span>
            <span aria-hidden className="text-sm leading-tight font-semibold sm:text-base">
              Help signal
            </span>
          </button>
        </li>
      </ul>

      <section aria-labelledby="deaf-keys" className="mt-6">
        <h2 id="deaf-keys" className={ui.h2}>
          What each key shows
        </h2>
        <ul className={`${ui.muted} mt-2 mb-0 grid list-none gap-1 p-0`}>
          {DIAL_KEYS.map((key) => (
            <li key={key.n}>
              <strong className="font-mono text-grave-bone-100">{key.n}</strong> {key.text}
            </li>
          ))}
          <li>
            <strong className="font-mono text-grave-bone-100">0</strong> A big screen to write anything. Hand it over so the other person can write back.
          </li>
          <li>
            <strong className="font-mono text-grave-bone-100">SOS</strong> The help signal: it shows HELP, calls out or vibrates, and opens a text with your position to your help contact.
          </li>
        </ul>
        <p className={`${ui.muted} mt-3 mb-0`}>It only shows and, if you tap Say it aloud, speaks. It doesn{'\u2019'}t contact anyone.</p>
      </section>

      {card && (
        <BigCard text={card} onClose={closeCard}>
          {canSpeak() && (
            <button type="button" onClick={() => say(card)} className={bigCardButton}>
              Say it aloud
            </button>
          )}
        </BigCard>
      )}
      {writing && <WriteScreen onClose={closeWrite} />}
    </div>
  )
}
