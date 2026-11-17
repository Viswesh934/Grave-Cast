import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackButton } from '../BackButton'
import { ui } from '../ui'
import { hush, say } from './aid'
import { isSos, messageFor, PAD_MESSAGES, spokenDots, spokenList, type Dot } from './braille'
import { NO_DISTRESS_TAPS, startDistress } from './distressTrigger'
import { buzz, FOUND_BUZZ, rememberMode } from './settings'

/** After the last touch, how long to wait before the letter counts as finished. */
const LETTER_PAUSE_MS = 1200
/** A touch held this long, without moving, repeats the last message. */
const HOLD_MS = 700
/** A touch that moves this far up or down is a swipe, not a dot. */
const SWIPE_PX = 90
/** A touch that moves less than this still counts as a tap or a hold. */
const STILL_PX = 24
/** Rows in a braille cell. */
const ROWS = 3

const INTRO =
  'Braille pad. The whole screen is one braille cell: dots 1, 2 and 3 down the left, dots 4, 5 and 6 down the right. Touch the dots of a letter, then pause. All six dots start the help signal. Swipe down to clear. Hold to repeat. Swipe up to go back. Letter L lists every message.'

interface Touch {
  dot: Dot
  x: number
  y: number
  at: number
}

/** How to use the pad: every letter, its dots and its message. Shown over the pad when asked for. */
function HowTo({ onClose }: { onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => box.current?.focus(), [])
  return (
    <div ref={box} role="dialog" aria-modal="true" aria-labelledby="howto-title" tabIndex={-1} className="fixed inset-0 overflow-y-auto bg-grave-dark-950 p-4 outline-none sm:p-8">
      <div className="mx-auto max-w-2xl">
        <h2 id="howto-title" className={ui.h1}>
          How to use the braille pad
        </h2>
        <ul className={`${ui.muted} mt-3 mb-0 pl-5 text-base`}>
          <li>Dots 1, 2 and 3 run down the left half of the screen; 4, 5 and 6 down the right. Touch them one at a time or together.</li>
          <li>Pause for about a second: the phone says the message and shows it in large text. Swipe down to clear, hold to repeat, swipe up to go back.</li>
          <li>Pause your screen reader (TalkBack or VoiceOver) while you use the pad: it takes over touches. iPhone also has its own Braille Screen Input.</li>
          <li>It only speaks and shows. It doesn{'\u2019'}t contact anyone.</li>
        </ul>
        <h3 className={`${ui.h2} mt-5`}>Letters and messages</h3>
        <ul className="mt-2 mb-0 grid list-none gap-1 p-0">
          {PAD_MESSAGES.map((m) => (
            <li key={m.letter} className="flex gap-3 text-base text-grave-bone-100">
              <span className="w-24 shrink-0 font-mono text-grave-mist-200">
                <strong className="text-grave-bone-100">{m.letter.toUpperCase()}</strong> {m.dots.join(' ')}
              </span>
              <span>{m.text ?? 'Says this whole list aloud.'}</span>
            </li>
          ))}
          <li className="flex gap-3 text-base text-grave-bone-100">
            <span className="w-24 shrink-0 font-mono text-grave-mist-200">
              <strong className="text-grave-bone-100">SOS</strong> 1-6
            </span>
            <span>All six dots: the help signal. It calls out, and opens a text with your position to your help contact.</span>
          </li>
        </ul>
        <button type="button" onClick={onClose} className={`${ui.big} mt-6`}>
          Back to the pad
        </button>
      </div>
    </div>
  )
}

/**
 * Can't see and can't speak: the whole screen is one braille cell, so the phone can speak for the person. Touches add dots; a
 * pause says and shows the message that starts with that braille letter. A
 * keyboard works too: 1 to 6 for the dots, Enter to finish, Backspace to clear.
 */
export function BlindPage() {
  const navigate = useNavigate()
  const touches = useRef(new Map<number, Touch>())
  const dots = useRef(new Set<Dot>())
  const timer = useRef<number | null>(null)
  const last = useRef<string | null>(null)
  const [entered, setEntered] = useState<Dot[]>([])
  const [shown, setShown] = useState('Touch the dots of a letter')
  const [howTo, setHowTo] = useState(false)
  const leave = useCallback(() => navigate('/access'), [navigate])

  const show = useCallback((text: string) => {
    setShown(text)
    say(text)
  }, [])

  const finish = useCallback(() => {
    timer.current = null
    const touched = [...dots.current].sort((a, b) => a - b)
    dots.current.clear()
    setEntered([])
    if (touched.length === 0) return
    if (isSos(touched)) {
      setShown('Help signal')
      startDistress({ immediate: true })
      return
    }
    const message = messageFor(touched)
    if (!message) return show(`No message for ${spokenDots(touched)}. Try again.`)
    if (message.text === null) {
      setShown('Every message is being read out')
      say(spokenList())
      return
    }
    last.current = message.text
    show(message.text)
  }, [show])

  const addDot = useCallback(
    (dot: Dot) => {
      dots.current.add(dot)
      setEntered([...dots.current].sort((a, b) => a - b))
      buzz(FOUND_BUZZ)
      say(`${dot}`)
      if (timer.current !== null) window.clearTimeout(timer.current)
      timer.current = window.setTimeout(finish, LETTER_PAUSE_MS)
    },
    [finish],
  )

  const clear = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = null
    dots.current.clear()
    setEntered([])
    show('Cleared')
  }, [show])

  const repeat = useCallback(() => show(last.current ?? 'Nothing to repeat yet'), [show])

  useEffect(() => {
    document.title = 'Braille pad \u00b7 Access \u00b7 Gravecast Lantern'
    rememberMode('blind')
    say(INTRO)
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
      hush()
    }
  }, [])

  useEffect(() => {
    if (howTo) return
    const onKey = (event: KeyboardEvent) => {
      const n = Number(event.key)
      if (Number.isInteger(n) && n >= 1 && n <= 6) addDot(n as Dot)
      else if (event.key === 'Enter') {
        if (timer.current !== null) window.clearTimeout(timer.current)
        finish()
      } else if (event.key === 'Backspace') clear()
      else if (event.key === 'r' || event.key === 'R') repeat()
      else if (event.key === 'Escape') leave()
      else return
      event.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [addDot, clear, finish, howTo, leave, repeat])

  const dotAt = (event: ReactPointerEvent<HTMLDivElement>): Dot => {
    const box = event.currentTarget.getBoundingClientRect()
    const column = event.clientX - box.left < box.width / 2 ? 0 : 1
    const row = Math.min(ROWS - 1, Math.max(0, Math.floor(((event.clientY - box.top) / box.height) * ROWS)))
    return (column * ROWS + row + 1) as Dot
  }
  const onDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    touches.current.set(event.pointerId, { dot: dotAt(event), x: event.clientX, y: event.clientY, at: performance.now() })
  }
  const onUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = touches.current.get(event.pointerId)
    touches.current.delete(event.pointerId)
    if (!start) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    const vertical = Math.abs(dy) > Math.abs(dx)
    if (vertical && dy > SWIPE_PX) return clear()
    if (vertical && dy < -SWIPE_PX) return leave()
    if (Math.hypot(dx, dy) > STILL_PX) return
    if (performance.now() - start.at >= HOLD_MS) return repeat()
    addDot(start.dot)
  }

  return (
    <div role="region" aria-label="Braille pad" className="fixed inset-0 flex flex-col bg-grave-dark-950">
      <div className="flex shrink-0 items-center gap-3 border-b border-grave-dark-700 px-3 py-2">
        <BackButton to="/access" label="Back to Access" />
        <p className="m-0 min-w-0 flex-1 font-mono text-base text-grave-mist-200">
          Dots <span className="font-bold text-grave-bone-100">{entered.length ? entered.join(' ') : '\u2013'}</span>
        </p>
        <button type="button" onClick={() => setHowTo(true)} className={ui.quiet}>
          How to use
        </button>
      </div>
      <div
        {...{ [NO_DISTRESS_TAPS]: '' }}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={(event) => touches.current.delete(event.pointerId)}
        onContextMenu={(event) => event.preventDefault()}
        aria-describedby="pad-help"
        className="relative grid flex-1 touch-none grid-flow-col grid-cols-2 grid-rows-3 select-none"
      >
        {([1, 2, 3, 4, 5, 6] as const).map((dot) => (
          <div key={dot} aria-hidden className="flex items-center justify-center border border-grave-dark-700">
            <span
              className={`flex size-20 items-center justify-center rounded-full border-4 font-mono text-3xl font-bold ${
                entered.includes(dot) ? 'border-grave-bone-100 bg-grave-bone-100 text-grave-dark-950' : 'border-grave-mist-500 text-grave-mist-300'
              }`}
            >
              {dot}
            </span>
          </div>
        ))}
        <p
          role="status"
          aria-live="assertive"
          className="pointer-events-none absolute inset-x-2 top-1/2 m-0 -translate-y-1/2 rounded-2xl bg-grave-bone-100 px-4 py-5 text-center text-3xl leading-tight font-bold text-grave-dark-950 sm:text-5xl"
        >
          {shown}
        </p>
      </div>
      <p id="pad-help" className="sr-only">
        {INTRO}
      </p>
      {howTo && <HowTo onClose={() => setHowTo(false)} />}
    </div>
  )
}
