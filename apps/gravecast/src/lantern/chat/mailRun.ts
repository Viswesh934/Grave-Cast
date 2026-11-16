/**
 * One mail run, from the page: send the outbox, fetch what is new, and save
 * both in a single step. The service worker has its own copy of this for
 * sending in the background; keep the two in step (vite/lanternPwa.ts).
 */
import { MAIL_LOCK, MAX_RUN_MESSAGES, MAX_RUN_ROUNDS } from '../../shared/channelContract'
import { postMailRun } from '../../shared/channel'
import { applyRun, getMeta, readOutbox, type RefusedMessage } from './db'

export type RunOutcome =
  | { ok: true; sent: number; refused: RefusedMessage[] }
  | { ok: false; reason: string; code?: string }

const byTime = (a: { sentAt: string }, b: { sentAt: string }) => (a.sentAt < b.sentAt ? -1 : a.sentAt > b.sentAt ? 1 : 0)

async function runRounds(): Promise<RunOutcome> {
  let sent = 0
  const refused: RefusedMessage[] = []
  for (let round = 0; round < MAX_RUN_ROUNDS; round++) {
    const outbox = (await readOutbox()).sort(byTime)
    const batch = outbox.slice(0, MAX_RUN_MESSAGES)
    const cursors = (await getMeta<Record<string, number>>('cursors')) ?? {}
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