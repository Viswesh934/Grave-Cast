/**
 * Turns what the map service sends back into the short list the phone keeps.
 * Pure, so it can be checked without a network.
 */
import { KINDS, type PlaceKind } from './kinds'

/** One thing the map service found. A node has its own position; a way or relation has a centre. */
export interface MapElement {
  type: string
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

export interface Place {
  id: string
  kind: PlaceKind
  name: string | null
  lat: number
  lon: number
  /** Metres from where the list was saved. */
  distanceM: number
  address: string | null
  phone: string | null
}

export interface PlacePack {
  id: 'current'
  /** Where the person was, rounded to about 100 metres. */
  center: { lat: number; lon: number }
  fetchedAt: string
  source: string
  places: Place[]
}

const EARTH_RADIUS_M = 6_371_000
const toRadians = (degrees: number) => (degrees * Math.PI) / 180

/** The distance between two points on the Earth, in metres. */
export const distanceBetween = (a: { lat: number; lon: number }, b: { lat: number; lon: number }): number => {
  const dLat = toRadians(b.lat - a.lat)
  const dLon = toRadians(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h))
}

const clean = (text: string | undefined): string | null => {
  const value = text?.trim()
  return value ? value : null
}

const addressOf = (tags: Record<string, string>): string | null => {
  const full = clean(tags['addr:full'])
  if (full) return full
  const street = [clean(tags['addr:housenumber']), clean(tags['addr:street'])].filter(Boolean).join(' ')
  const area = clean(tags['addr:suburb']) ?? clean(tags['addr:city'])
  return [street, area].filter(Boolean).join(', ') || null
}

const phoneOf = (tags: Record<string, string>): string | null => {
  const first = (clean(tags.phone) ?? clean(tags['contact:phone']))?.split(';')[0]
  return clean(first)
}

/** The nearest places of each kind, kinds in the order the page lists them. */
export function toPlaces(elements: readonly MapElement[], center: { lat: number; lon: number }): Place[] {
  const seen = new Set<string>()
  const byKind = new Map<PlaceKind, Place[]>()

  for (const element of elements) {
    const id = `${element.type}/${element.id}`
    if (seen.has(id)) continue
    seen.add(id)

    const position = element.type === 'node' ? { lat: element.lat, lon: element.lon } : element.center
    if (!position || typeof position.lat !== 'number' || typeof position.lon !== 'number') continue
    const tags = element.tags ?? {}
    const kind = KINDS.find((k) => k.tags.some(([key, value]) => tags[key] === value))
    if (!kind) continue

    const point = { lat: position.lat, lon: position.lon }
    const place: Place = {
      id,
      kind: kind.id,
      name: clean(tags.name) ?? clean(tags['name:en']),
      ...point,
      distanceM: Math.round(distanceBetween(center, point)),
      address: addressOf(tags),
      phone: phoneOf(tags),
    }
    byKind.set(kind.id, [...(byKind.get(kind.id) ?? []), place])
  }

  return KINDS.flatMap((kind) =>
    (byKind.get(kind.id) ?? [])
      .sort((a, b) => a.distanceM - b.distanceM)
      .slice(0, kind.keep),
  )
}