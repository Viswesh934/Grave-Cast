import { useId } from 'react'
import { BoneOssuaryDivider, TombstoneCard, type TombstoneWeathering } from 'groove-ui'
import { CHECKED_ON_SERVER, NOT_CHECKED_YET, verdictFor, type GraveSeverity } from '../linkscan/deviceChecks'
import { hostOf } from '../linkscan/serverScan'
import type { CheckedLink } from './LinkCheck'

/** The more serious the grave, the more weathered its stone. */
const WEATHERING: Record<GraveSeverity, TombstoneWeathering> = {
  danger: 'crumbling',
  warning: 'cracked',
  caution: 'aged',
  note: 'pristine',
}

/** Severity in words too, never by look alone. */
const SEVERITY_WORD: Record<GraveSeverity, string> = {
  danger: 'Serious',
  warning: 'Risky',
  caution: 'Unusual',
  note: 'Note',
}

export interface GraveyardProps {
  result: CheckedLink
}

/** The result of one check: where the link goes, a grave for each problem, and what wasn't checked. */
export function Graveyard({ result }: GraveyardProps) {
  const headingId = useId()
  const { link, graves, server, serverProblem } = result
  const renamed = link.displayHost !== link.host
  const finalHost = server ? hostOf(server.finalUrl) : null
  const forwarded = finalHost !== null && finalHost !== link.host
  const notChecked = server ? NOT_CHECKED_YET : [...CHECKED_ON_SERVER, ...NOT_CHECKED_YET]

  return (
    <section aria-labelledby={headingId} className="mt-16 space-y-10">
      <BoneOssuaryDivider label="The graveyard" pattern="row" size="md" />

      <div className="space-y-2">
        <h2 id={headingId} className="m-0 font-serif text-2xl text-grave-bone-100">
          {verdictFor(graves)}
        </h2>
        <p className="m-0 text-lg text-grave-mist-300">
          This link opens <span className="font-mono break-all text-grave-bone-200">{link.displayHost}</span>
          {renamed && (
            <>
              {' '}(sent as <span className="font-mono break-all">{link.host}</span>)
            </>
          )}
          {forwarded ? (
            <>
              {' '}and ends on <span className="font-mono break-all text-grave-bone-200">{finalHost}</span>.
            </>
          ) : (
            '.'
          )}
        </p>
        {serverProblem && (
          <p className="m-0 text-grave-mist-400">
            The server didn{'\u2019'}t open it: {serverProblem}
          </p>
        )}
      </div>

      {graves.length > 0 && (
        <ul className="m-0 grid list-none items-end gap-x-8 gap-y-16 p-0 pb-6 sm:grid-cols-2">
          {graves.map((grave) => (
            <li key={grave.id}>
              <TombstoneCard
                title={grave.title}
                subtitle={grave.label ?? SEVERITY_WORD[grave.severity]}
                epitaph={grave.detail}
                weathering={WEATHERING[grave.severity]}
              >
                <p className="m-0 text-center font-mono text-sm break-all">{grave.evidence}</p>
              </TombstoneCard>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-lg border border-grave-dark-700 bg-grave-dark-900/80 p-6">
        <h3 className="m-0 text-base font-semibold text-grave-bone-100">Not checked</h3>
        <ul className="mt-3 mb-0 list-disc space-y-1.5 pl-5 text-grave-mist-300">
          {notChecked.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-4 mb-0 text-sm text-grave-mist-400">
          Missing protections are the site owner{'\u2019'}s to fix. They make a site easier to attack, but they don{'\u2019'}t show that this
          link is harmful.
        </p>
      </div>
    </section>
  )
}