import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DEFAULT_ECHO, ECHO_NAME_PATTERN } from '../../shared/channelContract'
import { ui } from '../ui'
import { ChannelPanel } from './ChannelPanel'
import { Composer } from './Composer'
import { MessageList } from './MessageList'
import { useChannels } from './useChannels'
import { useChat, type RunState } from './useChat'

const STATE_TEXT: Record<RunState, string> = {
  idle: '',
  running: 'Checking\u2026',
  offline: 'No connection. Messages wait here and send when it returns.',
  failed: 'Could not send right now. Messages are kept and will try again.',
}

const clock = (iso: string | null): string => {
  if (!iso) return ''
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/**
 * Chat, laid out like a chat app: channels on the left (behind a button on a
 * phone), the conversation filling the rest with the newest message at the
 * bottom, and the message box pinned under it. Messages wait in an outbox when
 * there is no connection.
 */
export function ChatPage() {
  const [params, setParams] = useSearchParams()
  const requested = params.get('echo')?.toUpperCase() ?? ''
  const area = ECHO_NAME_PATTERN.test(requested) ? requested : DEFAULT_ECHO
  const channels = useChannels()
  const chat = useChat(area)
  const [wire, setWire] = useState(false)
  const [changingNick, setChangingNick] = useState(false)
  const [showChannels, setShowChannels] = useState(false)
  const [joinProblem, setJoinProblem] = useState<string | null>(null)

  const echo = channels.list.find((e) => e.name === area)
  const following = channels.followed.includes(area)
  const { join } = channels
  const { retry } = chat

  useEffect(() => {
    document.title = `#${area} \u00b7 Chat \u00b7 Gravecast Lantern`
  }, [area])

  // Opening a listed channel follows it, so mail runs fetch it; then fetch it now.
  useEffect(() => {
    if (following || !echo) return
    void join(area).then((problem) => {
      setJoinProblem(problem)
      if (!problem) void retry()
    })
  }, [area, echo, following, join, retry])

  const open = (name: string) => {
    setJoinProblem(null)
    setShowChannels(false)
    setParams(name === DEFAULT_ECHO ? {} : { echo: name }, { replace: true })
  }
  const create = async (name: string, about: string) => {
    const made = await channels.create(name, about)
    if (!made.ok) return made.reason
    open(made.name)
    void retry()
    return null
  }
  const leave = async () => {
    await channels.leave(area)
    open(DEFAULT_ECHO)
  }

  if (!chat.loaded) return <p className="m-0 text-base text-grave-mist-100">Opening Chat{'\u2026'}</p>

  const status = STATE_TEXT[chat.state]
  return (
    <div className="flex min-h-0 flex-1 gap-4">
      <aside aria-label="Channels" className={`${showChannels ? 'flex' : 'hidden'} min-h-0 w-full flex-col md:flex md:w-60 md:shrink-0`}>
        <ChannelPanel
          list={channels.list}
          followed={channels.followed}
          current={area}
          room={channels.room}
          listError={channels.listError}
          onOpen={open}
          onCreate={create}
        />
      </aside>

      <section aria-labelledby="chat-title" className={`${showChannels ? 'hidden' : 'flex'} min-h-0 min-w-0 flex-1 flex-col md:flex`}>
        <header className="mb-2 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2">
          <button type="button" onClick={() => setShowChannels(true)} className={`${ui.quiet} md:hidden`} aria-label="Show channels">
            <span aria-hidden>{'\u2630'}</span> Channels
          </button>
          <div className="min-w-0 flex-1">
            <h1 id="chat-title" className="m-0 truncate text-xl font-bold text-grave-bone-100">
              <span aria-hidden className="text-grave-mist-400">
                #
              </span>
              {area}
            </h1>
            {echo?.about && <p className="m-0 truncate text-sm text-grave-mist-300">{echo.about}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {chat.nick && !changingNick && (
              <button type="button" onClick={() => setChangingNick(true)} className={ui.quiet} title="Change your nickname">
                You: <strong className="font-semibold text-grave-bone-100">{chat.nick}</strong>
              </button>
            )}
            <button type="button" onClick={() => setWire((w) => !w)} aria-pressed={wire} className={`${ui.quiet} ${wire ? 'border-grave-mist-300 bg-grave-dark-750 text-grave-bone-100' : ''}`}>
              Headers
            </button>
            {following && !channels.isBuiltin(area) && (
              <button type="button" onClick={() => void leave()} className={ui.quiet}>
                Leave
              </button>
            )}
          </div>
        </header>

        <div role="status" className="mb-2 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-grave-mist-300">
          <span className="flex items-center gap-1.5">
            <span aria-hidden className={`inline-block size-2 rounded-full ${chat.state === 'idle' || chat.state === 'running' ? 'bg-grave-grove-sage' : 'bg-grave-grove-brass'}`} />
            {status || (chat.lastRunAt ? `Updated ${clock(chat.lastRunAt)}` : 'Not updated yet')}
          </span>
          {chat.waiting > 0 && (
            <span className="font-semibold text-grave-grove-brass">
              {chat.waiting} waiting to send
            </span>
          )}
          {chat.problem && chat.state === 'failed' && <span>{chat.problem}</span>}
          {chat.state !== 'running' && (
            <button type="button" onClick={() => void chat.retry()} className="cursor-pointer border-0 bg-transparent p-0 text-xs text-grave-grove-sage underline underline-offset-2">
              Check now
            </button>
          )}
        </div>

        {!echo && !channels.isBuiltin(area) && (
          <p className="mb-2 shrink-0 rounded-lg border border-grave-grove-brass/60 px-3 py-2 text-sm text-grave-bone-100">
            #{area} isn{'\u2019'}t in the channel list yet. If it doesn{'\u2019'}t exist, messages to it will be refused.
          </p>
        )}
        {joinProblem && <p className="mb-2 shrink-0 rounded-lg border border-grave-grove-brass/60 px-3 py-2 text-sm text-grave-bone-100">{joinProblem}</p>}

        <MessageList messages={chat.messages} area={area} wire={wire} />

        {chat.refused.length > 0 && (
          <div role="alert" className="mt-2 shrink-0 rounded-lg border border-grave-grove-brass/60 bg-grave-dark-850 px-3 py-2 text-sm text-grave-bone-100">
            <p className="m-0 font-semibold">Not accepted:</p>
            <ul className="m-0 mt-1 pl-5">
              {chat.refused.map((r) => (
                <li key={r.msgid}>
                  {'\u201c'}
                  {r.body}
                  {'\u201d'}: {r.reason}
                </li>
              ))}
            </ul>
            <button type="button" className={`${ui.quiet} mt-2`} onClick={() => void chat.dismissRefused()}>
              Dismiss
            </button>
          </div>
        )}

        <Composer
          key={changingNick ? 'nick' : 'message'}
          area={area}
          nick={chat.nick}
          changingNick={changingNick}
          onNick={async (value) => {
            const problem = await chat.setNick(value)
            if (!problem) setChangingNick(false)
            return problem
          }}
          onCancelNick={() => setChangingNick(false)}
          onSend={chat.send}
        />
      </section>
    </div>
  )
}
