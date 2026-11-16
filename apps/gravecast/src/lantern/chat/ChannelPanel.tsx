import { useId, useState, type FormEvent } from 'react'
import type { EchoInfo } from '../../shared/channel'
import { MAX_ECHO_ABOUT_CHARS, MAX_ECHO_NAME_CHARS } from '../../shared/channelContract'
import { ui } from '../ui'

export interface ChannelPanelProps {
  /** Every channel the server knows. */
  list: readonly EchoInfo[]
  /** The channels this phone follows, in order. */
  followed: readonly string[]
  current: string
  /** How many more channels can be created, when known. */
  room: number | null
  listError: string | null
  onOpen: (name: string) => void
  onCreate: (name: string, about: string) => Promise<string | null>
}

function ChannelButton({ echo, current, onOpen }: { echo: EchoInfo; current: boolean; onOpen: (name: string) => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(echo.name)}
        aria-current={current ? 'true' : undefined}
        className={[
          'flex min-h-11 w-full cursor-pointer flex-col items-start justify-center rounded-lg border border-l-4 px-3 py-1.5 text-left',
          'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-grave-bone-100',
          current
            ? 'border-grave-dark-600 border-l-grave-grove-sage bg-grave-dark-750'
            : 'border-grave-dark-700 border-l-grave-dark-700 bg-grave-dark-850 hover:border-grave-mist-500 hover:bg-grave-dark-800',
        ].join(' ')}
      >
        <span className={`text-sm font-semibold ${current ? 'text-grave-bone-100' : 'text-grave-mist-100'}`}>
          <span aria-hidden className="text-grave-mist-400">
            #{' '}
          </span>
          {echo.name}
        </span>
        {echo.about && <span className="line-clamp-1 text-xs text-grave-mist-300">{echo.about}</span>}
      </button>
    </li>
  )
}

/** The list of channels: the ones you follow, the rest to browse, and a form to make a new one. */
export function ChannelPanel({ list, followed, current, room, listError, onOpen, onCreate }: ChannelPanelProps) {
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [about, setAbout] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const ids = { name: useId(), about: useId(), yours: useId(), more: useId() }

  const byName = new Map(list.map((e) => [e.name, e]))
  const yours = followed.map((n) => byName.get(n) ?? { name: n, about: '', builtin: false, createdAt: null })
  const more = list.filter((e) => !followed.includes(e.name))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    const problem = await onCreate(name, about)
    setBusy(false)
    setError(problem)
    if (!problem) {
      setName('')
      setAbout('')
      setCreating(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
      <section aria-labelledby={ids.yours}>
        <h2 id={ids.yours} className="m-0 mb-2 font-mono text-xs font-bold tracking-wider text-grave-mist-300 uppercase">
          Your channels
        </h2>
        <ul className="m-0 grid list-none gap-1 p-0">
          {yours.map((echo) => (
            <ChannelButton key={echo.name} echo={echo} current={echo.name === current} onOpen={onOpen} />
          ))}
        </ul>
      </section>

      {creating ? (
        <form onSubmit={(e) => void submit(e)} className={`${ui.card} grid gap-2`} noValidate>
          <label htmlFor={ids.name} className="text-sm font-semibold text-grave-bone-100">
            Channel name
          </label>
          <input
            id={ids.name}
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase().replace(/\s+/g, '-'))}
            maxLength={MAX_ECHO_NAME_CHARS}
            autoComplete="off"
            autoCapitalize="characters"
            placeholder="CHENNAI-FLOOD"
            aria-describedby={`${ids.name}-hint`}
            className={ui.field}
          />
          <p id={`${ids.name}-hint`} className={`${ui.muted} m-0`}>
            Capital letters, digits and dashes. Anyone can read and write in it.
          </p>
          <label htmlFor={ids.about} className="mt-1 text-sm font-semibold text-grave-bone-100">
            What it is for <span className="font-normal text-grave-mist-300">(optional)</span>
          </label>
          <input id={ids.about} value={about} onChange={(e) => setAbout(e.target.value)} maxLength={MAX_ECHO_ABOUT_CHARS} autoComplete="off" className={ui.field} />
          {error && (
            <p role="alert" className="m-0 text-sm text-grave-grove-brass">
              {error}
            </p>
          )}
          <div className="mt-1 flex flex-wrap gap-2">
            <button type="submit" disabled={busy || name.length < 2} className={ui.primary}>
              {busy ? 'Creating\u2026' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setCreating(false)
                setError(null)
              }}
              className={ui.secondary}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setCreating(true)} disabled={room === 0} className={`${ui.secondary} w-full justify-start`}>
          <span aria-hidden className="text-lg leading-none text-grave-mist-200">
            +
          </span>
          New channel
        </button>
      )}
      {room === 0 && <p className={`${ui.muted} m-0`}>No room for new channels on this server.</p>}

      {more.length > 0 && (
        <section aria-labelledby={ids.more}>
          <h2 id={ids.more} className="m-0 mb-2 font-mono text-xs font-bold tracking-wider text-grave-mist-300 uppercase">
            More channels
          </h2>
          <ul className="m-0 grid list-none gap-1 p-0">
            {more.map((echo) => (
              <ChannelButton key={echo.name} echo={echo} current={echo.name === current} onOpen={onOpen} />
            ))}
          </ul>
        </section>
      )}
      {listError && <p className={`${ui.muted} m-0`}>The channel list could not be updated. {listError}</p>}
      <p className={`${ui.muted} mt-auto mb-0 pt-2`}>Every channel is public. Don{'\u2019'}t post personal details.</p>
    </div>
  )
}
