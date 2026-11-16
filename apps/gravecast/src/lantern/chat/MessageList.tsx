import { useEffect, useLayoutEffect, useRef } from 'react'
import { wireText } from '../../shared/channel'
import type { ShownMessage } from './useChat'

/** How close to the bottom counts as "at the bottom", so new messages scroll into view. */
const NEAR_BOTTOM_PX = 120

const clock = (iso: string | null): string => {
  if (!iso) return ''
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export interface MessageListProps {
  messages: readonly ShownMessage[]
  area: string
  /** Show each message's FidoNet-style headers under it. */
  wire: boolean
}

/** The conversation, oldest at the top and newest at the bottom, scrolled to the newest. */
export function MessageList({ messages, area, wire }: MessageListProps) {
  const scroller = useRef<HTMLDivElement>(null)
  const stuck = useRef(true)
  const last = messages.at(-1)

  // A new channel starts at its newest message.
  useLayoutEffect(() => {
    stuck.current = true
    const el = scroller.current
    if (el) el.scrollTop = el.scrollHeight
  }, [area])

  // New messages scroll into view when you are reading the newest ones, or when you wrote them.
  useEffect(() => {
    const el = scroller.current
    if (el && (stuck.current || last?.mine)) el.scrollTop = el.scrollHeight
  }, [messages.length, last?.msgid, last?.mine, wire])

  const onScroll = () => {
    const el = scroller.current
    if (el) stuck.current = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX
  }

  return (
    <div ref={scroller} onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-grave-dark-700 bg-grave-dark-950/60 px-3 py-3 sm:px-4">
      {messages.length === 0 ? (
        <p className="m-0 flex h-full items-center justify-center text-center text-sm text-grave-mist-300">No messages in #{area} yet. Say hello.</p>
      ) : (
        <ol role="log" aria-label={`Messages in ${area}`} className="m-0 flex list-none flex-col gap-1 p-0">
          {messages.map((message, index) => {
            const previous = messages[index - 1]
            const sameVoice = previous && previous.from === message.from && previous.mine === message.mine
            return (
              <li key={message.msgid} className={`flex flex-col ${message.mine ? 'items-end' : 'items-start'} ${sameVoice ? '' : 'mt-2 first:mt-0'}`}>
                {!sameVoice && (
                  <p className="m-0 mb-0.5 px-1 text-xs font-semibold">
                    <span className={message.mine ? 'text-grave-mist-300' : 'text-grave-bone-200'}>{message.mine ? 'You' : message.from}</span>
                  </p>
                )}
                <div
                  className={[
                    'max-w-[85%] rounded-2xl border px-3 py-2 sm:max-w-[70%]',
                    message.mine ? 'rounded-br-md border-grave-grove-sage/40 bg-grave-dark-700' : 'rounded-bl-md border-grave-dark-600 bg-grave-dark-800',
                  ].join(' ')}
                >
                  <p className="m-0 text-base leading-snug break-words whitespace-pre-wrap text-grave-bone-100">{message.body}</p>
                  <p className={`m-0 mt-0.5 text-right text-xs ${message.pending ? 'font-semibold text-grave-grove-brass' : 'text-grave-mist-300'}`}>
                    {message.pending ? 'Waiting to send' : clock(message.receivedAt)}
                  </p>
                </div>
                {wire && (
                  <pre className="mt-1 mb-1 max-w-full overflow-x-auto rounded-lg border border-grave-dark-700 bg-grave-dark-950 p-2 text-xs leading-snug text-grave-mist-200">
                    {wireText(message)}
                  </pre>
                )}
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
