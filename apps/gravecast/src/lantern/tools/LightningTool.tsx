import { useState } from 'react'
import { ui } from '../ui'
import { lightningDistance, type LightningDistance } from './tools'

/** How many timings to keep on screen. */
const KEPT = 5

interface Timing extends LightningDistance {
  at: number
}

const oneDecimal = (value: number) => value.toFixed(1)
const describe = (timing: LightningDistance) =>
  `About ${oneDecimal(timing.km)} km (${oneDecimal(timing.miles)} miles) away. ${oneDecimal(timing.seconds)} seconds between flash and thunder.`

/** Tap at the flash, tap at the thunder: how far away the lightning is. */
export function LightningTool() {
  const [flashAt, setFlashAt] = useState<number | null>(null)
  const [timings, setTimings] = useState<Timing[]>([])

  const tap = () => {
    const now = performance.now()
    if (flashAt === null) {
      setFlashAt(now)
      return
    }
    setTimings((list) => [{ ...lightningDistance(now - flashAt), at: Date.now() }, ...list].slice(0, KEPT))
    setFlashAt(null)
  }

  const [latest, previous] = timings
  const trend = latest && previous ? (latest.km < previous.km ? 'Closer than the last one.' : latest.km > previous.km ? 'Farther than the last one.' : 'About the same as the last one.') : null

  return (
    <>
      <button type="button" onClick={tap} className={flashAt === null ? ui.big : ui.bigAlt}>
        {flashAt === null ? 'Tap at the flash' : 'Tap at the thunder'}
      </button>
      {flashAt !== null && (
        <button type="button" onClick={() => setFlashAt(null)} className={`${ui.secondary} mt-3 block`}>
          Cancel
        </button>
      )}

      <p role="status" className="mt-5 mb-0 text-lg font-bold text-grave-bone-100">
        {flashAt !== null ? 'Counting\u2026 tap when you hear the thunder.' : latest ? describe(latest) : 'Waiting for a flash.'}
        {flashAt === null && trend && <span className="mt-1 block text-base font-semibold text-grave-mist-100">{trend}</span>}
      </p>

      <p className="mt-6 mb-0 rounded-xl border border-l-4 border-grave-dark-600 border-l-grave-grove-brass bg-grave-dark-850 p-3 text-base font-semibold text-grave-bone-100">
        If you can hear thunder, you are close enough to be struck. Get inside a building or a hard-topped car, and stay there.
      </p>

      {timings.length > 1 && (
        <section aria-labelledby="timings" className="mt-6">
          <h2 id="timings" className={ui.h2}>
            Earlier
          </h2>
          <ol className="mt-2 mb-0 list-none space-y-1 p-0">
            {timings.slice(1).map((timing) => (
              <li key={timing.at} className={ui.muted}>
                {new Date(timing.at).toLocaleTimeString(undefined, { timeStyle: 'short' })}: about {oneDecimal(timing.km)} km ({oneDecimal(timing.miles)} miles)
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className={`${ui.muted} mt-6 mb-0`}>
        A rough guide only. Sound takes about 3 seconds to travel a kilometre, or 5 seconds a mile.
      </p>
    </>
  )
}
