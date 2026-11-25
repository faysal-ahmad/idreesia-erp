import {
  InvoiceStatus,
  InvoiceableOrderStatuses,
  NumberedDocument,
  type InvoiceStatusValue,
} from 'meteor/idreesia-common/constants/purchasing';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import {
  PurchasingInvoices,
  PurchasingOrders,
  type InvoiceLine,
  type PurchasingInvoiceDocument,
  type PurchasingOrderDocument,
} from 'meteor/idreesia-common/server/collections/purchasing';
import { escapeRegExp } from 'meteor/idreesia-common/utilities/lodash';

import { purchasingError } from './errors';
import {
  EntityType,
  OperationType,
  addDays,
  assertLineCount,
  audit,
  cleanText,
  moveStatus,
  normalizeBaseLine,
  pageWindow,
  requireNonNegative,
  requireTaxRate,
  requireText,
  roundMoney,
  roundQuantity,
  totalsOf,
  updateIfUnchanged,
  type ActingUser,
  type LineInput,
  type Page,
  type PageOptions,
} from './internal';
import { nextDocumentNumber } from './numbering';
import { getOrder } from './orders';
import { getUsableVendor } from './vendors';

export interface InvoiceLineInput extends LineInput {
  /** The order and order line this line bills. */
  orderId: string;
  orderLineId: string;
  unitPrice: number;
  taxRate?: number | null;
}

export interface InvoiceValues {
  vendorId: string;
  vendorInvoiceNo: string;
  invoiceDate: Date;
  dueDate?: Date | null;
  notes?: string | null;
  lines: InvoiceLineInput[];
  /** Accept billing for more than was received; the invoice is marked disputed. */
  allowOverBilling?: boolean;
}

export interface ListInvoicesOptions extends PageOptions {
  search?: string;
  status?: InvoiceStatusValue;
  vendorId?: string;
  orderId?: string;
  isDisputed?: boolean;
  overdue?: boolean;
  fromDate?: Date;
  toDate?: Date;
}

/** The status an unvoided invoice has, given what was paid. */
export function statusForPaid(total: number, paidAmount: number): InvoiceStatusValue {
  if (paidAmount <= 0) return InvoiceStatus.UNPAID;
  return paidAmount >= total ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;
}

export async function getInvoice(_id: string): Promise<PurchasingInvoiceDocument> {
  const doc = await PurchasingInvoices.findOneAsync({ _id: { $eq: _id } });
  if (!doc) throw purchasingError('NOT_FOUND', 'Invoice not found.');
  return doc;
}

async function assertVendorInvoiceNoFree(vendorId: string, vendorInvoiceNo: string, exceptId?: string) {
  const duplicate = await PurchasingInvoices.findOneAsync({
    vendorId: { $eq: vendorId },
    vendorInvoiceNo: { $regex: new RegExp(`^${escapeRegExp(vendorInvoiceNo)}$`, 'i') },
    status: { $ne: InvoiceStatus.VOIDED },
    ...(exceptId ? { _id: { $ne: exceptId } } : {}),
  });
  if (duplicate) {
    throw purchasingError('CONFLICT', 'This vendor already has an invoice with that number.');
  }
}

/**
 * Records a vendor's bill. Every line is billed against a line of an order,
 * and one bill can cover several orders. The billed quantities are added to
 * those order lines. Billing more than was received is refused unless
 * `allowOverBilling` is set, which marks the invoice disputed.
 */
export async function createInvoice(values: InvoiceValues, user: ActingUser) {
  assertLineCount(values.lines);
  const vendorInvoiceNo = requireText(values.vendorInvoiceNo, 'The vendor invoice number', 100);

  return runInTransaction(async () => {
    const vendor = await getUsableVendor(values.vendorId);
    await assertVendorInvoiceNoFree(values.vendorId, vendorInvoiceNo);

    const orders = new Map<string, PurchasingOrderDocument>();
    for (const orderId of new Set(values.lines.map((l) => cleanText(l.orderId)))) {
      if (!orderId) throw purchasingError('BAD_USER_INPUT', 'Every line must be billed against an order.');
      const order = await getOrder(orderId);
      if (order.vendorId !== values.vendorId) {
        throw purchasingError('BAD_USER_INPUT', 'An order belongs to a different vendor.');
      }
      if (!InvoiceableOrderStatuses.includes(order.status)) {
        throw purchasingError('CONFLICT', 'Only an approved order can be invoiced.');
      }
      orders.set(orderId, order);
    }

    const lines: InvoiceLine[] = [];
    // Billed quantity per order, then per order line.
    const billed = new Map<string, Map<string, number>>();
    let overBilled = false;
    for (let i = 0; i < values.lines.length; i += 1) {
      const input = values.lines[i];
      const orderId = cleanText(input.orderId) as string;
      const orderLineId = cleanText(input.orderLineId);
      const order = orders.get(orderId) as PurchasingOrderDocument;
      const orderLine = order.lines.find((l) => l._id === orderLineId);
      if (!orderLine) {
        throw purchasingError('BAD_USER_INPUT', `Line ${i + 1} is not on the order.`);
      }
      const base = await normalizeBaseLine(
        {
          ...input,
          description: input.description ?? orderLine.description,
          unit: input.unit ?? orderLine.unit,
          internalCatalogId: orderLine.internalCatalogId,
          externalCatalogId: orderLine.externalCatalogId,
        },
        i
      );
      const perLine = billed.get(orderId) ?? new Map<string, number>();
      billed.set(orderId, perLine);
      const total = roundQuantity((perLine.get(orderLine._id) ?? 0) + base.quantity);
      perLine.set(orderLine._id, total);
      if (roundQuantity(orderLine.invoicedQuantity + total) > orderLine.receivedQuantity) {
        overBilled = true;
      }
      lines.push({
        ...base,
        orderId,
        orderLineId: orderLine._id,
        unitPrice: roundMoney(requireNonNegative(input.unitPrice, `Line ${i + 1}: price`)),
        taxRate: requireTaxRate(input.taxRate),
      });
    }
    if (overBilled && !values.allowOverBilling) {
      throw purchasingError('CONFLICT', 'The invoice bills more than was received. Receive the goods first, or accept it as disputed.', { code: 'CONFLICT', overBilled: true });
    }

    for (const [orderId, perLine] of billed) {
      const order = orders.get(orderId) as PurchasingOrderDocument;
      const newLines = order.lines.map((l) => ({
        ...l,
        invoicedQuantity: roundQuantity(l.invoicedQuantity + (perLine.get(l._id) ?? 0)),
      }));
      await updateIfUnchanged(PurchasingOrders, order._id, order.version, { lines: newLines }, user);
    }

    const { subtotal, taxTotal, total } = totalsOf(lines);
    const now = new Date();
    const terms = [...orders.values()]
      .map((o) => o.paymentTermsDays)
      .filter((d): d is number => d != null);
    const dueDate =
      values.dueDate ??
      addDays(values.invoiceDate, terms.length ? Math.min(...terms) : vendor.paymentTermsDays ?? 0);
    const number = await nextDocumentNumber(NumberedDocument.INVOICE, now);
    const notes = cleanText(values.notes);
    const _id = await PurchasingInvoices.insertAsync({
      number,
      vendorInvoiceNo,
      vendorId: values.vendorId,
      orderIds: [...orders.keys()],
      invoiceDate: values.invoiceDate,
      dueDate,
      ...(notes ? { notes } : {}),
      lines,
      subtotal,
      taxTotal,
      total,
      paidAmount: 0,
      status: InvoiceStatus.UNPAID,
      isDisputed: overBilled,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });
    await audit(EntityType.PURCHASING_INVOICE, _id, OperationType.CREATE, { number, vendorInvoiceNo, total, isDisputed: overBilled }, user);
    return getInvoice(_id);
  });
}

/** Only the vendor's number, the due date and the notes can change after entry. */
export async function updateInvoice(
  _id: string,
  values: { vendorInvoiceNo: string; dueDate: Date; notes?: string | null },
  user: ActingUser
) {
  const vendorInvoiceNo = requireText(values.vendorInvoiceNo, 'The vendor invoice number', 100);
  return runInTransaction(async () => {
    const existing = await getInvoice(_id);
    if (existing.status === InvoiceStatus.VOIDED) {
      throw purchasingError('CONFLICT', 'A voided invoice can\'t be edited.');
    }
    await assertVendorInvoiceNoFree(existing.vendorId, vendorInvoiceNo, _id);
    const notes = cleanText(values.notes);
    await PurchasingInvoices.updateAsync(
      { _id: { $eq: _id } },
      {
        $set: { vendorInvoiceNo, dueDate: values.dueDate, ...(notes ? { notes } : {}), updatedAt: new Date(), updatedBy: user._id },
        ...(notes ? {} : { $unset: { notes: '' } }),
      }
    );
    await audit(EntityType.PURCHASING_INVOICE, _id, OperationType.UPDATE, { vendorInvoiceNo, dueDate: values.dueDate }, user, existing);
    return getInvoice(_id);
  });
}

export async function setInvoiceDisputed(_id: string, isDisputed: boolean, user: ActingUser) {
  return runInTransaction(async () => {
    const existing = await getInvoice(_id);
    if (existing.status === InvoiceStatus.VOIDED) {
      throw purchasingError('CONFLICT', 'A voided invoice can\'t be changed.');
    }
    await PurchasingInvoices.updateAsync(
      { _id: { $eq: _id } },
      { $set: { isDisputed, updatedAt: new Date(), updatedBy: user._id } }
    );
    await audit(EntityType.PURCHASING_INVOICE, _id, OperationType.UPDATE, { isDisputed }, user, existing);
    return getInvoice(_id);
  });
}

/** Cancels an invoice nothing was paid against; its quantities come off the order. */
export async function voidInvoice(_id: string, user: ActingUser) {
  return runInTransaction(async () => {
    const invoice = await getInvoice(_id);
    if (invoice.paidAmount > 0) {
      throw purchasingError('CONFLICT', 'Payments were made against this invoice. Void them first.');
    }
    // Each line goes back to its own order (legacy invoices had one order).
    const back = new Map<string, Map<string, number>>();
    invoice.lines.forEach((l) => {
      const orderId = l.orderId ?? invoice.orderId;
      if (!orderId || !l.orderLineId) return;
      const perLine = back.get(orderId) ?? new Map<string, number>();
      back.set(orderId, perLine);
      perLine.set(l.orderLineId, (perLine.get(l.orderLineId) ?? 0) + l.quantity);
    });
    for (const [orderId, perLine] of back) {
      const order = await getOrder(orderId);
      const newLines = order.lines.map((l) => ({
        ...l,
        invoicedQuantity: Math.max(0, roundQuantity(l.invoicedQuantity - (perLine.get(l._id) ?? 0))),
      }));
      await updateIfUnchanged(PurchasingOrders, order._id, order.version, { lines: newLines }, user);
    }
    await moveStatus(
      PurchasingInvoices,
      _id,
      [InvoiceStatus.UNPAID],
      { status: InvoiceStatus.VOIDED, voidedAt: new Date(), voidedBy: user._id },
      user,
      'This invoice'
    );
    await audit(EntityType.PURCHASING_INVOICE, _id, OperationType.UPDATE, { status: InvoiceStatus.VOIDED }, user, invoice);
    return getInvoice(_id);
  });
}

export async function listInvoices({
  search,
  status,
  vendorId,
  orderId,
  isDisputed,
  overdue,
  fromDate,
  toDate,
  ...paging
}: ListInvoicesOptions = {}): Promise<Page<PurchasingInvoiceDocument>> {
  const selector: Record<string, unknown> = {};
  const text = search?.trim();
  if (text) {
    const regex = new RegExp(escapeRegExp(text), 'i');
    selector.$or = [{ number: regex }, { vendorInvoiceNo: regex }];
  }
  if (status) selector.status = status;
  if (vendorId) selector.vendorId = vendorId;
  if (orderId) selector.$and = [{ $or: [{ orderIds: orderId }, { orderId }] }];
  if (isDisputed != null) selector.isDisputed = isDisputed;
  if (overdue) {
    selector.status = { $in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID] };
    selector.dueDate = { $lt: new Date() };
  }
  if (fromDate || toDate) {
    selector.invoiceDate = {
      ...(fromDate ? { $gte: fromDate } : {}),
      ...(toDate ? { $lte: toDate } : {}),
    };
  }
  const { skip, limit } = pageWindow(paging);
  const [totalResults, data] = await Promise.all([
    PurchasingInvoices.find(selector).countAsync(),
    PurchasingInvoices.find(selector, { sort: { invoiceDate: -1, createdAt: -1 }, skip, limit }).fetchAsync(),
  ]);
  return { totalResults, data };
}

