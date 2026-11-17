import { useEffect, useState } from 'react'
import { ui } from '../ui'
import { hush, say } from './aid'

/**
 * Steps through a list of things to read, one at a time, in large text and aloud:
 * Back, Read again and Next. Nothing plays until the person presses a button,
 * because browsers keep speech off until a tap.
 */
export function Reader({ items, label }: { items: readonly string[]; label: string }) {
  const [index, setIndex] = useState(0)
  const [started, setStarted] = useState(false)
  const last = items.length - 1
  const text = items[index] ?? ''

  useEffect(() => () => hush(), [])

  const go = (next: number) => {
    const clamped = Math.min(last, Math.max(0, next))
    setIndex(clamped)
    setStarted(true)
    say(items[clamped] ?? '')
  }

  return (
    <section aria-label={label} className="mt-5">
      <p className="m-0 text-sm font-semibold text-grave-mist-200">
        {index + 1} of {items.length}
      </p>
      <p aria-live="polite" className="m-0 mt-1 min-h-32 rounded-xl border border-grave-dark-600 bg-grave-dark-850 p-4 text-2xl leading-snug text-grave-bone-100 sm:text-3xl">
        {text}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:max-w-xl">
        <button type="button" onClick={() => go(index - 1)} disabled={index === 0} className={ui.secondary}>
          Back
        </button>
        <button type="button" onClick={() => go(index)} className={ui.primary}>
          {started ? 'Read again' : 'Read'}
        </button>
        <button type="button" onClick={() => go(index + 1)} disabled={index === last} className={ui.secondary}>
          Next
        </button>
      </div>
    </section>
  )
}
