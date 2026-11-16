import type { Place } from './normalize'

/** "350 m", "2.4 km", "18 km". */
export const formatDistance = (metres: number): string => {
  if (metres < 1000) return `${Math.max(10, Math.round(metres / 10) * 10)} m`
  const km = metres / 1000
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`
}

/** "12 Nov 2026". */
export const formatDate = (iso: string): string => {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })
}

/** A link a phone's maps app can open, which works with no internet. */
export const geoLink = (place: Place, fallbackName: string): string =>
  `geo:${place.lat},${place.lon}?q=${place.lat},${place.lon}(${encodeURIComponent(place.name ?? fallbackName)})`

/** Coordinates as readable text. */
export const coordinates = (place: Place): string => `${place.lat.toFixed(5)}, ${place.lon.toFixed(5)}`

/** About how big the saved list is. */
export const sizeInKb = (value: unknown): number => Math.max(1, Math.round(JSON.stringify(value).length / 1024))

/** How old a saved list may get before the page asks for a refresh. */
export const STALE_AFTER_DAYS = 30
const DAY_MS = 86_400_000
export const isStale = (iso: string, now = Date.now()): boolean => now - new Date(iso).getTime() > STALE_AFTER_DAYS * DAY_MS