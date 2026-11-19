import { useState } from 'react'
import { CensoredText } from '../CensoredCoordinates'
import { useShowCoordinates } from '../hiddenPosition'
import { ui } from '../ui'
import { deleteNote, loadNotes, saveNote, type SavedNote } from './notes'
import { helpMessageText, smsLink, type Fix } from './tools'

type Locating = 'idle' | 'finding' | 'found' | 'failed'

const GPS_OPTIONS: PositionOptions = { enableHighAccuracy: true, timeout: 30_000, maximumAge: 60_000 }

const LOCATING_TEXT: Record<Locating, string> = {
  idle: 'Location not added yet.',
  finding: 'Finding your location\u2026 this can take up to 30 seconds.',
  found: 'Location added.',
  failed: 'The phone could not find your location. You can still send the message.',
}

/** "I need help", with the phone's position, ready to text. Also saved here as a "last seen" note. */
export function HelpMessageTool() {
  const [words, setWords] = useState('I need help.')
  const [fix, setFix] = useState<Fix | null>(null)
  const [locating, setLocating] = useState<Locating>('idle')
  const [writtenAt, setWrittenAt] = useState(() => new Date())
  const [notes, setNotes] = useState<SavedNote[]>(loadNotes)
  const [copied, setCopied] = useState(false)
  const [showCoordinates, setShowCoordinates] = useShowCoordinates()
  const toggleCoordinates = () => setShowCoordinates((shown) => !shown)

  const text = helpMessageText(words, fix, writtenAt)

  const locate = () => {
    if (!('geolocation' in navigator)) {
      setLocating('failed')
      return
    }
    setLocating('finding')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFix({ lat: position.coords.latitude, lon: position.coords.longitude, accuracy: position.coords.accuracy })
        setWrittenAt(new Date())
        setLocating('found')
      },
      () => setLocating('failed'),
      GPS_OPTIONS,
    )
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <label htmlFor="help-words" className="block text-base font-semibold text-grave-bone-100">
        Your message
      </label>
      <textarea
        id="help-words"
        value={words}
        onChange={(event) => {
          setWords(event.target.value)
          setCopied(false)
        }}
        rows={3}
        maxLength={300}
        className={`${ui.field} mt-2`}
      />

      <button type="button" onClick={locate} disabled={locating === 'finding'} className={`${ui.bigAlt} mt-4`}>
        {fix ? 'Find my location again' : 'Add my location'}
      </button>
      <p role="status" className={`${ui.muted} mt-2 mb-0`}>
        {LOCATING_TEXT[locating]}
      </p>

      <h2 className={`${ui.h2} mt-6`}>The text</h2>
      <p className={`${ui.card} mt-2 mb-0 text-base break-words text-grave-bone-100`}>
        <CensoredText text={text} shown={showCoordinates} onToggle={toggleCoordinates} />
      </p>
      {fix && <p className={`${ui.muted} mt-2 mb-0`}>Your coordinates are censored on screen; tap them to see. The text you send or copy includes them.</p>}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <a href={smsLink(text)} className={ui.big}>
          Open in messages
        </a>
        <button type="button" onClick={() => void copy()} className={ui.secondary}>
          {copied ? 'Copied' : 'Copy the text'}
        </button>
        <button type="button" onClick={() => setNotes(saveNote(text))} className={ui.secondary}>
          Save as last seen
        </button>
      </div>
      <p className={`${ui.muted} mt-3 mb-0`}>You choose who to send it to, then tap Send. Texts can go through when there is no internet.</p>

      {notes.length > 0 && (
        <section aria-labelledby="last-seen" className="mt-8">
          <h2 id="last-seen" className={ui.h2}>
            Last seen notes
          </h2>
          <p className={`${ui.muted} mt-1 mb-0`}>Saved only on this phone.</p>
          <ol className="mt-3 mb-0 grid list-none gap-3 p-0">
            {notes.map((note) => (
              <li key={note.id} className={ui.card}>
                <p className="m-0 text-sm text-grave-mist-200">
                  Saved {new Date(note.at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
                <p className="mt-1 mb-0 break-words text-grave-bone-100">
                  <CensoredText text={note.text} shown={showCoordinates} onToggle={toggleCoordinates} />
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <a href={smsLink(note.text)} className={ui.secondary}>
                    Send this one
                  </a>
                  <button type="button" onClick={() => setNotes(deleteNote(note.id))} className={ui.secondary}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  )
}
