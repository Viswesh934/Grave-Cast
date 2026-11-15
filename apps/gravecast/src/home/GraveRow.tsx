import {
  BestiaryCharacter,
  frankensteinSpec,
  ghostSpec,
  goblinSpec,
  vampireSpec,
  type CharacterSpec,
  type TombstoneWeathering,
} from 'groove-ui'
import type { StoryGrave } from './graves'

/** The creature guarding each grave, by how serious it is, so the graves don't all look alike. */
const GUARDIAN: Record<TombstoneWeathering, CharacterSpec> = {
  crumbling: vampireSpec,
  cracked: frankensteinSpec,
  aged: goblinSpec,
  pristine: ghostSpec,
}

const SERIOUS: ReadonlySet<TombstoneWeathering> = new Set(['crumbling', 'cracked'])

/** One grave in the list, with its guardian on the left. */
export function GraveRow({ grave, index }: { grave: StoryGrave; index: number }) {
  const serious = SERIOUS.has(grave.weathering)
  return (
    <li
      className={`flex items-center gap-4 rounded-xl border bg-grave-dark-900/80 py-3 pr-4 pl-2 backdrop-blur-sm ${
        serious ? 'border-grave-grove-glow/50' : 'border-grave-dark-700'
      }`}
    >
      <div aria-hidden="true" className="shrink-0">
        <BestiaryCharacter spec={GUARDIAN[grave.weathering]} size="sm" sound={false} growable={false} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="m-0 flex items-baseline gap-2 text-xs tracking-[0.25em] uppercase">
          <span className="text-grave-mist-400">{String(index + 1).padStart(2, '0')}</span>
          <span className={serious ? 'text-grave-grove-glow' : 'text-grave-mist-300'}>{grave.label}</span>
        </p>
        <p className="mt-1 mb-0 font-serif text-lg text-grave-bone-100">{grave.title}</p>
        <p className="mt-1 mb-0 text-sm text-grave-mist-300">{grave.detail}</p>
        {grave.href ? (
          <a
            href={grave.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block font-mono text-xs break-all text-grave-mist-300 underline decoration-grave-dark-600 underline-offset-4 hover:text-grave-bone-100"
          >
            {grave.evidence}
          </a>
        ) : (
          <p className="mt-1 mb-0 font-mono text-xs break-all text-grave-mist-400">{grave.evidence}</p>
        )}
      </div>
    </li>
  )
}