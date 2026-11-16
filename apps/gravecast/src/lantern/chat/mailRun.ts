/**
 * One mail run, from the page: send the outbox, fetch what is new, and save
 * both in a single step. The service worker has its own copy of this for
 * sending in the background; keep the two in step (vite/lanternPwa.ts).
 */
import { BUILTIN_ECHOES, MAIL_LOCK, MAX_FOLLOWED_ECHOES, MAX_RUN_MESSAGES, MAX_RUN_ROUNDS, META_KEYS } from '../../shared/channelContract'
import { postMailRun } from '../../shared/channel'
import { applyRun, getMeta, readOutbox, type RefusedMessage } from './db'

export type RunOutcome =
  | { ok: true; sent: number; refused: RefusedMessage[] }
  | { ok: false; reason: string; code?: string }

const byTime = (a: { sentAt: string }, b: { sentAt: string }) => (a.sentAt < b.sentAt ? -1 : a.sentAt > b.sentAt ? 1 : 0)

/**
 * The place markers to send: one per followed echo (the built-in ones, then the
 * joined ones), starting at 0 for a channel just joined. Echoes the phone has
 * left are dropped, so the server stops sending them.
 */
export const followedCursors = (stored: Record<string, number>, joined: readonly string[]): Record<string, number> => {
  const cursors: Record<string, number> = {}
  for (const area of [...new Set([...BUILTIN_ECHOES, ...joined])].slice(0, MAX_FOLLOWED_ECHOES)) cursors[area] = stored[area] ?? 0
  return cursors
}

async function runRounds(): Promise<RunOutcome> {
  let sent = 0
  const refused: RefusedMessage[] = []
  for (let round = 0; round < MAX_RUN_ROUNDS; round++) {
    const outbox = (await readOutbox()).sort(byTime)
    const batch = outbox.slice(0, MAX_RUN_MESSAGES)
    const joined = (await getMeta<string[]>(META_KEYS.joined)) ?? []
    const cursors = followedCursors((await getMeta<Record<string, number>>(META_KEYS.cursors)) ?? {}, joined)
    const result = await postMailRun(batch, cursors)
    if (!result.ok) return result

    const { accepted, rejected, messages, cursors: next, serverTime, more } = result.value
    const bodies = new Map(batch.map((m) => [m.msgid, m.body]))
    const refusedNow = rejected.map((r) => ({ ...r, body: bodies.get(r.msgid) ?? '' }))
    await applyRun({ sent: accepted, refused: refusedNow, messages, cursors: { ...cursors, ...next }, serverTime })
    sent += accepted.length
    refused.push(...refusedNow)

    const leftInOutbox = outbox.length - accepted.length - rejected.length
    if (!more && leftInOutbox <= 0) break
  }
  return { ok: true, sent, refused }
}

/** Makes one mail run. Two at once would only repeat each other, so a second waits for the first. */
export const mailRun = (): Promise<RunOutcome> => (navigator.locks ? navigator.locks.request(MAIL_LOCK, runRounds) : runRounds())