import {
  IssuanceForms,
  PurchaseForms,
  StockAdjustments,
} from 'meteor/idreesia-common/server/collections/inventory';
import PredefinedFilterNames from 'meteor/idreesia-common/constants/stores-predefined-filter-names';

interface RawCollectionWithDistinct {
  distinct(fieldName: string, query?: Record<string, unknown>): Promise<string[]>;
}

/**
 * The people a predefined filter stands for, e.g. who received goods on the
 * store's purchase forms before ("recently used" in the store pickers).
 */
export async function getPredefinedFilterKarkunIds(
  predefinedFilterName: string | undefined,
  predefinedFilterStoreId: string | undefined
): Promise<string[]> {
  let karkunIds: string[] = [];
  const purchaseFormsRaw =
    PurchaseForms.rawCollection() as unknown as RawCollectionWithDistinct;
  const issuanceFormsRaw =
    IssuanceForms.rawCollection() as unknown as RawCollectionWithDistinct;
  const stockAdjustmentsRaw =
    StockAdjustments.rawCollection() as unknown as RawCollectionWithDistinct;

  switch (predefinedFilterName) {
    case PredefinedFilterNames.PURCHASE_FORMS_RECEIVED_BY_RETURNED_BY:
      karkunIds = await purchaseFormsRaw.distinct('receivedBy', {
        physicalStoreId: predefinedFilterStoreId,
      });
      break;

    case PredefinedFilterNames.PURCHASE_FORMS_PURCHASED_BY_RETURNED_TO:
      karkunIds = await purchaseFormsRaw.distinct('purchasedBy', {
        physicalStoreId: predefinedFilterStoreId,
      });
      break;

    case PredefinedFilterNames.ISSUANCE_FORMS_ISSUED_BY_RECEIVED_BY:
      karkunIds = await issuanceFormsRaw.distinct('issuedBy', {
        physicalStoreId: predefinedFilterStoreId,
      });
      break;

    case PredefinedFilterNames.ISSUANCE_FORMS_ISSUED_TO_RETURNED_BY:
      karkunIds = await issuanceFormsRaw.distinct('issuedTo', {
        physicalStoreId: predefinedFilterStoreId,
      });
      break;

    case PredefinedFilterNames.STOCK_ADJUSTMENTS_ADJUSTED_BY:
      karkunIds = await stockAdjustmentsRaw.distinct('adjustedBy');
      break;

    default:
      karkunIds = [];
      break;
  }

  return karkunIds;
}
