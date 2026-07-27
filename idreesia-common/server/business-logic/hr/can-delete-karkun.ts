import {
  IssuanceForms,
  PurchaseForms,
  StockAdjustments,
} from 'meteor/idreesia-common/server/collections/inventory';

export async function canDeleteKarkun(karkunId: string) {
  const issuedByCount = await IssuanceForms.find({
    issuedBy: { $eq: karkunId },
  }).countAsync();
  if (issuedByCount > 0) {
    throw new Error(
      'This Karkun cannot be deleted as it is being referenced by issuance forms.'
    );
  }

  const issuedToCount = await IssuanceForms.find({
    issuedTo: { $eq: karkunId },
  }).countAsync();
  if (issuedToCount > 0) {
    throw new Error(
      'This Karkun cannot be deleted as it is being referenced by issuance forms.'
    );
  }

  const receivedByCount = await PurchaseForms.find({
    receivedBy: { $eq: karkunId },
  }).countAsync();
  if (receivedByCount > 0) {
    throw new Error(
      'This Karkun cannot be deleted as it is being referenced by purchase forms.'
    );
  }

  const purchasedByCount = await PurchaseForms.find({
    purchasedBy: { $eq: karkunId },
  }).countAsync();
  if (purchasedByCount > 0) {
    throw new Error(
      'This Karkun cannot be deleted as it is being referenced by purchase forms.'
    );
  }

  const adjustedByCount = await StockAdjustments.find({
    adjustedBy: { $eq: karkunId },
  }).countAsync();
  if (adjustedByCount > 0) {
    throw new Error(
      'This Karkun cannot be deleted as it is being referenced by stock adjustments.'
    );
  }

  return true;
}
