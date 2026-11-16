/**
 * Chat's messages and the calls that move them, shared by the Emergency
 * section (which sends) and the website's demo screen (which only watches).
 */
import { apiUrl, getJson, postJson } from './api'
import { ECHO_PATH, MAIL_RUN_PATH } from './channelContract'

/** A message a phone has written but not yet sent. Its id and time are made on the phone. */
export interface OutboxMessage {
  msgid: string
  area: string
  from: string
  body: string
  sentAt: string
}

/** A message in an echo. `seq` is the server's order. */
export interface ChannelMessage extends OutboxMessage {
  seq: number
  receivedAt: string
}

export interface RejectedMessage {
  msgid: string
  reason: string
}

export interface MailRun {
  accepted: string[]
  rejected: RejectedMessage[]
  messages: ChannelMessage[]
  cursors: Record<string, number>
  more: boolean
  serverTime: string
}

const isString = (v: unknown): v is string => typeof v === 'string'
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

export const readMessage = (value: unknown): ChannelMessage | null => {
  if (typeof value !== 'object' || value === null) return null
  const m = value as Record<string, unknown>
  if (!isNumber(m.seq) || !isString(m.msgid) || !isString(m.area) || !isString(m.from)) return null
  if (!isString(m.body) || !isString(m.sentAt) || !isString(m.receivedAt)) return null
  return { seq: m.seq, msgid: m.msgid, area: m.area, from: m.from, body: m.body, sentAt: m.sentAt, receivedAt: m.receivedAt }
}

const readMessages = (value: unknown): ChannelMessage[] =>
  Array.isArray(value) ? value.map(readMessage).filter((m): m is ChannelMessage => m !== null) : []

const readCursors = (value: unknown): Record<string, number> => {
  const cursors: Record<string, number> = {}
  if (typeof value === 'object' && value !== null) {
    for (const [area, seq] of Object.entries(value)) if (isNumber(seq)) cursors[area] = seq
  }
  return cursors
}

const readRejected = (value: unknown): RejectedMessage[] =>
  Array.isArray(value)
    ? value.flatMap((r) => (typeof r === 'object' && r !== null && isString((r as RejectedMessage).msgid) && isString((r as RejectedMessage).reason) ? [r as RejectedMessage] : []))
    : []

export type Result<T> = { ok: true; value: T } | { ok: false; reason: string; code?: string }

/** Sends the outbox and asks for what is new, in one request. */
export async function postMailRun(messages: readonly OutboxMessage[], cursors: Record<string, number>, signal?: AbortSignal): Promise<Result<MailRun>> {
  const result = await postJson(apiUrl(MAIL_RUN_PATH), { messages, cursors }, signal)
  if (!result.ok) return result
  const b = result.body as Record<string, unknown> | null
  if (!b || !Array.isArray(b.accepted) || !isString(b.serverTime)) return { ok: false, reason: 'The server sent an answer that could not be read.' }
  return {
    ok: true,
    value: {
      accepted: b.accepted.filter(isString),
      rejected: readRejected(b.rejected),
      messages: readMessages(b.messages),
      cursors: readCursors(b.cursors),
      more: b.more === true,
      serverTime: b.serverTime,
    },
  }
}

export interface EchoRead {
  messages: ChannelMessage[]
  cursor: number
  more: boolean
  serverTime: string
}

/** Reads one echo without sending anything. */
export async function fetchEcho(area: string, since: number, signal?: AbortSignal): Promise<Result<EchoRead>> {
  const result = await getJson(apiUrl(`${ECHO_PATH}/${encodeURIComponent(area)}?since=${since}`), signal)
  if (!result.ok) return result
  const b = result.body as Record<string, unknown> | null
  if (!b || !isNumber(b.cursor) || !isString(b.serverTime)) return { ok: false, reason: 'The server sent an answer that could not be read.' }
  return { ok: true, value: { messages: readMessages(b.messages), cursor: b.cursor, more: b.more === true, serverTime: b.serverTime } }
}

const HEX = '0123456789abcdef'

/** `n` random hex digits. */
export const randomHex = (n: number): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(n))
  return Array.from(bytes, (b) => HEX[b % 16]).join('')
}

/** A new message id: the device's eight digits, then eight for the message. */
export const newMsgid = (device: string): string => `${device}@gravecast ${randomHex(8)}`

/** The device a message id came from. */
export const deviceOf = (msgid: string): string => msgid.split('@')[0] ?? ''

const wireDate = (iso: string): string => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : `${d.toISOString().slice(0, 19).replace('T', ' ')} UTC`
}

/**
 * A message as its FidoNet-style headers would show it: the area, who and when,
 * its id, the text, a tear line, and an origin line. It is a view of the same
 * message, not a second copy.
 */
export const wireText = (m: OutboxMessage): string =>
  [
    `AREA:${m.area}`,
    `From: ${m.from}`,
    `Date: ${wireDate(m.sentAt)}`,
    `MSGID: ${m.msgid}`,
    '',
    m.body,
    '',
    '--- Gravecast',
    ` * Origin: Gravecast Emergency (${deviceOf(m.msgid)})`,
  ].join('\n')