import { useEffect, useState } from 'react'
import { ui } from '../ui'
import { KINDS } from './kinds'
import { coordinates, formatDate, formatDistance, geoLink, isStale, sizeInKb } from './format'
import type { Place } from './normalize'
import { usePlaces } from './usePlaces'

const OSM_COPYRIGHT = 'https://www.openstreetmap.org/copyright'

function PlaceCard({ place }: { place: Place }) {
  const kind = KINDS.find((k) => k.id === place.kind)
  const title = place.name ?? `${kind?.label ?? 'Place'} (no name on the map)`
  return (
    <li className={ui.card}>
      <p className="m-0 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <strong className="text-xl text-grave-bone-100">{title}</strong>
        <span className="text-lg font-semibold text-grave-grove-glow">{formatDistance(place.distanceM)}</span>
      </p>
      {place.address && <p className={`${ui.muted} mt-1 mb-0`}>{place.address}</p>}
      <p className={`${ui.muted} mt-1 mb-0`}>
        {coordinates(place)} {'\u00b7'}{' '}
        <a href={geoLink(place, kind?.label ?? 'Place')} className={ui.link}>
          Open in maps app
        </a>
      </p>
      {place.phone && (
        <p className="mt-2 mb-0 text-lg">
          <a href={`tel:${place.phone.replace(/[^+\d]/g, '')}`} className={ui.link}>
            Call {place.phone}
          </a>
        </p>
      )}
    </li>
  )
}

/** Help near you: places found for your location, saved on this phone. You can delete them. */
export function HelpPage() {
  const { pack, loaded, phase, error, download, remove } = usePlaces()
  const [confirming, setConfirming] = useState(false)
  const working = phase !== 'idle'

  useEffect(() => {
    document.title = 'Help near you \u00b7 Gravecast Lantern'
  }, [])

  return (
    <>
      <h1 className={ui.h1}>Help near you</h1>
      <p className={ui.lead}>
        Hospitals, clinics, pharmacies, police, fire stations, shelters and drinking water around you. Download the list once and it stays on this phone,
        so you can use it with no internet.
      </p>

      <div className={`${ui.card} mt-6`}>
        <h2 className="m-0 text-xl font-bold text-grave-bone-100">Your location stays private</h2>
        <p className={`${ui.muted} mt-1 mb-0`}>
          To find places, your phone sends where you are, rounded to about 100 metres, to a public map service (Overpass, which reads OpenStreetMap). Gravecast
          never receives it. The list is saved on this phone only, and you can delete it at any time.
        </p>
      </div>

      <div className="mt-6" role="status">
        {phase === 'locating' && <p className="m-0 text-lg text-grave-bone-100">Finding where you are{'\u2026'}</p>}
        {phase === 'downloading' && <p className="m-0 text-lg text-grave-bone-100">Finding places near you. This can take up to half a minute{'\u2026'}</p>}
        {error && (
          <p role="alert" className="m-0 rounded-xl border-2 border-grave-bone-200 p-4 text-lg text-grave-bone-100">
            {error}
          </p>
        )}
      </div>

      {loaded && !pack && (
        <button type="button" onClick={() => void download()} disabled={working} className={`${ui.primary} mt-4 w-full sm:w-auto`}>
          {working ? 'Working\u2026' : 'Find help near me'}
        </button>
      )}

      {pack && (
        <>
          <div className={`${ui.card} mt-4`}>
            <p className="m-0 text-lg font-semibold text-grave-bone-100">Saved on this phone: {formatDate(pack.fetchedAt)}</p>
            <p className={`${ui.muted} mt-1 mb-0`}>
              {pack.places.length} places within a few kilometres of {pack.center.lat.toFixed(3)}, {pack.center.lon.toFixed(3)}. About {sizeInKb(pack)} KB.
            </p>
            {isStale(pack.fetchedAt) && (
              <p className="mt-2 mb-0 text-lg font-semibold text-grave-bone-100">This list is over a month old. Update it when you have a connection.</p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={() => void download()} disabled={working} className={ui.secondary}>
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
                    className={ui.primary}
                  >
                    Yes, delete it
                  </button>
                  <button type="button" onClick={() => setConfirming(false)} className={ui.secondary}>
                    Keep it
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => setConfirming(true)} className={ui.secondary}>
                  Delete from this phone
                </button>
              )}
            </div>
            {confirming && <p className={`${ui.muted} mt-3 mb-0`}>This removes the saved list. You can download it again later.</p>}
          </div>

          {KINDS.map((kind) => {
            const places = pack.places.filter((p) => p.kind === kind.id)
            if (places.length === 0) return null
            return (
              <section key={kind.id} aria-labelledby={`kind-${kind.id}`} className="mt-8">
                <h2 id={`kind-${kind.id}`} className={ui.h2}>
                  {kind.group} <span className="text-lg font-normal text-grave-mist-200">({places.length})</span>
                </h2>
                <ul className="mt-3 mb-0 grid list-none gap-3 p-0">
                  {places.map((place) => (
                    <PlaceCard key={place.id} place={place} />
                  ))}
                </ul>
              </section>
            )
          })}
        </>
      )}

      <p className={`${ui.muted} mt-10 mb-0`}>
        Map data {'\u00a9'}{' '}
        <a href={OSM_COPYRIGHT} target="_blank" rel="noopener noreferrer" className={ui.link}>
          OpenStreetMap contributors
        </a>
        . Volunteers edit it, so it can be wrong, out of date or missing places. Shelters in particular are often not mapped. Distances are straight lines
        from where you saved the list. In an emergency, call your local emergency number.
      </p>
    </>
  )
}