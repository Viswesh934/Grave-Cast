/**
 * The phone's own copy of Chat, in IndexedDB: the messages it has read (so they
 * open offline), the outbox of messages waiting to send, and small settings.
 * The service worker opens the same database to send the outbox in the background.
 */
import { CHANNEL_DB } from '../../shared/channelContract'
import type { ChannelMessage, OutboxMessage, RejectedMessage } from '../../shared/channel'

type StoreName = (typeof CHANNEL_DB.stores)[keyof typeof CHANNEL_DB.stores]

const { stores } = CHANNEL_DB

/** A message the server refused, kept until the person has seen it. */
export interface RefusedMessage extends RejectedMessage {
  body: string
}

let opening: Promise<IDBDatabase> | null = null

export const openDb = (): Promise<IDBDatabase> => {
  opening ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(CHANNEL_DB.name, CHANNEL_DB.version)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(stores.messages)) db.createObjectStore(stores.messages, { keyPath: 'msgid' })
      if (!db.objectStoreNames.contains(stores.outbox)) db.createObjectStore(stores.outbox, { keyPath: 'msgid' })
      if (!db.objectStoreNames.contains(stores.meta)) db.createObjectStore(stores.meta, { keyPath: 'key' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => {
      opening = null
      reject(request.error)
    }
  })
  return opening
}

const wrap = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

const finished = (tx: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })

export async function getAll<T>(store: StoreName): Promise<T[]> {
  const db = await openDb()
  return wrap<T[]>(db.transaction(store, 'readonly').objectStore(store).getAll())
}

export async function putOne(store: StoreName, value: unknown): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(store, 'readwrite')
  tx.objectStore(store).put(value)
  await finished(tx)
}

export async function getMeta<T>(key: string): Promise<T | undefined> {
  const db = await openDb()
  const row = await wrap<{ key: string; value: T } | undefined>(db.transaction(stores.meta, 'readonly').objectStore(stores.meta).get(key))
  return row?.value
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  await putOne(stores.meta, { key, value })
}

/** Everything one mail run changes, in a single step, so a half-finished run never shows. */
export async function applyRun(run: {
  sent: readonly string[]
  refused: readonly RefusedMessage[]
  messages: readonly ChannelMessage[]
  cursors: Record<string, number>
  serverTime: string
}): Promise<void> {
  const db = await openDb()
  const tx = db.transaction([stores.messages, stores.outbox, stores.meta], 'readwrite')
  const outbox = tx.objectStore(stores.outbox)
  const meta = tx.objectStore(stores.meta)
  for (const msgid of run.sent) outbox.delete(msgid)
  for (const refused of run.refused) outbox.delete(refused.msgid)
  for (const message of run.messages) tx.objectStore(stores.messages).put(message)
  const previous = await wrap<{ value?: RefusedMessage[] } | undefined>(meta.get('refused'))
  if (run.refused.length > 0) meta.put({ key: 'refused', value: [...(previous?.value ?? []), ...run.refused] })
  meta.put({ key: 'cursors', value: run.cursors })
  meta.put({ key: 'lastRunAt', value: run.serverTime })
  await finished(tx)
}

export const readOutbox = (): Promise<OutboxMessage[]> => getAll<OutboxMessage>(stores.outbox)