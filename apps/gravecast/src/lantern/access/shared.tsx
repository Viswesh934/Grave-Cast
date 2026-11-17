/** Full-screen views the Access pads share: a message held up to someone, and a large screen to write on. */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { bigCardButton, canSpeak, say } from './aid'

/** Puts a full-screen view away with Escape. */
function useEscape(onClose: () => void) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
}

/** The light, high-contrast frame both views use, so they read well in sun or in the dark. */
const frame = 'fixed inset-0 flex flex-col gap-4 bg-grave-bone-100 p-4 text-grave-dark-950 outline-none sm:p-8'
const closeButton =
  'min-h-14 min-w-36 cursor-pointer rounded-xl border-2 border-grave-dark-950 bg-grave-bone-100 px-6 text-lg font-bold text-grave-dark-950 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-grave-dark-950'

/**
 * A message across the whole screen, as large as it fits, to hold up to someone.
 * It takes focus, so a screen reader reads it; Escape or Close puts it away.
 */
export function BigCard({ text, onClose, children }: { text: string; onClose: () => void; children?: ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  useEscape(onClose)
  useEffect(() => box.current?.focus(), [])
  return (
    <div ref={box} role="dialog" aria-modal="true" aria-label="Message to show" tabIndex={-1} className={frame}>
      <p className="m-0 flex flex-1 items-center justify-center text-center text-5xl leading-tight font-bold break-words sm:text-7xl">{text}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {children}
        <button type="button" onClick={onClose} className={closeButton}>
          Close
        </button>
      </div>
    </div>
  )
}

/**
 * A large screen to write on, for the person or the one they're talking to.
 * The words fill the screen as they are typed, so they can be read from across a room.
 */
export function WriteScreen({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState('')
  const box = useRef<HTMLTextAreaElement>(null)
  useEscape(onClose)
  useEffect(() => box.current?.focus(), [])
  return (
    <div role="dialog" aria-modal="true" aria-label="Write to show" className={frame}>
      <label htmlFor="write-screen" className="sr-only">
        Write here. It shows in large text.
      </label>
      <textarea
        id="write-screen"
        ref={box}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write here"
        className="min-h-0 w-full flex-1 resize-none rounded-xl border-4 border-grave-dark-950 bg-grave-bone-100 p-4 text-4xl leading-tight font-bold text-grave-dark-950 outline-none placeholder:text-grave-mist-400 focus:border-grave-dark-950 sm:text-6xl"
      />
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            setText('')
            box.current?.focus()
          }}
          disabled={text === ''}
          className={`${bigCardButton} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          Clear
        </button>
        {canSpeak() && (
          <button type="button" onClick={() => say(text)} disabled={text.trim() === ''} className={`${bigCardButton} disabled:cursor-not-allowed disabled:opacity-50`}>
            Say it aloud
          </button>
        )}
        <button type="button" onClick={onClose} className={closeButton}>
          Close
        </button>
      </div>
    </div>
  )
}
