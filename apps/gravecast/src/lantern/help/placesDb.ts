/**
 * The saved list of places, in the phone's own storage. It is its own small
 * database, apart from Chat's, so deleting it touches nothing else.
 */
import type { PlacePack } from './normalize'

const DB_NAME = 'gravecast-places'
const DB_VERSION = 1
const STORE = 'packs'
const KEY = 'current'

const open = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

async function run<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open()
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode)
      const request = work(tx.objectStore(STORE))
      tx.oncomplete = () => resolve(request.result)
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  } finally {
    db.close()
  }
}

export const loadPack = (): Promise<PlacePack | undefined> => run('readonly', (store) => store.get(KEY) as IDBRequest<PlacePack | undefined>)
export const savePack = (pack: PlacePack): Promise<IDBValidKey> => run('readwrite', (store) => store.put(pack))
export const deletePack = (): Promise<undefined> => run('readwrite', (store) => store.delete(KEY))