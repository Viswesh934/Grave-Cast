/**
 * Asks Amazon Location Service (Places SearchNearby) what is near a point. The
 * phone asks directly with a browser API key, so Gravecast's own server never
 * sees the location. The key is public by nature: in the AWS console it must be
 * limited to `geo-places:SearchNearby`, to our site's addresses, and given an
 * expiry date.
 *
 * Results are saved on the phone for offline use, so every request says
 * `IntendedUse: Storage`. AWS's terms require that for stored results.
 */
import { KINDS, type KindInfo, type PlaceKind } from './kinds'
import { placesFromAws, type AwsResultItem, type Place } from './normalize'

/** How long to wait for one answer. */
const REQUEST_TIMEOUT_MS = 15_000
/** Ask for more than we keep, so the nearest are kept after sorting. AWS allows up to 100. */
const ASK_FOR = 40
/** An AWS region name, such as `us-east-1`. */
const REGION_PATTERN = /^[a-z]{2}(-[a-z]+)+-\d$/

export interface AwsConfig {
  key: string
  region: string
}

/** The key and region from the build settings, or `null` when this build has none. */
export function awsConfig(): AwsConfig | null {
  const key = String(import.meta.env.VITE_AWS_LOCATION_KEY ?? '').trim()
  const region = String(import.meta.env.VITE_AWS_LOCATION_REGION ?? '').trim()
  return key && REGION_PATTERN.test(region) ? { key, region } : null
}

export type KindResult = { kind: PlaceKind; ok: true; places: Place[] } | { kind: PlaceKind; ok: false; reason: string }

const reasonFor = (status: number): string => {
  if (status === 403) return 'The places service refused the request. Its key may not allow this site.'
  if (status === 429) return 'The places service is busy. Try again in a minute.'
  if (status === 400) return 'The places service didn\u2019t accept the request.'
  return 'The places service didn\u2019t answer properly.'
}

async function searchKind(config: AwsConfig, kind: KindInfo, center: { lat: number; lon: number }, signal?: AbortSignal): Promise<KindResult> {
  const attempt = AbortSignal.any([AbortSignal.timeout(REQUEST_TIMEOUT_MS), ...(signal ? [signal] : [])])
  try {
    const response = await fetch(`https://places.geo.${config.region}.amazonaws.com/v2/search-nearby?key=${encodeURIComponent(config.key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        QueryPosition: [center.lon, center.lat],
        QueryRadius: kind.radiusM,
        MaxResults: ASK_FOR,
        Filter: { IncludeCategories: kind.aws },
        AdditionalFeatures: ['Contact'],
        IntendedUse: 'Storage',
        Language: 'en',
      }),
      signal: attempt,
    })
    if (!response.ok) return { kind: kind.id, ok: false, reason: reasonFor(response.status) }
    const json = (await response.json()) as { ResultItems?: unknown }
    const items = Array.isArray(json.ResultItems) ? (json.ResultItems as AwsResultItem[]) : []
    return { kind: kind.id, ok: true, places: placesFromAws(items, kind.id, center, kind.keep) }
  } catch {
    return { kind: kind.id, ok: false, reason: 'The places service didn\u2019t answer in time.' }
  }
}

/**
 * Searches every kind at once and reports each as it finishes.
 * One kind failing doesn't stop the others.
 */
export function searchAll(
  config: AwsConfig,
  center: { lat: number; lon: number },
  onKindDone: (done: number, total: number) => void,
  signal?: AbortSignal,
): Promise<KindResult[]> {
  let done = 0
  return Promise.all(
    KINDS.map(async (kind) => {
      const result = await searchKind(config, kind, center, signal)
      done += 1
      onKindDone(done, KINDS.length)
      return result
    }),
  )
}
