import { Attachments } from 'meteor/idreesia-common/server/collections/common';
import { StockItems } from 'meteor/idreesia-common/server/collections/inventory';
import {
  deleteFiles,
  StorageFolders,
} from 'meteor/idreesia-common/server/file-storage';
import {
  decodeAndNormalizeImage,
  getStoredImageUrl,
  storeImage,
} from 'meteor/idreesia-common/server/business-logic/common/stored-images';

interface UserRef {
  _id: string;
}

export interface StockItemImageFields {
  imageKey?: string | null;
  imageId?: string | null;
}

/**
 * URL of a stock item's image - from object storage, or from Attachments for
 * an image that hasn't been migrated yet.
 */
export const getStockItemImageUrl = (stockItem: StockItemImageFields) =>
  getStoredImageUrl(stockItem.imageKey, stockItem.imageId);

/** Stores an image under stock-item-images/<stockItemId>/. */
export const storeStockItemImage = (
  stockItemId: string,
  image: Buffer,
  mimeType: string
) =>
  storeImage(StorageFolders.StockItemImages, stockItemId, image, mimeType);

/**
 * Deletes a stock item's stored image - the object storage file, and the
 * legacy Attachments copy outright (images are being moved out of Mongo,
 * not archived in it).
 */
export async function removeStockItemImageFiles(
  stockItem: StockItemImageFields | null | undefined
) {
  if (stockItem?.imageKey) {
    try {
      await deleteFiles([stockItem.imageKey]);
    } catch (error) {
      // An orphaned file is harmless; failing the update over it is not.
      // eslint-disable-next-line no-console
      console.error(
        `Failed to delete stock item image ${stockItem.imageKey}:`,
        error
      );
    }
  }
  if (stockItem?.imageId) {
    await Attachments.removeAsync(stockItem.imageId);
  }
}

/**
 * Sets a stock item's image from base64 image data, then removes the image
 * it replaces.
 */
export async function setStockItemImage(
  user: UserRef,
  stockItemId: string,
  physicalStoreId: string,
  imageData: string
) {
  const selector = {
    _id: { $eq: stockItemId },
    physicalStoreId: { $eq: physicalStoreId },
  };
  const existing = (await StockItems.findOneAsync(selector)) as
    | StockItemImageFields
    | undefined;
  if (!existing) {
    throw new Error(`Stock item '${stockItemId}' was not found.`);
  }

  const image = await decodeAndNormalizeImage(imageData);
  const { imageKey } = await storeStockItemImage(
    stockItemId,
    image,
    'image/jpeg'
  );

  const date = new Date();
  await StockItems.updateAsync(selector, {
    $set: { imageKey, updatedAt: date, updatedBy: user._id },
    $unset: { imageId: '' },
  });

  await removeStockItemImageFiles(existing);
  return StockItems.findOneAsync(stockItemId);
}
