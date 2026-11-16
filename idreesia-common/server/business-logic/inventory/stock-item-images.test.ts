import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { StockItems } from 'meteor/idreesia-common/server/collections/inventory';
import * as storage from 'meteor/idreesia-common/server/file-storage';
import { decodeAndNormalizeImage } from 'meteor/idreesia-common/server/business-logic/common/stored-images';

import {
  getStockItemImageUrl,
  removeStockItemImageFiles,
  setStockItemImage,
  storeStockItemImage,
} from './stock-item-images';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);
// sharp is not available in unit tests; the decode step is faked.
vi.mock(
  'meteor/idreesia-common/server/business-logic/common/stored-images',
  async importOriginal => ({
    ...(await importOriginal<object>()),
    decodeAndNormalizeImage: vi.fn(async () => Buffer.from('normalized')),
  })
);

const putFile = vi.mocked(storage.putFile);
const deleteFiles = vi.mocked(storage.deleteFiles);

beforeEach(() => {
  putFile.mockClear();
  deleteFiles.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('stock item images', () => {
  it('gives a public URL only when the item has an image', () => {
    expect(getStockItemImageUrl({ imageKey: 'k.jpg' })).toBe(
      'https://storage.test/public'
    );
    expect(getStockItemImageUrl({})).toBeNull();
    expect(getStockItemImageUrl({ imageKey: null })).toBeNull();
  });

  it('stores an image under the item folder', async () => {
    const { imageKey } = await storeStockItemImage(
      'i1',
      Buffer.from('x'),
      'image/jpeg'
    );
    expect(imageKey).toMatch(/^stock-item-images\/i1\/.+\.jpg$/);
    expect(putFile).toHaveBeenCalledOnce();
  });

  describe('removeStockItemImageFiles', () => {
    it('deletes the file of an item with an image', async () => {
      await removeStockItemImageFiles({ imageKey: 'a.jpg' });
      expect(deleteFiles).toHaveBeenCalledWith(['a.jpg']);
    });

    it.each([[null], [undefined], [{}], [{ imageKey: null }]])(
      'does nothing for %j',
      async stockItem => {
        await removeStockItemImageFiles(stockItem as never);
        expect(deleteFiles).not.toHaveBeenCalled();
      }
    );

    it('waits for the transaction to commit', async () => {
      await runInTransaction(async () => {
        await removeStockItemImageFiles({ imageKey: 'a.jpg' });
        expect(deleteFiles).not.toHaveBeenCalled();
      });
      expect(deleteFiles).toHaveBeenCalledWith(['a.jpg']);
    });

    it('does not delete the file when the transaction rolls back', async () => {
      await expect(
        runInTransaction(async () => {
          await removeStockItemImageFiles({ imageKey: 'a.jpg' });
          throw new Error('boom');
        })
      ).rejects.toThrow('boom');
      expect(deleteFiles).not.toHaveBeenCalled();
    });

    it('swallows a failed delete', async () => {
      deleteFiles.mockRejectedValueOnce(new Error('storage down'));
      const log = vi.spyOn(console, 'error').mockImplementation(() => {});
      await expect(
        removeStockItemImageFiles({ imageKey: 'a.jpg' })
      ).resolves.toBeUndefined();
      expect(log).toHaveBeenCalled();
    });
  });

  describe('setStockItemImage', () => {
    it('stores the new image, saves its key and removes the old file', async () => {
      await StockItems.insertAsync({
        _id: 'i1',
        physicalStoreId: 's1',
        imageKey: 'old.jpg',
      });

      const result = (await setStockItemImage(
        { _id: 'u1' },
        'i1',
        's1',
        'data:image/png;base64,AAAA'
      )) as any;

      expect(result.imageKey).toMatch(/^stock-item-images\/i1\/.+\.jpg$/);
      expect(result.imageKey).not.toBe('old.jpg');
      expect(result.updatedBy).toBe('u1');
      expect(putFile).toHaveBeenCalledOnce();
      expect(deleteFiles).toHaveBeenCalledWith(['old.jpg']);
    });

    it('does not delete anything when the item had no image', async () => {
      await StockItems.insertAsync({ _id: 'i1', physicalStoreId: 's1' });
      await setStockItemImage({ _id: 'u1' }, 'i1', 's1', 'AAAA');
      expect(deleteFiles).not.toHaveBeenCalled();
    });

    it('rejects an item of another store without storing anything', async () => {
      await StockItems.insertAsync({ _id: 'i1', physicalStoreId: 's1' });

      await expect(
        setStockItemImage({ _id: 'u1' }, 'i1', 's2', 'AAAA')
      ).rejects.toThrow("Stock item 'i1' was not found.");

      expect(putFile).not.toHaveBeenCalled();
    });

    it('rejects data that is not an image and keeps the old one', async () => {
      await StockItems.insertAsync({
        _id: 'i1',
        physicalStoreId: 's1',
        imageKey: 'old.jpg',
      });
      vi.mocked(decodeAndNormalizeImage).mockRejectedValueOnce(
        new Error('The uploaded file is not a valid image.')
      );

      await expect(
        setStockItemImage({ _id: 'u1' }, 'i1', 's1', 'junk')
      ).rejects.toThrow('not a valid image');

      expect(deleteFiles).not.toHaveBeenCalled();
      expect((await StockItems.findOneAsync('i1'))?.imageKey).toBe('old.jpg');
    });
  });
});
