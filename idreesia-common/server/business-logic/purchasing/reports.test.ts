import { describe, expect, it } from 'vitest';

import {
  PurchasingInvoices,
  PurchasingOrders,
  PurchasingPayments,
} from 'meteor/idreesia-common/server/collections/purchasing';

import {
  approveOrder,
  createInvoice,
  createOrderFromRequisition,
  createRequisition,
  approveRequisition,
  submitRequisition,
  updateOrder,
  createVendor,
  dashboardCounts,
  markOrderSent,
  openOrders,
  payablesAging,
  postPayment,
  postReceipt,
  spendingByMonth,
  spendingByVendor,
  submitOrder,
  voidInvoice,
  vendorLedger,
  getOrder,
} from './index';

const user = { _id: 'u1' };
const day = (y: number, m: number, d: number) => new Date(y, m - 1, d);

// Each test starts from an empty set of documents so totals are exact.
const clean = async () => {
  await PurchasingPayments.removeAsync({});
  await PurchasingInvoices.removeAsync({});
  await PurchasingOrders.removeAsync({});
};

/** Orders only come from a requisition: makes an approved one and a draft order from it. */
const draftOrder = async (
  vendorId: string,
  orderDate: Date,
  line: { quantity: number; unitPrice: number },
  expectedDeliveryDate?: Date
) => {
  const requisition = await createRequisition(
    { title: 'R', lines: [{ description: 'Item', unit: 'pc', quantity: line.quantity, estimatedUnitPrice: line.unitPrice }] },
    user
  );
  await submitRequisition(requisition._id, user);
  await approveRequisition(requisition._id, user);
  const order = await createOrderFromRequisition(requisition._id, vendorId, user);
  return updateOrder(
    order._id,
    order.version,
    { vendorId, orderDate, expectedDeliveryDate, lines: order.lines },
    user
  );
};

const billedVendor = async (name: string, invoices: { no: string; date: Date; due: Date; qty: number }[]) => {
  const vendor = await createVendor({ name }, user);
  const order = await draftOrder(vendor._id, day(2040, 1, 1), { quantity: 1000, unitPrice: 10 });
  await submitOrder(order._id, user);
  await approveOrder(order._id, user);
  const approved = await getOrder(order._id);
  await postReceipt({ orderId: order._id, receivedDate: day(2040, 1, 2), lines: [{ orderLineId: approved.lines[0]._id, receivedQuantity: 1000 }] }, user);
  const created = [];
  for (const inv of invoices) {
    created.push(
      await createInvoice(
        {
          vendorId: vendor._id,
          vendorInvoiceNo: inv.no,
          invoiceDate: inv.date,
          dueDate: inv.due,
          lines: [{ orderId: order._id, orderLineId: approved.lines[0]._id, description: 'Item', unit: 'pc', quantity: inv.qty, unitPrice: 10 }],
        },
        user
      )
    );
  }
  return { vendor, order, invoices: created };
};

describe('purchasing reports', () => {
  it('sums billed amounts by vendor and month, ignoring voided invoices', async () => {
    await clean();
    const a = await billedVendor('Report A', [
      { no: 'A1', date: day(2040, 1, 5), due: day(2040, 2, 5), qty: 10 },
      { no: 'A2', date: day(2040, 2, 5), due: day(2040, 3, 5), qty: 20 },
    ]);
    const b = await billedVendor('Report B', [{ no: 'B1', date: day(2040, 1, 20), due: day(2040, 2, 20), qty: 5 }]);
    await voidInvoice(b.invoices[0]._id, user);

    const byVendor = await spendingByVendor();
    expect(byVendor).toEqual([{ vendorId: a.vendor._id, invoiceCount: 2, total: 300, paidAmount: 0 }]);

    const byMonth = await spendingByMonth({ fromDate: day(2040, 1, 1), toDate: day(2040, 12, 31) });
    expect(byMonth).toEqual([
      { month: '2040-01', invoiceCount: 1, total: 100 },
      { month: '2040-02', invoiceCount: 1, total: 200 },
    ]);
    expect(await spendingByVendor({ fromDate: day(2040, 2, 1) })).toHaveLength(1);
  });

  it('buckets what is owed by how late it is', async () => {
    await clean();
    const asOf = day(2040, 6, 30);
    const v = await billedVendor('Aging Co', [
      { no: 'G1', date: day(2040, 1, 1), due: day(2040, 7, 15), qty: 1 }, // not due: 10
      { no: 'G2', date: day(2040, 1, 1), due: day(2040, 6, 20), qty: 2 }, // 10 days late: 20
      { no: 'G3', date: day(2040, 1, 1), due: day(2040, 5, 15), qty: 3 }, // 46 days: 30
      { no: 'G4', date: day(2040, 1, 1), due: day(2040, 3, 1), qty: 4 }, // 121 days: 40
    ]);
    const rows = await payablesAging(asOf);
    expect(rows).toEqual([
      { vendorId: v.vendor._id, current: 10, days1To30: 20, days31To60: 30, days61Plus: 40, total: 100 },
    ]);

    await postPayment(
      { vendorId: v.vendor._id, paymentDate: asOf, method: 'cash', allocations: [{ invoiceId: v.invoices[3]._id, amount: 40 }] },
      user
    );
    expect((await payablesAging(asOf))[0]).toMatchObject({ days61Plus: 0, total: 60 });
  });

  it('builds a vendor ledger with an opening and running balance', async () => {
    await clean();
    const v = await billedVendor('Ledger Co', [
      { no: 'L1', date: day(2040, 1, 5), due: day(2040, 2, 5), qty: 10 }, // +100
      { no: 'L2', date: day(2040, 3, 5), due: day(2040, 4, 5), qty: 20 }, // +200
    ]);
    await postPayment(
      { vendorId: v.vendor._id, paymentDate: day(2040, 2, 1), method: 'cash', allocations: [{ invoiceId: v.invoices[0]._id, amount: 60 }] },
      user
    );

    const all = await vendorLedger(v.vendor._id);
    expect(all.openingBalance).toBe(0);
    expect(all.entries.map((e) => [e.type, e.amount, e.balance])).toEqual([
      ['invoice', 100, 100],
      ['payment', -60, 40],
      ['invoice', 200, 240],
    ]);
    expect(all.closingBalance).toBe(240);

    const later = await vendorLedger(v.vendor._id, { fromDate: day(2040, 3, 1) });
    expect(later.openingBalance).toBe(40);
    expect(later.entries).toHaveLength(1);
    expect(later.closingBalance).toBe(240);
  });

  it('lists open orders with what is outstanding, and counts the dashboard', async () => {
    await clean();
    const vendor = await createVendor({ name: 'Open Co' }, user);
    const order = await draftOrder(vendor._id, day(2020, 1, 1), { quantity: 10, unitPrice: 5 }, day(2020, 2, 1));
    await submitOrder(order._id, user);
    expect((await dashboardCounts()).ordersAwaitingApproval).toBe(1);
    await approveOrder(order._id, user);
    await markOrderSent(order._id, user);
    const approved = await getOrder(order._id);
    await postReceipt({ orderId: order._id, receivedDate: day(2020, 1, 5), lines: [{ orderLineId: approved.lines[0]._id, receivedQuantity: 4 }] }, user);

    const open = await openOrders();
    expect(open).toHaveLength(1);
    expect(open[0]).toMatchObject({ orderId: order._id, outstandingValue: 30, isOverdue: true, status: 'partially-received' });

    const counts = await dashboardCounts();
    expect(counts).toMatchObject({ openOrders: 1, ordersAwaitingApproval: 0, totalPayable: 0, overdueInvoices: 0 });
  });
});
