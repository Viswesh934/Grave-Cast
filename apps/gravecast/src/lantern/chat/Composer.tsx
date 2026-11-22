import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { MAX_BODY_CHARS, MAX_NICK_CHARS } from '../../shared/channelContract'
import { ui } from '../ui'

/** Show the character count once a message gets this close to the limit. */
const COUNT_FROM = MAX_BODY_CHARS - 100
/** The box grows with the text up to about five lines, then scrolls. */
const MAX_BOX_PX = 140

export interface ComposerProps {
  area: string
  nick: string | null
  /** Show the nickname form even when there is a nickname, to change it. */
  changingNick: boolean
  onNick: (nick: string) => Promise<string | null>
  onCancelNick: () => void
  onSend: (text: string) => Promise<string | null>
  /** What the message box is for, in a screen reader's words and as the hint. Defaults to the channel. */
  target?: string
}

/** The message box under the conversation. Without a nickname, it asks for one first. */
export function Composer({ area, nick, changingNick, onNick, onCancelNick, onSend, target }: ComposerProps) {
  const [text, setText] = useState('')
  const [nickDraft, setNickDraft] = useState(nick ?? '')
  const [error, setError] = useState<string | null>(null)
  const box = useRef<HTMLTextAreaElement>(null)
  const ids = { nick: useId(), message: useId(), error: useId() }

  const grow = () => {
    const el = box.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_BOX_PX)}px`
  }

  const send = async () => {
    if (text.trim() === '') return
    const problem = await onSend(text)
    setError(problem)
    if (!problem) {
      setText('')
      requestAnimationFrame(grow)
      box.current?.focus()
    }
  }
  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    void send()
  }
  // Enter sends; Shift+Enter starts a new line, as in most chat apps.
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      void send()
    }
  }
  const onJoin = async (event: FormEvent) => {
    event.preventDefault()
    const problem = await onNick(nickDraft)
    setError(problem)
  }

  if (!nick || changingNick) {
    return (
      <form onSubmit={(e) => void onJoin(e)} className="mt-2 flex shrink-0 flex-col gap-2 rounded-xl border border-grave-dark-600 bg-grave-dark-850 p-3" noValidate>
        <label htmlFor={ids.nick} className="text-sm font-semibold text-grave-bone-100">
          {nick ? 'Change your nickname' : 'Pick a nickname to write'}{' '}
          <span className="font-normal text-grave-mist-300">(no sign-up, up to {MAX_NICK_CHARS} characters)</span>
        </label>
        <div className="flex gap-2">
          <input
            id={ids.nick}
            value={nickDraft}
            onChange={(e) => setNickDraft(e.target.value)}
            placeholder="e.g. Judge Raven"
            maxLength={MAX_NICK_CHARS}
            autoComplete="off"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? ids.error : undefined}
            className={ui.field}
          />
          <button type="submit" disabled={nickDraft.trim() === ''} className={ui.primary}>
            {nick ? 'Save' : 'Join'}
          </button>
          {nick && (
            <button type="button" onClick={onCancelNick} className={ui.secondary}>
              Cancel
            </button>
          )}
        </div>
        {error && (
          <p id={ids.error} role="alert" className="m-0 text-sm text-grave-grove-brass">
            {error}
          </p>
        )}
      </form>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mt-2 shrink-0" noValidate>
      <div className="flex items-end gap-2 rounded-xl border border-grave-mist-500 bg-grave-dark-950 p-1.5 focus-within:border-grave-grove-sage">
        <label htmlFor={ids.message} className="sr-only">
          Message to {target ?? area}
        </label>
        <textarea
          id={ids.message}
          ref={box}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            grow()
          }}
          onKeyDown={onKeyDown}
          rows={1}
          maxLength={MAX_BODY_CHARS}
          placeholder={target ? `Message to ${target}` : `Message #${area}`}
          aria-describedby={error ? ids.error : undefined}
          className="block max-h-36 min-h-10 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-base leading-snug text-grave-bone-100 outline-none placeholder:text-grave-mist-400"
        />
        <button type="submit" disabled={text.trim() === ''} className={`${ui.primary} min-h-10 px-4`}>
          Send
        </button>
      </div>
      <div className="mt-1 flex justify-between gap-3 px-1 text-xs text-grave-mist-300">
        <span>
          {error ? (
            <span id={ids.error} role="alert" className="text-grave-grove-brass">
              {error}
            </span>
          ) : (
            <>
              Enter sends <span aria-hidden>{'\u00b7'}</span> Shift+Enter for a new line
            </>
          )}
        </span>
        {text.length >= COUNT_FROM && (
          <span className={text.length >= MAX_BODY_CHARS ? 'text-grave-grove-brass' : ''}>
            {text.length}/{MAX_BODY_CHARS}
          </span>
        )}
      </div>
    </form>
  )
}
