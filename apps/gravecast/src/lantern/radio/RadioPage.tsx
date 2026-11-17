import { useEffect, useId, useState } from 'react'
import { signalTokens, speechSupported } from 'groove-ui/signal'
import { RADIO_CHANNEL_COUNT, RADIO_CHANNELS, radioEcho } from '../../shared/channelContract'
import { Composer } from '../chat/Composer'
import { getMeta, setMeta } from '../chat/db'
import { clock, STATE_TEXT } from '../chat/runText'
import { useChat, type ShownMessage } from '../chat/useChat'
import { RefreshButton } from '../RefreshButton'
import { ui } from '../ui'
import { MAX_PLAYED_CHARS, soundOf, useRadioPlayer, type RadioMode } from './useRadioPlayer'

/** What this phone remembers about the set between visits. */
const SAVED = { channel: 'radioChannel', mode: 'radioMode', showMessages: 'radioShowMessages' } as const
/** Volume steps, in percent. */
const VOLUME_STEP = 10
const DEFAULT_VOLUME = Math.round(signalTokens.rtty.volume * 100)

const MODES: readonly { mode: RadioMode; label: string; hint: string }[] = [
  { mode: 'voice', label: 'Voice', hint: 'Read aloud in English' },
  { mode: 'tones', label: 'Tones', hint: 'Played as radio teletype (RTTY)' },
]

const channelOf = (value: unknown): number => {
  const n = Number(value)
  return Number.isInteger(n) && n >= 1 && n <= RADIO_CHANNEL_COUNT ? n : 1
}

/*
 * The set wears the palette's warm brass, like the faceplate and dial light of an old
 * valve radio, so it reads as a radio at a glance. Everywhere else in Lantern, brass
 * is kept for things that need attention.
 */
/** A label on the set's panel, in the small engraved capitals of a radio front. */
const panelLabel = 'font-mono text-xs font-bold tracking-widest text-grave-grove-brass uppercase'
const focusRing = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-grave-bone-100'
/** The square step buttons beside the tuning control. */
const stepButton = `inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-grave-grove-brass/50 bg-grave-dark-900 font-mono text-xl text-grave-bone-100 hover:border-grave-grove-brass disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`
/** One half of a two-way switch on the panel. */
const switchButton = (pressed: boolean) =>
  [
    `min-h-11 cursor-pointer rounded-md border px-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`,
    pressed ? 'border-grave-grove-brass bg-grave-dark-800 text-grave-bone-100' : 'border-grave-dark-600 bg-grave-dark-900 text-grave-mist-100 hover:border-grave-grove-brass/60',
  ].join(' ')

/** A small indicator lamp on the set's panel, lit warm like a dial light. Its word says the state, so colour is never the only sign. */
function Lamp({ on, label }: { on: boolean; label: string }) {
  return (
    <span className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-widest text-grave-bone-200 uppercase">
      <span aria-hidden className={`inline-block size-2.5 rounded-full border ${on ? 'border-grave-grove-brass bg-grave-grove-brass' : 'border-grave-dark-600 bg-grave-dark-950'}`} />
      {label}
      <span className="sr-only">{on ? 'on' : 'off'}</span>
    </span>
  )
}

/** The channel's messages, newest first, right under the message box. Shown only when the person opens them. */
function MessageLog({
  messages,
  channel,
  mode,
  playingId,
  onPlay,
}: {
  messages: readonly ShownMessage[]
  channel: number
  mode: RadioMode
  playingId: string | null
  onPlay: (message: ShownMessage) => void
}) {
  const newestFirst = [...messages].reverse()
  return (
    <div id="radio-messages" className="mt-2 max-h-96 overflow-y-auto rounded-xl border border-grave-dark-600 bg-grave-dark-950">
      {newestFirst.length === 0 ? (
        <p className="m-0 px-3 py-3 font-mono text-sm text-grave-mist-200">Nothing heard on CH {channel} yet.</p>
      ) : (
        <ol role="log" aria-label={`Messages on channel ${channel}, newest first`} className="m-0 list-none p-0">
          {newestFirst.map((message) => {
            const sound = soundOf(message.body)
            const playing = playingId === message.msgid
            const who = message.mine ? 'you' : message.from
            return (
              <li key={message.msgid} className="border-b border-dashed border-grave-dark-600 px-3 py-2.5 last:border-b-0">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="m-0 font-mono text-xs tracking-wider text-grave-mist-300 uppercase">
                      <span className="font-bold text-grave-bone-200">{message.mine ? 'You' : message.from}</span>
                      {' \u00b7 '}
                      {message.pending ? <span className="font-bold text-grave-grove-brass">Waiting to send</span> : clock(message.receivedAt)}
                      {mode === 'tones' && ` \u00b7 ${sound.seconds} s`}
                    </p>
                    <p className="m-0 mt-0.5 font-mono text-base leading-snug break-words whitespace-pre-wrap text-grave-bone-100">{message.body}</p>
                    {mode === 'tones' && (sound.cut || sound.skipped > 0) && (
                      <p className="m-0 mt-0.5 text-xs text-grave-mist-300">
                        {sound.cut && `Tones play the first ${MAX_PLAYED_CHARS} characters only.`}
                        {sound.cut && sound.skipped > 0 && ' '}
                        {sound.skipped > 0 && `${sound.skipped} character${sound.skipped === 1 ? '' : 's'} left out of the tones.`}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onPlay(message)}
                    aria-label={`${playing ? 'Stop' : 'Replay'} the message from ${who}`}
                    className={`${ui.quiet} shrink-0`}
                  >
                    <span aria-hidden>{playing ? '\u25a0' : '\u21bb'}</span> {playing ? 'Stop' : 'Replay'}
                  </button>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

/**
 * Radio: a replica of a shortwave radio net with nine channels. Turn it on, tune to
 * a channel, and send; every phone that is on and tuned to that channel gives the
 * message by itself, read aloud in English (Voice) or played as RTTY, the two-tone
 * warble ships once sent over shortwave (Tones). A quiet hiss plays while it is on.
 * Messages travel as text, through the same outbox and mail run as Chat. They stay
 * hidden until the person opens them, and can then be read and replayed.
 *
 * The set takes most of the width, with the channel's chat in a narrower column on
 * its right: the message box first, then the messages if opened. On a narrow screen
 * the chat sits under the set.
 */
export function RadioPage() {
  const [canSpeak] = useState(speechSupported)
  const [channel, setChannel] = useState(1)
  const [chosenMode, setChosenMode] = useState<RadioMode>('voice')
  const [showMessages, setShowMessages] = useState(false)
  const [volume, setVolume] = useState(DEFAULT_VOLUME)
  const [on, setOn] = useState(false)
  const [changingNick, setChangingNick] = useState(false)
  const mode: RadioMode = canSpeak ? chosenMode : 'tones'
  const area = radioEcho(channel)
  const chat = useChat(area)
  const player = useRadioPlayer(chat.messages, on, area, volume / 100, mode)
  const ids = { tune: useId(), volume: useId() }

  useEffect(() => {
    document.title = `Radio CH ${channel} \u00b7 Gravecast Lantern`
  }, [channel])

  // Come back to the channel, mode and message view this phone used last.
  useEffect(() => {
    let live = true
    void Promise.all([getMeta<number>(SAVED.channel), getMeta<RadioMode>(SAVED.mode), getMeta<boolean>(SAVED.showMessages)]).then(([savedChannel, savedMode, savedShow]) => {
      if (!live) return
      if (savedChannel !== undefined) setChannel(channelOf(savedChannel))
      if (savedMode === 'voice' || savedMode === 'tones') setChosenMode(savedMode)
      if (savedShow === true) setShowMessages(true)
    })
    return () => {
      live = false
    }
  }, [])

  const tune = (next: number) => {
    const clean = channelOf(next)
    if (clean === channel) return
    player.stop()
    setChannel(clean)
    void setMeta(SAVED.channel, clean)
  }
  const pickMode = (next: RadioMode) => {
    if (next === chosenMode) return
    player.stop()
    setChosenMode(next)
    void setMeta(SAVED.mode, next)
  }
  const toggleMessages = () => {
    const next = !showMessages
    setShowMessages(next)
    void setMeta(SAVED.showMessages, next)
  }

  if (!chat.loaded) return <p className="m-0 text-base text-grave-mist-100">Opening Radio{'\u2026'}</p>

  // Turning on starts from what is already here, so it needs one update first, or old messages would all play at once.
  const ready = chat.lastRunAt !== null
  const status = STATE_TEXT[chat.state]
  const heard = chat.messages.length
  const receiving = chat.messages.find((m) => m.msgid === player.playingId)

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-6">
      <div className="min-w-0">
        <section aria-labelledby="radio-title" className="rounded-2xl border-2 border-grave-grove-brass/60 bg-grave-grove-brass/10 p-3 shadow-md shadow-black/40 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h1 id="radio-title" className="m-0 text-lg leading-tight font-bold text-grave-bone-100 sm:text-xl">
              Radio
            </h1>
            <div className="flex items-center gap-3">
              <Lamp on={on} label="On" />
              <Lamp on={receiving !== undefined} label="RX" />
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-grave-grove-brass/40 bg-grave-dark-950 px-2 pt-2 pb-1.5 sm:px-4 sm:pt-3">
            <div aria-live="polite" className="flex items-baseline justify-between gap-3 px-1">
              <p className="m-0 font-mono text-3xl leading-none font-bold text-grave-grove-brass tabular-nums sm:text-4xl">CH {channel}</p>
              <p className="m-0 min-w-0 truncate font-mono text-xs text-grave-bone-200 sm:text-sm">
                {receiving
                  ? `RX: ${receiving.mine ? 'you' : receiving.from}`
                  : on
                    ? `On \u00b7 ${heard === 0 ? 'nothing heard' : `${heard} heard`}`
                    : 'Off'}
              </p>
            </div>
            {/* The scale. Each number is a channel button, the plain alternative to the tuning control; the needle sits over the tuned one. */}
            <fieldset className="m-0 mt-2 min-w-0 border-0 border-t border-grave-grove-brass/50 p-0">
              <legend className="sr-only">Channels</legend>
              <div className="grid grid-cols-9">
                {RADIO_CHANNELS.map((name, index) => {
                  const n = index + 1
                  const current = n === channel
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => tune(n)}
                      aria-pressed={current}
                      aria-label={`Channel ${n}`}
                      className="group flex min-h-11 cursor-pointer flex-col items-center border-0 bg-transparent p-0 focus-visible:outline-3 focus-visible:outline-offset-0 focus-visible:outline-grave-bone-100"
                    >
                      <span aria-hidden className={`block ${current ? 'h-5 w-0.5 bg-grave-grove-brass' : 'h-2.5 w-px bg-grave-mist-400 group-hover:bg-grave-bone-100'}`} />
                      <span className={`mt-1 font-mono text-sm tabular-nums ${current ? 'font-bold text-grave-grove-brass' : 'text-grave-mist-300 group-hover:text-grave-bone-100'}`}>{n}</span>
                    </button>
                  )
                })}
              </div>
            </fieldset>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="min-w-0">
              <label htmlFor={ids.tune} className={`${panelLabel} block`}>
                Tuning
              </label>
              <div className="mt-1 flex items-center gap-2">
                <button type="button" onClick={() => tune(channel - 1)} disabled={channel === 1} aria-label="Tune down one channel" className={stepButton}>
                  {'\u2212'}
                </button>
                <input
                  id={ids.tune}
                  type="range"
                  min={1}
                  max={RADIO_CHANNEL_COUNT}
                  step={1}
                  value={channel}
                  onChange={(e) => tune(Number(e.target.value))}
                  aria-valuetext={`Channel ${channel}`}
                  className="h-11 min-w-0 flex-1 cursor-pointer accent-grave-grove-brass"
                />
                <button type="button" onClick={() => tune(channel + 1)} disabled={channel === RADIO_CHANNEL_COUNT} aria-label="Tune up one channel" className={stepButton}>
                  +
                </button>
              </div>
            </div>
            <fieldset className="m-0 min-w-0 border-0 p-0">
              <legend className={panelLabel}>Mode</legend>
              <div className="mt-1 grid grid-cols-2 gap-1 sm:w-44">
                {MODES.map((m) => (
                  <button
                    key={m.mode}
                    type="button"
                    onClick={() => pickMode(m.mode)}
                    aria-pressed={mode === m.mode}
                    disabled={m.mode === 'voice' && !canSpeak}
                    title={m.hint}
                    className={switchButton(mode === m.mode)}
                  >
                    {m.label}
                    <span className="sr-only">: {m.hint}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="mt-3 flex items-end gap-3">
            <div className="min-w-0 flex-1">
              <label htmlFor={ids.volume} className={`${panelLabel} block`}>
                Volume <span className="font-normal text-grave-bone-200 tabular-nums">{volume}%</span>
              </label>
              <input
                id={ids.volume}
                type="range"
                min={0}
                max={100}
                step={VOLUME_STEP}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-valuetext={`${volume} percent`}
                className="mt-1 block h-11 w-full cursor-pointer accent-grave-grove-brass"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (on) player.stop()
                setOn((now) => !now)
              }}
              aria-pressed={on}
              disabled={!ready && !on}
              className={[
                `inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`,
                on
                  ? 'border-grave-bone-100 bg-grave-dark-950 text-grave-bone-100 hover:bg-grave-dark-800'
                  : 'border-grave-grove-brass bg-grave-grove-brass text-grave-dark-950 hover:border-grave-bone-100 hover:bg-grave-bone-100',
              ].join(' ')}
            >
              {on ? 'Turn off' : 'Turn on'}
            </button>
          </div>
          <p role="status" className="m-0 mt-2 text-xs text-grave-bone-200 sm:text-sm">
            {on
              ? `On. The hiss means it is running. Messages on CH ${channel} ${mode === 'voice' ? 'are read aloud' : 'play as tones'} by themselves.`
              : ready
                ? 'Turn it on to hear the channel. Messages play by themselves.'
                : 'The radio needs one update first. Connect once, then it works.'}
          </p>
          {!canSpeak && <p className="m-0 mt-1 text-xs text-grave-grove-brass">This browser can{'\u2019'}t read aloud, so the radio plays tones.</p>}
        </section>
        <p className="m-0 mt-2 text-xs leading-relaxed text-grave-mist-300">
          A replica, not a real broadcast, with no real frequencies. Messages travel as text, like Chat, and each phone reads them aloud or plays them as tones. Everyone
          can read them, so do not post personal details.
        </p>
      </div>

      <section aria-labelledby="radio-chat-title" className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 id="radio-chat-title" className="m-0 text-base font-semibold text-grave-bone-100">
            Chat on CH {channel}
          </h2>
          <RefreshButton onClick={() => void chat.retry()} busy={chat.state === 'running'} />
          {chat.nick && !changingNick && (
            <button type="button" onClick={() => setChangingNick(true)} className={`${ui.quiet} ml-auto`} title="Change your nickname">
              You: <strong className="font-semibold text-grave-bone-100">{chat.nick}</strong>
            </button>
          )}
        </div>
        <p role="status" className="m-0 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-grave-mist-300">
          <span aria-hidden className={`inline-block size-2 rounded-full ${chat.state === 'idle' || chat.state === 'running' ? 'bg-grave-grove-sage' : 'bg-grave-grove-brass'}`} />
          <span>{status || (chat.lastRunAt ? `Updated ${clock(chat.lastRunAt)}` : 'Not updated yet')}</span>
          {chat.waiting > 0 && <span className="font-semibold text-grave-grove-brass">{chat.waiting} waiting to send</span>}
          {chat.problem && chat.state === 'failed' && <span>{chat.problem}</span>}
        </p>

        {chat.refused.length > 0 && (
          <div role="alert" className="mt-2 rounded-lg border border-grave-grove-brass/60 bg-grave-dark-850 px-3 py-2 text-sm text-grave-bone-100">
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
          target={`channel ${channel}`}
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

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
          <button type="button" onClick={toggleMessages} aria-expanded={showMessages} aria-controls="radio-messages" className={ui.quiet}>
            {showMessages ? 'Hide messages' : `Show messages${heard > 0 ? ` (${heard})` : ''}`}
          </button>
          {!showMessages && <span className="text-xs text-grave-mist-300">Hidden. {on ? 'The radio gives them as they arrive.' : 'Turn the radio on to hear them.'}</span>}
        </div>
        {showMessages && <MessageLog messages={chat.messages} channel={channel} mode={mode} playingId={player.playingId} onPlay={player.play} />}
      </section>
    </div>
  )
}
