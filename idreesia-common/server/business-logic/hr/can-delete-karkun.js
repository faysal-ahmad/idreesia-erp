import {
  IssuanceForms,
  PurchaseForms,
  StockAdjustments,
} from 'meteor/idreesia-common/server/collections/inventory';

export function canDeleteKarkun(karkunId) {
  const issuedByCount = IssuanceForms.find({
    issuedBy: { $eq: karkunId },
  }).count();
  if (issuedByCount > 0) {
    throw new Error(
      'This Karkun cannot be deleted as it is being referenced by issuance forms.'
    );
  }

  const issuedToCount = IssuanceForms.find({
    issuedTo: { $eq: karkunId },
  }).count();
  if (issuedToCount > 0) {
    throw new Error(
      'This Karkun cannot be deleted as it is being referenced by issuance forms.'
    );
  }

  const receivedByCount = PurchaseForms.find({
    receivedBy: { $eq: karkunId },
  }).count();
  if (receivedByCount > 0) {
    throw new Error(
      'This Karkun cannot be deleted as it is being referenced by purchase forms.'
    );
  }

  const purchasedByCount = PurchaseForms.find({
    purchasedBy: { $eq: karkunId },
  }).count();
  if (purchasedByCount > 0) {
    throw new Error(
      'This Karkun cannot be deleted as it is being referenced by purchase forms.'
    );
  }

  const adjustedByCount = StockAdjustments.find({
    adjustedBy: { $eq: karkunId },
  }).count();
  if (adjustedByCount > 0) {
    throw new Error(
      'This Karkun cannot be deleted as it is being referenced by stock adjustments.'
    );
  }

  return true;
}
