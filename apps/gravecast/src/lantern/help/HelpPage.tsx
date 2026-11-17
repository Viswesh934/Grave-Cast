import { useEffect, useState } from 'react'
import { useStatus } from '../statusContext'
import { ui } from '../ui'
import { KINDS } from './kinds'
import { coordinates, directionTo, formatDate, formatDistance, geoLink, isStale, sizeInKb, telLink } from './format'
import type { Place, PlacePack } from './normalize'
import { usePlaces } from './usePlaces'

/** How long "Copied" shows after copying a location. */
const COPIED_MS = 2500

/** A compact action under a place: at least 44 px tall, so it is easy to hit. */
const action =
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-grave-mist-500 bg-grave-dark-800 px-3 text-sm font-semibold text-grave-bone-100 no-underline hover:border-grave-grove-sage hover:bg-grave-dark-750 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-grave-bone-100'

function PlaceRow({ place, center, copied, onCopy }: { place: Place; center: PlacePack['center']; copied: boolean; onCopy: () => void }) {
  const kind = KINDS.find((k) => k.id === place.kind)
  const title = place.name ?? `${kind?.label ?? 'Place'} (no name)`
  const direction = directionTo(center, place)
  return (
    <li className={ui.card}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <strong className="min-w-0 text-base text-grave-bone-100">{title}</strong>
        <span className="shrink-0 text-base font-bold text-grave-bone-100 tabular-nums">
          {formatDistance(place.distanceM)} <span aria-hidden>{direction.short}</span>
          <span className="sr-only">to the {direction.words}</span>
        </span>
      </div>
      {place.address && <p className={`${ui.muted} mt-1 mb-0`}>{place.address}</p>}
      <p className="mt-1 mb-0 font-mono text-xs text-grave-mist-300">{coordinates(place)}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {place.phone && (
          <a href={telLink(place.phone)} className={`${action} border-grave-grove-sage`}>
            Call {place.phone}
          </a>
        )}
        <a href={geoLink(place, kind?.label ?? 'Place')} className={action}>
          Open in maps
        </a>
        <button type="button" onClick={onCopy} className={action}>
          {copied ? 'Copied' : 'Copy location'}
        </button>
      </div>
    </li>
  )
}

/**
 * Help near you: hospitals, clinics, pharmacies, police and fire stations around
 * the person, found once with a connection and saved on the phone. Everything on
 * the saved list works with no internet: distance and compass direction from
 * where it was saved, the address and coordinates, calling (which uses the phone
 * network), and a link to the maps app.
 */
export function HelpPage() {
  const { online } = useStatus()
  const { pack, loaded, phase, progress, error, download, remove, configured } = usePlaces()
  const [confirming, setConfirming] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const working = phase !== 'idle'
  const canDownload = online && configured && !working

  useEffect(() => {
    document.title = 'Help near you \u00b7 Gravecast Lantern'
  }, [])

  useEffect(() => {
    if (!copiedId) return
    const timer = window.setTimeout(() => setCopiedId(null), COPIED_MS)
    return () => window.clearTimeout(timer)
  }, [copiedId])

  const copy = (place: Place) => {
    void navigator.clipboard?.writeText(coordinates(place)).then(
      () => setCopiedId(place.id),
      () => setCopiedId(null),
    )
  }

  const whyNotNow = !configured ? 'Finding places isn\u2019t set up in this version of the app yet.' : !online ? 'Needs a connection. Your saved list still works.' : null
  const missingKinds = (pack?.missing ?? []).map((id) => KINDS.find((k) => k.id === id)?.group.toLowerCase()).filter(Boolean)
  const shown = pack ? KINDS.map((kind) => ({ kind, places: pack.places.filter((p) => p.kind === kind.id) })).filter((g) => g.places.length > 0) : []

  return (
    <div className="max-w-4xl">
      <h1 className={ui.h1}>Help near you</h1>
      <p className={ui.lead}>Hospitals, clinics, pharmacies, police and fire stations near you, saved on this phone so the list opens with no internet.</p>

      <div className="mt-4" role="status">
        {phase === 'locating' && <p className="m-0 text-base text-grave-bone-100">Finding where you are{'\u2026'}</p>}
        {phase === 'downloading' && progress && (
          <p className="m-0 text-base text-grave-bone-100">
            Finding places near you: {progress.done} of {progress.total} kinds done{'\u2026'}
          </p>
        )}
        {error && (
          <p role="alert" className="m-0 rounded-lg border border-grave-grove-brass/60 p-3 text-base text-grave-bone-100">
            {error}
          </p>
        )}
      </div>

      {loaded && !pack && (
        <section aria-labelledby="save-title" className={`${ui.card} mt-4`}>
          <h2 id="save-title" className={ui.h2}>
            Save places near you
          </h2>
          <p className={`${ui.muted} mt-1 mb-0`}>
            Do this once while you have a connection. Your phone sends where you are, rounded to about 100 metres, to Amazon Location Service. Gravecast never
            receives it. The list is saved on this phone only, and you can delete it at any time.
          </p>
          <button type="button" onClick={() => void download()} disabled={!canDownload} className={`${ui.primary} mt-4 w-full sm:w-auto`}>
            {working ? 'Working\u2026' : 'Find and save places near me'}
          </button>
          {whyNotNow && <p className={`${ui.muted} mt-2 mb-0`}>{whyNotNow}</p>}
        </section>
      )}

      {pack && (
        <>
          <section aria-labelledby="saved-title" className="mt-4 rounded-xl border border-grave-grove-sage/60 bg-grave-dark-850 p-4">
            <h2 id="saved-title" className="m-0 flex items-center gap-2 text-base font-semibold text-grave-bone-100">
              <span aria-hidden className="text-grave-grove-sage">
                {'\u2713'}
              </span>
              Saved on this phone. Works with no internet.
            </h2>
            <p className={`${ui.muted} mt-1 mb-0`}>
              Saved {formatDate(pack.fetchedAt)} near {pack.center.lat.toFixed(3)}, {pack.center.lon.toFixed(3)}. {pack.places.length} places, about {sizeInKb(pack)} KB.
            </p>
            {isStale(pack.fetchedAt) && (
              <p className="mt-2 mb-0 text-sm font-semibold text-grave-grove-brass">This list is over a month old. Update it when you have a connection.</p>
            )}
            {missingKinds.length > 0 && (
              <p className="mt-2 mb-0 text-sm text-grave-grove-brass">Couldn{'\u2019'}t search for {missingKinds.join(', ')} this time. Update to try again.</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => void download()} disabled={!canDownload} className={ui.quiet}>
                {working ? 'Working\u2026' : 'Update the list'}
              </button>
              {confirming ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      void remove()
                      setConfirming(false)
                    }}
                    className={ui.quiet}
                  >
                    Yes, delete it
                  </button>
                  <button type="button" onClick={() => setConfirming(false)} className={ui.quiet}>
                    Keep it
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => setConfirming(true)} className={ui.quiet}>
                  Delete from this phone
                </button>
              )}
              {whyNotNow && <span className="text-xs text-grave-mist-300">{whyNotNow}</span>}
            </div>
          </section>

          <nav aria-label="Jump to a kind of place" className="mt-4 flex flex-wrap gap-2">
            {shown.map(({ kind, places }) => (
              <a key={kind.id} href={`#kind-${kind.id}`} className={action}>
                {kind.group} <span className="font-normal text-grave-mist-300">{places.length}</span>
              </a>
            ))}
          </nav>
          <p className={`${ui.muted} mt-3 mb-0`}>
            Distances and directions are straight lines from where you saved the list. Calling uses the phone network, not the internet. Open in maps works with
            no internet only if your maps app has offline maps saved; the coordinates can be typed into any map.
          </p>

          {shown.map(({ kind, places }) => (
            <section key={kind.id} id={`kind-${kind.id}`} aria-labelledby={`kind-${kind.id}-title`} className="mt-6 scroll-mt-4">
              <h2 id={`kind-${kind.id}-title`} className={ui.h2}>
                {kind.group} <span className="text-sm font-normal text-grave-mist-300">({places.length})</span>
              </h2>
              <ul className="mt-2 mb-0 grid list-none gap-2 p-0 lg:grid-cols-2">
                {places.map((place) => (
                  <PlaceRow key={place.id} place={place} center={pack.center} copied={copiedId === place.id} onCopy={() => copy(place)} />
                ))}
              </ul>
            </section>
          ))}
        </>
      )}

      <p className={`${ui.muted} mt-8 mb-0`}>
        Places from {pack?.source ?? 'Amazon Location Service'}. They can be wrong, out of date or missing places, so check before you go. Shelters and drinking
        water aren{'\u2019'}t listed yet. In an emergency, call your local emergency number.
      </p>
    </div>
  )
}
