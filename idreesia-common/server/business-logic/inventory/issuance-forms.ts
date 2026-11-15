import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { IssuanceForms } from 'meteor/idreesia-common/server/collections/inventory';
import { removeAttachment } from 'meteor/idreesia-common/server/business-logic/common/stored-attachments';

import {
  applyStockMovements,
  revertStockMovements,
  type StockMovement,
} from './stock-levels';

/*
 * Issuance forms move stock out of (or back into) a store. A form and the
 * stock levels it changes are written in one transaction.
 */

export interface IssuanceFormInput {
  issueDate: Date;
  issuedBy: string;
  issuedTo: string;
  handedOverTo?: string;
  physicalStoreId: string;
  locationId?: string;
  items: StockMovement[];
  notes?: string;
}

interface IssuanceFormDocument {
  approvedOn?: Date;
  approvedBy?: string;
  items: StockMovement[];
}

/** Creates the form and applies its items to the stock levels. */
export async function createIssuanceForm(
  input: IssuanceFormInput,
  userId: string
): Promise<string> {
  return runInTransaction(async () => {
    const date = new Date();
    const issuanceFormId = await IssuanceForms.insertAsync({
      ...input,
      createdAt: date,
      createdBy: userId,
      updatedAt: date,
      updatedBy: userId,
    });
    await applyStockMovements(input.items);
    return issuanceFormId;
  });
}

/** Replaces an unapproved form, moving the stock levels to match. */
export async function updateIssuanceForm(
  issuanceFormId: string,
  input: IssuanceFormInput,
  userId: string
): Promise<void> {
  return runInTransaction(async () => {
    const existingForm = (await IssuanceForms.findOneAsync(
      issuanceFormId
    )) as unknown as IssuanceFormDocument | undefined;
    if (!existingForm) {
      throw new Error('Issuance form not found.');
    }
    if (existingForm.approvedOn || existingForm.approvedBy) {
      throw new Error('You cannot update an already approved Issuance Form.');
    }

    await revertStockMovements(existingForm.items);
    await applyStockMovements(input.items);

    const updated = await IssuanceForms.updateAsync(
      {
        _id: { $eq: issuanceFormId },
        approvedOn: { $eq: null },
        approvedBy: { $eq: null },
      },
      { $set: { ...input, updatedAt: new Date(), updatedBy: userId } }
    );
    if (!updated) {
      throw new Error('You cannot update an already approved Issuance Form.');
    }
  });
}

/** Detaches an attachment from the form and deletes it. */
export async function removeIssuanceFormAttachment(
  issuanceFormId: string,
  physicalStoreId: string,
  attachmentId: string,
  userId: string
): Promise<void> {
  return runInTransaction(async () => {
    await IssuanceForms.updateAsync(
      { _id: issuanceFormId, physicalStoreId },
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
export async function removeIssuanceForms(
  physicalStoreId: string,
  issuanceFormIds: string[]
): Promise<number> {
  return runInTransaction(async () => {
    const unapproved = (await IssuanceForms.find({
      _id: { $in: issuanceFormIds },
      physicalStoreId,
      approvedOn: { $exists: false },
      approvedBy: { $exists: false },
    }).fetchAsync()) as unknown as IssuanceFormDocument[];
    for (const form of unapproved) {
      await revertStockMovements(form.items);
    }
    return IssuanceForms.removeAsync({
      _id: { $in: issuanceFormIds },
      physicalStoreId,
    });
  });
}
