/**
 * The Crypt: keeps things on this device with IndexedDB, and shows what the site stores.
 * @module grimoire/rites/crypt
 */

import { defineCapability } from '../core/capability';
import { defineRite } from '../core/rite';

/** Storing things on the device. */
export const cryptCapability = defineCapability({
  id: 'crypt',
  label: 'IndexedDB',
  detect: () => typeof indexedDB !== 'undefined',
});

export const cryptRite = defineRite({
  id: 'crypt',
  name: 'Crypt',
  tagline: 'Buries things on this device, so they are still there when the page comes back.',
  sigil: 'coffin',
  accent: 'candle',
  family: 'keeping',
  support: {
    chromium: 'full',
    firefox: 'full',
    safari: 'full',
    note: 'Private windows may forget everything when they close.',
  },
  capability: cryptCapability,
});

/**
 * Options for {@link openCrypt}.
 */
export interface CryptOptions {
  /** The database name. */
  name: string;
  /** Raise it when adding stores. @default 1 */
  version?: number;
  /** The stores (like tables) the database holds. */
  stores: readonly string[];
}

/** One stored item. */
export interface CryptEntry<T> {
  key: IDBValidKey;
  value: T;
}

/**
 * An open crypt, from {@link openCrypt}. Every method waits until the
 * change is safely stored.
 */
export interface Crypt {
  readonly name: string;
  /** Stores `value` under `key`, replacing anything there. */
  bury: <T>(store: string, key: IDBValidKey, value: T) => Promise<void>;
  /** Reads what is under `key`, or `undefined`. */
  exhume: <T>(store: string, key: IDBValidKey) => Promise<T | undefined>;
  /** Everything in a store, in key order. */
  list: <T>(store: string) => Promise<CryptEntry<T>[]>;
  /** Removes one item. */
  forget: (store: string, key: IDBValidKey) => Promise<void>;
  /** Removes everything in a store. */
  clear: (store: string) => Promise<void>;
  /** Closes the database. */
  close: () => void;
}

const settle = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const finished = (transaction: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error ?? new DOMException('The change was cancelled.', 'AbortError'));
  });

const wrap = (database: IDBDatabase, name: string): Crypt => {
  const run = async <R>(store: string, mode: IDBTransactionMode, work: (objects: IDBObjectStore) => Promise<R>): Promise<R> => {
    const transaction = database.transaction(store, mode);
    const done = finished(transaction);
    const result = await work(transaction.objectStore(store));
    await done;
    return result;
  };

  return {
    name,
    bury: (store, key, value) => run(store, 'readwrite', async (objects) => void (await settle(objects.put(value, key)))),
    exhume: (store, key) => run(store, 'readonly', (objects) => settle(objects.get(key))),
    list: (store) =>
      run(store, 'readonly', async (objects) => {
        const [keys, values] = await Promise.all([settle(objects.getAllKeys()), settle(objects.getAll())]);
        return keys.map((key, index) => ({ key, value: values[index] }));
      }),
    forget: (store, key) => run(store, 'readwrite', async (objects) => void (await settle(objects.delete(key)))),
    clear: (store) => run(store, 'readwrite', async (objects) => void (await settle(objects.clear()))),
    close: () => database.close(),
  };
};

/**
 * Opens (or creates) an IndexedDB database with the given stores, wrapped in
 * simple promises.
 *
 * - New stores are created when `version` goes up.
 * - If another tab upgrades the database, this connection closes itself
 *   instead of blocking it.
 *
 * @example
 * ```ts
 * const crypt = await openCrypt({ name: 'notes', stores: ['notes'] });
 * await crypt.bury('notes', 'today', { text: 'Buy candles' });
 * const note = await crypt.exhume('notes', 'today');
 * ```
 */
export const openCrypt = ({ name, version = 1, stores }: CryptOptions): Promise<Crypt> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    request.onupgradeneeded = () => {
      const database = request.result;
      for (const store of stores) if (!database.objectStoreNames.contains(store)) database.createObjectStore(store);
    };
    request.onblocked = () => reject(new DOMException('Another tab is holding the crypt open.', 'InvalidStateError'));
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => database.close();
      resolve(wrap(database, name));
    };
  });

/**
 * What this site stores on the device, from {@link inspectStorage}. Each
 * value is `null` where the browser does not say.
 */
export interface StorageReport {
  /** Bytes used by this site. */
  usage: number | null;
  /** Bytes this site may use. */
  quota: number | null;
  /** Whether the browser promised not to clear this site's storage on its own. */
  persisted: boolean | null;
  /** IndexedDB databases, where the browser can list them. */
  databases: { name: string; version: number }[] | null;
  /** Keys in localStorage and sessionStorage. */
  localKeys: number | null;
  sessionKeys: number | null;
  /** Cache Storage caches (used by service workers). */
  caches: string[] | null;
  /** Cookies this page can read. Cookies marked HttpOnly are hidden from pages. */
  cookies: number;
}

const attempt = async <T>(work: () => Promise<T> | T): Promise<T | null> => {
  try {
    return await work();
  } catch {
    return null;
  }
};

/**
 * Looks at everything this site keeps on the device: storage used and
 * allowed, IndexedDB databases, web storage, caches, and readable cookies.
 * Nothing is changed and nothing is sent anywhere.
 */
export const inspectStorage = async (): Promise<StorageReport> => {
  const storage = typeof navigator !== 'undefined' ? navigator.storage : undefined;
  const estimate = await attempt(() => storage?.estimate?.() ?? null);
  const persisted = await attempt(() => storage?.persisted?.() ?? null);
  const listDatabases = (indexedDB as IDBFactory & { databases?: () => Promise<IDBDatabaseInfo[]> }).databases;
  const databases = await attempt(async () =>
    typeof listDatabases === 'function'
      ? (await listDatabases.call(indexedDB)).map((info) => ({ name: info.name ?? '', version: info.version ?? 0 }))
      : null
  );
  const cacheNames = await attempt(() => (typeof caches !== 'undefined' ? caches.keys() : null));
  const localKeys = await attempt(() => (typeof localStorage !== 'undefined' ? localStorage.length : null));
  const sessionKeys = await attempt(() => (typeof sessionStorage !== 'undefined' ? sessionStorage.length : null));
  const cookieText = typeof document !== 'undefined' ? document.cookie : '';
  return {
    usage: estimate?.usage ?? null,
    quota: estimate?.quota ?? null,
    persisted,
    databases,
    localKeys,
    sessionKeys,
    caches: cacheNames,
    cookies: cookieText.split(';').filter((part) => part.trim() !== '').length,
  };
};

/**
 * Asks the browser to keep this site's storage until the user clears it.
 * Resolves `true` if granted, `false` if refused, or `null` where browsers
 * cannot be asked. Call it from a click.
 */
export const requestPersistence = async (): Promise<boolean | null> => {
  const storage = typeof navigator !== 'undefined' ? navigator.storage : undefined;
  if (typeof storage?.persist !== 'function') return null;
  return attempt(() => storage.persist());
};
