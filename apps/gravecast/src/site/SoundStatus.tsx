import type { AmbienceState } from './useAmbience'

const WORDS: Record<AmbienceState, string> = { ready: 'Sound ready', on: 'Sound on', off: 'Sound off' }

/** Says whether the ambient sound is waiting, playing or off, and switches it. */
export function SoundStatus({ state, onToggle }: { state: AmbienceState; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={state !== 'off'}
      className="flex cursor-pointer items-center gap-2 bg-transparent p-1 text-xs tracking-[0.3em] text-grave-mist-300 uppercase hover:text-grave-bone-100"
    >
      <span aria-hidden="true" className="flex h-3 items-end gap-[2px]">
        {[0.45, 1, 0.7].map((h, i) => (
          <span
            key={i}
            className={`w-[2px] bg-current ${state === 'on' ? 'gc-sound-bar' : ''}`}
            style={{ height: `${state === 'off' ? 0.25 * 100 : h * 100}%`, animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </span>
      {WORDS[state]}
    </button>
  )
}