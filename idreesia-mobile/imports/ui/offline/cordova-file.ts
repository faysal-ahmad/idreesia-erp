// A small promise wrapper over cordova-plugin-file. Paths here are relative to
// the app's private data directory (cordova.file.dataDirectory), because the
// absolute path of that directory can change when the app is updated on iOS.
//
// Everything is a no-op / unavailable outside a Cordova app (e.g. in a
// desktop browser while developing).

interface FileErrorLike {
  code?: number;
}

interface FileWriterLike {
  onwrite: (() => void) | null;
  onerror: ((event: unknown) => void) | null;
  write: (data: Blob) => void;
}

interface EntryLike {
  isFile: boolean;
  name: string;
  remove: (success: () => void, error: (error: FileErrorLike) => void) => void;
}

interface FileEntryLike extends EntryLike {
  file: (success: (file: File) => void, error: (error: FileErrorLike) => void) => void;
  createWriter: (success: (writer: FileWriterLike) => void, error: (error: FileErrorLike) => void) => void;
  moveTo: (
    parent: DirectoryEntryLike,
    newName: string,
    success: (entry: FileEntryLike) => void,
    error: (error: FileErrorLike) => void
  ) => void;
}

interface DirectoryReaderLike {
  readEntries: (success: (entries: EntryLike[]) => void, error: (error: FileErrorLike) => void) => void;
}

interface DirectoryEntryLike extends EntryLike {
  getDirectory: (
    path: string,
    options: { create?: boolean },
    success: (entry: DirectoryEntryLike) => void,
    error: (error: FileErrorLike) => void
  ) => void;
  getFile: (
    path: string,
    options: { create?: boolean },
    success: (entry: FileEntryLike) => void,
    error: (error: FileErrorLike) => void
  ) => void;
  createReader: () => DirectoryReaderLike;
  removeRecursively: (success: () => void, error: (error: FileErrorLike) => void) => void;
}

interface CordovaWindow {
  cordova?: { file?: { dataDirectory?: string } };
  resolveLocalFileSystemURL?: (
    url: string,
    success: (entry: DirectoryEntryLike) => void,
    error: (error: FileErrorLike) => void
  ) => void;
}

const cordovaWindow = () => (typeof window === 'undefined' ? {} : window) as CordovaWindow;

/** FileError.NOT_FOUND_ERR */
const NOT_FOUND = 1;

/** Whether cordova-plugin-file is loaded, i.e. files can be kept on the device. */
export const isFileStorageAvailable = (): boolean => {
  const { cordova, resolveLocalFileSystemURL } = cordovaWindow();
  return !!cordova?.file?.dataDirectory && typeof resolveLocalFileSystemURL === 'function';
};

const toError = (error: FileErrorLike | undefined, action: string) =>
  Object.assign(new Error(`Could not ${action} on this device.`), { fileErrorCode: error?.code });

const isNotFound = (error: unknown) => (error as { fileErrorCode?: number })?.fileErrorCode === NOT_FOUND;

const getRoot = () =>
  new Promise<DirectoryEntryLike>((resolve, reject) => {
    const { cordova, resolveLocalFileSystemURL } = cordovaWindow();
    const root = cordova?.file?.dataDirectory;
    if (!root || !resolveLocalFileSystemURL) {
      reject(new Error('Saving files on this device is not available.'));
      return;
    }
    resolveLocalFileSystemURL(root, resolve, error => reject(toError(error, 'open storage')));
  });

const getChildDirectory = (parent: DirectoryEntryLike, name: string, create: boolean) =>
  new Promise<DirectoryEntryLike>((resolve, reject) => {
    parent.getDirectory(name, { create }, resolve, error => reject(toError(error, 'open a folder')));
  });

const getChildFile = (parent: DirectoryEntryLike, name: string, create: boolean) =>
  new Promise<FileEntryLike>((resolve, reject) => {
    parent.getFile(name, { create }, resolve, error => reject(toError(error, 'open a file')));
  });

/** Opens (and with `create`, makes) a nested directory under the data directory. */
const getDirectory = async (relativeDir: string, create: boolean) => {
  let directory = await getRoot();
  for (const segment of relativeDir.split('/').filter(Boolean)) {
    directory = await getChildDirectory(directory, segment, create);
  }
  return directory;
};

const splitPath = (relativePath: string) => {
  const index = relativePath.lastIndexOf('/');
  return index === -1
    ? { dir: '', name: relativePath }
    : { dir: relativePath.slice(0, index), name: relativePath.slice(index + 1) };
};

const removeEntry = (entry: EntryLike) =>
  new Promise<void>((resolve, reject) => {
    entry.remove(resolve, error => reject(toError(error, 'remove a file')));
  });

const writeBlob = (writer: FileWriterLike, data: Blob) =>
  new Promise<void>((resolve, reject) => {
    Object.assign(writer, {
      onwrite: () => resolve(),
      onerror: () => reject(new Error('Could not write the file on this device.')),
    });
    writer.write(data);
  });

const createWriter = (entry: FileEntryLike) =>
  new Promise<FileWriterLike>((resolve, reject) => {
    entry.createWriter(resolve, error => reject(toError(error, 'write a file')));
  });

const moveEntry = (entry: FileEntryLike, parent: DirectoryEntryLike, name: string) =>
  new Promise<FileEntryLike>((resolve, reject) => {
    entry.moveTo(parent, name, resolve, error => reject(toError(error, 'save a file')));
  });

/** Bytes are collected up to this size before each native write, to keep bridge calls few. */
const WRITE_CHUNK_BYTES = 1024 * 1024;

interface WriteOptions {
  /** The exact size the file should have; a different length fails the write. */
  expectedSize?: number;
  onProgress?: (bytesWritten: number) => void;
  signal?: AbortSignal;
}

/**
 * Streams a fetch Response to `relativePath`. It is written to a ".part" file
 * first and moved into place when complete, so a failed or cancelled download
 * never leaves a half file under the real name. Resolves to the size written.
 */
export const writeResponseToFile = async (
  relativePath: string,
  response: Response,
  { expectedSize, onProgress, signal }: WriteOptions = {}
): Promise<number> => {
  const { dir, name } = splitPath(relativePath);
  const directory = await getDirectory(dir, true);
  const partName = `${name}.part`;

  // Start from nothing: a leftover .part from an earlier attempt must not be appended to.
  await getChildFile(directory, partName, false).then(removeEntry, () => undefined);
  const partEntry = await getChildFile(directory, partName, true);

  try {
    const writer = await createWriter(partEntry);
    let received = 0;
    const abortIfCancelled = () => {
      if (signal?.aborted) throw new DOMException('The download was cancelled.', 'AbortError');
    };

    const reader = response.body?.getReader();
    if (reader) {
      let pending: Uint8Array[] = [];
      let pendingBytes = 0;
      const flush = async () => {
        if (!pendingBytes) return;
        const chunk = new Blob(pending as BlobPart[]);
        pending = [];
        pendingBytes = 0;
        await writeBlob(writer, chunk);
      };
      for (;;) {
        abortIfCancelled();
        const { done, value } = await reader.read();
        if (done) break;
        pending.push(value);
        pendingBytes += value.length;
        received += value.length;
        onProgress?.(received);
        if (pendingBytes >= WRITE_CHUNK_BYTES) await flush();
      }
      await flush();
    } else {
      // No streaming support: fall back to holding the whole file.
      const blob = await response.blob();
      abortIfCancelled();
      await writeBlob(writer, blob);
      received = blob.size;
      onProgress?.(received);
    }

    if (expectedSize != null && received !== expectedSize) {
      throw new Error('The download was incomplete. Try again.');
    }
    await moveEntry(partEntry, directory, name);
    return received;
  } catch (error) {
    await removeEntry(partEntry).catch(() => undefined);
    throw error;
  }
};

/**
 * Reads a saved file into a Blob that can be shown with URL.createObjectURL.
 * It goes through the plugin's FileReader (which replaces the browser's),
 * because the web view can't open the file:// URL directly.
 */
export const readFileAsBlob = async (relativePath: string, mimeType: string): Promise<Blob> => {
  const { dir, name } = splitPath(relativePath);
  const directory = await getDirectory(dir, false);
  const entry = await getChildFile(directory, name, false);
  const file = await new Promise<File>((resolve, reject) => {
    entry.file(resolve, error => reject(toError(error, 'read a file')));
  });
  const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Could not read the file on this device.'));
    reader.readAsArrayBuffer(file);
  });
  return new Blob([buffer], { type: mimeType });
};

/** Deletes one saved file. Already gone is fine. */
export const removeFile = async (relativePath: string): Promise<void> => {
  const { dir, name } = splitPath(relativePath);
  try {
    const directory = await getDirectory(dir, false);
    const entry = await getChildFile(directory, name, false);
    await removeEntry(entry);
  } catch (error) {
    if (!isNotFound(error)) throw error;
  }
};

/** Deletes a directory and everything in it. Already gone is fine. */
export const removeDirectory = async (relativeDir: string): Promise<void> => {
  try {
    const directory = await getDirectory(relativeDir, false);
    await new Promise<void>((resolve, reject) => {
      directory.removeRecursively(resolve, error => reject(toError(error, 'remove a folder')));
    });
  } catch (error) {
    if (!isNotFound(error)) throw error;
  }
};

/** Deletes every directory under `relativeDir` except the one named `keepName`. */
export const removeDirectoriesExcept = async (relativeDir: string, keepName: string): Promise<void> => {
  let directory: DirectoryEntryLike;
  try {
    directory = await getDirectory(relativeDir, false);
  } catch (error) {
    if (isNotFound(error)) return;
    throw error;
  }
  const entries = await new Promise<EntryLike[]>((resolve, reject) => {
    directory.createReader().readEntries(resolve, error => reject(toError(error, 'list a folder')));
  });
  for (const entry of entries) {
    if (entry.name === keepName) continue;
    if (entry.isFile) {
      await removeEntry(entry).catch(() => undefined);
    } else {
      await removeDirectory(`${relativeDir}/${entry.name}`).catch(() => undefined);
    }
  }
};
