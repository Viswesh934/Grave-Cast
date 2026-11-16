import { useEffect, useId, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { wireText } from '../../shared/channel'
import { DEFAULT_ECHO, ECHOES, MAX_BODY_CHARS, MAX_NICK_CHARS, type Echo } from '../../shared/channelContract'
import { useChat, type RunState, type ShownMessage } from './useChat'

const ECHO_HINT: Record<Echo, string> = {
  EMERGENCY: 'For real warnings and help.',
  DEMO: 'For testing. Say hello here.',
}

const STATE_TEXT: Record<RunState, string> = {
  idle: '',
  running: 'Checking for messages\u2026',
  offline: 'No connection. Messages you write wait here and send when it returns.',
  failed: 'Messages could not be sent right now. They are kept here and will try again.',
}

const isEcho = (value: string | null): value is Echo => ECHOES.some((e) => e === value)

const clock = (iso: string | null): string => {
  if (!iso) return ''
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const field =
  'block w-full rounded-lg border-2 border-grave-mist-400 bg-grave-dark-950 px-4 py-3 text-xl text-grave-bone-100 placeholder:text-grave-mist-300'
const button =
  'min-h-12 cursor-pointer rounded-lg border-2 border-grave-bone-200 bg-grave-bone-100 px-6 text-lg font-semibold text-grave-dark-950 disabled:cursor-not-allowed disabled:opacity-60'
const quietButton =
  'min-h-12 cursor-pointer rounded-lg border-2 border-grave-mist-400 bg-transparent px-5 text-lg text-grave-bone-100'

function Message({ message, wire }: { message: ShownMessage; wire: boolean }) {
  return (
    <li className="rounded-lg border-2 border-grave-dark-600 bg-grave-dark-900 px-4 py-3">
      <p className="m-0 flex flex-wrap items-baseline gap-x-3 text-base text-grave-mist-100">
        <strong className="text-lg text-grave-bone-100">
          {message.from}
          {message.mine ? ' (you)' : ''}
        </strong>
        <span>{message.pending ? 'Waiting to send' : clock(message.receivedAt)}</span>
      </p>
      <p className="mt-1 mb-0 text-xl leading-relaxed break-words whitespace-pre-wrap text-grave-bone-100">{message.body}</p>
      {wire && (
        <pre className="mt-3 mb-0 overflow-x-auto rounded-md bg-grave-dark-950 p-3 text-base leading-snug text-grave-mist-100">{wireText(message)}</pre>
      )}
    </li>
  )
}

/** Chat: public echoes, written like old BBS echomail. Messages wait in an outbox when there is no connection. */
export function ChatPage() {
  const [params, setParams] = useSearchParams()
  const requested = params.get('echo')?.toUpperCase() ?? null
  const area: Echo = isEcho(requested) ? requested : DEFAULT_ECHO
  const chat = useChat(area)
  const [text, setText] = useState('')
  const [nickDraft, setNickDraft] = useState('')
  const [changingNick, setChangingNick] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [wire, setWire] = useState(false)
  const ids = { nick: useId(), message: useId(), echo: useId() }

  useEffect(() => {
    document.title = `Chat \u00b7 ${area} \u00b7 Gravecast Emergency`
  }, [area])

  const onJoin = async (event: FormEvent) => {
    event.preventDefault()
    const error = await chat.setNick(nickDraft)
    setFormError(error)
    if (!error) setChangingNick(false)
  }

  const onSend = async (event: FormEvent) => {
    event.preventDefault()
    const error = await chat.send(text)
    setFormError(error)
    if (!error) setText('')
  }

  if (!chat.loaded) return <p className="m-0 text-xl text-grave-mist-100">Opening Chat\u2026</p>

  const needNick = !chat.nick || changingNick

  return (
    <>
      <h1 className="m-0 text-4xl leading-tight font-bold text-grave-bone-100">Chat</h1>
      <p className="mt-4 mb-0 text-xl leading-relaxed text-grave-mist-100">
        Public messages for everyone on this echo. Don{'\u2019'}t post personal details. A message you write with no connection waits in your outbox and sends
        by itself when the line returns.
      </p>

      <fieldset className="mt-8 border-0 p-0">
        <legend id={ids.echo} className="mb-2 text-2xl font-bold text-grave-bone-100">
          Echo
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {ECHOES.map((echo) => (
            <label
              key={echo}
              className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-lg border-2 px-4 py-3 ${
                echo === area ? 'border-grave-bone-100 bg-grave-dark-700' : 'border-grave-mist-400'
              }`}
            >
              <input
                type="radio"
                name="echo"
                value={echo}
                checked={echo === area}
                onChange={() => setParams(echo === DEFAULT_ECHO ? {} : { echo }, { replace: true })}
                className="mt-1.5 size-5 accent-grave-bone-100"
              />
              <span>
                <span className="block text-xl font-semibold text-grave-bone-100">{echo}</span>
                <span className="block text-base text-grave-mist-100">{ECHO_HINT[echo]}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {needNick ? (
        <form onSubmit={(e) => void onJoin(e)} className="mt-8" noValidate>
          <label htmlFor={ids.nick} className="block text-2xl font-bold text-grave-bone-100">
            Pick a nickname
          </label>
          <p className="mt-1 mb-3 text-base text-grave-mist-100">No sign-up. Up to {MAX_NICK_CHARS} characters.</p>
          <input
            id={ids.nick}
            value={nickDraft}
            onChange={(e) => setNickDraft(e.target.value)}
            maxLength={MAX_NICK_CHARS}
            autoComplete="off"
            aria-describedby={formError ? `${ids.nick}-error` : undefined}
            aria-invalid={formError ? true : undefined}
            className={field}
          />
          {formError && (
            <p id={`${ids.nick}-error`} role="alert" className="mt-2 mb-0 text-lg text-grave-bone-100">
              {formError}
            </p>
          )}
          <button type="submit" className={`${button} mt-4`}>
            Join
          </button>
        </form>
      ) : (
        <p className="mt-8 mb-0 flex flex-wrap items-center gap-3 text-xl text-grave-mist-100">
          You are <strong className="text-grave-bone-100">{chat.nick}</strong>.
          <button
            type="button"
            className={quietButton}
            onClick={() => {
              setNickDraft(chat.nick ?? '')
              setFormError(null)
              setChangingNick(true)
            }}
          >
            Change nickname
          </button>
        </p>
      )}

      {!needNick && (
        <form onSubmit={(e) => void onSend(e)} className="mt-8" noValidate>
          <label htmlFor={ids.message} className="block text-2xl font-bold text-grave-bone-100">
            Message to {area}
          </label>
          <textarea
            id={ids.message}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            maxLength={MAX_BODY_CHARS}
            aria-describedby={`${ids.message}-count`}
            className={`${field} mt-3 resize-y`}
          />
          <p id={`${ids.message}-count`} className="mt-1 mb-0 text-base text-grave-mist-100">
            {text.length} of {MAX_BODY_CHARS} characters
          </p>
          {formError && (
            <p role="alert" className="mt-2 mb-0 text-lg text-grave-bone-100">
              {formError}
            </p>
          )}
          <button type="submit" className={`${button} mt-3`} disabled={text.trim() === ''}>
            Send
          </button>
        </form>
      )}

      <div className="mt-8" role="status">
        {chat.waiting > 0 && (
          <p className="m-0 text-xl font-semibold text-grave-bone-100">
            {chat.waiting} {chat.waiting === 1 ? 'message is' : 'messages are'} waiting to send.
          </p>
        )}
        {STATE_TEXT[chat.state] && <p className="mt-1 mb-0 text-lg text-grave-mist-100">{STATE_TEXT[chat.state]}</p>}
        {chat.problem && chat.state === 'failed' && <p className="mt-1 mb-0 text-lg text-grave-mist-100">{chat.problem}</p>}
        <p className="mt-1 mb-0 text-base text-grave-mist-100">
          {chat.lastRunAt ? `Last updated ${clock(chat.lastRunAt)}.` : 'Not updated yet.'}
          {chat.state !== 'running' && (
            <>
              {' '}
              <button type="button" onClick={() => void chat.retry()} className="cursor-pointer border-0 bg-transparent p-0 text-base text-grave-bone-100 underline">
                Check now
              </button>
            </>
          )}
        </p>
      </div>

      {chat.refused.length > 0 && (
        <div role="alert" className="mt-6 rounded-lg border-2 border-grave-bone-200 p-4">
          <p className="m-0 text-xl font-semibold text-grave-bone-100">These messages were not accepted:</p>
          <ul className="mt-2 mb-0 pl-6 text-lg text-grave-mist-100">
            {chat.refused.map((r) => (
              <li key={r.msgid}>
                {'\u201c'}
                {r.body}
                {'\u201d'}: {r.reason}
              </li>
            ))}
          </ul>
          <button type="button" className={`${quietButton} mt-3`} onClick={() => void chat.dismissRefused()}>
            Dismiss
          </button>
        </div>
      )}

      <section className="mt-10" aria-labelledby={`${ids.echo}-list`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id={`${ids.echo}-list`} className="m-0 text-2xl font-bold text-grave-bone-100">
            Messages in {area}
          </h2>
          <label className="flex min-h-12 cursor-pointer items-center gap-3 text-lg text-grave-bone-100">
            <input type="checkbox" checked={wire} onChange={(e) => setWire(e.target.checked)} className="size-5 accent-grave-bone-100" />
            Show headers
          </label>
        </div>
        {chat.messages.length === 0 ? (
          <p className="mt-4 mb-0 text-xl text-grave-mist-100">No messages yet in {area}.</p>
        ) : (
          <ol aria-live="polite" aria-relevant="additions" className="mt-4 mb-0 list-none space-y-3 p-0">
            {chat.messages.map((message) => (
              <Message key={message.msgid} message={message} wire={wire} />
            ))}
          </ol>
        )}
      </section>
    </>
  )
}