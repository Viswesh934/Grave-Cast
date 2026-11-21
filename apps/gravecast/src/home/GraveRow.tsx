import {
  BestiaryCharacter,
  frankensteinSpec,
  mummySpec,
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
  pristine: mummySpec,
}

/**
 * Each grave's haunt colour, the same glow it has in the 3D yard. The label
 * beside it always says the same thing in words.
 */
const HAUNT: Record<TombstoneWeathering, { border: string; label: string }> = {
  crumbling: { border: 'border-grave-haunt-serious/60', label: 'text-grave-haunt-serious' },
  cracked: { border: 'border-grave-haunt-risky/55', label: 'text-grave-haunt-risky' },
  aged: { border: 'border-grave-haunt-unusual/45', label: 'text-grave-haunt-unusual' },
  pristine: { border: 'border-grave-haunt-note/35', label: 'text-grave-haunt-note' },
}

/** One grave in the list, with its guardian on the left. */
export function GraveRow({ grave, index }: { grave: StoryGrave; index: number }) {
  const haunt = HAUNT[grave.weathering]
  return (
    <li
      className={`flex items-center gap-4 rounded-xl border bg-grave-dark-900/80 py-3 pr-4 pl-2 backdrop-blur-sm ${haunt.border}`}
    >
      <div aria-hidden="true" className="shrink-0">
        <BestiaryCharacter spec={GUARDIAN[grave.weathering]} size="sm" sound={false} growable={false} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="m-0 flex items-baseline gap-2 text-xs tracking-[0.25em] uppercase">
          <span className="text-grave-mist-400">{String(index + 1).padStart(2, '0')}</span>
          <span className={haunt.label}>{grave.label}</span>
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
        <GraveDetails grave={grave} />
      </div>
    </li>
  )
}

/** The line it was found on, how to fix it, its CWE and OWASP tags, and where to read more. Shown only when the grave has them. */
export function GraveDetails({ grave }: { grave: StoryGrave }) {
  return (
    <>
      {grave.snippet ? (
        <pre className="mt-2 mb-0 overflow-x-auto rounded-md bg-grave-dark-950/80 px-2 py-1 font-mono text-xs whitespace-pre-wrap break-all text-grave-mist-300">
          {grave.snippet}
        </pre>
      ) : null}
      {grave.fix ? (
        <>
          <p className="mt-3 mb-0 text-[0.65rem] tracking-[0.25em] text-grave-mist-400 uppercase">How to fix</p>
          <p className="m-0 text-sm leading-relaxed text-grave-mist-200">{grave.fix}</p>
        </>
      ) : null}
      {grave.tags && grave.tags.length > 0 ? (
        <p className="mt-2 mb-0 text-xs text-grave-mist-400">{grave.tags.join(' \u00b7 ')}</p>
      ) : null}
      {grave.refs && grave.refs.length > 0 ? (
        <ul className="mt-1 mb-0 flex list-none flex-wrap gap-x-3 gap-y-1 p-0 text-xs">
          {grave.refs.map((ref) => (
            <li key={ref.url}>
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-grave-mist-300 underline decoration-grave-dark-600 underline-offset-4 hover:text-grave-bone-100"
              >
                {ref.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  )
}