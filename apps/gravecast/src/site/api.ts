/**
 * Calls to Gravecast's own API. In development Vite forwards `/api` to the
 * local server; a deployed site sets `VITE_API_URL` to the API's address.
 */

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

/** How long to wait for the API before giving up. Scans are bounded on the server too. */
export const API_TIMEOUT_MS = 60_000

export const apiUrl = (path: string): string => `${API_BASE}${path}`

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

/** POSTs JSON. Never throws: every failure comes back as a reason in plain words. */
export async function postJson(url: string, payload: unknown, signal?: AbortSignal): Promise<ApiResult> {
  const timeout = AbortSignal.timeout(API_TIMEOUT_MS)
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout
  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: combined,
    })
  } catch {
    if (signal?.aborted) return { ok: false, reason: 'Stopped.', code: 'ABORTED' }
    if (timeout.aborted) return { ok: false, reason: 'The server took too long to answer.' }
    return { ok: false, reason: 'Gravecast\u2019s server couldn\u2019t be reached.' }
  }
  let body: unknown = null
  try {
    body = await response.json()
  } catch {
    body = null
  }
  if (response.ok) return { ok: true, body }
  const { message, code } = readError(body)
  return { ok: false, reason: message ?? `The server answered with an error (${response.status}).`, code }
}