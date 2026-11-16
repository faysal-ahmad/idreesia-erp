import { describe, expect, it } from 'vitest';

import {
  IssuanceForms,
  ItemCategories,
  Locations,
  PurchaseForms,
  StockAdjustments,
  StockItems,
  Vendors,
} from 'meteor/idreesia-common/server/collections/inventory';

import issuanceFormResolvers from './issuance-form/resolvers';
import itemCategoryResolvers from './item-category/resolvers';
import locationResolvers from './location/resolvers';
import purchaseFormResolvers from './purchase-form/resolvers';
import stockAdjustmentResolvers from './stock-adjustment/resolvers';
import stockItemResolvers from './stock-item/resolvers';
import vendorResolvers from './vendor/resolvers';

// The by-id queries are authorized against the physicalStoreId argument, so
// they must only return a record that belongs to that store.
const cases = [
  ['stockItemById', StockItems, stockItemResolvers],
  ['vendorById', Vendors, vendorResolvers],
  ['locationById', Locations, locationResolvers],
  ['itemCategoryById', ItemCategories, itemCategoryResolvers],
  ['purchaseFormById', PurchaseForms, purchaseFormResolvers],
  ['issuanceFormById', IssuanceForms, issuanceFormResolvers],
  ['stockAdjustmentById', StockAdjustments, stockAdjustmentResolvers],
] as const;

describe.each(cases)('%s', (queryName, collection, resolvers) => {
  const query = (
    resolvers.Query as unknown as Record<
      string,
      (obj: unknown, args: Record<string, string>) => Promise<unknown>
    >
  )[queryName];

  it('returns the record for its own store', async () => {
    await (collection as any).insertAsync({
      _id: 'r1',
      physicalStoreId: 'store-a',
    });
    const found = (await query(null, {
      _id: 'r1',
      physicalStoreId: 'store-a',
    })) as { _id: string };
    expect(found._id).toBe('r1');
  });

  it('returns nothing when the record belongs to another store', async () => {
    await (collection as any).insertAsync({
      _id: 'r2',
      physicalStoreId: 'store-b',
    });
    expect(
      await query(null, { _id: 'r2', physicalStoreId: 'store-a' })
    ).toBeFalsy();
  });
});
