import dayjs from 'dayjs';

import { PurchasingVendors } from 'meteor/idreesia-common/server/collections/purchasing';
import { createWorkbookBuffer } from 'meteor/idreesia-common/server/business-logic/common/excel-exporter';

import {
  openOrders,
  payablesAging,
  spendingByMonth,
  spendingByVendor,
  vendorLedger,
  type DateRange,
} from './reports';

const DATE_FORMAT = 'DD MMM, YYYY';

/** "fromMs,toMs": either may be empty. */
function parseRange(reportArgs: string): DateRange {
  const [from, to] = reportArgs.split(',');
  const toDate = (value?: string) =>
    value && /^\d+$/.test(value) ? new Date(Number(value)) : undefined;
  return { fromDate: toDate(from), toDate: toDate(to) };
}

async function vendorNames(vendorIds: string[]) {
  const vendors = await PurchasingVendors.find({
    _id: { $in: vendorIds },
  }).fetchAsync();
  return new Map(vendors.map((vendor) => [vendor._id, vendor.name]));
}

const formatDate = (date?: Date) => (date ? dayjs(date).format(DATE_FORMAT) : '');

export async function exportPurchasingSpendingByVendor(reportArgs: string) {
  const rows = await spendingByVendor(parseRange(reportArgs));
  const names = await vendorNames(rows.map((row) => row.vendorId));
  return createWorkbookBuffer(
    rows.map((row) => ({
      Vendor: names.get(row.vendorId) ?? '',
      Invoices: row.invoiceCount,
      Billed: row.total,
      Paid: row.paidAmount,
      Outstanding: Math.round((row.total - row.paidAmount) * 100) / 100,
    })),
    'Spending by Vendor'
  );
}

export async function exportPurchasingSpendingByMonth(reportArgs: string) {
  const rows = await spendingByMonth(parseRange(reportArgs));
  return createWorkbookBuffer(
    rows.map((row) => ({
      Month: row.month,
      Invoices: row.invoiceCount,
      Billed: row.total,
    })),
    'Spending by Month'
  );
}

export async function exportPurchasingOpenOrders() {
  const rows = await openOrders();
  const names = await vendorNames(rows.map((row) => row.vendorId));
  return createWorkbookBuffer(
    rows.map((row) => ({
      Order: row.number,
      Vendor: names.get(row.vendorId) ?? '',
      Status: row.status,
      'Order Date': formatDate(row.orderDate),
      'Expected Delivery': formatDate(row.expectedDeliveryDate),
      Overdue: row.isOverdue ? 'Yes' : '',
      'Order Total': row.total,
      'Still Due': row.outstandingValue,
    })),
    'Open Orders'
  );
}

export async function exportPurchasingPayablesAging() {
  const rows = await payablesAging();
  const names = await vendorNames(rows.map((row) => row.vendorId));
  return createWorkbookBuffer(
    rows.map((row) => ({
      Vendor: names.get(row.vendorId) ?? '',
      'Not Yet Due': row.current,
      '1-30 Days': row.days1To30,
      '31-60 Days': row.days31To60,
      '61+ Days': row.days61Plus,
      'Total Owed': row.total,
    })),
    'Payables Aging'
  );
}

/** reportArgs is "vendorId,fromMs,toMs". */
export async function exportPurchasingVendorLedger(reportArgs: string) {
  const [vendorId, ...rest] = reportArgs.split(',');
  const ledger = await vendorLedger(vendorId, parseRange(rest.join(',')));
  const rows: Record<string, unknown>[] = [
    { Date: '', Document: 'Opening balance', Reference: '', Billed: '', Paid: '', Balance: ledger.openingBalance },
    ...ledger.entries.map((entry) => ({
      Date: formatDate(entry.date),
      Document: entry.number,
      Reference: entry.reference ?? '',
      Billed: entry.amount > 0 ? entry.amount : '',
      Paid: entry.amount < 0 ? -entry.amount : '',
      Balance: entry.balance,
    })),
  ];
  return createWorkbookBuffer(rows, 'Vendor Ledger');
}
