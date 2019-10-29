import { Salaries } from 'meteor/idreesia-common/server/collections/hr';
import {
  IssuanceForms,
  PurchaseForms,
  StockAdjustments,
} from 'meteor/idreesia-common/server/collections/inventory';

export function canDeleteKarkun(karkunId) {
  const salaryRecordCount = Salaries.find({ karkunId }).count();
  if (salaryRecordCount > 0) return false;

  const issuedByCount = IssuanceForms.find({
    issuedBy: { $eq: karkunId },
  }).count();
  if (issuedByCount > 0) return false;

  const issuedToCount = IssuanceForms.find({
    issuedTo: { $eq: karkunId },
  }).count();
  if (issuedToCount > 0) return false;

  const receivedByCount = PurchaseForms.find({
    receivedBy: { $eq: karkunId },
  }).count();
  if (receivedByCount > 0) return false;

  const purchasedByCount = PurchaseForms.find({
    purchasedBy: { $eq: karkunId },
  }).count();
  if (purchasedByCount > 0) return false;

  const adjustedByCount = StockAdjustments.find({
    adjustedBy: { $eq: karkunId },
  }).count();
  if (adjustedByCount > 0) return false;

  return true;
}
