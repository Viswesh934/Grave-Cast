import { useCallback, useEffect, useRef, useState } from 'react'
import { awsConfig, searchAll } from './awsPlaces'
import { KINDS } from './kinds'
import { roundPosition, type PlacePack } from './normalize'
import { deletePack, loadPack, savePack } from './placesDb'

export type PlacesPhase = 'idle' | 'locating' | 'downloading'

const LOCATE_TIMEOUT_MS = 20_000
const LOCATION_MAY_BE_OLD_MS = 60_000
/** The browser's code for "the person said no". */
const PERMISSION_DENIED = 1

const locate = (): Promise<GeolocationPosition> =>
  new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: LOCATE_TIMEOUT_MS, maximumAge: LOCATION_MAY_BE_OLD_MS }),
  )

const locationProblem = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'code' in error && (error as GeolocationPositionError).code === PERMISSION_DENIED) {
    return 'Location is turned off for this site. Turn it on in your browser\u2019s settings, then try again.'
  }
  return 'Your location couldn\u2019t be found. Try again with location turned on, ideally outside.'
}

/** The saved list of places, and the two things you can do with it: download it, and delete it. */
export function usePlaces() {
  const [pack, setPack] = useState<PlacePack | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [phase, setPhase] = useState<PlacesPhase>('idle')
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const busy = useRef(false)
  const config = awsConfig()

  useEffect(() => {
    let live = true
    loadPack()
      .then((saved) => live && setPack(saved ?? null))
      .catch(() => undefined)
      .finally(() => live && setLoaded(true))
    return () => {
      live = false
    }
  }, [])

  const download = useCallback(async () => {
    if (busy.current) return
    setError(null)
    const settings = awsConfig()
    if (!settings) return setError('Finding places isn\u2019t set up in this version of the app yet.')
    if (!('geolocation' in navigator)) return setError('This browser can\u2019t share your location.')
    if (!navigator.onLine) return setError('You need a connection to download this. Try again when you have one.')
    busy.current = true
    try {
      setPhase('locating')
      const position = await locate().catch((e: unknown) => {
        throw new Error(locationProblem(e))
      })
      const center = { lat: roundPosition(position.coords.latitude), lon: roundPosition(position.coords.longitude) }

      setPhase('downloading')
      setProgress({ done: 0, total: KINDS.length })
      const results = await searchAll(settings, center, (done, total) => setProgress({ done, total }))
      const failed = results.filter((r) => !r.ok)
      const places = results.flatMap((r) => (r.ok ? r.places : []))
      if (failed.length === results.length) throw new Error(failed[0] && !failed[0].ok ? failed[0].reason : 'The places service didn\u2019t answer.')
      if (places.length === 0) throw new Error('No hospitals, clinics, pharmacies, police or fire stations were found near you.')

      const saved: PlacePack = {
        id: 'current',
        center,
        fetchedAt: new Date().toISOString(),
        source: 'Amazon Location Service',
        places,
        missing: failed.map((r) => r.kind),
      }
      // Replace the old list only once the new one is good, so a bad connection never leaves the phone with nothing.
      await savePack(saved)
      setPack(saved)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.')
    } finally {
      busy.current = false
      setPhase('idle')
      setProgress(null)
    }
  }, [])

  const remove = useCallback(async () => {
    await deletePack()
    setPack(null)
    setError(null)
  }, [])

  return { pack, loaded, phase, progress, error, download, remove, configured: config !== null }
}
