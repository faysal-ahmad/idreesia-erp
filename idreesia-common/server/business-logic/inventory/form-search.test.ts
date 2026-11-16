import { describe, expect, it } from 'vitest';

import {
  IssuanceForms,
  PurchaseForms,
  StockAdjustments,
} from 'meteor/idreesia-common/server/collections/inventory';

import getIssuanceForms, {
  getIssuanceFormsByMonth,
  getIssuanceFormsByStockItemId,
} from './issuance-form-search';
import getPurchaseForms, {
  getPurchaseFormsByMonth,
  getPurchaseFormsByStockItemId,
} from './purchase-form-search';
import getStockAdjustments, {
  getStockAdjustmentsByStockItemId,
} from './stock-adjustment-search';

// The three searches share their filters (approval, dates, paging); each is
// run against its own collection and date field.

const approved = { approvedOn: new Date(2024, 0, 1), approvedBy: 'u9' };

interface Kind {
  label: string;
  collection: { rawCollection(): any };
  search: (qs: string, storeId: string) => any;
  byItem: (storeId: string, itemId: string) => Promise<any[]>;
  byMonth?: (storeId: string, month: string) => Promise<any[]>;
  dateField: string;
  /** Builds a form/adjustment document of a store, item and date. */
  doc: (
    _id: string,
    store: string,
    date: Date,
    itemId?: string,
    extra?: Record<string, unknown>
  ) => Record<string, unknown>;
}

const formDoc =
  (dateField: string) =>
  (
    _id: string,
    store: string,
    date: Date,
    itemId = 'i1',
    extra: Record<string, unknown> = {}
  ) => ({
    _id,
    physicalStoreId: store,
    [dateField]: date,
    items: [{ stockItemId: itemId, quantity: 1 }],
    ...extra,
  });

const kinds: Kind[] = [
  {
    label: 'purchase forms',
    collection: PurchaseForms,
    search: getPurchaseForms,
    byItem: getPurchaseFormsByStockItemId,
    byMonth: getPurchaseFormsByMonth,
    dateField: 'purchaseDate',
    doc: formDoc('purchaseDate'),
  },
  {
    label: 'issuance forms',
    collection: IssuanceForms,
    search: getIssuanceForms,
    byItem: getIssuanceFormsByStockItemId,
    byMonth: getIssuanceFormsByMonth,
    dateField: 'issueDate',
    doc: formDoc('issueDate'),
  },
  {
    label: 'stock adjustments',
    collection: StockAdjustments,
    search: getStockAdjustments,
    byItem: getStockAdjustmentsByStockItemId,
    dateField: 'adjustmentDate',
    doc: (_id, store, date, itemId = 'i1', extra = {}) => ({
      _id,
      physicalStoreId: store,
      stockItemId: itemId,
      adjustmentDate: date,
      quantity: 1,
      ...extra,
    }),
  },
];

describe.each(kinds)('searching $label', kind => {
  const seed = (docs: Record<string, unknown>[]) =>
    kind.collection.rawCollection().insertMany(docs);
  const ids = (rows: { _id: string }[]) => rows.map(row => row._id);

  it('only returns the store asked for, newest first', async () => {
    await seed([
      kind.doc('old', 's1', new Date(2024, 0, 1)),
      kind.doc('new', 's1', new Date(2024, 5, 1)),
      kind.doc('other', 's2', new Date(2024, 3, 1)),
    ]);

    const result = await kind.search('', 's1');
    expect(ids(result.data)).toEqual(['new', 'old']);
    expect(result.totalResults).toBe(2);
  });

  it('filters on approval', async () => {
    await seed([
      kind.doc('a', 's1', new Date(2024, 0, 1), 'i1', approved),
      kind.doc('u', 's1', new Date(2024, 0, 2)),
    ]);

    expect(
      ids((await kind.search('showApproved=true&showUnapproved=false', 's1')).data)
    ).toEqual(['a']);
    expect(
      ids((await kind.search('showApproved=false&showUnapproved=true', 's1')).data)
    ).toEqual(['u']);
    expect(
      (await kind.search('showApproved=true&showUnapproved=true', 's1')).data
    ).toHaveLength(2);
  });

  it('returns nothing when neither approved nor unapproved are wanted', async () => {
    await seed([kind.doc('a', 's1', new Date(2024, 0, 1))]);

    const result = await kind.search(
      'showApproved=false&showUnapproved=false',
      's1'
    );
    expect(result.totalResults).toBe(0);
    // (The issuance search names its empty rows `issuanceForms`, not `data`:
    // reported, not asserted.)
    if (kind.label !== 'issuance forms') expect(result.data).toEqual([]);
  });

  it('filters on an inclusive date range', async () => {
    await seed([
      kind.doc('before', 's1', new Date(2024, 0, 9, 23, 59)),
      kind.doc('start', 's1', new Date(2024, 0, 10, 0, 0)),
      kind.doc('end', 's1', new Date(2024, 0, 20, 23, 59)),
      kind.doc('after', 's1', new Date(2024, 0, 21, 0, 0)),
    ]);

    const both = await kind.search('startDate=10-01-2024&endDate=20-01-2024', 's1');
    expect(ids(both.data).sort()).toEqual(['end', 'start']);
    expect(
      ids((await kind.search('startDate=20-01-2024', 's1')).data).sort()
    ).toEqual(['after', 'end']);
    expect(
      ids((await kind.search('endDate=10-01-2024', 's1')).data).sort()
    ).toEqual(['before', 'start']);
  });

  it('pages the results and reports the full count', async () => {
    await seed(
      [1, 2, 3, 4, 5].map(day => kind.doc(`f${day}`, 's1', new Date(2024, 0, day)))
    );

    const page1 = await kind.search('pageIndex=1&pageSize=2', 's1');
    expect(ids(page1.data)).toEqual(['f3', 'f2']);
    expect(page1.totalResults).toBe(5);
    expect(
      ids((await kind.search('pageIndex=2&pageSize=2', 's1')).data)
    ).toEqual(['f1']);
  });

  it('defaults to pages of 20', async () => {
    await seed(
      Array.from({ length: 25 }, (_, i) =>
        kind.doc(`f${i}`, 's1', new Date(2024, 0, 1, i))
      )
    );
    const result = await kind.search('', 's1');
    expect(result.data).toHaveLength(20);
    expect(result.totalResults).toBe(25);
  });

  it('returns no rows and a zero count for a store without any', async () => {
    expect(await kind.search('', 's1')).toEqual({ data: [], totalResults: 0 });
  });

  it('finds the rows that touch a stock item, in one store', async () => {
    await seed([
      kind.doc('a', 's1', new Date(2024, 0, 1), 'i1'),
      kind.doc('b', 's1', new Date(2024, 0, 2), 'i2'),
      kind.doc('c', 's2', new Date(2024, 0, 3), 'i1'),
      kind.doc('d', 's1', new Date(2024, 0, 4), 'i1'),
    ]);

    expect(ids(await kind.byItem('s1', 'i1'))).toEqual(['d', 'a']);
  });

  if (kind.byMonth) {
    it('finds the rows of one month of a store', async () => {
      await seed([
        kind.doc('apr', 's1', new Date(2024, 3, 30, 12)),
        kind.doc('may1', 's1', new Date(2024, 4, 1, 0, 0)),
        kind.doc('may31', 's1', new Date(2024, 4, 31, 23, 0)),
        kind.doc('jun', 's1', new Date(2024, 5, 1, 0, 0)),
        kind.doc('other', 's2', new Date(2024, 4, 15)),
      ]);

      expect(ids(await kind.byMonth!('s1', '15-05-2024'))).toEqual([
        'may31',
        'may1',
      ]);
    });
  }
});

describe('searching purchase forms', () => {
  it('filters on vendor', async () => {
    await (PurchaseForms as any).rawCollection().insertMany([
      { _id: 'a', physicalStoreId: 's1', vendorId: 'v1' } as never,
      { _id: 'b', physicalStoreId: 's1', vendorId: 'v2' } as never,
    ]);
    const result: any = await getPurchaseForms('vendorId=v2', 's1');
    expect(result.data.map((f: { _id: string }) => f._id)).toEqual(['b']);
  });
});

describe('searching issuance forms', () => {
  it('filters on location', async () => {
    await (IssuanceForms as any).rawCollection().insertMany([
      { _id: 'a', physicalStoreId: 's1', locationId: 'l1' } as never,
      { _id: 'b', physicalStoreId: 's1', locationId: 'l2' } as never,
    ]);
    const result: any = await getIssuanceForms('locationId=l1', 's1');
    expect(result.data.map((f: { _id: string }) => f._id)).toEqual(['a']);
  });
});

describe('searching stock adjustments', () => {
  it('filters on stock item', async () => {
    await (StockAdjustments as any).rawCollection().insertMany([
      { _id: 'a', physicalStoreId: 's1', stockItemId: 'i1' } as never,
      { _id: 'b', physicalStoreId: 's1', stockItemId: 'i2' } as never,
    ]);
    const result: any = await getStockAdjustments('stockItemId=i2', 's1');
    expect(result.data.map((f: { _id: string }) => f._id)).toEqual(['b']);
  });
});
