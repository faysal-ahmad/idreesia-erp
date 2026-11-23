import {
  InvoiceStatus,
  OrderStatus,
  PaymentStatus,
  RequisitionStatus,
} from 'meteor/idreesia-common/constants/purchasing';
import {
  PurchasingInvoices,
  PurchasingOrders,
  PurchasingPayments,
  PurchasingRequisitions,
} from 'meteor/idreesia-common/server/collections/purchasing';

import { purchasingError } from './errors';
import { roundMoney } from './internal';

export interface DateRange {
  fromDate?: Date;
  toDate?: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const rangeSelector = (field: string, { fromDate, toDate }: DateRange) =>
  fromDate || toDate
    ? {
        [field]: {
          ...(fromDate ? { $gte: fromDate } : {}),
          ...(toDate ? { $lte: toDate } : {}),
        },
      }
    : {};

/** What was billed per vendor in the period: voided invoices don't count. */
export async function spendingByVendor(range: DateRange = {}) {
  const rows = await PurchasingInvoices.aggregate<{
    _id: string;
    invoiceCount: number;
    total: number;
    paidAmount: number;
  }>([
    {
      $match: {
        status: { $ne: InvoiceStatus.VOIDED },
        ...rangeSelector('invoiceDate', range),
      },
    },
    {
      $group: {
        _id: '$vendorId',
        invoiceCount: { $sum: 1 },
        total: { $sum: '$total' },
        paidAmount: { $sum: '$paidAmount' },
      },
    },
    { $sort: { total: -1 } },
  ]);
  return rows.map((row) => ({
    vendorId: row._id,
    invoiceCount: row.invoiceCount,
    total: roundMoney(row.total),
    paidAmount: roundMoney(row.paidAmount),
  }));
}

/** What was billed per calendar month ("2030-01") in the period. */
export async function spendingByMonth(range: DateRange = {}) {
  const rows = await PurchasingInvoices.aggregate<{
    _id: string;
    invoiceCount: number;
    total: number;
  }>([
    {
      $match: {
        status: { $ne: InvoiceStatus.VOIDED },
        ...rangeSelector('invoiceDate', range),
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$invoiceDate' } },
        invoiceCount: { $sum: 1 },
        total: { $sum: '$total' },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return rows.map((row) => ({
    month: row._id,
    invoiceCount: row.invoiceCount,
    total: roundMoney(row.total),
  }));
}

/** Orders still waiting for goods, with what is outstanding and whether delivery is late. */
export async function openOrders(now: Date = new Date()) {
  const orders = await PurchasingOrders.find(
    {
      status: {
        $in: [OrderStatus.APPROVED, OrderStatus.SENT, OrderStatus.PARTIALLY_RECEIVED],
      },
    },
    { sort: { expectedDeliveryDate: 1, orderDate: 1 }, limit: 500 }
  ).fetchAsync();
  return orders.map((order) => {
    const outstandingValue = roundMoney(
      order.lines.reduce(
        (sum, l) => sum + Math.max(0, l.quantity - l.receivedQuantity) * l.unitPrice,
        0
      )
    );
    return {
      orderId: order._id,
      number: order.number,
      vendorId: order.vendorId,
      status: order.status,
      orderDate: order.orderDate,
      expectedDeliveryDate: order.expectedDeliveryDate,
      total: order.total,
      outstandingValue,
      isOverdue: !!order.expectedDeliveryDate && order.expectedDeliveryDate < now,
    };
  });
}

/**
 * What is owed per vendor, by how late it is: not yet due, 1-30, 31-60 and
 * 61 or more days past due.
 */
export async function payablesAging(asOf: Date = new Date()) {
  const invoices = await PurchasingInvoices.find({
    status: { $in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID] },
  }).fetchAsync();

  const byVendor = new Map<
    string,
    { vendorId: string; current: number; days1To30: number; days31To60: number; days61Plus: number; total: number }
  >();
  invoices.forEach((invoice) => {
    const balance = roundMoney(invoice.total - invoice.paidAmount);
    if (balance <= 0) return;
    const row = byVendor.get(invoice.vendorId) ?? {
      vendorId: invoice.vendorId,
      current: 0,
      days1To30: 0,
      days31To60: 0,
      days61Plus: 0,
      total: 0,
    };
    const daysLate = Math.floor((asOf.getTime() - invoice.dueDate.getTime()) / DAY_MS);
    if (daysLate <= 0) row.current += balance;
    else if (daysLate <= 30) row.days1To30 += balance;
    else if (daysLate <= 60) row.days31To60 += balance;
    else row.days61Plus += balance;
    row.total += balance;
    byVendor.set(invoice.vendorId, row);
  });
  return [...byVendor.values()]
    .map((row) => ({
      vendorId: row.vendorId,
      current: roundMoney(row.current),
      days1To30: roundMoney(row.days1To30),
      days31To60: roundMoney(row.days31To60),
      days61Plus: roundMoney(row.days61Plus),
      total: roundMoney(row.total),
    }))
    .sort((a, b) => b.total - a.total);
}

/**
 * A vendor's account: invoices raise what is owed, payments lower it, with a
 * running balance. The balance before the period opens the list.
 */
export async function vendorLedger(vendorId: string, range: DateRange = {}) {
  if (!vendorId) throw purchasingError('BAD_USER_INPUT', 'Choose a vendor.');
  const invoices = await PurchasingInvoices.find({
    vendorId: { $eq: vendorId },
    status: { $ne: InvoiceStatus.VOIDED },
  }).fetchAsync();
  const payments = await PurchasingPayments.find({
    vendorId: { $eq: vendorId },
    status: PaymentStatus.POSTED,
  }).fetchAsync();

  const all = [
    ...invoices.map((i) => ({
      date: i.invoiceDate,
      type: 'invoice' as const,
      documentId: i._id,
      number: i.number,
      reference: i.vendorInvoiceNo,
      amount: i.total,
    })),
    ...payments.map((p) => ({
      date: p.paymentDate,
      type: 'payment' as const,
      documentId: p._id,
      number: p.number,
      reference: p.reference,
      amount: -p.amount,
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const { fromDate, toDate } = range;
  let balance = roundMoney(
    all.filter((e) => fromDate && e.date < fromDate).reduce((s, e) => s + e.amount, 0)
  );
  const openingBalance = balance;
  const entries = all
    .filter((e) => (!fromDate || e.date >= fromDate) && (!toDate || e.date <= toDate))
    .map((e) => {
      balance = roundMoney(balance + e.amount);
      return { ...e, balance };
    });
  return { openingBalance, closingBalance: balance, entries };
}

/** The numbers for the Purchasing dashboard. */
export async function dashboardCounts(now: Date = new Date()) {
  const [requisitionsAwaitingApproval, ordersAwaitingApproval, openOrderCount, unpaid] =
    await Promise.all([
      PurchasingRequisitions.find({ status: RequisitionStatus.SUBMITTED }).countAsync(),
      PurchasingOrders.find({ status: OrderStatus.PENDING_APPROVAL }).countAsync(),
      PurchasingOrders.find({
        status: {
          $in: [OrderStatus.APPROVED, OrderStatus.SENT, OrderStatus.PARTIALLY_RECEIVED],
        },
      }).countAsync(),
      PurchasingInvoices.find({
        status: { $in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID] },
      }).fetchAsync(),
    ]);

  let totalPayable = 0;
  let overdueAmount = 0;
  let overdueInvoices = 0;
  unpaid.forEach((invoice) => {
    const balance = invoice.total - invoice.paidAmount;
    totalPayable += balance;
    if (invoice.dueDate < now) {
      overdueAmount += balance;
      overdueInvoices += 1;
    }
  });
  return {
    requisitionsAwaitingApproval,
    ordersAwaitingApproval,
    openOrders: openOrderCount,
    overdueInvoices,
    totalPayable: roundMoney(totalPayable),
    overdueAmount: roundMoney(overdueAmount),
  };
}
