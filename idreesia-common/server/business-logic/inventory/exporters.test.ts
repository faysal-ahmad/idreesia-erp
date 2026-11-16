import { beforeEach, describe, expect, it, vi } from 'vitest';

// exceljs is installed for the Meteor app only, so the workbook builder is
// replaced by a recorder: these tests check the sheet name and the rows (one
// object per row, its keys the column headers) each exporter hands to it.
vi.mock(
  'meteor/idreesia-common/server/business-logic/common/excel-exporter',
  () => ({ createWorkbookBuffer: vi.fn(async () => Buffer.from('xlsx')) })
);

import { createWorkbookBuffer } from 'meteor/idreesia-common/server/business-logic/common/excel-exporter';
import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  IssuanceForms,
  ItemCategories,
  Locations,
  PurchaseForms,
  StockAdjustments,
  StockItems,
} from 'meteor/idreesia-common/server/collections/inventory';

import { exportIsssuanceForms } from './issuance-forms-exporter';
import { exportPurchaseForms } from './purchase-forms-exporter';
import { exportStockAdjustmentForms } from './stock-adjustment-forms-exporter';
import { exportStockItems } from './stock-items-exporter';

const build = vi.mocked(createWorkbookBuffer);
const lastSheet = () => {
  const [rows, sheetName] = build.mock.calls[build.mock.calls.length - 1] as [
    Record<string, unknown>[],
    string,
  ];
  return { rows, sheetName };
};

const date = new Date(2024, 2, 5, 10);
const insert = (collection: { rawCollection(): any }, docs: unknown[]) =>
  collection.rawCollection().insertMany(docs);

beforeEach(async () => {
  build.mockClear();
  await insert(People, [
    { _id: 'p1', sharedData: { name: 'Ali' } },
    { _id: 'p2', sharedData: { name: 'Bilal' } },
  ]);
  await insert(Locations, [{ _id: 'l1', name: 'Kitchen' }]);
  await insert(StockItems, [
    { _id: 'rice', name: 'Rice', unitOfMeasurement: 'quantity' },
    { _id: 'oil', name: 'Oil', unitOfMeasurement: 'litre' },
  ]);
});

describe('exportIsssuanceForms', () => {
  it('writes one row per form with the issued items listed', async () => {
    await insert(IssuanceForms, [
      {
        _id: 'f1',
        issueDate: date,
        issuedTo: 'p1',
        locationId: 'l1',
        items: [
          { stockItemId: 'rice', quantity: 3 },
          { stockItemId: 'oil', quantity: 2, isInflow: true },
        ],
      },
    ]);

    const buffer = await exportIsssuanceForms('f1');

    expect(buffer.toString()).toBe('xlsx');
    expect(lastSheet()).toEqual({
      sheetName: 'Issuance Forms',
      rows: [
        {
          'Issue Date': '05 Mar, 2024',
          'Issued To': 'Ali',
          'Location Name': 'Kitchen',
          Items: 'Rice [3 Issued]\nOil [2 litre Returned]',
        },
      ],
    });
  });

  it('names who the items were handed to, on behalf of the person', async () => {
    await insert(IssuanceForms, [
      {
        _id: 'f1',
        issueDate: date,
        issuedTo: 'p1',
        handedOverTo: 'Driver',
        items: [],
      },
    ]);

    await exportIsssuanceForms('f1');

    expect(lastSheet().rows[0]).toMatchObject({
      'Issued To': 'Driver - [on behalf of Ali]',
      'Location Name': '',
      Items: '',
    });
  });

  it('leaves names empty for unknown people and locations', async () => {
    await insert(IssuanceForms, [
      {
        _id: 'f1',
        issueDate: date,
        issuedTo: 'ghost',
        locationId: 'gone',
        items: [],
      },
    ]);

    await exportIsssuanceForms('f1');

    expect(lastSheet().rows[0]).toMatchObject({
      'Issued To': '',
      'Location Name': '',
    });
  });

  it('only exports the requested forms, one row each', async () => {
    await insert(IssuanceForms, [
      { _id: 'f1', issueDate: date, issuedTo: 'p1', items: [] },
      { _id: 'f2', issueDate: date, issuedTo: 'p2', items: [] },
      { _id: 'f3', issueDate: date, issuedTo: 'p1', items: [] },
    ]);

    await exportIsssuanceForms('f1,f2');

    expect(lastSheet().rows.map(row => row['Issued To']).sort()).toEqual([
      'Ali',
      'Bilal',
    ]);
  });
});

describe('exportPurchaseForms', () => {
  it('writes one row per form with the purchased and returned items', async () => {
    await insert(PurchaseForms, [
      {
        _id: 'f1',
        purchaseDate: date,
        purchasedBy: 'p2',
        locationId: 'l1',
        items: [
          { stockItemId: 'rice', quantity: 10, isInflow: true },
          { stockItemId: 'oil', quantity: 1 },
        ],
      },
    ]);

    await exportPurchaseForms('f1');

    expect(lastSheet()).toEqual({
      sheetName: 'Purchase Forms',
      rows: [
        {
          'Purchase Date': '05 Mar, 2024',
          'Purchased By': 'Bilal',
          'Location Name': 'Kitchen',
          Items: 'Rice [10 Purchased]\nOil [1 litre Returned]',
        },
      ],
    });
  });

  it('leaves names empty for unknown people and no location', async () => {
    await insert(PurchaseForms, [
      { _id: 'f1', purchaseDate: date, purchasedBy: 'ghost', items: [] },
    ]);

    await exportPurchaseForms('f1');

    expect(lastSheet().rows[0]).toMatchObject({
      'Purchased By': '',
      'Location Name': '',
    });
  });
});

describe('exportStockAdjustmentForms', () => {
  it.each([
    ['increased', true, 'Increased by 4'],
    ['decreased', false, 'Decreased by 4'],
  ])('describes a stock %s', async (_label, isInflow, text) => {
    await insert(StockAdjustments, [
      {
        _id: 'a1',
        stockItemId: 'rice',
        adjustmentDate: date,
        adjustedBy: 'p1',
        quantity: 4,
        isInflow,
        adjustmentReason: 'Recount',
      },
    ]);

    await exportStockAdjustmentForms('a1');

    expect(lastSheet()).toEqual({
      sheetName: 'Stock Adjustment Forms',
      rows: [
        {
          Name: 'Rice',
          Adjustment: text,
          'Adjustment Date': '05 Mar, 2024',
          'Adjusted By': 'Ali',
          'Adjustment Reason': 'Recount',
        },
      ],
    });
  });

  it.each([
    [{ name: 'Rice' }, 'Rice'],
    [{ name: 'Rice', company: 'Acme' }, 'Rice - Acme'],
    [{ name: 'Rice', details: '5kg' }, 'Rice - 5kg'],
    [{ name: 'Rice', company: 'Acme', details: '5kg' }, 'Rice - Acme - 5kg'],
  ])('names the item as %j -> %s', async (itemFields, expected) => {
    await (StockItems as any).rawCollection().updateOne(
      { _id: 'rice' },
      { $set: itemFields }
    );
    await insert(StockAdjustments, [
      {
        _id: 'a1',
        stockItemId: 'rice',
        adjustmentDate: date,
        adjustedBy: 'p1',
        quantity: 1,
      },
    ]);

    await exportStockAdjustmentForms('a1');

    expect(lastSheet().rows[0].Name).toBe(expected);
  });
});

describe('exportStockItems', () => {
  it('lists the items of the store by name with their category and level', async () => {
    await (StockItems as any).rawCollection().deleteMany({});
    await insert(ItemCategories, [
      { _id: 'c1', physicalStoreId: 's1', name: 'Grocery' },
      { _id: 'c2', physicalStoreId: 's2', name: 'Elsewhere' },
    ]);
    await insert(StockItems, [
      {
        _id: 'i1',
        physicalStoreId: 's1',
        name: 'Rice',
        company: 'Acme',
        details: 'Basmati',
        categoryId: 'c1',
        unitOfMeasurement: 'quantity',
        currentStockLevel: 12,
      },
      {
        _id: 'i2',
        physicalStoreId: 's1',
        name: 'Atta',
        unitOfMeasurement: 'kg',
        currentStockLevel: -3,
      },
      {
        _id: 'i3',
        physicalStoreId: 's2',
        name: 'Other store',
        categoryId: 'c2',
        unitOfMeasurement: 'quantity',
        currentStockLevel: 1,
      },
    ]);

    await exportStockItems('s1');

    expect(lastSheet()).toEqual({
      sheetName: 'Stock Items',
      rows: [
        {
          Name: 'Atta',
          Company: undefined,
          Details: undefined,
          Category: undefined,
          'Current Stock': '-3 kg',
        },
        {
          Name: 'Rice',
          Company: 'Acme',
          Details: 'Basmati',
          Category: 'Grocery',
          'Current Stock': 12,
        },
      ],
    });
  });

  it('exports an empty sheet for a store without items', async () => {
    await exportStockItems('empty-store');
    expect(lastSheet()).toEqual({ sheetName: 'Stock Items', rows: [] });
  });
});
