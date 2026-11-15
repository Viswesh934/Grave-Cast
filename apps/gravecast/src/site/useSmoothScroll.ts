import { useCallback, useEffect, useRef, type RefObject } from 'react'
import Lenis from 'lenis'
import { useLatest, useReducedMotion } from 'groove-ui'

/**
 * Momentum scrolling inside one scrolling panel. Off for people who ask for
 * less motion. `paused` stops it while a dialog is open. `onProgress` gets how
 * far the panel has scrolled, 0 to 1.
 */
export function useSmoothScroll(
  wrapper: RefObject<HTMLElement | null>,
  content: RefObject<HTMLElement | null>,
  paused: boolean,
  onProgress?: (progress: number) => void,
) {
  const reduced = useReducedMotion()
  const lenis = useRef<Lenis | null>(null)
  const report = useLatest(onProgress)

  useEffect(() => {
    const element = wrapper.current
    if (!element) return
    const onScroll = () => {
      const room = element.scrollHeight - element.clientHeight
      report.current?.(room > 0 ? element.scrollTop / room : 0)
    }
    element.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    if (reduced || !content.current) return () => element.removeEventListener('scroll', onScroll)
    const instance = new Lenis({ wrapper: element, content: content.current, autoRaf: true, lerp: 0.09 })
    lenis.current = instance
    return () => {
      element.removeEventListener('scroll', onScroll)
      instance.destroy()
      lenis.current = null
    }
  }, [reduced, wrapper, content, report])

  useEffect(() => {
    if (paused) lenis.current?.stop()
    else lenis.current?.start()
  }, [paused])

  const scrollTo = useCallback(
    (element: HTMLElement) => {
      if (lenis.current) lenis.current.scrollTo(element, { offset: -24 })
      else element.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    },
    [reduced],
  )

  return { scrollTo }
}