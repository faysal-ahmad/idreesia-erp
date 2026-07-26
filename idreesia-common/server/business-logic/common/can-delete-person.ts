// @ts-nocheck
import {
  IssuanceForms,
  PurchaseForms,
  StockAdjustments,
} from 'meteor/idreesia-common/server/collections/inventory';

export async function canDeletePerson(personId) {
  const issuedByCount = await IssuanceForms.find({
    issuedBy: { $eq: personId },
  }).countAsync();
  if (issuedByCount > 0) {
    throw new Error(
      'This Karkun cannot be deleted as it is being referenced by issuance forms.'
    );
  }

  const issuedToCount = await IssuanceForms.find({
    issuedTo: { $eq: personId },
  }).countAsync();
  if (issuedToCount > 0) {
    throw new Error(
      'This Karkun cannot be deleted as it is being referenced by issuance forms.'
    );
  }

  const receivedByCount = await PurchaseForms.find({
    receivedBy: { $eq: personId },
  }).countAsync();
  if (receivedByCount > 0) {
    throw new Error(
      'This Karkun cannot be deleted as it is being referenced by purchase forms.'
    );
  }

  const purchasedByCount = await PurchaseForms.find({
    purchasedBy: { $eq: personId },
  }).countAsync();
  if (purchasedByCount > 0) {
    throw new Error(
      'This Karkun cannot be deleted as it is being referenced by purchase forms.'
    );
  }

  const adjustedByCount = await StockAdjustments.find({
    adjustedBy: { $eq: personId },
  }).countAsync();
  if (adjustedByCount > 0) {
    throw new Error(
      'This Karkun cannot be deleted as it is being referenced by stock adjustments.'
    );
  }

  return true;
}
