import { ApolloLink } from '@apollo/client';
import type { InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { tap } from 'rxjs';

import { backendAccounts } from './backend';

// Keeps the Apollo cache on the device, so what the user has already browsed
// can be read offline after the app is closed and reopened.
//
// - The cache is saved to IndexedDB shortly after query results arrive, and
//   immediately when the app goes to the background.
// - It is restored once, before the first render (restoreApolloCache).
// - It belongs to one user: a different (or no) signed-in user discards it,
//   and logout wipes it (clearPersistedCache).
// - apollo3-cache-persist is not used: it targets Apollo Client 3.

const DB_NAME = 'idreesia-offline';
const STORE_NAME = 'apollo';
const RECORD_KEY = 'cache';

/** Bump when persisted data can no longer be read by the app (e.g. type changes). */
export const CACHE_SCHEMA_VERSION = 1;

const SAVE_DELAY_MS = 2000;
const RESTORE_TIMEOUT_MS = 3000;

interface CacheRecord {
  userId: string;
  schemaVersion: number;
  savedAt: number;
  data: NormalizedCacheObject;
}

let cacheRef: InMemoryCache | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let generation = 0;

const openDb = (): Promise<IDBDatabase | null> =>
  new Promise(resolve => {
    if (typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });

/** Runs one request in a transaction; resolves to undefined if storage fails. */
const withStore = async <T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T | undefined> => {
  const db = await openDb();
  if (!db) return undefined;
  return new Promise<T | undefined>(resolve => {
    try {
      const transaction = db.transaction(STORE_NAME, mode);
      const request = run(transaction.objectStore(STORE_NAME));
      transaction.oncomplete = () => {
        db.close();
        resolve(request.result);
      };
      transaction.onerror = () => {
        db.close();
        resolve(undefined);
      };
      transaction.onabort = () => {
        db.close();
        resolve(undefined);
      };
    } catch {
      db.close();
      resolve(undefined);
    }
  });
};

const readRecord = () => withStore<CacheRecord | undefined>('readonly', store => store.get(RECORD_KEY));

const writeRecord = (record: CacheRecord) =>
  withStore('readwrite', store => store.put(record, RECORD_KEY));

/** Deletes the saved cache and cancels any save that is waiting. */
export const clearPersistedCache = async () => {
  generation += 1;
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  await withStore('readwrite', store => store.delete(RECORD_KEY));
};

const saveNow = async () => {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  const userId = backendAccounts?.userId();
  if (!cacheRef || !userId) return;
  const startedIn = generation;
  try {
    const record: CacheRecord = {
      userId,
      schemaVersion: CACHE_SCHEMA_VERSION,
      savedAt: Date.now(),
      data: cacheRef.extract(),
    };
    // A logout during extract() must not bring the data back.
    if (startedIn !== generation) return;
    await writeRecord(record);
  } catch {
    // Persistence is best effort; the app works without it.
  }
};

const scheduleSave = () => {
  if (saveTimer || !backendAccounts?.userId()) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    saveNow().catch(() => undefined);
  }, SAVE_DELAY_MS);
};

/** Saves the cache after every response, so no change waits for the app to close. */
export const persistLink = new ApolloLink((operation, forward) =>
  forward(operation).pipe(tap({ next: scheduleSave }))
);

/** Starts saving `cache`, and saves at once when the app is backgrounded. */
export const startApolloPersistence = (cache: InMemoryCache) => {
  cacheRef = cache;
  if (typeof document === 'undefined') return;
  const flush = () => {
    saveNow().catch(() => undefined);
  };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
  // Cordova's "pause" and the page lifecycle's "pagehide" cover the cases
  // where visibilitychange does not fire before the app is suspended.
  document.addEventListener('pause', flush);
  window.addEventListener('pagehide', flush);
};

/**
 * Loads the saved cache into the client. Call once before the first render.
 * Never throws, and gives up after a few seconds rather than delaying launch.
 */
export const restoreApolloCache = async () => {
  const cache = cacheRef;
  if (!cache) return;
  try {
    const record = await Promise.race([
      readRecord(),
      new Promise<undefined>(resolve => {
        setTimeout(() => resolve(undefined), RESTORE_TIMEOUT_MS);
      }),
    ]);
    if (!record) return;
    const userId = backendAccounts?.userId();
    if (!userId || record.userId !== userId || record.schemaVersion !== CACHE_SCHEMA_VERSION) {
      await clearPersistedCache();
      return;
    }
    cache.restore(record.data);
  } catch {
    // A damaged or unreadable cache is the same as no cache.
  }
};
