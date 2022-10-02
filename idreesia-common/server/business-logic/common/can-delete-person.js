import {
  IssuanceForms,
  PurchaseForms,
  StockAdjustments,
} from 'meteor/idreesia-common/server/collections/inventory';

export function canDeletePerson(personId) {
  const issuedByCount = IssuanceForms.find({
    issuedBy: { $eq: personId },
  }).count();
  if (issuedByCount > 0) {
    throw new Error(
      'This Karkun cannot be deleted as it is being referenced by issuance forms.'
    );
  }

  const issuedToCount = IssuanceForms.find({
    issuedTo: { $eq: personId },
  }).count();
  if (issuedToCount > 0) {
    throw new Error(
      'This Karkun cannot be deleted as it is being referenced by issuance forms.'
    );
  }

  const receivedByCount = PurchaseForms.find({
    receivedBy: { $eq: personId },
  }).count();
  if (receivedByCount > 0) {
    throw new Error(
      'This Karkun cannot be deleted as it is being referenced by purchase forms.'
    );
  }

  const purchasedByCount = PurchaseForms.find({
    purchasedBy: { $eq: personId },
  }).count();
  if (purchasedByCount > 0) {
    throw new Error(
      'This Karkun cannot be deleted as it is being referenced by purchase forms.'
    );
  }

  const adjustedByCount = StockAdjustments.find({
    adjustedBy: { $eq: personId },
  }).count();
  if (adjustedByCount > 0) {
    throw new Error(
      'This Karkun cannot be deleted as it is being referenced by stock adjustments.'
    );
  }

  return true;
}
