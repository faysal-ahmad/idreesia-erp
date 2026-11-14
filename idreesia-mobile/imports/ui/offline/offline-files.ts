import { backendAccounts } from '/imports/startup/backend';

import {
  isFileStorageAvailable,
  readFileAsBlob,
  removeDirectory,
  removeDirectoriesExcept,
  removeFile,
  writeResponseToFile,
} from './cordova-file';

// Files the user chose to keep on the device, for offline use. A module opts
// in by calling saveOfflineFile; nothing is saved automatically.
//
// - The files live in the app's private data directory:
//     offline/<userId>/<feature>/<committeeId>/<itemId>/<fileId>.<ext>
// - A manifest (below) lists them, so screens can show what is available
//   without touching the file system.
// - Everything belongs to the signed-in user, and is wiped on logout.

const ROOT = 'offline';
const MANIFEST_PREFIX = 'idreesia.offline.files.';

export interface OfflineFileEntry {
  /** The module that saved it, e.g. 'documents'. */
  feature: string;
  committeeId: string;
  /** The thing the file belongs to, e.g. a document id. */
  itemId: string;
  /** Identifies the file within the item, e.g. 'v3' for version 3 of a document. */
  fileId: string;
  /** A version number, for items whose files change over time. */
  version?: number;
  name: string;
  fileName: string;
  mimeType: string;
  size: number;
  /** Relative to the app's data directory. */
  path: string;
  savedAt: number;
}

export type NewOfflineFile = Omit<OfflineFileEntry, 'path' | 'savedAt'>;

/** Whether this device can keep files for offline use (Cordova with the file plugin). */
export const isOfflineStorageAvailable = isFileStorageAvailable;

const currentUserId = () => backendAccounts?.userId() ?? null;

// --- Manifest ----------------------------------------------------------------

// Used when localStorage is unavailable, so the app still works this session.
const memoryManifests = new Map<string, OfflineFileEntry[]>();

const readManifest = (userId: string): OfflineFileEntry[] => {
  try {
    const raw = window.localStorage.getItem(MANIFEST_PREFIX + userId);
    if (raw) return JSON.parse(raw) as OfflineFileEntry[];
  } catch {
    // Fall through to the in-memory copy.
  }
  return memoryManifests.get(userId) ?? [];
};

const writeManifest = (userId: string, entries: OfflineFileEntry[]) => {
  memoryManifests.set(userId, entries);
  try {
    window.localStorage.setItem(MANIFEST_PREFIX + userId, JSON.stringify(entries));
  } catch {
    // Keep the in-memory copy.
  }
};

const clearManifests = () => {
  memoryManifests.clear();
  try {
    const keys: string[] = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(MANIFEST_PREFIX)) keys.push(key);
    }
    keys.forEach(key => window.localStorage.removeItem(key));
  } catch {
    // Nothing more to clear.
  }
};

// --- Subscriptions (for React) -----------------------------------------------

const listeners = new Set<() => void>();
const NO_ENTRIES: OfflineFileEntry[] = [];
let snapshotUserId: string | null = null;
let snapshot: OfflineFileEntry[] = NO_ENTRIES;

const refreshSnapshot = () => {
  snapshotUserId = currentUserId();
  snapshot = snapshotUserId ? readManifest(snapshotUserId) : NO_ENTRIES;
  listeners.forEach(listener => listener());
};

export const subscribeOfflineFiles = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** The signed-in user's saved files. The same array until something changes. */
export const getOfflineFilesSnapshot = (): OfflineFileEntry[] => {
  if (snapshotUserId !== currentUserId()) {
    snapshotUserId = currentUserId();
    snapshot = snapshotUserId ? readManifest(snapshotUserId) : NO_ENTRIES;
  }
  return snapshot;
};

// --- Queries -----------------------------------------------------------------

export const listOfflineFiles = (): OfflineFileEntry[] => getOfflineFilesSnapshot();

/** The saved copy of an item's file (by version number, or the first if none is given). */
export const findOfflineFile = (feature: string, itemId: string, version?: number) =>
  getOfflineFilesSnapshot().find(
    entry =>
      entry.feature === feature && entry.itemId === itemId && (version == null || entry.version === version)
  );

export const offlineBytesUsed = (entries: OfflineFileEntry[]) =>
  entries.reduce((total, entry) => total + entry.size, 0);

// --- Saving and removing -----------------------------------------------------

const extensionOf = (fileName: string) => {
  const match = /\.([A-Za-z0-9]{1,10})$/.exec(fileName);
  return match ? `.${match[1].toLowerCase()}` : '';
};

const sameFile = (a: NewOfflineFile, b: OfflineFileEntry) =>
  a.feature === b.feature && a.itemId === b.itemId && a.fileId === b.fileId;

interface SaveOptions {
  /** Called with 0-100 as the file arrives. */
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
  /** Remove the item's other saved files once this one is in (e.g. older versions). Default true. */
  replaceItem?: boolean;
}

/**
 * Downloads a file and keeps it on the device. `download` makes the request
 * (it is called once, with a signal that is aborted on cancel); the response
 * body is streamed to storage. The file's exact `size` is checked.
 */
export const saveOfflineFile = async (
  file: NewOfflineFile,
  download: (signal: AbortSignal) => Promise<Response>,
  { onProgress, signal, replaceItem = true }: SaveOptions = {}
): Promise<OfflineFileEntry> => {
  const userId = currentUserId();
  if (!userId) throw new Error('Sign in to save files for offline use.');
  if (!isFileStorageAvailable()) throw new Error('Saving files on this device is not available.');

  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.addEventListener('abort', cancel);

  const path = `${ROOT}/${userId}/${file.feature}/${file.committeeId}/${file.itemId}/${file.fileId}${extensionOf(
    file.fileName
  )}`;
  try {
    const response = await download(controller.signal);
    if (!response.ok) throw new Error(`The file could not be downloaded (error ${response.status}).`);
    await writeResponseToFile(path, response, {
      expectedSize: file.size,
      signal: controller.signal,
      onProgress: bytes => onProgress?.(file.size ? Math.min(100, Math.round((bytes / file.size) * 100)) : 0),
    });
  } finally {
    signal?.removeEventListener('abort', cancel);
  }

  const entry: OfflineFileEntry = { ...file, path, savedAt: Date.now() };
  const existing = readManifest(userId);
  const superseded = existing.filter(item => (replaceItem ? item.feature === file.feature && item.itemId === file.itemId : sameFile(file, item)));
  writeManifest(userId, [...existing.filter(item => !superseded.includes(item)), entry]);
  refreshSnapshot();

  // The new copy is in; drop the files it replaces (never the one just written).
  await Promise.all(
    superseded.filter(item => item.path !== path).map(item => removeFile(item.path).catch(() => undefined))
  );
  return entry;
};

/** Reads a saved file, ready for URL.createObjectURL. */
export const readOfflineFile = (entry: OfflineFileEntry): Promise<Blob> =>
  readFileAsBlob(entry.path, entry.mimeType);

/** Removes every saved file of one item (e.g. a document). */
export const removeOfflineItem = async (feature: string, itemId: string): Promise<void> => {
  const userId = currentUserId();
  if (!userId) return;
  const existing = readManifest(userId);
  const removed = existing.filter(entry => entry.feature === feature && entry.itemId === itemId);
  if (!removed.length) return;
  writeManifest(
    userId,
    existing.filter(entry => !removed.includes(entry))
  );
  refreshSnapshot();
  await Promise.all(removed.map(entry => removeFile(entry.path).catch(() => undefined)));
};

/** Removes all of the signed-in user's saved files. */
export const removeAllOfflineFiles = async (): Promise<void> => {
  const userId = currentUserId();
  if (!userId) return;
  writeManifest(userId, []);
  refreshSnapshot();
  await removeDirectory(`${ROOT}/${userId}`).catch(() => undefined);
};

/** Deletes every saved file and manifest of every user. For logout: nothing may stay for the next user. */
export const clearOfflineFiles = async (): Promise<void> => {
  clearManifests();
  refreshSnapshot();
  if (!isFileStorageAvailable()) return;
  await removeDirectory(ROOT).catch(() => undefined);
};

/** Deletes files left on the device by other users (e.g. after a session was ended elsewhere). */
export const pruneOfflineFiles = async (): Promise<void> => {
  const userId = currentUserId();
  if (!userId || !isFileStorageAvailable()) return;
  await removeDirectoriesExcept(ROOT, userId).catch(() => undefined);
};
