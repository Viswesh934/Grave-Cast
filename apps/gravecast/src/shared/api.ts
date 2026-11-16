/**
 * Calls to Gravecast's own API, shared by the website and Lantern.
 * In development Vite forwards `/api` to the local server; a deployed site sets
 * `VITE_API_URL` to the API's address. Written without newer browser features,
 * because the installed app may run on an older phone.
 */

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

/** How long to wait for the API before giving up. Scans are bounded on the server too. */
export const API_TIMEOUT_MS = 60_000

export const apiUrl = (path: string): string => `${API_BASE}${path}`

/** What the person is told when the server can't be reached (no network, or a gateway that can't reach it). */
const UNREACHABLE_TEXT = 'Gravecast’s server couldn’t be reached.'
/** Statuses a gateway or proxy answers with when the server behind it is down. */
const GATEWAY_STATUSES = new Set([502, 503, 504])

export type ApiResult = { ok: true; body: unknown } | { ok: false; reason: string; code?: string }

const readError = (body: unknown): { message?: string; code?: string } => {
  if (typeof body !== 'object' || body === null) return {}
  const error = (body as { error?: unknown }).error
  if (typeof error !== 'object' || error === null) return {}
  const { message, code } = error as { message?: unknown; code?: unknown }
  return {
    message: typeof message === 'string' ? message : undefined,
    code: typeof code === 'string' ? code : undefined,
  }
}

/** Sends one request. Never throws: every failure comes back as a reason in plain words. */
async function request(url: string, init: RequestInit, signal?: AbortSignal): Promise<ApiResult> {
  const controller = new AbortController()
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, API_TIMEOUT_MS)
  const onAbort = () => controller.abort()
  if (signal?.aborted) controller.abort()
  else signal?.addEventListener('abort', onAbort, { once: true })

  try {
    let response: Response
    try {
      response = await fetch(url, { ...init, signal: controller.signal })
    } catch {
      if (signal?.aborted) return { ok: false, reason: 'Stopped.', code: 'ABORTED' }
      if (timedOut) return { ok: false, reason: 'The server took too long to answer.', code: 'TIMEOUT' }
      return { ok: false, reason: UNREACHABLE_TEXT, code: 'UNREACHABLE' }
    }
    let body: unknown = null
    try {
      body = await response.json()
    } catch {
      body = null
    }
    if (response.ok) return { ok: true, body }
    const { message, code } = readError(body)
    // A gateway or proxy that can't reach Gravecast's server answers 502, 503 or 504 without a message of ours.
    if (!message && GATEWAY_STATUSES.has(response.status)) return { ok: false, reason: UNREACHABLE_TEXT, code: 'UNREACHABLE' }
    return { ok: false, reason: message ?? `The server answered with an error (${response.status}).`, code }
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onAbort)
  }
}

/** POSTs JSON. */
export const postJson = (url: string, payload: unknown, signal?: AbortSignal): Promise<ApiResult> =>
  request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }, signal)

/** GETs JSON. */
export const getJson = (url: string, signal?: AbortSignal): Promise<ApiResult> => request(url, { method: 'GET' }, signal)