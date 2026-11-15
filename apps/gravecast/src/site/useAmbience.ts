import { useEffect, useState } from 'react'
import { useSpookyAudio, useSpookyMusic } from 'groove-ui'

/**
 * `ready` until the visitor's first click or key (browsers hold sound until
 * then), `on` while the drone plays, `off` once they turn it off.
 */
export type AmbienceState = 'ready' | 'on' | 'off'

/** Notes added over the drone, one per voice: komal re, komal dha, tivra ma, high re. */
const ISSUE_DEGREES = [1, 5, 3, 8] as const

/**
 * How many voices open issues add to the drone: one for each tenfold.
 * 0 issues adds none, 1 to 9 adds one, 10 to 99 two, 100 to 999 three, 1000 or more four.
 */
export const issueVoices = (openIssues: number): number =>
  openIssues <= 0 ? 0 : Math.min(ISSUE_DEGREES.length, Math.floor(Math.log10(openIssues)) + 1)

/** A quiet drone under the page, with extra voices while a repo's issues are on screen. */
export function useAmbience(extraVoices: number) {
  const { setEnabled } = useSpookyAudio()
  const [state, setState] = useState<AmbienceState>('ready')
  const drone = useSpookyMusic({ scale: 'todi', tonic: 'D2', instrument: 'drone', volume: 0.07 })
  const voices = useSpookyMusic({ scale: 'todi', tonic: 'D3', instrument: 'ghost', volume: 0.035 })

  useEffect(() => {
    if (state !== 'ready') return
    const wake = () => setState('on')
    window.addEventListener('pointerdown', wake, { once: true })
    window.addEventListener('keydown', wake, { once: true })
    return () => {
      window.removeEventListener('pointerdown', wake)
      window.removeEventListener('keydown', wake)
    }
  }, [state])

  useEffect(() => {
    if (state !== 'on') return
    const handle = drone.drone({ duration: Infinity })
    return () => handle?.stop()
  }, [state, drone])

  useEffect(() => {
    if (state !== 'on' || extraVoices <= 0) return
    const handles = ISSUE_DEGREES.slice(0, extraVoices).map((degree, i) => voices.degree(degree, { duration: Infinity, when: i * 0.8 }))
    return () => handles.forEach((handle) => handle?.stop())
  }, [state, extraVoices, voices])

  const toggle = () => {
    const next: AmbienceState = state === 'off' ? 'on' : 'off'
    setEnabled(next === 'on')
    setState(next)
  }

  return { state, toggle }
}