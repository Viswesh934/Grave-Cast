import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { CoordinatesToggle } from '../CoordinatesToggle'
import { useShowCoordinates } from '../hiddenPosition'
import { morseUnits, morseVibration, playMorse, SOS_SEGMENTS, signalTokens, watchShake, type SignalPlayback } from 'groove-ui/signal'
import { helpMessageText, smsLink, type Fix } from '../tools/tools'
import { hush, say } from './aid'
import { DISTRESS_EVENT, NO_DISTRESS_TAPS, type DistressRequest } from './distressTrigger'
import { buzz, distressSound, helpContact, lastMode, SETTINGS_EVENT, shakeTrigger, tapsTrigger } from './settings'

/** Seconds counted down after a shake or taps, so a bump or a dropped phone can be cancelled. */
const COUNTDOWN_S = 3
/** Taps that start the signal, and how quickly they must come. */
const TAPS = 5
const TAPS_WINDOW_MS = 2000
/** Holding the screen this long cancels the countdown or stops the signal. */
const HOLD_TO_STOP_MS = 1500
/** A touch shorter than this, during the signal, opens the text. */
const TAP_MS = 600
/** A buzz each second of the countdown. */
const TICK_BUZZ: readonly number[] = [120]
/** Waiting for the GPS before writing the text without a position. */
const GPS_OPTIONS: PositionOptions = { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 }
/** A pause between SOS vibrations in Silent mode, in Morse units. */
const SILENT_GAP_UNITS = 7
const ONE_SECOND_MS = 1000

/** What the phone says and the text begins with, fitting the mode the person uses. */
const helpWords = (): string => {
  const mode = lastMode()
  if (mode === 'blind') return 'I need help. I am blind and cannot speak.'
  if (mode === 'deaf') return 'I need help. I am deaf.'
  return 'I need help.'
}

/** A text to the help contact, or to nobody yet if none is saved. */
const textLink = (text: string): string => {
  const number = helpContact().replace(/[^+\d]/g, '')
  return number ? `sms:${number}?&body=${encodeURIComponent(text)}` : smsLink(text)
}

type Phase = { kind: 'idle' } | { kind: 'countdown'; left: number } | { kind: 'on'; loud: boolean }
/** The phone's position: still being found, found, or not available. */
type Position = Fix | 'finding' | null

/**
 * The distress signal, for the whole of Lantern. It starts from the pads' SOS, from
 * the button in Access, or (when turned on in Access) from three hard shakes or five
 * quick taps, which first count down so they can be cancelled. While it is on it
 * repeats a spoken call for help and the SOS tone (Loud) or only vibrates (Silent),
 * shows HELP across the screen, and offers a text with the phone's position to the
 * saved help contact. The person still sends the text; it only works while Lantern is open.
 */
export function DistressSignal() {
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const [position, setPosition] = useState<Position>(null)
  const [startedAt, setStartedAt] = useState<Date | null>(null)
  const [showCoordinates, setShowCoordinates] = useShowCoordinates()
  const hold = useRef<{ timer: number; at: number } | null>(null)
  const textLinkRef = useRef<HTMLAnchorElement>(null)
  const active = phase.kind !== 'idle'

  const turnOn = useCallback(() => {
    setPhase({ kind: 'on', loud: distressSound() === 'loud' })
    setPosition('geolocation' in navigator ? 'finding' : null)
    setStartedAt(new Date())
  }, [])

  const begin = useCallback(
    (request: DistressRequest) => {
      if (phase.kind !== 'idle') return
      if (request.immediate) turnOn()
      else setPhase({ kind: 'countdown', left: COUNTDOWN_S })
    },
    [phase.kind, turnOn],
  )

  const stop = useCallback(() => {
    hush()
    if (typeof navigator.vibrate === 'function') navigator.vibrate(0)
    setPhase({ kind: 'idle' })
    setPosition(null)
  }, [])

  // Requests from the pads and the Access button.
  useEffect(() => {
    const onRequest = (event: Event) => begin((event as CustomEvent<DistressRequest>).detail ?? { immediate: false })
    window.addEventListener(DISTRESS_EVENT, onRequest)
    return () => window.removeEventListener(DISTRESS_EVENT, onRequest)
  }, [begin])

  // Shake and taps, only while they are turned on in Access.
  const [triggers, setTriggers] = useState({ shake: shakeTrigger(), taps: tapsTrigger() })
  useEffect(() => {
    const sync = () => setTriggers({ shake: shakeTrigger(), taps: tapsTrigger() })
    window.addEventListener(SETTINGS_EVENT, sync)
    return () => window.removeEventListener(SETTINGS_EVENT, sync)
  }, [])
  useEffect(() => (triggers.shake ? watchShake(() => begin({ immediate: false })) : undefined), [triggers.shake, begin])
  useEffect(() => {
    if (!triggers.taps) return
    let taps: number[] = []
    const onTap = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null
      if (target?.closest(`[${NO_DISTRESS_TAPS}], input, textarea, select`)) return
      const now = performance.now()
      taps = [...taps.filter((t) => now - t <= TAPS_WINDOW_MS), now]
      if (taps.length >= TAPS) {
        taps = []
        begin({ immediate: false })
      }
    }
    document.addEventListener('pointerdown', onTap, true)
    return () => document.removeEventListener('pointerdown', onTap, true)
  }, [triggers.taps, begin])

  // The countdown: a buzz each second, then the signal.
  useEffect(() => {
    if (phase.kind !== 'countdown') return
    if (phase.left === COUNTDOWN_S) say(`Help signal in ${COUNTDOWN_S} seconds. Hold the screen to cancel.`)
    buzz(TICK_BUZZ)
    const timer = window.setTimeout(() => {
      if (phase.left > 1) setPhase({ kind: 'countdown', left: phase.left - 1 })
      else turnOn()
    }, ONE_SECOND_MS)
    return () => window.clearTimeout(timer)
  }, [phase, turnOn])

  // The signal: find the position once, and repeat the call for help.
  const on = phase.kind === 'on'
  const loud = phase.kind === 'on' && phase.loud
  useEffect(() => {
    if (!on) return
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (p) => setPosition({ lat: p.coords.latitude, lon: p.coords.longitude, accuracy: p.coords.accuracy }),
        () => setPosition(null),
        GPS_OPTIONS,
      )
    }
    let live = true
    let tone: SignalPlayback | null = null
    let silentTimer: number | null = null
    if (loud) {
      const words = helpWords()
      const cycle = () => {
        if (!live) return
        say(words, () => {
          if (!live) return
          tone = playMorse(SOS_SEGMENTS, { loop: false, onEnd: cycle })
          if (!tone) window.setTimeout(cycle, ONE_SECOND_MS)
        })
      }
      say('Help signal on. Tap anywhere to text your help contact. Hold the screen to stop.', cycle)
    } else {
      const unit = signalTokens.soundUnitMs
      const pattern = morseVibration(SOS_SEGMENTS, unit)
      const every = (morseUnits(SOS_SEGMENTS) + SILENT_GAP_UNITS) * unit
      buzz(pattern)
      silentTimer = window.setInterval(() => buzz(pattern), every)
    }
    return () => {
      live = false
      tone?.stop()
      hush()
      if (silentTimer !== null) window.clearInterval(silentTimer)
    }
  }, [on, loud])

  useEffect(() => {
    if (!active) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') stop()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, stop])

  if (!active) return null

  const fix = position !== null && position !== 'finding' ? position : null
  // A real link, so screen readers announce it as one; a tap anywhere follows it too.
  const textHref = textLink(helpMessageText(helpWords(), fix, startedAt ?? new Date(0)))
  const openText = () => textLinkRef.current?.click()

  // Anywhere on the screen: hold to cancel or stop; during the signal, a short tap opens the text.
  const onDown = () => {
    hold.current = { at: performance.now(), timer: window.setTimeout(stop, HOLD_TO_STOP_MS) }
  }
  const onUp = () => {
    if (!hold.current) return
    window.clearTimeout(hold.current.timer)
    const quick = performance.now() - hold.current.at < TAP_MS
    hold.current = null
    if (quick && on) openText()
  }
  const keepToButton = (event: ReactPointerEvent) => event.stopPropagation()

  // Loud is bright, so people see it. Silent stays dark, for when being seen is dangerous too.
  const bright = phase.kind === 'countdown' || loud
  const contact = helpContact()
  const button = `min-h-14 min-w-40 cursor-pointer rounded-xl border-2 px-6 text-lg font-bold focus-visible:outline-3 focus-visible:outline-offset-2 ${
    bright ? 'border-grave-dark-950 focus-visible:outline-grave-dark-950' : 'border-grave-bone-100 focus-visible:outline-grave-bone-100'
  }`

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="distress-title"
      aria-describedby="distress-how"
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerCancel={() => hold.current && window.clearTimeout(hold.current.timer)}
      className={`fixed inset-0 flex touch-none flex-col items-center justify-center gap-5 p-6 text-center select-none ${
        bright ? 'bg-grave-bone-100 text-grave-dark-950' : 'bg-grave-dark-950 text-grave-bone-100'
      }`}
    >
      {phase.kind === 'countdown' ? (
        <>
          <p id="distress-title" className="m-0 text-3xl font-bold sm:text-4xl">
            Help signal in
          </p>
          <p aria-live="assertive" className="m-0 font-mono text-9xl leading-none font-bold tabular-nums">
            {phase.left}
          </p>
          <p id="distress-how" className="m-0 max-w-md text-xl">
            Hold the screen to cancel.
          </p>
          <button type="button" onPointerDown={keepToButton} onPointerUp={keepToButton} onClick={stop} className={button}>
            Cancel
          </button>
        </>
      ) : (
        <>
          <p id="distress-title" className="m-0 text-8xl leading-none font-black tracking-wider sm:text-9xl">
            HELP
          </p>
          <p className="m-0 max-w-xl text-2xl leading-snug font-bold sm:text-3xl">{helpWords()}</p>
          <p className="m-0 font-mono text-base">
            {fix
              ? showCoordinates
                ? `${fix.lat.toFixed(5)}, ${fix.lon.toFixed(5)}`
                : 'Position found. The text includes it.'
              : position === 'finding'
                ? 'Finding your position\u2026'
                : 'Position not found'}
          </p>
          {fix && (
            <CoordinatesToggle
              shown={showCoordinates}
              onToggle={() => setShowCoordinates((shown) => !shown)}
              onPointerDown={keepToButton}
              onPointerUp={keepToButton}
              className={`${button} ${bright ? 'bg-grave-bone-100 text-grave-dark-950' : 'bg-grave-dark-950 text-grave-bone-100'}`}
            />
          )}
          <p id="distress-how" className="m-0 max-w-md text-lg">
            Tap anywhere to text {contact ? 'your help contact' : 'for help'}; you still press Send. Hold the screen to stop.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              ref={textLinkRef}
              href={textHref}
              onPointerDown={keepToButton}
              onPointerUp={keepToButton}
              className={`${button} inline-flex items-center justify-center no-underline ${bright ? 'bg-grave-dark-950 text-grave-bone-100' : 'bg-grave-bone-100 text-grave-dark-950'}`}
            >
              Text for help
            </a>
            <button type="button" onPointerDown={keepToButton} onPointerUp={keepToButton} onClick={stop} className={button}>
              Stop
            </button>
          </div>
          {!contact && <p className="m-0 max-w-md text-sm">No help contact is saved. Add one in Access, so the text goes straight to them.</p>}
        </>
      )}
    </div>
  )
}
