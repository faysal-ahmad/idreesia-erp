import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuditLogs } from 'meteor/idreesia-common/server/collections/common';
import * as storage from 'meteor/idreesia-common/server/file-storage';

import {
  createCatalogItem,
  deleteCatalogItem,
  getCatalogItemImageUrl,
  removeCatalogItemImage,
  setCatalogItemImage,
} from './index';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);
// sharp is not available in unit tests; the decode step is faked.
vi.mock(
  'meteor/idreesia-common/server/business-logic/common/stored-images',
  async (importOriginal) => ({
    ...(await importOriginal<object>()),
    decodeAndNormalizeImage: vi.fn(async (data: string) => {
      if (data === 'bad') throw new Error('The uploaded file is not a valid image.');
      return Buffer.from('normalized');
    }),
  })
);

const putFile = vi.mocked(storage.putFile);
const deleteFiles = vi.mocked(storage.deleteFiles);
const user = { _id: 'u1' };

beforeEach(() => {
  putFile.mockClear();
  deleteFiles.mockClear();
});

describe('purchasing catalog item pictures', () => {
  it('gives a public URL only when the item has a picture', () => {
    expect(getCatalogItemImageUrl({ imageKey: 'k.jpg' })).toBe('https://storage.test/public');
    expect(getCatalogItemImageUrl({})).toBeNull();
  });

  it('stores a picture under its folder, replaces it and removes the old file', async () => {
    const item = await createCatalogItem({ name: 'Tea', unit: 'kg' }, user);

    const first = await setCatalogItemImage(item._id, 'data', user);
    expect(first.imageKey).toMatch(new RegExp(`^purchasing-catalog-item-images/${item._id}/.+\\.jpg$`));
    expect(putFile).toHaveBeenCalledOnce();
    expect(deleteFiles).not.toHaveBeenCalled();

    const second = await setCatalogItemImage(item._id, 'data', user);
    expect(second.imageKey).not.toBe(first.imageKey);
    expect(deleteFiles).toHaveBeenCalledWith([first.imageKey]);
    expect(await AuditLogs.find({ entityId: item._id }).countAsync()).toBe(3); // create + 2 pictures
  });

  it('removes a picture and its file, and does nothing when there is none', async () => {
    const item = await createCatalogItem({ name: 'Tea', unit: 'kg' }, user);
    await removeCatalogItemImage(item._id, user);
    expect(deleteFiles).not.toHaveBeenCalled();

    const withImage = await setCatalogItemImage(item._id, 'data', user);
    const removed = await removeCatalogItemImage(item._id, user);
    expect(removed.imageKey).toBeUndefined();
    expect(deleteFiles).toHaveBeenCalledWith([withImage.imageKey]);
  });

  it('refuses something that is not an image and an unknown item', async () => {
    const item = await createCatalogItem({ name: 'Tea', unit: 'kg' }, user);
    await expect(setCatalogItemImage(item._id, 'bad', user)).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });
    await expect(setCatalogItemImage('nope', 'data', user)).rejects.toMatchObject({
      extensions: { code: 'NOT_FOUND' },
    });
  });

  it('deletes the picture file when the item is deleted', async () => {
    const item = await createCatalogItem({ name: 'Tea', unit: 'kg' }, user);
    const withImage = await setCatalogItemImage(item._id, 'data', user);
    deleteFiles.mockClear();
    await deleteCatalogItem(item._id, user);
    expect(deleteFiles).toHaveBeenCalledWith([withImage.imageKey]);
  });
});
