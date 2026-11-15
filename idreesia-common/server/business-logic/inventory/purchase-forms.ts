import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { PurchaseForms } from 'meteor/idreesia-common/server/collections/inventory';
import { removeAttachment } from 'meteor/idreesia-common/server/business-logic/common/stored-attachments';

import {
  applyStockMovements,
  revertStockMovements,
  type StockMovement,
} from './stock-levels';

/*
 * Purchase forms move stock into (or out of) a store. A form and the stock
 * levels it changes are written in one transaction.
 */

export interface PurchaseFormInput {
  purchaseDate: Date;
  receivedBy: string;
  purchasedBy: string;
  physicalStoreId: string;
  locationId?: string;
  vendorId?: string;
  items: StockMovement[];
  notes?: string;
}

interface PurchaseFormDocument {
  items: StockMovement[];
}

/** Creates the form and applies its items to the stock levels. */
export async function createPurchaseForm(
  input: PurchaseFormInput,
  userId: string
): Promise<string> {
  return runInTransaction(async () => {
    const date = new Date();
    const purchaseFormId = await PurchaseForms.insertAsync({
      ...input,
      createdAt: date,
      createdBy: userId,
      updatedAt: date,
      updatedBy: userId,
    });
    await applyStockMovements(input.items);
    return purchaseFormId;
  });
}

/** Replaces an unapproved form, moving the stock levels to match. */
export async function updatePurchaseForm(
  purchaseFormId: string,
  input: PurchaseFormInput,
  userId: string
): Promise<void> {
  return runInTransaction(async () => {
    const existingForm = (await PurchaseForms.findOneAsync(
      purchaseFormId
    )) as unknown as PurchaseFormDocument | undefined;
    if (!existingForm) {
      throw new Error('Purchase form not found.');
    }

    await revertStockMovements(existingForm.items);
    await applyStockMovements(input.items);

    const updated = await PurchaseForms.updateAsync(
      {
        _id: { $eq: purchaseFormId },
        approvedOn: { $exists: false },
        approvedBy: { $exists: false },
      },
      { $set: { ...input, updatedAt: new Date(), updatedBy: userId } }
    );
    if (!updated) {
      throw new Error('You cannot update an already approved Purchase Form.');
    }
  });
}

/** Detaches an attachment from the form and deletes it. */
export async function removePurchaseFormAttachment(
  purchaseFormId: string,
  physicalStoreId: string,
  attachmentId: string,
  userId: string
): Promise<void> {
  return runInTransaction(async () => {
    await PurchaseForms.updateAsync(
      { _id: purchaseFormId, physicalStoreId },
      {
        $pull: { attachmentIds: attachmentId },
        $set: { updatedAt: new Date(), updatedBy: userId },
      }
    );
    await removeAttachment(attachmentId);
  });
}

/**
 * Removes forms of a store. The stock changes of the unapproved ones are
 * undone first. Returns how many forms were removed.
 */
export async function removePurchaseForms(
  physicalStoreId: string,
  purchaseFormIds: string[]
): Promise<number> {
  return runInTransaction(async () => {
    const unapproved = (await PurchaseForms.find({
      _id: { $in: purchaseFormIds },
      physicalStoreId,
      approvedOn: { $exists: false },
      approvedBy: { $exists: false },
    }).fetchAsync()) as unknown as PurchaseFormDocument[];
    for (const form of unapproved) {
      await revertStockMovements(form.items);
    }
    return PurchaseForms.removeAsync({
      _id: { $in: purchaseFormIds },
      physicalStoreId,
    });
  });
}
