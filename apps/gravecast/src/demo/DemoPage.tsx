import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { HorrorBackground } from 'groove-ui'
import { wireText } from '../shared/channel'
import { Qr } from './Qr'
import { useEcho, type EchoState } from './useEcho'

const delay = (seconds: number) => ({ ['--gc-delay' as string]: `${seconds}s` }) as CSSProperties

const ECHO = 'DEMO'
/** The page phones open from the code: Chat in the installed app, already on the DEMO echo. */
const CHAT_PATH = `/emergency/chat?echo=${ECHO}`

/** What Gravecast is, in three parts. From the vision doc. */
const PARTS: readonly { name: string; what: string; to: string; label: string; page?: boolean }[] = [
  { name: 'Check a link', what: 'Paste a link someone sent you. Every problem it hides rises as a grave.', to: '/', label: 'Try it' },
  {
    name: 'Emergency section',
    what: 'Installs on a phone. Survival guides that work with no internet, and a chat that waits for the line to come back.',
    to: '/emergency/',
    label: 'Open it',
    page: true,
  },
  { name: 'Groove UI', what: 'The horror-themed component library behind every screen. It has its own docs.', to: '/docs/introduction', label: 'Read the docs' },
]

const STEPS: readonly string[] = [
  'Scan the code with your phone. It opens Chat on the DEMO echo.',
  'Pick a nickname and send a message. It appears here.',
  'Turn on airplane mode and send another. It waits in the phone\u2019s outbox.',
  'Turn airplane mode off. The message arrives here by itself.',
]

const STATE_TEXT: Record<EchoState, string> = {
  loading: 'Connecting\u2026',
  live: 'Live',
  trouble: 'Can\u2019t reach the server. Trying again.',
}

const clock = (iso: string | null): string => {
  if (!iso) return ''
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

/** The judges' screen: what Gravecast is, how to join from a phone, and the DEMO echo live. */
export default function DemoPage() {
  const { messages, state, updatedAt } = useEcho(ECHO)
  const [wire, setWire] = useState(false)
  const joinUrl = `${window.location.origin}${CHAT_PATH}`
  const onlyThisComputer = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)

  return (
    <div className="grave-grove relative isolate flex-1">
      <HorrorBackground variant="fog" intensity="ghastly" fixed />
      <main className="mx-auto max-w-6xl px-6 pt-16 pb-28">
        <p className="gc-reveal m-0 text-sm tracking-[0.3em] text-grave-grove-glow uppercase" style={delay(0.2)}>
          Gravecast, live
        </p>
        <h1 className="gc-reveal mt-4 mb-0 max-w-4xl font-serif text-5xl leading-[1.05] text-grave-bone-100 italic sm:text-7xl" style={delay(0.4)}>
          Find what{'\u2019'}s dangerous. Warn the people around you.
        </h1>
        <p className="gc-reveal mt-6 mb-0 max-w-3xl text-2xl leading-relaxed text-grave-mist-200" style={delay(0.7)}>
          Even when the internet is barely holding on.
        </p>

        <ul className="gc-reveal mt-14 mb-0 grid list-none gap-5 p-0 md:grid-cols-3" style={delay(1)}>
          {PARTS.map((part) => (
            <li key={part.name} className="flex flex-col rounded-2xl border border-grave-dark-600 bg-grave-dark-900/85 p-6 backdrop-blur-sm">
              <h2 className="m-0 font-serif text-2xl text-grave-bone-100">{part.name}</h2>
              <p className="mt-3 mb-5 flex-1 text-lg leading-relaxed text-grave-mist-200">{part.what}</p>
              {part.page ? (
                <a href={part.to} className="text-lg text-grave-grove-glow underline underline-offset-4">
                  {part.label} {'\u2192'}
                </a>
              ) : (
                <Link to={part.to} className="text-lg text-grave-grove-glow underline underline-offset-4">
                  {part.label} {'\u2192'}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <section aria-labelledby="try-it" className="gc-reveal mt-20 grid gap-10 lg:grid-cols-[auto_1fr] lg:items-center" style={delay(1.3)}>
          <div className="mx-auto w-64 max-w-full sm:w-72">
            <Qr value={joinUrl} label={`QR code for ${joinUrl}`} className="w-full rounded-xl" />
            <p className="mt-3 mb-0 text-center font-mono text-sm break-all text-grave-mist-300">{joinUrl}</p>
          </div>
          <div>
            <h2 id="try-it" className="m-0 font-serif text-4xl text-grave-bone-100">
              Try it from your phone
            </h2>
            <ol className="mt-6 mb-0 list-decimal space-y-3 pl-7 text-2xl leading-snug text-grave-bone-100 marker:text-grave-grove-glow">
              {STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            {onlyThisComputer && (
              <p className="mt-6 mb-0 text-lg text-grave-mist-300">
                This page is open on {window.location.hostname}, which only this computer can reach. Open it on the computer{'\u2019'}s network address, or on the
                deployed site, so phones can follow the code.
              </p>
            )}
          </div>
        </section>

        <section aria-labelledby="live" className="mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="live" className="m-0 font-serif text-4xl text-grave-bone-100">
                {ECHO} echo, live
              </h2>
              <p role="status" className="mt-2 mb-0 text-lg text-grave-mist-200">
                {STATE_TEXT[state]}
                {state === 'live' && updatedAt ? ` \u00b7 updated ${clock(updatedAt)}` : ''}
                {messages.length > 0 ? ` \u00b7 ${messages.length} ${messages.length === 1 ? 'message' : 'messages'}` : ''}
              </p>
            </div>
            <label className="flex min-h-12 cursor-pointer items-center gap-3 text-lg text-grave-bone-100">
              <input type="checkbox" checked={wire} onChange={(e) => setWire(e.target.checked)} className="size-5 accent-grave-grove-glow" />
              Show headers
            </label>
          </div>

          {messages.length === 0 ? (
            <p className="mt-6 mb-0 rounded-2xl border border-dashed border-grave-dark-600 bg-grave-dark-900/70 p-8 text-2xl text-grave-mist-200">
              No messages yet. Scan the code and be the first.
            </p>
          ) : (
            <ol aria-live="polite" aria-relevant="additions" className="mt-6 mb-0 list-none space-y-4 p-0">
              {messages.map((message) => (
                <li key={message.msgid} className="rounded-2xl border border-grave-dark-600 bg-grave-dark-900/90 p-6 backdrop-blur-sm">
                  <p className="m-0 flex flex-wrap items-baseline gap-x-4 text-lg text-grave-mist-200">
                    <strong className="font-serif text-2xl text-grave-grove-glow">{message.from}</strong>
                    <span>{clock(message.receivedAt)}</span>
                  </p>
                  <p className="mt-2 mb-0 text-3xl leading-snug break-words whitespace-pre-wrap text-grave-bone-100">{message.body}</p>
                  {wire && <pre className="mt-4 mb-0 overflow-x-auto rounded-lg bg-grave-dark-950 p-4 text-base leading-snug text-grave-mist-200">{wireText(message)}</pre>}
                </li>
              ))}
            </ol>
          )}
        </section>
      </main>
    </div>
  )
}