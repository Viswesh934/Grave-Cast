import { useEffect, useRef, useState } from 'react'
import { startBeat, useWakeLock, vibrate, type SignalPlayback } from 'groove-ui/signal'
import { ui } from '../ui'
import { CPR, formatClock } from './tools'

/** Beats between swaps of who pushes. */
const BEATS_PER_SWAP = Math.round((CPR.swapEverySeconds * CPR.beatsPerMinute) / 60)
/** How long the swap message stays up, in beats (about 10 seconds). */
const SWAP_SHOWN_BEATS = Math.round((10 * CPR.beatsPerMinute) / 60)
/** A long buzz at each swap, so it is felt as well as heard. */
const SWAP_BUZZ_MS = 600

/** A steady CPR pace, a count, and a reminder to swap who pushes. */
export function CprBeatTool() {
  const [count, setCount] = useState(0)
  const [running, setRunning] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const beat = useRef<SignalPlayback | null>(null)
  useWakeLock(running)

  const stop = () => {
    beat.current?.stop()
    beat.current = null
    setRunning(false)
  }
  // Sound starts inside the tap itself, because browsers only allow sound after one.
  const start = () => {
    setCount(0)
    const next = startBeat({
      bpm: CPR.beatsPerMinute,
      accent: (n) => n % BEATS_PER_SWAP === 0,
      onBeat: (n) => {
        setCount(n)
        if (n % BEATS_PER_SWAP === 0) vibrate(SWAP_BUZZ_MS)
      },
    })
    if (!next) {
      setNote('This browser can\u2019t play sound. Push about 2 times a second.')
      return
    }
    setNote(null)
    beat.current = next
    setRunning(true)
  }
  useEffect(() => () => beat.current?.stop(), [])

  const elapsed = (count * 60) / CPR.beatsPerMinute
  const sinceSwap = count % BEATS_PER_SWAP
  const swapNow = count >= BEATS_PER_SWAP && sinceSwap < SWAP_SHOWN_BEATS
  const nextSwap = ((BEATS_PER_SWAP - sinceSwap) * 60) / CPR.beatsPerMinute

  return (
    <>
      <p className="m-0 text-base text-grave-mist-100">Push hard and fast in the centre of the chest, with each beat.</p>
      {note && <p className={`${ui.muted} mt-2 mb-0`}>{note}</p>}

      {running ? (
        <button type="button" onClick={stop} className={`${ui.bigStop} mt-6`}>
          Stop
        </button>
      ) : (
        <button type="button" onClick={start} className={`${ui.big} mt-6`}>
          Start the beat
        </button>
      )}

      <dl className="mt-6 grid grid-cols-2 gap-4 sm:max-w-xl">
        <div className={ui.card}>
          <dt className={ui.muted}>Pushes</dt>
          <dd className={`${ui.reading} m-0`}>{count}</dd>
        </div>
        <div className={ui.card}>
          <dt className={ui.muted}>Time</dt>
          <dd className={`${ui.reading} m-0`}>{formatClock(elapsed)}</dd>
        </div>
      </dl>

      {running && !swapNow && <p className="mt-4 mb-0 text-lg font-bold text-grave-mist-100">Swap who pushes in {formatClock(nextSwap)}.</p>}
      {running && swapNow && (
        <p role="alert" className="mt-4 mb-0 text-lg font-bold text-grave-grove-sage">
          Swap who pushes now, if someone can take over.
        </p>
      )}

      <p className={`${ui.muted} mt-6 mb-0`}>
        {CPR.beatsPerMinute} beats a minute. Every {CPR.swapEverySeconds / 60} minutes it beeps higher and buzzes: swap who pushes if someone else can, so the pushes stay strong. Keep going until help takes over.
      </p>
    </>
  )
}
