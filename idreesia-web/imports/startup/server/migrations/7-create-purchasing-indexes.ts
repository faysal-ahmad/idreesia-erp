import { Migrations } from 'meteor/quave:migrations';

import {
  PurchasingAttachments,
  PurchasingCatalogItems,
  PurchasingCounters,
  PurchasingInvoices,
  PurchasingOrders,
  PurchasingPayments,
  PurchasingPettyCashExpenseHeads,
  PurchasingPettyCashFunds,
  PurchasingPettyCashReplenishments,
  PurchasingPettyCashVouchers,
  PurchasingQuotes,
  PurchasingReceipts,
  PurchasingRequisitions,
  PurchasingVendors,
} from 'meteor/idreesia-common/server/collections/purchasing';

// Case-insensitive comparison for names.
const CASE_INSENSITIVE = { locale: 'en', strength: 2 } as const;

// A line's purchasing catalog item is `internalCatalogId`; `externalCatalogId`
// holds a store's stock item. Requisitions, orders and receipts raised for a
// store carry `source` and `externalSourceId`.
async function createPurchasingIndexes() {
  const vendors = PurchasingVendors.rawCollection();
  await vendors.createIndex({ isActive: 1, name: 1 }, { background: true });

  const catalogItems = PurchasingCatalogItems.rawCollection();
  await catalogItems.createIndex(
    { name: 1 },
    { unique: true, collation: CASE_INSENSITIVE }
  );
  await catalogItems.createIndex({ isActive: 1, name: 1 }, { background: true });

  // One counter document per document type and year.
  await PurchasingCounters.rawCollection().createIndex(
    { type: 1, year: 1 },
    { unique: true }
  );

  const requisitions = PurchasingRequisitions.rawCollection();
  await requisitions.createIndex({ number: 1 }, { unique: true });
  await requisitions.createIndex({ status: 1, createdAt: -1 });
  await requisitions.createIndex({ requestedBy: 1, createdAt: -1 });
  await requisitions.createIndex({ 'lines.internalCatalogId': 1 }, { sparse: true });
  await requisitions.createIndex(
    { source: 1, externalSourceId: 1, status: 1 },
    { sparse: true }
  );

  const quotes = PurchasingQuotes.rawCollection();
  await quotes.createIndex({ requisitionId: 1, status: 1 }, { sparse: true });
  await quotes.createIndex({ vendorId: 1, quoteDate: -1 });
  await quotes.createIndex({ 'lines.internalCatalogId': 1 }, { sparse: true });

  const orders = PurchasingOrders.rawCollection();
  await orders.createIndex({ number: 1 }, { unique: true });
  await orders.createIndex({ status: 1, orderDate: -1 });
  await orders.createIndex({ vendorId: 1, orderDate: -1 });
  await orders.createIndex({ requisitionId: 1 }, { sparse: true });
  await orders.createIndex({ quoteId: 1 }, { sparse: true });
  await orders.createIndex({ 'lines.internalCatalogId': 1 }, { sparse: true });
  await orders.createIndex(
    { source: 1, externalSourceId: 1, status: 1 },
    { sparse: true }
  );

  const receipts = PurchasingReceipts.rawCollection();
  await receipts.createIndex({ number: 1 }, { unique: true });
  await receipts.createIndex({ orderId: 1, status: 1 });
  await receipts.createIndex({ vendorId: 1, receivedDate: -1 });
  await receipts.createIndex(
    { source: 1, externalSourceId: 1, status: 1 },
    { sparse: true }
  );

  const invoices = PurchasingInvoices.rawCollection();
  await invoices.createIndex({ number: 1 }, { unique: true });
  await invoices.createIndex({ vendorId: 1, vendorInvoiceNo: 1 });
  await invoices.createIndex({ orderId: 1, status: 1 }, { sparse: true });
  // Invoices bill each line against an order, so they list `orderIds`.
  await invoices.createIndex({ orderIds: 1 }, { sparse: true });
  // Overdue and payables reports.
  await invoices.createIndex({ status: 1, dueDate: 1 });
  await invoices.createIndex({ invoiceDate: -1 });
  await invoices.createIndex({ 'lines.internalCatalogId': 1 }, { sparse: true });

  const attachments = PurchasingAttachments.rawCollection();
  await attachments.createIndex({ ownerType: 1, ownerId: 1, status: 1 });
  // Clearing out expired pending uploads.
  await attachments.createIndex({ status: 1, uploadExpiresAt: 1 }, { sparse: true });

  const payments = PurchasingPayments.rawCollection();
  await payments.createIndex({ number: 1 }, { unique: true });
  await payments.createIndex({ vendorId: 1, paymentDate: -1 });
}

// Petty cash funds, the expense heads vouchers are booked to, the vouchers
// spent from the funds, and the replenishments that top them back up.
async function createPettyCashIndexes() {
  const funds = PurchasingPettyCashFunds.rawCollection();
  await funds.createIndex({ isActive: 1, name: 1 }, { background: true });
  await funds.createIndex({ custodianPersonId: 1 }, { background: true });

  const expenseHeads = PurchasingPettyCashExpenseHeads.rawCollection();
  await expenseHeads.createIndex(
    { name: 1 },
    { unique: true, collation: CASE_INSENSITIVE }
  );
  await expenseHeads.createIndex({ isActive: 1, name: 1 }, { background: true });

  const vouchers = PurchasingPettyCashVouchers.rawCollection();
  await vouchers.createIndex({ number: 1 }, { unique: true });
  await vouchers.createIndex({ fundId: 1, status: 1, voucherDate: -1 });
  await vouchers.createIndex({ status: 1, voucherDate: -1 });
  await vouchers.createIndex({ expenseHeadId: 1 });
  await vouchers.createIndex({ replenishmentId: 1 }, { sparse: true });

  const replenishments = PurchasingPettyCashReplenishments.rawCollection();
  await replenishments.createIndex({ number: 1 }, { unique: true });
  await replenishments.createIndex({ fundId: 1, status: 1, createdAt: -1 });
}

Migrations.add({
  version: 7,
  name: 'Create purchasing indexes',
  async up() {
    await createPurchasingIndexes();
    await createPettyCashIndexes();
  },
});
