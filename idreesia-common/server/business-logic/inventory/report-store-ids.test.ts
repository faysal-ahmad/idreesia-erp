import { describe, expect, it, vi } from 'vitest';

// The exporters build spreadsheets with a library the unit tests do not load;
// these tests only use the store lookups beside them.
vi.mock(
  'meteor/idreesia-common/server/business-logic/common/excel-exporter',
  () => ({ createWorkbookBuffer: vi.fn() })
);

import {
  IssuanceForms,
  PurchaseForms,
  StockAdjustments,
} from 'meteor/idreesia-common/server/collections/inventory';

import { getIssuanceFormStoreIds } from './issuance-forms-exporter';
import { getPurchaseFormStoreIds } from './purchase-forms-exporter';
import { getStockAdjustmentStoreIds } from './stock-adjustment-forms-exporter';

// What /generate-report checks the user's store access against: the stores of
// the forms named in the request, not a store id the client sends.

const insert = (collection: { rawCollection(): { insertOne(doc: never): Promise<unknown> } }, docs: Array<{ _id: string; physicalStoreId: string }>) =>
  Promise.all(docs.map(doc => collection.rawCollection().insertOne(doc as never)));

describe.each([
  ['purchase forms', PurchaseForms, getPurchaseFormStoreIds],
  ['issuance forms', IssuanceForms, getIssuanceFormStoreIds],
  ['stock adjustments', StockAdjustments, getStockAdjustmentStoreIds],
] as const)('store ids of %s', (_label, collection, storeIdsOf) => {
  it('returns the store of each requested form', async () => {
    await insert(collection as never, [
      { _id: 'f1', physicalStoreId: 's1' },
      { _id: 'f2', physicalStoreId: 's2' },
      { _id: 'f3', physicalStoreId: 's3' },
    ]);

    expect((await storeIdsOf('f1,f2')).sort()).toEqual(['s1', 's2']);
  });

  it('skips ids that match no form', async () => {
    await insert(collection as never, [{ _id: 'f1', physicalStoreId: 's1' }]);

    expect(await storeIdsOf('f1,missing')).toEqual(['s1']);
    expect(await storeIdsOf('missing')).toEqual([]);
  });

  it('repeats a store once per form, so every one is checked', async () => {
    await insert(collection as never, [
      { _id: 'f1', physicalStoreId: 's1' },
      { _id: 'f2', physicalStoreId: 's1' },
    ]);

    expect(await storeIdsOf('f1,f2')).toEqual(['s1', 's1']);
  });
});
