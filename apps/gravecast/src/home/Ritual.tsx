import { useId } from 'react'
import type { RitualStep } from './ritualSteps'

export interface RitualProps {
  steps: readonly RitualStep[]
  active: number
  onSelect: (index: number) => void
  /** While a scan runs the steps follow it, so they can't be picked. */
  running: boolean
}

const pad = (n: number) => String(n).padStart(2, '0')

/** What happens to what you paste, step by step. Pick a step to look at it; during a scan it follows along. */
export function Ritual({ steps, active, onSelect, running }: RitualProps) {
  const detailId = useId()
  const step = steps[Math.min(active, steps.length - 1)]
  return (
    <div className="gc-reveal w-full max-w-2xl" style={{ ['--gc-delay' as string]: '1.8s' }}>
      <div className="flex items-baseline justify-between text-xs tracking-[0.3em] text-grave-mist-400 uppercase">
        <span>The ritual</span>
        <span>
          <span className="text-grave-grove-glow">{pad(active + 1)}</span> / {pad(steps.length)}
        </span>
      </div>
      <ol className="relative mt-4 mb-0 grid list-none p-0" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        <span aria-hidden="true" className="absolute top-[5px] right-0 left-0 h-px bg-grave-mist-500/50" />
        {steps.map((s, i) => {
          const current = i === active
          return (
            <li key={s.id} className="relative">
              <button
                type="button"
                disabled={running}
                onClick={() => onSelect(i)}
                aria-current={current ? 'step' : undefined}
                aria-describedby={current ? detailId : undefined}
                className="group flex w-full cursor-pointer flex-col items-start gap-2 bg-transparent p-0 text-left disabled:cursor-default"
              >
                <span
                  aria-hidden="true"
                  className={`relative block size-[11px] rounded-full border transition-colors duration-500 ${
                    current ? 'border-grave-grove-glow bg-grave-grove-glow' : i < active ? 'border-grave-bone-200 bg-grave-bone-200' : 'border-grave-mist-400 bg-grave-dark-950'
                  }`}
                />
                <span className={`text-sm transition-colors ${current ? 'text-grave-bone-100' : 'text-grave-mist-300 group-hover:text-grave-bone-100'}`}>{s.label}</span>
                <span className="text-xs text-grave-mist-400">{s.where}</span>
              </button>
            </li>
          )
        })}
      </ol>
      <p id={detailId} aria-live="polite" className="mt-4 mb-0 min-h-[3rem] max-w-xl text-sm leading-relaxed text-grave-mist-300">
        {step.detail}
      </p>
    </div>
  )
}