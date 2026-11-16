import { describe, expect, it } from 'vitest';

import { PredefinedFilterNames } from 'meteor/idreesia-common/constants/hr';
import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  IssuanceForms,
  PurchaseForms,
  StockAdjustments,
} from 'meteor/idreesia-common/server/collections/inventory';

import { getKarkunsByPredefinedFilter } from './karkun-search';

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

const names = (result: { data: any[] }) =>
  result.data.map(person => person.sharedData.name);

describe('getKarkunsByPredefinedFilter', () => {
  it.each([
    [PredefinedFilterNames.PURCHASE_FORMS_RECEIVED_BY_RETURNED_BY, 's1', ['Zaid']],
    [PredefinedFilterNames.PURCHASE_FORMS_RECEIVED_BY_RETURNED_BY, 's2', ['Bilal']],
    [PredefinedFilterNames.PURCHASE_FORMS_PURCHASED_BY_RETURNED_TO, 's1', ['Ali']],
    [PredefinedFilterNames.ISSUANCE_FORMS_ISSUED_BY_RECEIVED_BY, 's1', ['Zaid']],
    [PredefinedFilterNames.ISSUANCE_FORMS_ISSUED_TO_RETURNED_BY, 's1', ['Bilal']],
    [PredefinedFilterNames.ISSUANCE_FORMS_ISSUED_TO_RETURNED_BY, 's2', []],
    // Stock adjustments are not scoped to a store; results are sorted by name.
    [PredefinedFilterNames.STOCK_ADJUSTMENTS_ADJUSTED_BY, undefined, ['Ali', 'Bilal']],
    ['unknown-filter', 's1', []],
  ])('%s (store %s)', async (predefinedFilterName, predefinedFilterStoreId, expected) => {
    await seed();
    const result = await getKarkunsByPredefinedFilter({
      predefinedFilterName,
      predefinedFilterStoreId,
    });
    expect(names(result)).toEqual(expected);
    expect(result.totalResults).toBe(expected.length);
  });

  it('pages the sorted results while totalResults stays the full count', async () => {
    await seed();
    const params = {
      predefinedFilterName: PredefinedFilterNames.STOCK_ADJUSTMENTS_ADJUSTED_BY,
      pageSize: '1',
    };
    const first = await getKarkunsByPredefinedFilter({ ...params, pageIndex: '0' });
    const second = await getKarkunsByPredefinedFilter({ ...params, pageIndex: '1' });
    expect(names(first)).toEqual(['Ali']);
    expect(names(second)).toEqual(['Bilal']);
    expect(first.totalResults).toBe(2);
  });
});
