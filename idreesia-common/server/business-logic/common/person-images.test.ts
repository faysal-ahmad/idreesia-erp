import { beforeEach, describe, expect, it, vi } from 'vitest';

import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import {
  deleteFiles,
  putFile,
  StorageFolders,
} from 'meteor/idreesia-common/server/file-storage';

import {
  getPersonImageUrls,
  removePersonImageFiles,
  storePersonImage,
} from './person-images';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);
// stored-images needs sharp, which is only installed for the web app.
vi.mock('sharp', () => ({ default: vi.fn() }));

const deleteFilesMock = deleteFiles as unknown as ReturnType<typeof vi.fn>;
const putFileMock = putFile as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  deleteFilesMock.mockReset().mockResolvedValue(undefined);
  putFileMock.mockClear();
});

describe('storePersonImage', () => {
  it('stores the photo and thumbnail under the people images folder', async () => {
    const { imageKey, imageThumbnailKey } = await storePersonImage(
      'p1',
      Buffer.from('i'),
      'image/jpeg',
      Buffer.from('t')
    );
    expect(imageKey.startsWith(`${StorageFolders.PeopleImages}/p1/`)).toBe(true);
    expect(imageThumbnailKey?.startsWith(`${StorageFolders.PeopleImages}/p1/`)).toBe(
      true
    );
    expect(putFileMock).toHaveBeenCalledTimes(2);
  });
});

describe('getPersonImageUrls', () => {
  it('has no URLs for a person without a photo', () => {
    expect(getPersonImageUrls(null)).toEqual({
      imageUrl: null,
      imageThumbnailUrl: null,
    });
    expect(getPersonImageUrls({})).toEqual({
      imageUrl: null,
      imageThumbnailUrl: null,
    });
  });

  it('falls back to the full photo when there is no thumbnail', () => {
    expect(getPersonImageUrls({ imageKey: 'k' })).toEqual({
      imageUrl: 'https://storage.test/public',
      imageThumbnailUrl: 'https://storage.test/public',
    });
  });
});

describe('removePersonImageFiles', () => {
  it('does nothing without a photo', async () => {
    await removePersonImageFiles(null);
    await removePersonImageFiles({ imageKey: null, imageThumbnailKey: undefined });
    expect(deleteFilesMock).not.toHaveBeenCalled();
  });

  it('deletes the photo and thumbnail files', async () => {
    await removePersonImageFiles({ imageKey: 'a', imageThumbnailKey: 'b' });
    expect(deleteFilesMock).toHaveBeenCalledWith(['a', 'b']);
  });

  it('deletes only the keys that exist', async () => {
    await removePersonImageFiles({ imageKey: 'a', imageThumbnailKey: null });
    expect(deleteFilesMock).toHaveBeenCalledWith(['a']);
  });

  it('does not fail when the files cannot be deleted', async () => {
    deleteFilesMock.mockRejectedValueOnce(new Error('storage down'));
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(
      removePersonImageFiles({ imageKey: 'a' })
    ).resolves.toBeUndefined();
    spy.mockRestore();
  });

  it('waits for the surrounding transaction to commit, and skips a rollback', async () => {
    await runInTransaction(async () => {
      await removePersonImageFiles({ imageKey: 'a' });
      expect(deleteFilesMock).not.toHaveBeenCalled();
    });
    expect(deleteFilesMock).toHaveBeenCalledTimes(1);

    deleteFilesMock.mockClear();
    await expect(
      runInTransaction(async () => {
        await removePersonImageFiles({ imageKey: 'a' });
        throw new Error('boom');
      })
    ).rejects.toThrow('boom');
    expect(deleteFilesMock).not.toHaveBeenCalled();
  });
});
