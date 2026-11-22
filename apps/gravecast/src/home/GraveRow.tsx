import {
  BestiaryCharacter,
  frankensteinSpec,
  mummySpec,
  goblinSpec,
  vampireSpec,
  type CharacterSpec,
  type TombstoneWeathering,
} from 'groove-ui'
import type { GravePlace, StoryGrave } from './graves'

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
      className={`group flex items-start gap-4 rounded-xl border bg-grave-dark-950/90 p-4 shadow-lg backdrop-blur-md transition-all hover:border-grave-grove-glow/70 hover:shadow-[0_0_20px_rgba(56,189,248,0.12)] ${haunt.border}`}
    >
      <div aria-hidden="true" className="shrink-0 pt-0.5">
        <BestiaryCharacter spec={GUARDIAN[grave.weathering]} size="sm" sound={false} growable={false} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="m-0 flex items-baseline gap-2 text-xs tracking-[0.25em] uppercase font-mono">
            <span className="font-bold text-grave-mist-400">{String(index + 1).padStart(2, '0')}</span>
            <span className={haunt.label}>{grave.label}</span>
          </p>
          <span className="rounded border border-grave-dark-800 bg-grave-dark-900 px-1.5 py-0.2 text-[10px] font-mono text-grave-mist-400 capitalize">
            {grave.weathering}
          </span>
        </div>
        <p className="mt-1 mb-0 font-serif text-lg font-semibold text-grave-bone-100 group-hover:text-grave-grove-glow transition-colors">{grave.title}</p>
        <p className="mt-1 mb-0 text-sm leading-relaxed text-grave-mist-300">{grave.detail}</p>
        {grave.href ? (
          <a
            href={grave.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-block font-mono text-xs break-all text-grave-mist-300 underline decoration-grave-dark-600 underline-offset-4 hover:text-grave-bone-100"
          >
            {grave.evidence}
          </a>
        ) : (
          <p className="mt-1.5 mb-0 font-mono text-xs break-all text-grave-mist-400">{grave.evidence}</p>
        )}
        <GraveDetails grave={grave} />
      </div>
    </li>
  )
}

/** Places shown at once on a grave's card; the rest open with one click, so a long list stays light. */
const PLACES_SHOWN = 5

const linkClass = 'text-grave-mist-300 underline decoration-grave-dark-600 underline-offset-4 hover:text-grave-bone-100'

function Place({ place }: { place: GravePlace }) {
  return (
    <li className="border-t border-grave-dark-700/60 pt-2 first:border-t-0 first:pt-0">
      {place.title ? <p className="m-0 text-sm text-grave-bone-100">{place.title}</p> : null}
      {place.href ? (
        <a href={place.href} target="_blank" rel="noopener noreferrer" className={`font-mono text-xs break-all ${linkClass}`}>
          {place.where}
        </a>
      ) : (
        <p className="m-0 font-mono text-xs break-all text-grave-mist-300">{place.where}</p>
      )}
      {place.note ? <p className="m-0 text-xs text-grave-mist-300">{place.note}</p> : null}
      {place.snippet ? (
        <pre className="mt-1 mb-0 overflow-x-auto rounded-md bg-grave-dark-950/80 px-2 py-1 font-mono text-xs whitespace-pre-wrap break-all text-grave-mist-300">
          {place.snippet}
        </pre>
      ) : null}
      {place.links && place.links.length > 0 ? (
        <p className="m-0 flex flex-wrap gap-x-3 text-xs">
          {place.links.map((link) => (
            <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {link.label}
            </a>
          ))}
        </p>
      ) : null}
    </li>
  )
}

/** Every place a grave's findings were found: the first few, then the rest behind one click. */
function Places({ places }: { places: GravePlace[] }) {
  const first = places.slice(0, PLACES_SHOWN)
  const rest = places.slice(PLACES_SHOWN)
  return (
    <>
      <p className="mt-3 mb-1 text-[0.65rem] tracking-[0.25em] text-grave-mist-400 uppercase">Where ({places.length})</p>
      <ul className="m-0 list-none space-y-2 p-0">
        {first.map((place, i) => (
          <Place key={`${place.where}-${i}`} place={place} />
        ))}
      </ul>
      {rest.length > 0 ? (
        <details className="mt-2">
          <summary className="cursor-pointer text-sm text-grave-bone-100">Show {rest.length} more</summary>
          <ul className="mt-2 mb-0 list-none space-y-2 p-0">
            {rest.map((place, i) => (
              <Place key={`${place.where}-${i + PLACES_SHOWN}`} place={place} />
            ))}
          </ul>
        </details>
      ) : null}
    </>
  )
}

/** The line it was found on, how to fix it, its CWE and OWASP tags, and where to read more. Shown only when the grave has them. */
export function GraveDetails({ grave }: { grave: StoryGrave }) {
  return (
    <>
      {grave.places && grave.places.length > 0 ? <Places places={grave.places} /> : null}
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