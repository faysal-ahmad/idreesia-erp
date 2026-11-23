import { beforeEach, describe, expect, it, vi } from 'vitest';

// exceljs is installed for the Meteor app only, so the workbook builder is
// replaced by a recorder of the sheet name and rows each exporter produces.
vi.mock(
  'meteor/idreesia-common/server/business-logic/common/excel-exporter',
  () => ({ createWorkbookBuffer: vi.fn(async () => Buffer.from('xlsx')) })
);

import { createWorkbookBuffer } from 'meteor/idreesia-common/server/business-logic/common/excel-exporter';
import {
  PurchasingInvoices,
  PurchasingOrders,
  PurchasingPayments,
} from 'meteor/idreesia-common/server/collections/purchasing';

import {
  exportPurchasingPayablesAging,
  exportPurchasingSpendingByVendor,
  exportPurchasingVendorLedger,
} from './exporters';
import {
  approveOrder,
  createInvoice,
  createOrder,
  createVendor,
  getOrder,
  postPayment,
  postReceipt,
  submitOrder,
} from './index';

const build = vi.mocked(createWorkbookBuffer);
const lastSheet = () => {
  const [rows, sheetName] = build.mock.calls[build.mock.calls.length - 1] as [
    Record<string, unknown>[],
    string,
  ];
  return { rows, sheetName };
};

const user = { _id: 'u1' };
const day = (y: number, m: number, d: number) => new Date(y, m - 1, d);

let vendorId: string;
let invoiceId: string;

beforeEach(async () => {
  build.mockClear();
  await PurchasingPayments.removeAsync({});
  await PurchasingInvoices.removeAsync({});
  await PurchasingOrders.removeAsync({});

  vendorId = (await createVendor({ name: `Export Co ${Math.random()}` }, user))._id;
  const order = await createOrder(
    { vendorId, orderDate: day(2041, 1, 1), lines: [{ description: 'Item', unit: 'pc', quantity: 10, unitPrice: 10 }] },
    user
  );
  await submitOrder(order._id, user);
  await approveOrder(order._id, user);
  const approved = await getOrder(order._id);
  await postReceipt({ orderId: order._id, receivedDate: day(2041, 1, 2), lines: [{ orderLineId: approved.lines[0]._id, receivedQuantity: 10 }] }, user);
  invoiceId = (
    await createInvoice(
      {
        vendorId,
        orderId: order._id,
        vendorInvoiceNo: 'X-1',
        invoiceDate: day(2041, 1, 5),
        dueDate: day(2041, 2, 5),
        lines: [{ orderLineId: approved.lines[0]._id, description: 'Item', unit: 'pc', quantity: 10, unitPrice: 10 }],
      },
      user
    )
  )._id;
});

describe('purchasing exporters', () => {
  it('writes spending by vendor with the vendor name and outstanding amount', async () => {
    await exportPurchasingSpendingByVendor(',');
    const { rows, sheetName } = lastSheet();
    expect(sheetName).toBe('Spending by Vendor');
    expect(rows).toEqual([
      expect.objectContaining({ Invoices: 1, Billed: 100, Paid: 0, Outstanding: 100 }),
    ]);
    expect(String(rows[0].Vendor)).toContain('Export Co');
  });

  it('honours the date range in the arguments', async () => {
    await exportPurchasingSpendingByVendor(`${day(2042, 1, 1).getTime()},`);
    expect(lastSheet().rows).toEqual([]);
  });

  it('writes payables aging', async () => {
    await exportPurchasingPayablesAging();
    const { rows, sheetName } = lastSheet();
    expect(sheetName).toBe('Payables Aging');
    // Due in 2041, so nothing is late yet.
    expect(rows[0]).toMatchObject({ 'Total Owed': 100, 'Not Yet Due': 100, '61+ Days': 0 });
  });

  it('writes a vendor ledger with opening balance, invoices and payments', async () => {
    await postPayment(
      { vendorId, paymentDate: day(2041, 1, 20), method: 'cash', allocations: [{ invoiceId, amount: 40 }] },
      user
    );
    await exportPurchasingVendorLedger(`${vendorId},,`);
    const { rows, sheetName } = lastSheet();
    expect(sheetName).toBe('Vendor Ledger');
    expect(rows.map((r) => [r.Billed, r.Paid, r.Balance])).toEqual([
      ['', '', 0],
      [100, '', 100],
      ['', 40, 60],
    ]);
  });
});
