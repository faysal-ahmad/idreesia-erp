#!/usr/bin/env node
/*
 * Fills the Purchasing module with sample data, so every screen, status,
 * action and report of the module has something to show.
 *
 * It assumes the rest of the system already has data: users (the documents
 * are created, approved, received... by them), people (petty cash custodians)
 * and stores with stock items (store requisitions, store receipts and stock
 * lines on petty cash vouchers). Without stores the store scenarios are
 * skipped. Nothing outside Purchasing is created.
 *
 * What it makes, spread over the last ~6 months:
 *   - Vendors and catalog items (a few inactive), petty cash expense heads
 *     and funds (one inactive).
 *   - Purchasing requisitions in every status: draft, submitted, rejected,
 *     cancelled, approved (with open quotes to compare, and one whose only
 *     order was cancelled), ordered and closed.
 *   - Quotes: open, selected, rejected, and one not tied to a requisition.
 *   - Purchase orders in every status: a draft returned by the approver,
 *     pending approval, approved, sent (some late), partially received,
 *     received, closed short and cancelled; one requisition split across
 *     two vendors.
 *   - Goods receipts with rejected quantities, and a voided receipt.
 *   - Invoices: unpaid, overdue, partially paid, paid, voided, disputed
 *     (over-billed) and one covering two orders.
 *   - Payments by cash, bank transfer and cheque, one paying two invoices,
 *     and a voided (bounced) cheque.
 *   - Store requisitions and orders in each state, with store receipts that
 *     add to the store's stock.
 *   - Petty cash vouchers in every status (one with store stock lines) and
 *     replenishments that are approved, rejected and pending, with a cash
 *     count variance.
 *   - Audit log entries for every document, so the History tabs fill.
 *
 * The fund balances, order quantities, invoice paid amounts, requisition
 * statuses, catalog last prices and store stock levels follow the documents,
 * as the module's own business logic would leave them. Document numbers come
 * from the module's counters, so numbers made later in the app continue
 * after them.
 *
 * Each run adds a new set, so run it once on a fresh dev database.
 *
 * It refuses to run against a database that isn't local (localhost or the
 * docker-compose `mongo` host) unless --allow-remote is passed.
 *
 * Run it from the repository root, inside the local idreesia-web container
 * (where the docker-compose host name `mongo` resolves). It reads MONGO_URL
 * from idreesia-web/.env:
 *
 *   docker compose exec idreesia-web meteor yarn sample-data:purchasing
 *
 * Outside the container, set MONGO_URL to a localhost address (a variable
 * already set in the environment wins over the file):
 *
 *   MONGO_URL='mongodb://localhost:27017/idreesia-erp?directConnection=true' yarn sample-data:purchasing
 *
 * The users only see the data if they hold the Purchasing permissions.
 * Attachments and catalog item pictures are not generated (they need files in
 * object storage).
 */
import { MongoClient } from 'mongodb';

import {
  addDays,
  between,
  daysAgo,
  docId,
  mongoUrlFromSettings,
  roundMoney,
  roundQuantity,
  withoutUndefined,
} from './common.mjs';

const mongoUrl = mongoUrlFromSettings();
const lineId = docId;

const COLLECTIONS = {
  vendors: 'purchasing-vendors',
  catalogItems: 'purchasing-catalog-items',
  counters: 'purchasing-counters',
  requisitions: 'purchasing-requisitions',
  quotes: 'purchasing-quotes',
  orders: 'purchasing-orders',
  receipts: 'purchasing-receipts',
  invoices: 'purchasing-invoices',
  payments: 'purchasing-payments',
  expenseHeads: 'purchasing-petty-cash-expense-heads',
  funds: 'purchasing-petty-cash-funds',
  vouchers: 'purchasing-petty-cash-vouchers',
  replenishments: 'purchasing-petty-cash-replenishments',
  auditLogs: 'common-audit-log',
  users: 'users',
  people: 'common-people',
  stores: 'inventory-physical-stores',
  stockItems: 'inventory-stock-items',
};

/** The purchasing collections the sample documents go into. */
const SAMPLE_COLLECTIONS = [
  'vendors',
  'catalogItems',
  'requisitions',
  'quotes',
  'orders',
  'receipts',
  'invoices',
  'payments',
  'expenseHeads',
  'funds',
  'vouchers',
  'replenishments',
];

const EntityType = {
  VENDOR: 'purchasing-vendor',
  CATALOG_ITEM: 'purchasing-catalog-item',
  REQUISITION: 'purchasing-requisition',
  QUOTE: 'purchasing-quote',
  ORDER: 'purchasing-order',
  RECEIPT: 'purchasing-receipt',
  INVOICE: 'purchasing-invoice',
  PAYMENT: 'purchasing-payment',
  FUND: 'purchasing-petty-cash-fund',
  EXPENSE_HEAD: 'purchasing-petty-cash-expense-head',
  VOUCHER: 'purchasing-petty-cash-voucher',
  REPLENISHMENT: 'purchasing-petty-cash-replenishment',
};

/** Numbered documents and their number prefix (see constants/purchasing.ts). */
const NUMBER_PREFIX = {
  requisitions: 'PR',
  orders: 'PO',
  receipts: 'GRN',
  invoices: 'INV',
  payments: 'PAY',
  vouchers: 'PCV',
  replenishments: 'PCR',
};

/** A stock item's unit of measurement as the text a line carries (see requisitions.ts). */
const UNIT_TEXT = { quantity: 'unit', ft: 'ft', m: 'm', kg: 'kg', lbs: 'lbs', l: 'l' };

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function totalsOf(lines) {
  let subtotal = 0;
  let taxTotal = 0;
  lines.forEach((line) => {
    const net = roundMoney(line.quantity * line.unitPrice);
    subtotal += net;
    taxTotal += roundMoney((net * line.taxRate) / 100);
  });
  subtotal = roundMoney(subtotal);
  taxTotal = roundMoney(taxTotal);
  return { subtotal, taxTotal, total: roundMoney(subtotal + taxTotal) };
}

function fail(message) {
  throw new Error(`Sample data is inconsistent: ${message}`);
}

// ---------------------------------------------------------------------------
// The documents being built, and their audit trail
// ---------------------------------------------------------------------------

const docs = Object.fromEntries(SAMPLE_COLLECTIONS.map((name) => [name, []]));
const auditLogs = [];
/** Stock item id -> quantity added to the store. */
const stockChanges = new Map();

function stamped(doc, by, at) {
  return { ...doc, createdAt: at, createdBy: by, updatedAt: at, updatedBy: by };
}

/** Logs a create; `values` may be a function, read once numbers are assigned. */
function auditCreate(entityType, doc, values, by, at) {
  auditLogs.push({ entityId: doc._id, entityType, operationType: 'create', operationBy: by, operationTime: at, values });
}

/** Logs a change, as { field: [from, to] } (stored as the app stores them). */
function auditChange(entityType, entityId, changes, by, at) {
  auditLogs.push({
    entityId,
    entityType,
    operationType: 'update',
    operationBy: by,
    operationTime: at,
    auditValues: Object.entries(changes)
      .filter(([, [from, to]]) => from || to)
      .map(([fieldName, [changedFrom, changedTo]]) =>
        JSON.stringify({ fieldName, changedFrom: changedFrom ?? null, changedTo })
      ),
  });
}

/** Moves a document to a new status, as moveStatus / updateIfUnchanged do. */
function step(entityType, doc, status, by, at, fields = {}) {
  if (at < doc.updatedAt) fail(`${entityType} ${doc._id} steps back in time.`);
  const from = doc.status;
  Object.assign(doc, { status, ...fields, updatedAt: at, updatedBy: by });
  if (doc.version !== undefined) doc.version += 1;
  const extra = Object.fromEntries(
    ['rejectionReason', 'voidReason'].filter((k) => fields[k]).map((k) => [k, [undefined, fields[k]]])
  );
  auditChange(entityType, doc._id, { status: [from, status], ...extra }, by, at);
}

/** Records a change to a document that isn't a status move. */
function touch(doc, by, at) {
  doc.updatedAt = at;
  doc.updatedBy = by;
  if (doc.version !== undefined) doc.version += 1;
}

function addStock(stockItemId, quantity) {
  stockChanges.set(stockItemId, roundQuantity((stockChanges.get(stockItemId) ?? 0) + quantity));
}

// ---------------------------------------------------------------------------
// Setup: vendors, catalog, petty cash heads and funds
// ---------------------------------------------------------------------------

function vendor(values, by, at, { inactiveAt } = {}) {
  const doc = stamped({ _id: docId(), ...values, isActive: true }, by, at);
  docs.vendors.push(doc);
  auditCreate(EntityType.VENDOR, doc, { name: doc.name }, by, at);
  if (inactiveAt) {
    doc.isActive = false;
    touch(doc, by, inactiveAt);
    auditChange(EntityType.VENDOR, doc._id, { isActive: [true, false] }, by, inactiveAt);
  }
  return doc;
}

function catalogItem(values, by, at, { inactiveAt } = {}) {
  const doc = stamped({ _id: docId(), ...values, isActive: true }, by, at);
  docs.catalogItems.push(doc);
  auditCreate(EntityType.CATALOG_ITEM, doc, { name: doc.name }, by, at);
  if (inactiveAt) {
    doc.isActive = false;
    touch(doc, by, inactiveAt);
    auditChange(EntityType.CATALOG_ITEM, doc._id, { isActive: [true, false] }, by, inactiveAt);
  }
  return doc;
}

function expenseHead(name, description, by, at, { inactiveAt } = {}) {
  const doc = stamped(withoutUndefined({ _id: docId(), name, description, isActive: true, version: 1 }), by, at);
  docs.expenseHeads.push(doc);
  auditCreate(EntityType.EXPENSE_HEAD, doc, { name }, by, at);
  if (inactiveAt) {
    doc.isActive = false;
    touch(doc, by, inactiveAt);
    auditChange(EntityType.EXPENSE_HEAD, doc._id, { isActive: [true, false] }, by, inactiveAt);
  }
  return doc;
}

function fund(values, by, at, { inactiveAt } = {}) {
  const doc = stamped(
    withoutUndefined({ _id: docId(), ...values, balance: values.floatAmount, isActive: true, version: 1 }),
    by,
    at
  );
  docs.funds.push(doc);
  auditCreate(EntityType.FUND, doc, { name: doc.name }, by, at);
  if (inactiveAt) {
    doc.isActive = false;
    touch(doc, by, inactiveAt);
    auditChange(EntityType.FUND, doc._id, { isActive: [true, false] }, by, inactiveAt);
  }
  return doc;
}

// ---------------------------------------------------------------------------
// Requisitions
// ---------------------------------------------------------------------------

const requisitionsById = new Map();

/**
 * An item for a line: a purchasing catalog item, or a store's stock item
 * (snapshotted as a store line is).
 */
function lineItem(spec) {
  if (spec.catalog) {
    const item = spec.catalog;
    return { internalCatalogId: item._id, description: item.name, unit: item.unit, price: spec.price ?? item.defaultUnitPrice };
  }
  const item = spec.stock;
  return {
    externalCatalogId: item._id,
    description: [item.name, item.company].filter(Boolean).join(' - '),
    unit: UNIT_TEXT[item.unitOfMeasurement] ?? 'unit',
    price: spec.price ?? item.samplePrice,
  };
}

function requisition({ title, purpose, requestedBy, requestedFor, store, neededInDays, items }, by, at) {
  const lines = items.map((spec) => {
    const { price, ...item } = lineItem(spec);
    return withoutUndefined({ _id: lineId(), ...item, quantity: spec.quantity, estimatedUnitPrice: price });
  });
  const estimatedTotal = roundMoney(lines.reduce((sum, l) => sum + l.quantity * (l.estimatedUnitPrice ?? 0), 0));
  const doc = stamped(
    withoutUndefined({
      _id: docId(),
      title,
      purpose,
      requestedBy,
      requestedFor: store ? store.name : requestedFor,
      neededBy: neededInDays != null ? addDays(at, neededInDays) : undefined,
      ...(store ? { source: 'store', externalSourceId: store._id } : {}),
      lines,
      estimatedTotal,
      status: 'draft',
      version: 1,
    }),
    by,
    at
  );
  docs.requisitions.push(doc);
  requisitionsById.set(doc._id, doc);
  auditCreate(EntityType.REQUISITION, doc, () => ({ number: doc.number, title }), by, at);
  return doc;
}

const submitRequisition = (doc, by, at) =>
  step(EntityType.REQUISITION, doc, 'submitted', by, at, { submittedAt: at, submittedBy: by });
const approveRequisition = (doc, by, at) =>
  step(EntityType.REQUISITION, doc, 'approved', by, at, { approvedAt: at, approvedBy: by });
const rejectRequisition = (doc, reason, by, at) =>
  step(EntityType.REQUISITION, doc, 'rejected', by, at, { rejectedAt: at, rejectedBy: by, rejectionReason: reason });
const cancelRequisition = (doc, by, at) =>
  step(EntityType.REQUISITION, doc, 'cancelled', by, at, { cancelledAt: at, cancelledBy: by });

/** A requisition raised, submitted and approved, a day apart. */
function approvedRequisition(values, { raisedBy, approvedBy }, raisedDaysAgo) {
  const doc = requisition(values, raisedBy, daysAgo(raisedDaysAgo, 9));
  submitRequisition(doc, raisedBy, daysAgo(raisedDaysAgo, 11));
  approveRequisition(doc, approvedBy, daysAgo(raisedDaysAgo - 1, 10));
  return doc;
}

/** Keeps an ordered requisition in step with its orders (syncRequisitionClosure). */
function syncRequisitionClosure(requisitionId, by, at) {
  const doc = requisitionsById.get(requisitionId);
  if (doc.status !== 'ordered' && doc.status !== 'closed') return;
  const orders = docs.orders.filter((o) => o.requisitionId === requisitionId && o.status !== 'cancelled');
  const allDone = orders.length > 0 && orders.every((o) => ['received', 'closed'].includes(o.status));
  const target = allDone ? 'closed' : 'ordered';
  if (target !== doc.status) step(EntityType.REQUISITION, doc, target, by, at);
}

// ---------------------------------------------------------------------------
// Quotes
// ---------------------------------------------------------------------------

/** A vendor's prices for a requisition's lines (or free lines without one). */
function quote({ requisition: req, vendor: v, priceFactor = 1, validForDays, reference, notes, items }, by, at) {
  const lines = req
    ? req.lines.map((l) =>
        withoutUndefined({
          _id: lineId(),
          requisitionLineId: l._id,
          internalCatalogId: l.internalCatalogId,
          externalCatalogId: l.externalCatalogId,
          description: l.description,
          unit: l.unit,
          quantity: l.quantity,
          unitPrice: roundMoney((l.estimatedUnitPrice ?? 100) * priceFactor),
        })
      )
    : items.map((spec) => {
        const { price, ...item } = lineItem(spec);
        return { _id: lineId(), ...item, quantity: spec.quantity, unitPrice: roundMoney(price * priceFactor) };
      });
  const total = roundMoney(lines.reduce((sum, l) => sum + roundMoney(l.quantity * l.unitPrice), 0));
  const doc = stamped(
    withoutUndefined({
      _id: docId(),
      requisitionId: req?._id,
      vendorId: v._id,
      reference,
      quoteDate: at,
      validUntil: validForDays != null ? addDays(at, validForDays) : undefined,
      lines,
      total,
      status: 'received',
      notes,
      version: 1,
    }),
    by,
    at
  );
  docs.quotes.push(doc);
  auditCreate(EntityType.QUOTE, doc, { vendorId: v._id, total }, by, at);
  return doc;
}

/** Picks a quote; the requisition's other open quotes are rejected. */
function selectQuote(doc, by, at) {
  docs.quotes
    .filter((q) => q.requisitionId && q.requisitionId === doc.requisitionId && q._id !== doc._id && q.status === 'received')
    .forEach((other) => step(EntityType.QUOTE, other, 'rejected', by, at));
  step(EntityType.QUOTE, doc, 'selected', by, at);
}

// ---------------------------------------------------------------------------
// Purchase orders
// ---------------------------------------------------------------------------

const vendorsById = new Map();

/** Marks the requisition ordered when an order is made from it (linkRequisition). */
function linkRequisition(req, by, at) {
  if (req.status === 'approved') step(EntityType.REQUISITION, req, 'ordered', by, at);
  else if (req.status === 'closed') step(EntityType.REQUISITION, req, 'ordered', by, at);
  else if (req.status !== 'ordered') fail(`requisition ${req.title} is ${req.status}, so it can't be ordered.`);
}

/**
 * An order made from a requisition (its lines, or `lineIndexes` of them) or
 * from a quote. Prices are the quote's, or the estimate times `priceFactor`.
 */
function order(
  { requisition: req, quote: q, vendor: v, lineIndexes, priceFactor = 1, taxRate = 0, discount = 0, shipping = 0, expectedInDays, deliveryAddress, notes },
  by,
  at
) {
  const theVendor = v ?? vendorsById.get(q.vendorId);
  const source = q
    ? q.lines.map((l) => ({ ...l, price: l.unitPrice }))
    : req.lines
        .filter((_, i) => !lineIndexes || lineIndexes.includes(i))
        .map((l) => ({ ...l, requisitionLineId: l._id, price: roundMoney((l.estimatedUnitPrice ?? 0) * priceFactor) }));
  const lines = source.map((l) =>
    withoutUndefined({
      _id: lineId(),
      requisitionLineId: l.requisitionLineId,
      internalCatalogId: l.internalCatalogId,
      externalCatalogId: l.externalCatalogId,
      description: l.description,
      unit: l.unit,
      quantity: l.quantity,
      unitPrice: l.price,
      taxRate,
      receivedQuantity: 0,
      invoicedQuantity: 0,
    })
  );
  const { subtotal, taxTotal } = totalsOf(lines);
  const total = roundMoney(subtotal + taxTotal - discount + shipping);
  if (q && q.status === 'received') selectQuote(q, by, at);
  linkRequisition(req, by, at);
  const doc = stamped(
    withoutUndefined({
      _id: docId(),
      vendorId: theVendor._id,
      requisitionId: req._id,
      quoteId: q?._id,
      ...(req.source ? { source: req.source, externalSourceId: req.externalSourceId } : {}),
      orderDate: at,
      expectedDeliveryDate: expectedInDays != null ? addDays(at, expectedInDays) : undefined,
      deliveryAddress,
      paymentTermsDays: theVendor.paymentTermsDays,
      notes,
      lines,
      subtotal,
      taxTotal,
      discount,
      shipping,
      total,
      status: 'draft',
      version: 1,
    }),
    by,
    at
  );
  docs.orders.push(doc);
  auditCreate(
    EntityType.ORDER,
    doc,
    () => withoutUndefined({ number: doc.number, vendorId: doc.vendorId, total, requisitionId: req._id, quoteId: q?._id }),
    by,
    at
  );
  return doc;
}

const submitOrder = (doc, by, at) =>
  step(EntityType.ORDER, doc, 'pending-approval', by, at, { submittedAt: at, submittedBy: by });
const approveOrder = (doc, by, at) =>
  step(EntityType.ORDER, doc, 'approved', by, at, { approvedAt: at, approvedBy: by });
const sendOrder = (doc, by, at) => step(EntityType.ORDER, doc, 'sent', by, at, { sentAt: at, sentBy: by });
const returnOrder = (doc, reason, by, at) => step(EntityType.ORDER, doc, 'draft', by, at, { rejectionReason: reason });

function closeOrder(doc, by, at) {
  step(EntityType.ORDER, doc, 'closed', by, at, { closedAt: at, closedBy: by });
  syncRequisitionClosure(doc.requisitionId, by, at);
}

/** Cancels an order; the requisition can be ordered again if no live order is left. */
function cancelOrder(doc, by, at) {
  step(EntityType.ORDER, doc, 'cancelled', by, at, { cancelledAt: at, cancelledBy: by });
  const live = docs.orders.filter((o) => o.requisitionId === doc.requisitionId && o._id !== doc._id && o.status !== 'cancelled');
  if (live.length) syncRequisitionClosure(doc.requisitionId, by, at);
  else {
    const req = requisitionsById.get(doc.requisitionId);
    if (req.status === 'ordered') step(EntityType.REQUISITION, req, 'approved', by, at);
  }
}

/** Raised, submitted, approved and (unless `send` is false) sent. */
function sentOrder(values, { buyer, approver }, raisedDaysAgo, { send = true } = {}) {
  const doc = order(values, buyer, daysAgo(raisedDaysAgo, 10));
  submitOrder(doc, buyer, daysAgo(raisedDaysAgo, 12));
  approveOrder(doc, approver, daysAgo(raisedDaysAgo - 1, 9));
  if (send) sendOrder(doc, buyer, daysAgo(raisedDaysAgo - 1, 15));
  return doc;
}

function receivingStatus(doc) {
  if (doc.lines.every((l) => l.receivedQuantity >= l.quantity)) return 'received';
  if (doc.lines.some((l) => l.receivedQuantity > 0)) return 'partially-received';
  return doc.sentAt ? 'sent' : 'approved';
}

/** Moves an order's received quantities and its status with them. */
function changeReceived(doc, perLine, by, at) {
  doc.lines = doc.lines.map((l) => ({ ...l, receivedQuantity: roundQuantity(l.receivedQuantity + (perLine.get(l._id) ?? 0)) }));
  const status = receivingStatus(doc);
  if (status !== doc.status) step(EntityType.ORDER, doc, status, by, at);
  else touch(doc, by, at);
  syncRequisitionClosure(doc.requisitionId, by, at);
}

// ---------------------------------------------------------------------------
// Goods receipts
// ---------------------------------------------------------------------------

/**
 * Goods received against an order: `lines` is [lineIndex, accepted,
 * rejected?, remarks?]. A store order's goods go into the store's stock.
 */
function receipt(ord, { lines: inputs, receivedBy, deliveryNoteNo, notes }, by, at) {
  if (!['approved', 'sent', 'partially-received'].includes(ord.status)) fail(`order ${ord._id} can't be received (${ord.status}).`);
  const perLine = new Map();
  const lines = inputs.map(([index, accepted, rejected = 0, remarks]) => {
    const l = ord.lines[index];
    if (roundQuantity(l.receivedQuantity + accepted) > l.quantity) fail(`receiving more "${l.description}" than ordered.`);
    perLine.set(l._id, accepted);
    return withoutUndefined({
      _id: lineId(),
      orderLineId: l._id,
      externalCatalogId: l.externalCatalogId,
      description: l.description,
      unit: l.unit,
      receivedQuantity: accepted,
      rejectedQuantity: rejected,
      remarks,
    });
  });
  changeReceived(ord, perLine, by, at);
  const isStore = ord.source === 'store';
  if (isStore) lines.filter((l) => l.externalCatalogId && l.receivedQuantity > 0).forEach((l) => addStock(l.externalCatalogId, l.receivedQuantity));
  const doc = stamped(
    withoutUndefined({
      _id: docId(),
      orderId: ord._id,
      vendorId: ord.vendorId,
      ...(isStore ? { source: ord.source, externalSourceId: ord.externalSourceId } : {}),
      receivedDate: at,
      receivedBy,
      deliveryNoteNo,
      notes,
      lines,
      status: 'posted',
    }),
    by,
    at
  );
  docs.receipts.push(doc);
  auditCreate(EntityType.RECEIPT, doc, () => ({ number: doc.number, orderId: ord._id }), by, at);
  return doc;
}

/** Fully receives whatever is still due on the order. */
const receiveRest = (ord, values, by, at) =>
  receipt(
    ord,
    {
      ...values,
      lines: ord.lines
        .map((l, i) => [i, roundQuantity(l.quantity - l.receivedQuantity)])
        .filter(([, quantity]) => quantity > 0),
    },
    by,
    at
  );

/** Receives about half of every line. */
const receiveHalf = (ord, values, by, at) =>
  receipt(ord, { ...values, lines: ord.lines.map((l, i) => [i, Math.max(1, Math.floor(l.quantity / 2))]) }, by, at);

function voidReceipt(doc, reason, by, at) {
  const ord = docs.orders.find((o) => o._id === doc.orderId);
  const perLine = new Map();
  doc.lines.forEach((l) => perLine.set(l.orderLineId, (perLine.get(l.orderLineId) ?? 0) - l.receivedQuantity));
  if (ord.lines.some((l) => roundQuantity(l.receivedQuantity + (perLine.get(l._id) ?? 0)) < l.invoicedQuantity)) {
    fail(`receipt ${doc._id} is already invoiced.`);
  }
  changeReceived(ord, perLine, by, at);
  if (doc.source === 'store') doc.lines.filter((l) => l.externalCatalogId).forEach((l) => addStock(l.externalCatalogId, -l.receivedQuantity));
  step(EntityType.RECEIPT, doc, 'voided', by, at, { voidedAt: at, voidedBy: by, voidReason: reason });
}

// ---------------------------------------------------------------------------
// Invoices and payments
// ---------------------------------------------------------------------------

const statusForPaid = (total, paid) => (paid <= 0 ? 'unpaid' : paid >= total ? 'paid' : 'partially-paid');

/**
 * A vendor's bill: `lines` is [order, lineIndex, quantity, unitPrice?].
 * Billing more than was received marks it disputed (allowOverBilling).
 */
function invoice(v, { vendorInvoiceNo, lines: inputs, notes, dueDate }, by, at) {
  const billed = new Map();
  let overBilled = false;
  const lines = inputs.map(([ord, index, quantity, unitPrice]) => {
    if (ord.vendorId !== v._id) fail(`invoice ${vendorInvoiceNo} bills another vendor's order.`);
    if (!['approved', 'sent', 'partially-received', 'received'].includes(ord.status)) fail(`order ${ord._id} can't be invoiced (${ord.status}).`);
    const l = ord.lines[index];
    const total = roundQuantity((billed.get(l._id) ?? 0) + quantity);
    billed.set(l._id, total);
    if (roundQuantity(l.invoicedQuantity + total) > l.receivedQuantity) overBilled = true;
    return withoutUndefined({
      _id: lineId(),
      internalCatalogId: l.internalCatalogId,
      externalCatalogId: l.externalCatalogId,
      orderId: ord._id,
      orderLineId: l._id,
      description: l.description,
      unit: l.unit,
      quantity,
      unitPrice: unitPrice ?? l.unitPrice,
      taxRate: l.taxRate,
    });
  });
  const orders = [...new Set(inputs.map(([ord]) => ord))];
  orders.forEach((ord) => {
    ord.lines = ord.lines.map((l) => ({ ...l, invoicedQuantity: roundQuantity(l.invoicedQuantity + (billed.get(l._id) ?? 0)) }));
    touch(ord, by, at);
  });
  const { subtotal, taxTotal, total } = totalsOf(lines);
  const terms = orders.map((o) => o.paymentTermsDays).filter((d) => d != null);
  const doc = stamped(
    withoutUndefined({
      _id: docId(),
      vendorInvoiceNo,
      vendorId: v._id,
      orderIds: orders.map((o) => o._id),
      invoiceDate: at,
      dueDate: dueDate ?? addDays(at, terms.length ? Math.min(...terms) : v.paymentTermsDays ?? 0),
      notes,
      lines,
      subtotal,
      taxTotal,
      total,
      paidAmount: 0,
      status: 'unpaid',
      isDisputed: overBilled,
    }),
    by,
    at
  );
  docs.invoices.push(doc);
  auditCreate(EntityType.INVOICE, doc, () => ({ number: doc.number, vendorInvoiceNo, total, isDisputed: overBilled }), by, at);
  return doc;
}

function voidInvoice(doc, by, at) {
  if (doc.paidAmount > 0) fail(`invoice ${doc.vendorInvoiceNo} is paid.`);
  doc.lines.forEach((line) => {
    const ord = docs.orders.find((o) => o._id === line.orderId);
    ord.lines = ord.lines.map((l) => (l._id === line.orderLineId ? { ...l, invoicedQuantity: roundQuantity(l.invoicedQuantity - line.quantity) } : l));
    touch(ord, by, at);
  });
  step(EntityType.INVOICE, doc, 'voided', by, at, { voidedAt: at, voidedBy: by });
}

function setPaid(inv, paidAmount, by, at) {
  const status = statusForPaid(inv.total, paidAmount);
  const from = inv.status;
  Object.assign(inv, { paidAmount, status, updatedAt: at, updatedBy: by });
  inv.version = (inv.version ?? 0) + 1;
  if (status !== from) auditChange(EntityType.INVOICE, inv._id, { status: [from, status] }, by, at);
}

/** Pays invoices of one vendor: `allocations` is [invoice, amount] ('rest' pays what is owed). */
function payment(v, { method, reference, notes, allocations: inputs }, by, at) {
  const allocations = inputs.map(([inv, amountOrRest]) => {
    const owed = roundMoney(inv.total - inv.paidAmount);
    const amount = amountOrRest === 'rest' ? owed : roundMoney(amountOrRest);
    if (inv.vendorId !== v._id || ['voided', 'paid'].includes(inv.status) || amount <= 0 || amount > owed) {
      fail(`can't pay ${amount} on invoice ${inv.vendorInvoiceNo}.`);
    }
    setPaid(inv, roundMoney(inv.paidAmount + amount), by, at);
    return { invoiceId: inv._id, amount };
  });
  const amount = roundMoney(allocations.reduce((sum, a) => sum + a.amount, 0));
  const doc = stamped(
    withoutUndefined({ _id: docId(), vendorId: v._id, paymentDate: at, method, reference, notes, amount, allocations, status: 'posted' }),
    by,
    at
  );
  docs.payments.push(doc);
  auditCreate(EntityType.PAYMENT, doc, () => ({ number: doc.number, amount, vendorId: v._id }), by, at);
  return doc;
}

function voidPayment(doc, reason, by, at) {
  doc.allocations.forEach(({ invoiceId, amount }) => {
    const inv = docs.invoices.find((i) => i._id === invoiceId);
    setPaid(inv, roundMoney(inv.paidAmount - amount), by, at);
  });
  step(EntityType.PAYMENT, doc, 'voided', by, at, { voidedAt: at, voidedBy: by, voidReason: reason });
}

// ---------------------------------------------------------------------------
// Petty cash
// ---------------------------------------------------------------------------

/** `lines` items: { description, unit, quantity, unitPrice, stock? } (stock: a store's stock item). */
function voucher(f, head, { payee, vendor: v, purpose, lines: inputs }, by, at) {
  const lines = inputs.map(({ description, unit = 'each', quantity, unitPrice, stock }) =>
    withoutUndefined({
      _id: lineId(),
      description: stock ? [stock.name, stock.company].filter(Boolean).join(' - ') : description,
      unit: stock ? UNIT_TEXT[stock.unitOfMeasurement] ?? 'unit' : unit,
      quantity,
      unitPrice,
      amount: roundMoney(quantity * unitPrice),
      physicalStoreId: stock?.physicalStoreId,
      externalCatalogId: stock?._id,
    })
  );
  const total = roundMoney(lines.reduce((sum, l) => sum + l.amount, 0));
  const doc = stamped(
    withoutUndefined({
      _id: docId(),
      fundId: f._id,
      expenseHeadId: head._id,
      voucherDate: at,
      payee,
      vendorId: v?._id,
      purpose,
      lines,
      total,
      status: 'draft',
      version: 1,
    }),
    by,
    at
  );
  docs.vouchers.push(doc);
  auditCreate(EntityType.VOUCHER, doc, () => ({ number: doc.number, total }), by, at);
  return doc;
}

function submitVoucher(doc, by, at) {
  const f = docs.funds.find((x) => x._id === doc.fundId);
  if (f.perTransactionLimit !== undefined && doc.total > f.perTransactionLimit) fail(`voucher of ${doc.total} is over the fund's limit.`);
  step(EntityType.VOUCHER, doc, 'submitted', by, at, { submittedAt: at, submittedBy: by });
}

/** Approving spends the cash and receives any stock lines into their stores. */
function approveVoucher(doc, by, at) {
  const f = docs.funds.find((x) => x._id === doc.fundId);
  if (f.balance < doc.total) fail(`fund ${f.name} can't pay ${doc.total}.`);
  step(EntityType.VOUCHER, doc, 'approved', by, at, { approvedAt: at, approvedBy: by });
  f.balance = roundMoney(f.balance - doc.total);
  f.updatedAt = at;
  f.updatedBy = by;
  doc.lines.filter((l) => l.externalCatalogId).forEach((l) => addStock(l.externalCatalogId, l.quantity));
}

const rejectVoucher = (doc, reason, by, at) =>
  step(EntityType.VOUCHER, doc, 'rejected', by, at, { rejectedAt: at, rejectedBy: by, rejectionReason: reason });

function voidVoucher(doc, reason, by, at) {
  const f = docs.funds.find((x) => x._id === doc.fundId);
  f.balance = roundMoney(f.balance + doc.total);
  f.updatedAt = at;
  f.updatedBy = by;
  doc.lines.filter((l) => l.externalCatalogId).forEach((l) => addStock(l.externalCatalogId, -l.quantity));
  step(EntityType.VOUCHER, doc, 'voided', by, at, { voidedAt: at, voidedBy: by, voidReason: reason });
}

/** Submits, approves (or rejects) a voucher, a few hours after it is raised. */
function approvedVoucher(f, head, values, { custodian, approver }, raisedDaysAgo) {
  const doc = voucher(f, head, values, custodian, daysAgo(raisedDaysAgo, 10));
  submitVoucher(doc, custodian, daysAgo(raisedDaysAgo, 12));
  approveVoucher(doc, approver, daysAgo(raisedDaysAgo, 16));
  return doc;
}

/** Bundles approved vouchers for a top-up; `shortBy` records a cash count that is short. */
function replenishment(f, vouchers, { notes, shortBy }, by, at) {
  vouchers.forEach((v) => {
    if (v.status !== 'approved' || v.replenishmentId) fail(`voucher ${v._id} can't be replenished.`);
  });
  const amount = roundMoney(vouchers.reduce((sum, v) => sum + v.total, 0));
  const countedCash = shortBy != null ? roundMoney(f.balance - shortBy) : undefined;
  const doc = stamped(
    withoutUndefined({
      _id: docId(),
      fundId: f._id,
      voucherIds: vouchers.map((v) => v._id),
      amount,
      countedCash,
      variance: countedCash != null ? roundMoney(countedCash - f.balance) : undefined,
      notes,
      status: 'submitted',
      version: 1,
    }),
    by,
    at
  );
  docs.replenishments.push(doc);
  vouchers.forEach((v) => {
    v.replenishmentId = doc._id;
  });
  auditCreate(EntityType.REPLENISHMENT, doc, () => ({ number: doc.number, amount }), by, at);
  return doc;
}

function approveReplenishment(doc, by, at) {
  const f = docs.funds.find((x) => x._id === doc.fundId);
  step(EntityType.REPLENISHMENT, doc, 'approved', by, at, { approvedAt: at, approvedBy: by });
  f.balance = roundMoney(f.balance + doc.amount);
  f.updatedAt = at;
  f.updatedBy = by;
}

function rejectReplenishment(doc, reason, by, at) {
  step(EntityType.REPLENISHMENT, doc, 'rejected', by, at, { rejectedAt: at, rejectedBy: by, rejectionReason: reason });
  docs.vouchers
    .filter((v) => doc.voucherIds.includes(v._id) && v.replenishmentId === doc._id)
    .forEach((v) => {
      delete v.replenishmentId;
    });
}

// ---------------------------------------------------------------------------
// Supporting data already in the system
// ---------------------------------------------------------------------------

async function loadSupportingData(db) {
  const users = await db
    .collection(COLLECTIONS.users)
    .find({ locked: { $ne: true } }, { projection: { username: 1, displayName: 1, personId: 1, permissions: 1 } })
    .sort({ lastActiveAt: -1, createdAt: 1 })
    .limit(500)
    .toArray();
  if (users.length === 0) throw new Error('No users found. The sample data needs at least one user.');
  // Users that already work in Purchasing come first.
  const hasPurchasing = (u) => (u.permissions ?? []).some((p) => String(p).startsWith('purchasing-'));
  users.sort((a, b) => Number(hasPurchasing(b)) - Number(hasPurchasing(a)));
  const pick = (i) => users[i % users.length];
  const actors = {
    requester: pick(0),
    approver: pick(1),
    buyer: pick(2),
    storeKeeper: pick(3),
    finance: pick(4),
  };

  const peopleIds = [...new Set(users.map((u) => u.personId).filter(Boolean))].slice(0, 50);
  let people = await db
    .collection(COLLECTIONS.people)
    .find({ _id: { $in: peopleIds } }, { projection: { _id: 1 } })
    .limit(2)
    .toArray();
  if (people.length < 2) {
    people = people.concat(
      await db.collection(COLLECTIONS.people).find({ _id: { $nin: people.map((p) => p._id) } }, { projection: { _id: 1 } }).limit(2 - people.length).toArray()
    );
  }
  if (people.length === 0) throw new Error('No people found. Petty cash funds need a custodian.');

  // Stores with enough stock items for a few requisitions each.
  const stores = [];
  for (const store of await db.collection(COLLECTIONS.stores).find({}, { projection: { name: 1 } }).sort({ name: 1 }).toArray()) {
    const items = await db
      .collection(COLLECTIONS.stockItems)
      .find({ physicalStoreId: store._id }, { projection: { name: 1, company: 1, unitOfMeasurement: 1, physicalStoreId: 1 } })
      .sort({ name: 1 })
      .limit(400)
      .toArray();
    if (items.length >= 4) stores.push({ ...store, items });
  }
  // Prefer stores whose names suggest the scenarios (kitchen for the langar, electric for wiring).
  stores.sort((a, b) => Number(/kitchen/i.test(b.name)) - Number(/kitchen/i.test(a.name)));

  return { users, actors, people, stores: stores.slice(0, 2) };
}

/** `count` different items of a store, each with a made-up price. */
function storeItems(store, count) {
  const chosen = new Set();
  while (chosen.size < Math.min(count, store.items.length)) chosen.add(store.items[between(0, store.items.length - 1)]);
  return [...chosen].map((item) => ({ ...item, samplePrice: between(5, 300) * 10 }));
}

const nameOf = (user) => user.displayName || user.username || 'Unknown';

// ---------------------------------------------------------------------------
// The scenarios
// ---------------------------------------------------------------------------

function buildSampleData({ actors, people, stores }) {
  const { requester, approver, buyer, storeKeeper, finance } = actors;
  const [R, A, B, S, F] = [requester, approver, buyer, storeKeeper, finance].map((u) => u._id);
  const roles = { raisedBy: R, approvedBy: A };
  const po = { buyer: B, approver: A };

  // ---- Vendors ------------------------------------------------------------
  const setupAt = daysAgo(200, 9);
  const bank = (bankName, title) => ({ bankName, bankAccountTitle: title, bankAccountNumber: `PK${between(10, 99)}${bankName.slice(0, 4).toUpperCase()}${String(between(1e9, 9e9))}${between(100000, 999999)}` });
  const V = {
    grocer: vendor({ name: 'Al-Madina Traders', contactPerson: 'Haji Abdul Rasheed', phone: '0300-6301122', email: 'almadina.traders@example.com', address: 'Shop 14, Ghalla Mandi, Multan', taxId: '3520145-7', paymentTermsDays: 30, ...bank('Meezan Bank', 'Al-Madina Traders'), notes: 'Rice, oil, sugar and daal in bulk. Delivers free inside the city.' }, A, setupAt),
    electric: vendor({ name: 'Multan Electric House', contactPerson: 'Muhammad Imran', phone: '0301-7445566', email: 'sales@multanelectric.example.com', address: 'Hussain Agahi Bazaar, Multan', taxId: '4110278-2', paymentTermsDays: 15, ...bank('Habib Bank Limited', 'Multan Electric House') }, A, setupAt),
    hardware: vendor({ name: 'Pak Hardware & Sanitary', contactPerson: 'Rana Shahid', phone: '0333-6123987', address: 'Vehari Road, Multan', taxId: '2987431-5', paymentTermsDays: 30, ...bank('United Bank Limited', 'Pak Hardware and Sanitary') }, A, setupAt),
    stationery: vendor({ name: 'Shah Stationers', contactPerson: 'Syed Kashif Shah', phone: '0345-7012233', email: 'shahstationers@example.com', address: 'Kutchery Road, Multan', paymentTermsDays: 0, notes: 'Cash on delivery only.' }, A, setupAt),
    cleaning: vendor({ name: 'Crescent Cleaning Supplies', contactPerson: 'Asif Mehmood', phone: '0321-6987001', address: 'Bosan Road, Multan', taxId: '5012876-1', paymentTermsDays: 15, ...bank('Bank Alfalah', 'Crescent Cleaning Supplies') }, A, setupAt),
    builders: vendor({ name: 'Faisal Builders Mart', contactPerson: 'Faisal Nadeem', phone: '0302-7334455', email: 'info@faisalbuilders.example.com', address: 'Northern Bypass, Multan', taxId: '3761209-4', paymentTermsDays: 45, ...bank('MCB Bank', 'Faisal Builders Mart') }, A, setupAt),
    kitchen: vendor({ name: 'Rehman Kitchen Equipment', contactPerson: 'Abdul Rehman', phone: '0313-6550909', address: 'Chowk Shaheedan, Multan', taxId: '4450981-3', paymentTermsDays: 30, ...bank('Allied Bank', 'Rehman Kitchen Equipment') }, A, setupAt),
    old: vendor({ name: 'Gulshan General Store', contactPerson: 'Ghulam Abbas', phone: '0300-6009988', address: 'Gulgasht Colony, Multan', paymentTermsDays: 7, notes: 'Closed down; kept for the old records.' }, A, setupAt, { inactiveAt: daysAgo(170, 11) }),
  };
  Object.values(V).forEach((v) => vendorsById.set(v._id, v));

  // ---- Catalog --------------------------------------------------------------
  const item = (name, unit, category, company, defaultUnitPrice, description, options) =>
    catalogItem(withoutUndefined({ name, unit, category, company, defaultUnitPrice, description }), B, setupAt, options);
  const C = {
    rice: item('Basmati Rice', 'kg', 'Groceries', 'Guard', 320),
    oil: item('Cooking Oil', 'litre', 'Groceries', 'Dalda', 540),
    sugar: item('Sugar', 'kg', 'Groceries', undefined, 165),
    daal: item('Masoor Daal', 'kg', 'Groceries', undefined, 290),
    tea: item('Tea Leaves', 'kg', 'Groceries', 'Tapal Danedar', 1650),
    pot: item('Steel Cooking Pot 40L', 'unit', 'Kitchen', undefined, 9500, 'Heavy base, with lid'),
    tray: item('Serving Tray', 'unit', 'Kitchen', undefined, 650),
    gas: item('Gas Cylinder Refill (45 kg)', 'cylinder', 'Kitchen', undefined, 12500),
    bulb: item('LED Bulb 18W', 'unit', 'Electrical', 'Philips', 450),
    fan: item('Ceiling Fan 56"', 'unit', 'Electrical', 'Pak Fan', 9800),
    wire: item('Electric Wire 7/29', 'roll', 'Electrical', 'Fast Cables', 14500, '90 metre roll'),
    switchboard: item('Switch Board 6-Gang', 'unit', 'Electrical', undefined, 380),
    extension: item('Extension Cable 5m', 'unit', 'Electrical', undefined, 900),
    cleaner: item('Floor Cleaner 5L', 'can', 'Cleaning', 'Finis', 1350),
    phenyl: item('Phenyl', 'litre', 'Cleaning', undefined, 220),
    mop: item('Mop with Stick', 'unit', 'Cleaning', undefined, 750),
    bags: item('Garbage Bags (Large)', 'pack', 'Cleaning', undefined, 420),
    paper: item('A4 Paper', 'ream', 'Stationery', 'Double A', 1450),
    pens: item('Ballpoint Pens', 'box', 'Stationery', 'Dollar', 600, 'Box of 50'),
    register: item('Register (Large)', 'unit', 'Stationery', undefined, 350),
    paint: item('Weathershield Paint 16L', 'drum', 'Hardware', 'ICI Dulux', 18500),
    brush: item('Paint Brush 4"', 'unit', 'Hardware', undefined, 250),
    tap: item('Water Tap', 'unit', 'Hardware', 'Master', 1200),
    pipe: item('PVC Pipe 1"', 'length', 'Hardware', undefined, 850, '20 ft length'),
    chair: item('Plastic Chair', 'unit', 'Furniture', 'Boss', 2400),
  };
  item('Tube Light 40W', 'unit', 'Electrical', 'Philips', 300, undefined, { inactiveAt: daysAgo(160) });
  item('Carbon Paper', 'pack', 'Stationery', undefined, 180, undefined, { inactiveAt: daysAgo(160) });

  const hall = 'Main Hall, Dar-ul-Ehsan';
  const kitchen = 'Langar Kitchen';

  // ---- Purchasing requisitions, quotes and orders ------------------------
  // Closed: received in two deliveries, each billed; one bill voided and
  // re-entered; both paid with one bank transfer.
  const reqGathering = approvedRequisition({ title: 'Groceries for the annual gathering', purpose: 'Langar for three days of the annual gathering', requestedBy: nameOf(requester), requestedFor: kitchen, neededInDays: 14, items: [{ catalog: C.rice, quantity: 500 }, { catalog: C.oil, quantity: 120 }, { catalog: C.sugar, quantity: 200 }, { catalog: C.tea, quantity: 15 }] }, roles, 96);
  const poGathering = sentOrder({ requisition: reqGathering, vendor: V.grocer, priceFactor: 0.97, deliveryAddress: kitchen, expectedInDays: 7, shipping: 1500, notes: 'Deliver to the langar kitchen store room.' }, po, 93);
  receiveHalf(poGathering, { receivedBy: nameOf(storeKeeper), deliveryNoteNo: 'DN-4471', notes: 'First delivery' }, S, daysAgo(86, 11));
  const invGathering1 = invoice(V.grocer, { vendorInvoiceNo: 'AMT-2231', lines: poGathering.lines.map((l, i) => [poGathering, i, l.receivedQuantity]) }, F, daysAgo(85, 15));
  receiveRest(poGathering, { receivedBy: nameOf(storeKeeper), deliveryNoteNo: 'DN-4502' }, S, daysAgo(81, 10));
  const due = (ord) => ord.lines.map((l, i) => [ord, i, roundQuantity(l.receivedQuantity - l.invoicedQuantity)]).filter(([, , q]) => q > 0);
  const invWrong = invoice(V.grocer, { vendorInvoiceNo: 'AMT-2240', notes: 'Entered with the wrong prices', lines: due(poGathering).map(([o, i, q]) => [o, i, q, roundMoney(o.lines[i].unitPrice * 1.1)]) }, F, daysAgo(80, 12));
  voidInvoice(invWrong, F, daysAgo(80, 16));
  const invGathering2 = invoice(V.grocer, { vendorInvoiceNo: 'AMT-2240A', lines: due(poGathering) }, F, daysAgo(79, 11));
  payment(V.grocer, { method: 'bank-transfer', reference: 'IBFT 00918273', notes: 'Both deliveries of the gathering groceries', allocations: [[invGathering1, 'rest'], [invGathering2, 'rest']] }, F, daysAgo(60, 14));

  // Closed short: part received, then closed; the bill is overdue and the
  // cheque that paid it bounced.
  const reqWashrooms = approvedRequisition({ title: 'Sanitary fittings for the washrooms', purpose: 'Replace the leaking taps and pipes in the guest washrooms', requestedBy: nameOf(requester), requestedFor: 'Guest House', items: [{ catalog: C.tap, quantity: 24 }, { catalog: C.pipe, quantity: 40 }] }, roles, 150);
  const poWashrooms = sentOrder({ requisition: reqWashrooms, vendor: V.hardware, taxRate: 17, expectedInDays: 10 }, po, 146);
  receipt(poWashrooms, { lines: [[0, 16, 2, '2 taps cracked, returned'], [1, 40]], receivedBy: nameOf(storeKeeper), deliveryNoteNo: 'PHS-118' }, S, daysAgo(132, 12));
  const invWashrooms = invoice(V.hardware, { vendorInvoiceNo: 'PHS/INV/0917', lines: due(poWashrooms) }, F, daysAgo(130, 10));
  closeOrder(poWashrooms, B, daysAgo(120, 10));
  const bounced = payment(V.hardware, { method: 'cheque', reference: 'Cheque 0045521', allocations: [[invWashrooms, 'rest']] }, F, daysAgo(100, 11));
  voidPayment(bounced, 'Cheque returned unpaid by the bank', F, daysAgo(94, 10));

  // Closed: received in full; billed together with the split order below.
  const reqTrays = approvedRequisition({ title: 'Serving trays for the langar hall', requestedBy: nameOf(requester), requestedFor: kitchen, items: [{ catalog: C.tray, quantity: 60 }] }, roles, 122);
  const poTrays = sentOrder({ requisition: reqTrays, vendor: V.kitchen, priceFactor: 0.95, expectedInDays: 5 }, po, 119);
  receiveRest(poTrays, { receivedBy: nameOf(storeKeeper), deliveryNoteNo: 'RKE-77' }, S, daysAgo(112, 11));

  // Ordered: split across two vendors; one received, one sent and late.
  const reqUpgrade = approvedRequisition({ title: 'Kitchen equipment upgrade', purpose: 'Bigger pots and more trays for the Urs langar', requestedBy: nameOf(requester), requestedFor: kitchen, neededInDays: 30, items: [{ catalog: C.pot, quantity: 2 }, { catalog: C.tray, quantity: 100 }, { catalog: C.gas, quantity: 3 }] }, roles, 62);
  const poUpgradeA = sentOrder({ requisition: reqUpgrade, vendor: V.kitchen, lineIndexes: [0, 1], expectedInDays: 10 }, po, 58);
  sentOrder({ requisition: reqUpgrade, vendor: V.hardware, lineIndexes: [2], expectedInDays: 7, notes: 'Exchange of empty cylinders on delivery' }, po, 56);
  receiveRest(poUpgradeA, { receivedBy: nameOf(storeKeeper), deliveryNoteNo: 'RKE-102' }, S, daysAgo(50, 12));
  // One bill for two orders.
  invoice(V.kitchen, { vendorInvoiceNo: 'RKE-INV-3390', notes: 'Trays and pots, two orders', lines: [...due(poTrays), ...due(poUpgradeA)] }, F, daysAgo(48, 11));

  // Ordered: partly received; the bill is partly paid.
  const reqSchool = approvedRequisition({ title: 'Stationery for the school', requestedBy: nameOf(requester), requestedFor: 'Idreesia School', items: [{ catalog: C.paper, quantity: 40 }, { catalog: C.pens, quantity: 20 }, { catalog: C.register, quantity: 30 }] }, roles, 42);
  const poSchool = sentOrder({ requisition: reqSchool, vendor: V.stationery, discount: 1000, expectedInDays: 3 }, po, 40);
  receipt(poSchool, { lines: [[0, 25], [1, 20], [2, 28, 2, 'Two registers water-damaged']], receivedBy: nameOf(storeKeeper) }, S, daysAgo(35, 11));
  const invSchool = invoice(V.stationery, { vendorInvoiceNo: 'SS-1182', lines: due(poSchool) }, F, daysAgo(34, 15));
  payment(V.stationery, { method: 'cheque', reference: 'Cheque 0047712', notes: 'First instalment', allocations: [[invSchool, 30000]] }, F, daysAgo(20, 12));

  // Ordered: sent, nothing received (a receipt was voided); a disputed bill
  // arrived before the goods. Late against its expected date.
  const reqLibrary = approvedRequisition({ title: 'Wiring for the library extension', requestedBy: nameOf(requester), requestedFor: 'Library', items: [{ catalog: C.wire, quantity: 4 }, { catalog: C.switchboard, quantity: 8 }, { catalog: C.bulb, quantity: 20 }] }, roles, 28);
  const poLibrary = sentOrder({ requisition: reqLibrary, vendor: V.electric, taxRate: 17, expectedInDays: 14 }, po, 26);
  const wrongReceipt = receipt(poLibrary, { lines: [[0, 4], [1, 8]], receivedBy: nameOf(storeKeeper), deliveryNoteNo: 'MEH-5530' }, S, daysAgo(16, 11));
  voidReceipt(wrongReceipt, 'Posted against the wrong order', S, daysAgo(15, 9));
  invoice(V.electric, { vendorInvoiceNo: 'MEH-24-0611', notes: 'Vendor billed before delivering', lines: [[poLibrary, 0, 2]] }, F, daysAgo(12, 14));

  // Ordered: approved, not yet sent.
  const reqMonthly = approvedRequisition({ title: 'Groceries for the monthly langar', requestedBy: nameOf(requester), requestedFor: kitchen, neededInDays: 10, items: [{ catalog: C.rice, quantity: 200 }, { catalog: C.oil, quantity: 60 }, { catalog: C.sugar, quantity: 100 }, { catalog: C.daal, quantity: 80 }] }, roles, 14);
  sentOrder({ requisition: reqMonthly, vendor: V.grocer, expectedInDays: 5, deliveryAddress: kitchen }, po, 12, { send: false });

  // Ordered: from the selected of two quotes, awaiting approval.
  const reqCables = approvedRequisition({ title: 'Extension cables and switch boards', requestedBy: nameOf(requester), requestedFor: hall, items: [{ catalog: C.extension, quantity: 15 }, { catalog: C.switchboard, quantity: 12 }] }, roles, 10);
  const qCablesA = quote({ requisition: reqCables, vendor: V.electric, priceFactor: 0.92, validForDays: 15, reference: 'MEH-Q-771' }, B, daysAgo(8, 11));
  quote({ requisition: reqCables, vendor: V.hardware, priceFactor: 1.05, validForDays: 7, reference: 'PHS-Q-204' }, B, daysAgo(8, 15));
  const poCables = order({ quote: qCablesA, requisition: reqCables, taxRate: 17 }, B, daysAgo(6, 10));
  submitOrder(poCables, B, daysAgo(5, 10));

  // Ordered: a draft order the approver sent back.
  const reqCleaning = approvedRequisition({ title: 'Monthly cleaning supplies', requestedBy: nameOf(requester), requestedFor: hall, items: [{ catalog: C.cleaner, quantity: 10 }, { catalog: C.phenyl, quantity: 20 }, { catalog: C.mop, quantity: 8 }, { catalog: C.bags, quantity: 15 }] }, roles, 6);
  const poCleaning = order({ requisition: reqCleaning, vendor: V.cleaning, priceFactor: 1.12 }, B, daysAgo(4, 10));
  submitOrder(poCleaning, B, daysAgo(3, 10));
  returnOrder(poCleaning, 'Prices are higher than last month. Please confirm them with the vendor.', A, daysAgo(2, 11));

  // Approved, with three open quotes to compare and select from.
  const reqPots = approvedRequisition({ title: 'Cooking pots and trays for the langar', requestedBy: nameOf(requester), requestedFor: kitchen, neededInDays: 21, items: [{ catalog: C.pot, quantity: 4 }, { catalog: C.tray, quantity: 50 }] }, roles, 12);
  quote({ requisition: reqPots, vendor: V.kitchen, priceFactor: 0.98, validForDays: 30, reference: 'RKE-Q-415' }, B, daysAgo(8, 12));
  quote({ requisition: reqPots, vendor: V.grocer, priceFactor: 1.08, validForDays: 15 }, B, daysAgo(7, 12));
  quote({ requisition: reqPots, vendor: V.hardware, priceFactor: 0.94, validForDays: 3, reference: 'PHS-Q-219', notes: 'Delivery in 3 weeks' }, B, daysAgo(6, 12));

  // Approved again: its only order was cancelled.
  const reqPaint = approvedRequisition({ title: 'Paint for the boundary wall', requestedBy: nameOf(requester), requestedFor: 'Boundary wall', items: [{ catalog: C.paint, quantity: 6 }, { catalog: C.brush, quantity: 12 }] }, roles, 34);
  const poPaint = sentOrder({ requisition: reqPaint, vendor: V.builders, expectedInDays: 7 }, po, 31, { send: false });
  cancelOrder(poPaint, B, daysAgo(27, 10));

  // Draft, submitted, rejected and cancelled requisitions.
  requisition({ title: 'Office stationery for December', requestedBy: nameOf(requester), requestedFor: 'Office', neededInDays: 10, items: [{ catalog: C.paper, quantity: 10 }, { catalog: C.pens, quantity: 5 }, { catalog: C.register, quantity: 8 }] }, R, daysAgo(2, 10));
  const reqHall = requisition({ title: 'Lights and fans for the new hall', purpose: 'The new hall is ready for its electrical fittings', requestedBy: nameOf(requester), requestedFor: hall, neededInDays: 20, items: [{ catalog: C.bulb, quantity: 40 }, { catalog: C.fan, quantity: 6 }, { catalog: C.switchboard, quantity: 10 }] }, R, daysAgo(5, 10));
  submitRequisition(reqHall, R, daysAgo(4, 10));
  const reqFans = requisition({ title: 'Ceiling fans for the guest rooms', requestedBy: nameOf(requester), requestedFor: 'Guest House', items: [{ catalog: C.fan, quantity: 12 }] }, R, daysAgo(22, 10));
  submitRequisition(reqFans, R, daysAgo(21, 10));
  rejectRequisition(reqFans, 'No budget left this quarter. Please raise it again in January.', A, daysAgo(19, 12));
  const reqChairs = requisition({ title: 'Plastic chairs for the courtyard', requestedBy: nameOf(requester), requestedFor: 'Courtyard', items: [{ catalog: C.chair, quantity: 100 }] }, R, daysAgo(45, 10));
  submitRequisition(reqChairs, R, daysAgo(44, 10));
  cancelRequisition(reqChairs, R, daysAgo(42, 10));

  // A price list not tied to any requisition.
  quote({ vendor: V.cleaning, reference: 'CCS price list Nov', validForDays: 30, notes: 'Monthly price list', items: [{ catalog: C.cleaner, quantity: 1 }, { catalog: C.phenyl, quantity: 1 }, { catalog: C.mop, quantity: 1 }, { catalog: C.bags, quantity: 1 }] }, B, daysAgo(15, 11));

  // ---- Store requisitions and orders --------------------------------------
  const storeVendor = (store) => (/electric/i.test(store.name) ? V.electric : /safai|clean/i.test(store.name) ? V.cleaning : V.grocer);
  const storeRequisition = (store, title, count, by, at, purpose) =>
    requisition({ title, purpose, requestedBy: nameOf(storeKeeper), store, items: storeItems(store, count).map((s) => ({ stock: s, quantity: between(2, 12) * 5 })) }, by, at);
  const storeRoles = { raisedBy: S, approvedBy: A };

  const [storeA, storeB] = stores;
  if (storeA) {
    const v = storeVendor(storeA);
    storeRequisition(storeA, `Restock for ${storeA.name}`, 3, S, daysAgo(1, 10));
    submitRequisition(storeRequisition(storeA, `Weekly top-up for ${storeA.name}`, 4, S, daysAgo(3, 10)), S, daysAgo(3, 12));
    const approvedOnly = storeRequisition(storeA, `Items running low in ${storeA.name}`, 3, S, daysAgo(7, 10));
    submitRequisition(approvedOnly, S, daysAgo(7, 11));
    approveRequisition(approvedOnly, A, daysAgo(6, 10));
    const rejected = storeRequisition(storeA, `Extra stock for ${storeA.name}`, 2, S, daysAgo(26, 10));
    submitRequisition(rejected, S, daysAgo(26, 11));
    rejectRequisition(rejected, 'Already in stock at the main store; ask them to transfer it.', A, daysAgo(25, 10));

    // Sent, late: the store can receive it.
    const reqSent = storeRequisition(storeA, `Monthly order for ${storeA.name}`, 4, S, daysAgo(20, 10));
    submitRequisition(reqSent, S, daysAgo(20, 11));
    approveRequisition(reqSent, A, daysAgo(19, 10));
    sentOrder({ requisition: reqSent, vendor: v, priceFactor: 1.02, expectedInDays: 10 }, po, 16);

    // Partly received by the store (stock goes up).
    const reqPartial = storeRequisition(storeA, `Bulk order for ${storeA.name}`, 4, S, daysAgo(42, 10));
    submitRequisition(reqPartial, S, daysAgo(42, 11));
    approveRequisition(reqPartial, A, daysAgo(41, 10));
    const poPartial = sentOrder({ requisition: reqPartial, vendor: v, expectedInDays: 7 }, po, 40);
    receiveHalf(poPartial, { receivedBy: nameOf(storeKeeper), deliveryNoteNo: `DN-${between(1000, 9999)}`, notes: 'Rest promised next week' }, S, daysAgo(30, 12));

    // Received in full by the store, billed and paid in cash.
    const reqDone = storeRequisition(storeA, `Quarterly order for ${storeA.name}`, 3, S, daysAgo(72, 10));
    submitRequisition(reqDone, S, daysAgo(72, 11));
    approveRequisition(reqDone, A, daysAgo(71, 10));
    const poDone = sentOrder({ requisition: reqDone, vendor: v, expectedInDays: 5 }, po, 68);
    receiveRest(poDone, { receivedBy: nameOf(storeKeeper), deliveryNoteNo: `DN-${between(1000, 9999)}` }, S, daysAgo(62, 11));
    const invStore = invoice(v, { vendorInvoiceNo: `${v.name.split(/\s+/).map((w) => w[0]).join('').toUpperCase()}-${between(3000, 3999)}`, lines: due(poDone) }, F, daysAgo(60, 12));
    payment(v, { method: 'cash', notes: `Paid at the counter for ${storeA.name}`, allocations: [[invStore, 'rest']] }, F, daysAgo(45, 13));
  }
  if (storeB) {
    const v = storeVendor(storeB);
    submitRequisition(storeRequisition(storeB, `Weekly top-up for ${storeB.name}`, 3, S, daysAgo(4, 10)), S, daysAgo(4, 12));
    const reqApproved = storeRequisition(storeB, `Monthly order for ${storeB.name}`, 3, S, daysAgo(10, 10));
    submitRequisition(reqApproved, S, daysAgo(10, 11));
    approveRequisition(reqApproved, A, daysAgo(9, 10));
    sentOrder({ requisition: reqApproved, vendor: v, expectedInDays: 7 }, po, 8, { send: false });
    const cancelled = storeRequisition(storeB, `Spare items for ${storeB.name}`, 2, S, daysAgo(50, 10));
    cancelRequisition(cancelled, S, daysAgo(49, 10));
  }

  // ---- Petty cash ------------------------------------------------------------
  const H = {
    tea: expenseHead('Tea & Refreshments', 'Tea, milk and snacks for guests and meetings', F, setupAt),
    transport: expenseHead('Transport & Fuel', 'Rickshaw fares, fuel for errands', F, setupAt),
    stationery: expenseHead('Stationery', undefined, F, setupAt),
    repairs: expenseHead('Minor Repairs', 'Small repairs that do not need a purchase order', F, setupAt),
    cleaning: expenseHead('Cleaning Supplies', undefined, F, setupAt),
    postage: expenseHead('Postage & Courier', undefined, F, setupAt),
    kitchen: expenseHead('Kitchen & Langar', 'Vegetables, spices and small kitchen items', F, setupAt),
  };
  expenseHead('Miscellaneous', 'Replaced by the specific heads', F, setupAt, { inactiveAt: daysAgo(150, 10) });

  const [custodianA, custodianB = custodianA] = people;
  const office = fund({ name: 'Main Office Petty Cash', custodianPersonId: custodianA._id, floatAmount: 50000, perTransactionLimit: 10000, notes: 'Kept in the office safe' }, F, daysAgo(100, 9));
  const langar = fund({ name: 'Langar Kitchen Petty Cash', custodianPersonId: custodianB._id, floatAmount: 25000, perTransactionLimit: 5000 }, F, daysAgo(60, 9));
  fund({ name: 'Old Building Site Petty Cash', custodianPersonId: custodianA._id, floatAmount: 10000, notes: 'Construction finished; fund closed.' }, F, daysAgo(200, 9), { inactiveAt: daysAgo(150, 9) });

  const cash = { custodian: R, approver: A };
  // Office fund, in date order (the cash count depends on the balance at the time).
  const va = approvedVoucher(office, H.tea, { payee: 'Bismillah Tea Stall', purpose: 'Tea for the committee meetings', lines: [{ description: 'Tea (cups)', unit: 'cup', quantity: 130, unitPrice: 25 }] }, cash, 90);
  const vb = approvedVoucher(office, H.transport, { payee: 'Rickshaw / fuel', purpose: 'Trips to the bank and the market', lines: [{ description: 'Petrol', unit: 'litre', quantity: 16, unitPrice: 300 }] }, cash, 86);
  const vc = approvedVoucher(office, H.repairs, { vendor: V.hardware, purpose: 'Fix the office door and window latches', lines: [{ description: 'Door hinges', unit: 'pair', quantity: 4, unitPrice: 650 }, { description: 'Carpenter labour', unit: 'day', quantity: 2, unitPrice: 2400 }] }, cash, 80);
  const rOffice1 = replenishment(office, [va, vb, vc], { notes: 'Top-up after the first quarter' }, R, daysAgo(75, 11));
  approveReplenishment(rOffice1, F, daysAgo(72, 11));
  const vk = approvedVoucher(office, H.stationery, { vendor: V.stationery, lines: [{ description: 'Files and folders', unit: 'pack', quantity: 5, unitPrice: 370 }] }, cash, 60);
  const rOffice2 = replenishment(office, [vk], {}, R, daysAgo(57, 11));
  rejectReplenishment(rOffice2, 'Attach the shop receipts first.', F, daysAgo(55, 11));
  const vd = approvedVoucher(office, H.postage, { payee: 'TCS', purpose: 'Documents to Lahore and Karachi', lines: [{ description: 'Courier', unit: 'parcel', quantity: 3, unitPrice: 400 }] }, cash, 40);
  const ve = approvedVoucher(office, H.cleaning, { payee: 'Local market', lines: [{ description: 'Dusters and soap', unit: 'each', quantity: 1, unitPrice: 2150 }] }, cash, 30);
  const vg = approvedVoucher(office, H.transport, { payee: 'Rickshaw', lines: [{ description: 'Rickshaw fare', unit: 'trip', quantity: 3, unitPrice: 500 }] }, cash, 28);
  voidVoucher(vg, 'Duplicate of an earlier voucher for the same trips', A, daysAgo(26, 10));
  replenishment(office, [vk, vd, ve], { notes: 'Cash count was Rs 150 short; the custodian is checking.', shortBy: 150 }, R, daysAgo(20, 11));
  approvedVoucher(office, H.tea, { payee: 'Bismillah Tea Stall', lines: [{ description: 'Tea and biscuits for guests', unit: 'each', quantity: 1, unitPrice: 2900 }] }, cash, 12);
  const vh = voucher(office, H.repairs, { payee: 'Electrician', purpose: 'Rewire the office socket', lines: [{ description: 'Labour', unit: 'job', quantity: 1, unitPrice: 4200 }] }, R, daysAgo(7, 10));
  submitVoucher(vh, R, daysAgo(7, 11));
  rejectVoucher(vh, 'No receipt attached. Get one from the electrician.', A, daysAgo(5, 10));
  const vi = voucher(office, H.transport, { payee: 'Rickshaw', lines: [{ description: 'Rickshaw fare', unit: 'trip', quantity: 2, unitPrice: 475 }] }, R, daysAgo(3, 10));
  submitVoucher(vi, R, daysAgo(2, 10));
  voucher(office, H.tea, { purpose: 'Tea for Friday guests', lines: [{ description: 'Tea (cups)', unit: 'cup', quantity: 24, unitPrice: 25 }] }, R, daysAgo(1, 10));

  // Langar fund: one voucher brings goods into a store's stock.
  const stockLines = storeA ? storeItems(storeA, 2).map((s) => ({ stock: s, quantity: between(2, 4), unitPrice: between(10, 20) * 10 })) : [];
  const vl = approvedVoucher(langar, H.kitchen, { payee: 'Sabzi Mandi', purpose: 'Vegetables and spices for Thursday langar', lines: [{ description: 'Vegetables', unit: 'kg', quantity: 20, unitPrice: 90 }, ...stockLines] }, cash, 50);
  const vm = approvedVoucher(langar, H.kitchen, { payee: 'Gas agency', lines: [{ description: 'Small cylinder refill', unit: 'cylinder', quantity: 1, unitPrice: 4500 }] }, cash, 20);
  approveReplenishment(replenishment(langar, [vl, vm], {}, R, daysAgo(10, 11)), F, daysAgo(8, 11));
  const vn = voucher(langar, H.kitchen, { payee: 'Sabzi Mandi', lines: [{ description: 'Onions and tomatoes', unit: 'kg', quantity: 25, unitPrice: 120 }] }, R, daysAgo(4, 10));
  submitVoucher(vn, R, daysAgo(3, 10));
  voucher(langar, H.cleaning, { lines: [{ description: 'Dishwashing liquid', unit: 'bottle', quantity: 6, unitPrice: 350 }] }, R, daysAgo(2, 10));

  // ---- Catalog prices remembered from approved orders ------------------------
  docs.orders
    .filter((o) => o.approvedAt)
    .sort((a, b) => a.approvedAt - b.approvedAt)
    .forEach((o) =>
      o.lines.forEach((l) => {
        const catalog = docs.catalogItems.find((c) => c._id === l.internalCatalogId);
        if (catalog) Object.assign(catalog, { lastUnitPrice: l.unitPrice, lastVendorId: o.vendorId });
      })
    );

  return { storeCount: stores.length };
}

// ---------------------------------------------------------------------------
// Writing
// ---------------------------------------------------------------------------

/** Numbers each kind of document in date order, from the module's counters. */
async function assignNumbers(db) {
  const counters = db.collection(COLLECTIONS.counters);
  for (const [kind, type] of Object.entries(NUMBER_PREFIX)) {
    const dateOf = (d) => (kind === 'vouchers' ? d.voucherDate : d.createdAt);
    const sorted = [...docs[kind]].sort((a, b) => dateOf(a) - dateOf(b));
    for (const doc of sorted) {
      const year = dateOf(doc).getFullYear();
      const result = await counters.findOneAndUpdate(
        { type, year },
        { $inc: { seq: 1 }, $setOnInsert: { _id: `${type}-${year}` } },
        { upsert: true, returnDocument: 'after' }
      );
      const counter = result?.value ?? result;
      doc.number = `${type}-${year}-${String(counter.seq).padStart(4, '0')}`;
    }
  }
}

async function insertSampleData(db) {
  for (const kind of SAMPLE_COLLECTIONS) {
    if (docs[kind].length) await db.collection(COLLECTIONS[kind]).insertMany(docs[kind]);
  }
  const logs = auditLogs.map(({ values, ...log }) => ({
    _id: docId(),
    ...log,
    ...(values ? { auditValues: typeof values === 'function' ? values() : values } : {}),
  }));
  await db.collection(COLLECTIONS.auditLogs).insertMany(logs);
  for (const [stockItemId, quantity] of stockChanges) {
    if (quantity) await db.collection(COLLECTIONS.stockItems).updateOne({ _id: stockItemId }, { $inc: { currentStockLevel: quantity } });
  }
  return logs.length;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const client = new MongoClient(mongoUrl, { serverSelectionTimeoutMS: 10_000 });
try {
  await client.connect();
  const db = client.db();
  console.log(`Database: ${db.databaseName}`);

  const supporting = await loadSupportingData(db);
  const { actors } = supporting;
  console.log('Acting users:', Object.fromEntries(Object.entries(actors).map(([role, u]) => [role, nameOf(u)])));
  console.log('Stores:', supporting.stores.map((s) => s.name).join(', ') || 'none with stock items; store scenarios skipped');

  buildSampleData(supporting);
  await assignNumbers(db);
  const auditCount = await insertSampleData(db);

  console.log('Created:', Object.fromEntries(SAMPLE_COLLECTIONS.map((kind) => [kind, docs[kind].length])), `and ${auditCount} audit log entries`);
  console.log(`Stock changed on ${[...stockChanges.values()].filter(Boolean).length} store items.`);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await client.close();
}
