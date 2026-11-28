import { describe, expect, it } from 'vitest';

import PredefinedFilterNames from 'meteor/idreesia-common/constants/stores-predefined-filter-names';
import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  IssuanceForms,
  PurchaseForms,
  StockAdjustments,
} from 'meteor/idreesia-common/server/collections/inventory';

import { getPredefinedFilterKarkunIds } from './store-predefined-filters';

const seed = async () => {
  for (const [id, name] of [
    ['k1', 'Zaid'],
    ['k2', 'Ali'],
    ['k3', 'Bilal'],
    ['k4', 'Never'],
  ]) {
    await People.insertAsync({ _id: id, sharedData: { name } } as any);
  }
  await PurchaseForms.insertAsync({
    physicalStoreId: 's1',
    receivedBy: 'k1',
    purchasedBy: 'k2',
  } as any);
  await PurchaseForms.insertAsync({
    physicalStoreId: 's2',
    receivedBy: 'k3',
    purchasedBy: 'k3',
  } as any);
  await IssuanceForms.insertAsync({
    physicalStoreId: 's1',
    issuedBy: 'k1',
    issuedTo: 'k3',
  } as any);
  await StockAdjustments.insertAsync({ adjustedBy: 'k2' } as any);
  await StockAdjustments.insertAsync({ adjustedBy: 'k3' } as any);
};

describe('getPredefinedFilterKarkunIds', () => {
  it.each([
    [PredefinedFilterNames.PURCHASE_FORMS_RECEIVED_BY_RETURNED_BY, 's1', ['k1']],
    [PredefinedFilterNames.PURCHASE_FORMS_RECEIVED_BY_RETURNED_BY, 's2', ['k3']],
    [PredefinedFilterNames.PURCHASE_FORMS_PURCHASED_BY_RETURNED_TO, 's1', ['k2']],
    [PredefinedFilterNames.ISSUANCE_FORMS_ISSUED_BY_RECEIVED_BY, 's1', ['k1']],
    [PredefinedFilterNames.ISSUANCE_FORMS_ISSUED_TO_RETURNED_BY, 's1', ['k3']],
    [PredefinedFilterNames.ISSUANCE_FORMS_ISSUED_TO_RETURNED_BY, 's2', []],
    // Stock adjustments are not scoped to a store.
    [PredefinedFilterNames.STOCK_ADJUSTMENTS_ADJUSTED_BY, undefined, ['k2', 'k3']],
    ['unknown-filter', 's1', []],
  ])('%s (store %s)', async (predefinedFilterName, predefinedFilterStoreId, expected) => {
    await seed();
    const ids = await getPredefinedFilterKarkunIds(predefinedFilterName, predefinedFilterStoreId);
    expect([...ids].sort()).toEqual(expected);
  });
});
