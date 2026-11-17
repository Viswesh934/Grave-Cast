import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motionSupported, requestMotionPermission } from 'groove-ui/signal'
import { ui } from '../ui'
import { startDistress } from './distressTrigger'
import { canVibrate, useContactSetting, useShakeSetting, useSoundSetting, useTapsSetting, useVibrateSetting, type DistressSound } from './settings'

const iconProps = { 'aria-hidden': true, viewBox: '0 0 48 48', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

/** A braille cell showing the letter H (dots 1, 2 and 5), the pad's "I need help". */
function BrailleIcon({ className }: { className: string }) {
  const filled = new Set([1, 2, 5])
  const dots = [1, 2, 3, 4, 5, 6].map((n) => ({ n, x: n <= 3 ? 16 : 32, y: 10 + ((n - 1) % 3) * 14 }))
  return (
    <svg {...iconProps} className={className}>
      {dots.map((d) => (
        <circle key={d.n} cx={d.x} cy={d.y} r={5} fill={filled.has(d.n) ? 'currentColor' : 'none'} />
      ))}
    </svg>
  )
}

/** A dial pad: three rows of three keys. */
function DialIcon({ className }: { className: string }) {
  const keys = [0, 1, 2].flatMap((row) => [0, 1, 2].map((col) => ({ x: 7 + col * 13, y: 7 + row * 13 })))
  return (
    <svg {...iconProps} className={className}>
      {keys.map((k) => (
        <rect key={`${k.x}-${k.y}`} x={k.x} y={k.y} width={9} height={9} rx={2} />
      ))}
    </svg>
  )
}

interface Mode {
  to: string
  name: string
  about: string
  icon: (props: { className: string }) => ReactNode
}

const MODES: readonly Mode[] = [
  {
    to: '/access/blind',
    name: 'Can\u2019t see and can\u2019t speak',
    about: 'A braille pad that speaks for you. Touch the dots of a letter anywhere on the screen and the phone says the message.',
    icon: BrailleIcon,
  },
  {
    to: '/access/deaf',
    name: 'Can\u2019t hear or can\u2019t speak',
    about: 'A dial pad of messages to show in very large text, a big screen to write on, and an SOS key.',
    icon: DialIcon,
  },
]

/** An on/off switch with its label and a line about it. */
function Switch({ label, hint, on, disabled, onChange }: { label: string; hint: string; on: boolean; disabled?: boolean; onChange: (next: boolean) => void }) {
  const ids = { button: useId(), hint: useId() }
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <label htmlFor={ids.button} className="text-base font-semibold text-grave-bone-100">
          {label}
        </label>
        <p id={ids.hint} className={`${ui.muted} mt-0.5 mb-0`}>
          {hint}
        </p>
      </div>
      <button
        id={ids.button}
        type="button"
        role="switch"
        aria-checked={on}
        aria-describedby={ids.hint}
        disabled={disabled}
        onClick={() => onChange(!on)}
        className={[
          'inline-flex h-9 w-16 shrink-0 cursor-pointer items-center rounded-full border-2 p-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-grave-bone-100 disabled:cursor-not-allowed disabled:opacity-50',
          on ? 'justify-end border-grave-grove-sage bg-grave-grove-sage' : 'justify-start border-grave-mist-500 bg-grave-dark-950',
        ].join(' ')}
      >
        <span aria-hidden className={`block size-7 rounded-full ${on ? 'bg-grave-dark-950' : 'bg-grave-mist-300'}`} />
        <span className="sr-only">{on ? 'On' : 'Off'}</span>
      </button>
    </div>
  )
}

const card = 'rounded-2xl border border-grave-dark-600 bg-grave-dark-850 px-5 py-2'

/**
 * Access: pick the pad that fits you, then set up the help signal. Everything works
 * with no internet, and nothing leaves the phone unless you send the help text.
 */
export function AccessPage() {
  const [vibrate, setVibrate] = useVibrateSetting()
  const [shake, setShake] = useShakeSetting()
  const [taps, setTaps] = useTapsSetting()
  const [sound, setSound] = useSoundSetting()
  const [contact, setContact] = useContactSetting()
  const [draft, setDraft] = useState(contact)
  const [shakeProblem, setShakeProblem] = useState<string | null>(null)
  const vibrateOk = canVibrate()
  const contactId = useId()

  useEffect(() => {
    document.title = 'Access \u00b7 Gravecast Lantern'
  }, [])

  const turnShake = async (next: boolean) => {
    setShakeProblem(null)
    if (next && !(await requestMotionPermission())) {
      setShakeProblem('Motion wasn\u2019t allowed, so shaking can\u2019t start the signal. Five taps still can.')
      return
    }
    setShake(next)
  }
  const saveContact = (event: FormEvent) => {
    event.preventDefault()
    setContact(draft)
  }

  return (
    <div className="max-w-4xl">
      <h1 className={ui.h1}>Access</h1>
      <p className={ui.lead}>Pick the pad that fits you. Each one explains its keys. No internet needed.</p>

      <ul className="mt-6 mb-0 grid list-none gap-3 p-0 sm:grid-cols-2">
        {MODES.map((mode) => {
          const Icon = mode.icon
          return (
            <li key={mode.to}>
              <Link
                to={mode.to}
                className="group flex h-full flex-col gap-4 rounded-2xl border-2 border-grave-dark-600 bg-grave-dark-850 p-6 text-grave-bone-100 no-underline shadow-sm shadow-black/40 hover:border-grave-grove-sage hover:bg-grave-dark-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-grave-bone-100"
              >
                <span className="flex size-24 items-center justify-center rounded-2xl border border-grave-grove-sage/40 bg-grave-dark-950 text-grave-grove-sage">
                  <Icon className="size-16" />
                </span>
                <span className="text-2xl leading-tight font-bold sm:text-3xl">{mode.name}</span>
                <span className="text-base leading-relaxed text-grave-mist-200">{mode.about}</span>
              </Link>
            </li>
          )
        })}
      </ul>

      <section aria-labelledby="help-signal" className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="help-signal" className={ui.h2}>
            Help signal
          </h2>
          <button
            type="button"
            onClick={() => startDistress({ immediate: true })}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-lg border-2 border-grave-grove-brass bg-grave-grove-brass px-4 text-base font-bold text-grave-dark-950 hover:border-grave-bone-100 hover:bg-grave-bone-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-grave-bone-100"
          >
            Start it now
          </button>
        </div>
        <p className={`${ui.muted} mt-1 mb-0 max-w-2xl`}>
          Shows HELP, calls out or vibrates, and opens a text with your position to your help contact. You still press Send. It only works while Lantern is open.
        </p>

        <form onSubmit={saveContact} className={`${card} mt-3 py-4`}>
          <label htmlFor={contactId} className="text-base font-semibold text-grave-bone-100">
            Help contact
          </label>
          <p className={`${ui.muted} mt-0.5 mb-0`}>
            A phone number for the help text, such as family, or your country{'\u2019'}s emergency text number if it has one. It stays on this phone.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              id={contactId}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Phone number"
              className={`${ui.field} min-w-0 flex-1`}
            />
            <button type="submit" disabled={draft.trim() === contact} className={ui.primary}>
              Save
            </button>
          </div>
          {contact && <p className="mt-2 mb-0 text-sm text-grave-grove-sage">Saved: {contact}</p>}
        </form>

        <div className={`${card} mt-3 divide-y divide-grave-dark-700`}>
          <Switch
            label="Shake to start"
            hint={motionSupported() ? 'Shake the phone hard three times. A 3-second countdown lets you cancel.' : 'This phone can\u2019t read motion.'}
            on={shake}
            disabled={!motionSupported()}
            onChange={(next) => void turnShake(next)}
          />
          <Switch label="Tap five times to start" hint="Five quick taps anywhere in Lantern. Not on the braille pad, where taps are letters." on={taps} onChange={setTaps} />
          <fieldset className="m-0 min-w-0 border-0 px-0 py-3">
            <legend className="text-base font-semibold text-grave-bone-100">Sound</legend>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:max-w-md">
              {(
                [
                  ['loud', 'Loud', 'Calls out and plays SOS'],
                  ['silent', 'Silent', 'Vibration only, dark screen'],
                ] as const satisfies readonly (readonly [DistressSound, string, string])[]
              ).map(([value, name, about]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={sound === value}
                  onClick={() => setSound(value)}
                  className={[
                    'flex min-h-14 cursor-pointer flex-col items-start justify-center rounded-lg border-2 px-3 py-2 text-left focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-grave-bone-100',
                    sound === value ? 'border-grave-grove-sage bg-grave-dark-750 text-grave-bone-100' : 'border-grave-dark-600 bg-grave-dark-900 text-grave-mist-100 hover:border-grave-mist-400',
                  ].join(' ')}
                >
                  <span className="text-base font-bold">{name}</span>
                  <span className="text-xs">{about}</span>
                </button>
              ))}
            </div>
            <p className={`${ui.muted} mt-2 mb-0`}>Choose Silent if noise could put you in danger, for example while hiding.</p>
          </fieldset>
          {shakeProblem && (
            <p role="alert" className="m-0 py-3 text-sm text-grave-grove-brass">
              {shakeProblem}
            </p>
          )}
        </div>
      </section>

      <div className={`${card} mt-4`}>
        <Switch
          label="Vibrate for new messages"
          hint={vibrateOk ? 'Two short buzzes when a Chat or Radio message arrives while it is open.' : 'This browser can\u2019t vibrate the phone. iPhone browsers don\u2019t allow it.'}
          on={vibrate}
          disabled={!vibrateOk}
          onChange={setVibrate}
        />
      </div>
    </div>
  )
}
