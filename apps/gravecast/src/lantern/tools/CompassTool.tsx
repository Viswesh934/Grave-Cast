import { useEffect, useState } from 'react'
import { compassPoint, requestOrientationPermission, signalTokens, useOrientation, useWakeLock } from 'groove-ui/signal'
import { ui } from '../ui'

/** How long to wait for a first reading before saying there is none. */
const NO_READING_AFTER_MS = 3000

const degrees = (value: number) => `${Math.round(Math.abs(value))}\u00b0`

/** Which way the top of the phone points, and how level the phone is. */
export function CompassTool() {
  const [started, setStarted] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [waited, setWaited] = useState(false)
  const { heading, frontBack, leftRight } = useOrientation(started)
  useWakeLock(started)

  useEffect(() => {
    if (!started) return
    const timer = setTimeout(() => setWaited(true), NO_READING_AFTER_MS)
    return () => {
      clearTimeout(timer)
      setWaited(false)
    }
  }, [started])

  const start = async () => {
    setNote(null)
    if (!(await requestOrientationPermission())) {
      setNote('The phone did not allow its motion sensors. Check the browser\u2019s settings, then try again.')
      return
    }
    setStarted(true)
  }

  const hasTilt = frontBack !== null && leftRight !== null
  const level = hasTilt && Math.abs(frontBack) < signalTokens.levelToleranceDeg && Math.abs(leftRight) < signalTokens.levelToleranceDeg

  return (
    <>
      {started ? (
        <button type="button" onClick={() => setStarted(false)} className={ui.bigStop}>
          Stop
        </button>
      ) : (
        <button type="button" onClick={() => void start()} className={ui.big}>
          Start
        </button>
      )}
      {note && <p className={`${ui.muted} mt-3 mb-0`}>{note}</p>}

      {started && (
        <div className="mt-6 grid gap-4 sm:max-w-2xl sm:grid-cols-2">
          <section aria-labelledby="compass-heading" className={ui.card}>
            <h2 id="compass-heading" className={`${ui.muted} m-0 font-normal`}>
              Facing
            </h2>
            {heading !== null ? (
              <p className={`${ui.reading} mt-1`}>
                {compassPoint(heading)}
                <span className="block text-2xl text-grave-mist-100">{Math.round(heading)}{'\u00b0'}</span>
              </p>
            ) : (
              <p className="mt-1 mb-0 text-base text-grave-bone-100">{waited ? 'This browser gives no compass reading.' : 'Waiting for the compass\u2026'}</p>
            )}
          </section>
          <section aria-labelledby="level-heading" className={ui.card}>
            <h2 id="level-heading" className={`${ui.muted} m-0 font-normal`}>
              Level
            </h2>
            {hasTilt ? (
              <p className={`${ui.reading} mt-1`}>
                {level ? 'Level' : 'Tilted'}
                <span className="block text-base text-grave-mist-100">
                  Front to back {degrees(frontBack)}, side to side {degrees(leftRight)}
                </span>
              </p>
            ) : (
              <p className="mt-1 mb-0 text-base text-grave-bone-100">{waited ? 'This phone isn\u2019t sharing its motion sensors.' : 'Waiting for the sensors\u2026'}</p>
            )}
          </section>
        </div>
      )}

      <p className={`${ui.muted} mt-6 mb-0`}>
        Hold the phone flat, with its top pointing the way you face. Metal, magnets and cars nearby throw the compass off, and accuracy varies from phone to phone.
      </p>
    </>
  )
}
