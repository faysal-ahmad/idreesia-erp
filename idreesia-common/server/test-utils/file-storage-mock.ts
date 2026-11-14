import { vi } from 'vitest';

// A stand-in for the object-storage module: no real storage, every call
// succeeds. `getFileInfo` answers with a size set by the test.
export { getFileExtension } from '../file-storage/file-extension';
export { StorageFolders } from '../file-storage/folders';

export const fileInfo = { size: 5, etag: 'etag' };

export const putFile = vi.fn(async () => undefined);
export const getFile = vi.fn(async () => Buffer.from('file'));
export const deleteFile = vi.fn(async () => undefined);
export const deleteFiles = vi.fn(async () => undefined);
export const copyFile = vi.fn(async () => undefined);
export const fileExists = vi.fn(async () => true);
export const getFileUrl = vi.fn(async () => 'https://storage.test/file');
export const getPublicFileUrl = vi.fn(() => 'https://storage.test/public');
export const getUploadUrl = vi.fn(async () => 'https://storage.test/upload');
export const getFileInfo = vi.fn(async () => ({ ...fileInfo }));
export const PUBLIC_IMMUTABLE_FILE = 'public-immutable';
export const runWithRequestHost = <T>(_host: unknown, fn: () => T) => fn();
