import { EntityType, OperationType } from 'meteor/idreesia-common/constants/audit';
import { afterCommit, runInTransaction } from 'meteor/idreesia-common/server/collections';
import { PurchasingCatalogItems } from 'meteor/idreesia-common/server/collections/purchasing';
import { deleteFiles, StorageFolders } from 'meteor/idreesia-common/server/file-storage';
import {
  decodeAndNormalizeImage,
  getStoredImageUrl,
  storeImage,
} from 'meteor/idreesia-common/server/business-logic/common/stored-images';

import { createAuditLog } from '../common/audit-logs';
import { purchasingError } from './errors';
import { type ActingUser } from './internal';

export interface CatalogItemImageFields {
  imageKey?: string | null;
}

/** URL of a catalog item's picture in object storage. */
export const getCatalogItemImageUrl = (item: CatalogItemImageFields) =>
  getStoredImageUrl(item.imageKey);

/**
 * Deletes a catalog item's picture file, once the current transaction
 * commits (straight away outside one).
 */
export async function removeCatalogItemImageFiles(
  item: CatalogItemImageFields | null | undefined
) {
  const imageKey = item?.imageKey;
  if (!imageKey) return;
  await afterCommit(async () => {
    try {
      await deleteFiles([imageKey]);
    } catch (error) {
      // An orphaned file is harmless; failing the update over it is not.
      // eslint-disable-next-line no-console
      console.error(`Failed to delete catalog item image ${imageKey}:`, error);
    }
  });
}

async function requireItem(_id: string) {
  const item = await PurchasingCatalogItems.findOneAsync({ _id: { $eq: _id } });
  if (!item) throw purchasingError('NOT_FOUND', 'Catalog item not found.');
  return item;
}

/** Sets an item's picture from base64 image data and removes the one it replaces. */
export async function setCatalogItemImage(
  _id: string,
  imageData: string,
  user: ActingUser
) {
  const existing = await requireItem(_id);

  let image: Buffer;
  try {
    image = await decodeAndNormalizeImage(imageData);
  } catch (error) {
    throw purchasingError('BAD_USER_INPUT', (error as Error).message);
  }
  const { imageKey } = await storeImage(
    StorageFolders.PurchasingCatalogItemImages,
    _id,
    image,
    'image/jpeg'
  );

  await runInTransaction(async () => {
    const now = new Date();
    await PurchasingCatalogItems.updateAsync(
      { _id: { $eq: _id } },
      { $set: { imageKey, updatedAt: now, updatedBy: user._id } }
    );
    await createAuditLog({
      entityId: _id,
      entityType: EntityType.PURCHASING_CATALOG_ITEM,
      operationType: OperationType.UPDATE,
      auditValues: { picture: 'changed' },
      operationBy: user._id,
      operationTime: now,
    });
    await removeCatalogItemImageFiles(existing);
  });
  return requireItem(_id);
}

/** Takes an item's picture away. */
export async function removeCatalogItemImage(_id: string, user: ActingUser) {
  const existing = await requireItem(_id);
  if (!existing.imageKey) return existing;

  await runInTransaction(async () => {
    const now = new Date();
    await PurchasingCatalogItems.updateAsync(
      { _id: { $eq: _id } },
      {
        $set: { updatedAt: now, updatedBy: user._id },
        $unset: { imageKey: '' },
      }
    );
    await createAuditLog({
      entityId: _id,
      entityType: EntityType.PURCHASING_CATALOG_ITEM,
      operationType: OperationType.UPDATE,
      auditValues: { picture: 'removed' },
      operationBy: user._id,
      operationTime: now,
    });
    await removeCatalogItemImageFiles(existing);
  });
  return requireItem(_id);
}
