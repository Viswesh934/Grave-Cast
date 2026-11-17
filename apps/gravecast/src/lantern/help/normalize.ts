/**
 * The short list of places the phone keeps, and turning what Amazon Location
 * Service sends back into it. Pure, so it can be checked without a network.
 */
import type { PlaceKind } from './kinds'

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
  /** Kinds that couldn't be searched this time. Lists saved before this field existed have none. */
  missing?: PlaceKind[]
}

/** Decimal places kept in a position: three is about 100 metres. */
export const POSITION_DECIMALS = 3
export const roundPosition = (value: number): number => Number(value.toFixed(POSITION_DECIMALS))

const EARTH_RADIUS_M = 6_371_000
const toRadians = (degrees: number) => (degrees * Math.PI) / 180
const toDegrees = (radians: number) => (radians * 180) / Math.PI

/** The distance between two points on the Earth, in metres. */
export const distanceBetween = (a: { lat: number; lon: number }, b: { lat: number; lon: number }): number => {
  const dLat = toRadians(b.lat - a.lat)
  const dLon = toRadians(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h))
}

/** The compass bearing from one point to another, in degrees from north (0 up to 360). */
export const bearingBetween = (a: { lat: number; lon: number }, b: { lat: number; lon: number }): number => {
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)
  const dLon = toRadians(b.lon - a.lon)
  const y = Math.sin(dLon) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)
  return (toDegrees(Math.atan2(y, x)) + 360) % 360
}

/** The part of one Amazon Location Service SearchNearby result that the page uses. */
export interface AwsResultItem {
  PlaceId?: string
  Title?: string
  Position?: number[]
  Address?: { Label?: string }
  Contacts?: { Phones?: { Value?: string }[] }
}

const clean = (text: string | undefined | null): string | null => {
  const value = text?.trim()
  return value ? value : null
}

/** AWS's address label starts with the place's own name; drop it so the address doesn't repeat the title. */
const addressWithoutName = (label: string | null, name: string | null): string | null => {
  if (!label) return null
  if (name && label.startsWith(`${name}, `)) return clean(label.slice(name.length + 2))
  return label
}

/** One kind's results, as places: those with a position, each once, nearest first, at most `keep`. */
export function placesFromAws(items: readonly AwsResultItem[], kind: PlaceKind, center: { lat: number; lon: number }, keep: number): Place[] {
  const seen = new Set<string>()
  const places: Place[] = []
  for (const item of items) {
    const [lon, lat] = item.Position ?? []
    if (typeof lat !== 'number' || typeof lon !== 'number' || !item.PlaceId || seen.has(item.PlaceId)) continue
    seen.add(item.PlaceId)
    const name = clean(item.Title)
    places.push({
      id: `aws/${item.PlaceId}`,
      kind,
      name,
      lat,
      lon,
      distanceM: Math.round(distanceBetween(center, { lat, lon })),
      address: addressWithoutName(clean(item.Address?.Label), name),
      phone: clean(item.Contacts?.Phones?.find((p) => clean(p.Value))?.Value),
    })
  }
  return places.sort((a, b) => a.distanceM - b.distanceM).slice(0, keep)
}
