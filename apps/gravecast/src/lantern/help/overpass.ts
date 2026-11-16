/**
 * Asks a public map service (Overpass, which reads OpenStreetMap) what is near a
 * point. The phone asks directly, so Gravecast's own server never sees the location.
 */
import { KINDS } from './kinds'
import type { MapElement } from './normalize'

/** Public Overpass servers, tried in order if one is busy or down. */
const MIRRORS: readonly string[] = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
]

/** How long to wait for one server before trying the next. */
const ATTEMPT_TIMEOUT_MS = 30_000
/** The service's own time limit for a query, in seconds. */
const QUERY_TIMEOUT_S = 25
/** The most of each kind to ask for; the nearest are kept afterwards. */
const MAX_PER_KIND = 150
/** Decimal places kept in a position: three is about 100 metres. */
export const POSITION_DECIMALS = 3

export const roundPosition = (value: number): number => Number(value.toFixed(POSITION_DECIMALS))

/** The query for everything the page lists, around one point. */
export function buildQuery(lat: number, lon: number): string {
  const sets = KINDS.map((kind, i) => {
    const matches = kind.tags.map(([key, value]) => `nwr["${key}"="${value}"](around:${kind.radiusM},${lat},${lon});`).join('')
    return `(${matches})->.k${i};.k${i} out center tags ${MAX_PER_KIND};`
  })
  return `[out:json][timeout:${QUERY_TIMEOUT_S}];${sets.join('')}`
}

export type FetchResult = { ok: true; elements: MapElement[]; mirror: string } | { ok: false; reason: string }

export async function fetchElements(lat: number, lon: number, signal?: AbortSignal): Promise<FetchResult> {
  for (const mirror of MIRRORS) {
    if (signal?.aborted) return { ok: false, reason: 'Stopped.' }
    const attempt = new AbortController()
    const timer = setTimeout(() => attempt.abort(), ATTEMPT_TIMEOUT_MS)
    const stop = () => attempt.abort()
    signal?.addEventListener('abort', stop, { once: true })
    try {
      const response = await fetch(mirror, { method: 'POST', body: new URLSearchParams({ data: buildQuery(lat, lon) }), signal: attempt.signal })
      if (!response.ok) continue
      const json = (await response.json()) as { elements?: unknown; remark?: unknown }
      // A busy server can answer with a partial result and a remark saying it ran out of time or memory.
      if (!Array.isArray(json.elements) || /runtime error/i.test(String(json.remark ?? ''))) continue
      return { ok: true, elements: json.elements as MapElement[], mirror: new URL(mirror).hostname }
    } catch {
      // This server didn't answer in time or at all: try the next one.
    } finally {
      clearTimeout(timer)
      signal?.removeEventListener('abort', stop)
    }
  }
  return { ok: false, reason: 'The map service didn\u2019t answer. It may be busy. Try again in a minute.' }
}