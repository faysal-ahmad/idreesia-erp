import {
  NumberedDocument,
  OrderStatus,
  QuoteStatus,
  RequisitionSource,
  RequisitionStatus,
  StoreVisibleOrderStatuses,
  type OrderStatusValue,
} from 'meteor/idreesia-common/constants/purchasing';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import {
  PurchasingCatalogItems,
  PurchasingInvoices,
  PurchasingOrders,
  PurchasingReceipts,
  PurchasingRequisitions,
  type OrderLine,
  type PurchasingOrderDocument,
  type PurchasingRequisitionDocument,
} from 'meteor/idreesia-common/server/collections/purchasing';
import { escapeRegExp } from 'meteor/idreesia-common/utilities/lodash';

import { deleteOwnerAttachments } from './attachments';
import { purchasingError } from './errors';
import {
  EntityType,
  OperationType,
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
  totalsOf,
  updateIfUnchanged,
  type ActingUser,
  type LineInput,
  type Page,
  type PageOptions,
} from './internal';
import { nextDocumentNumber } from './numbering';
import { getQuote, selectQuote } from './quotes';
import { getRequisition, setRequisitionOrdered, syncRequisitionClosure } from './requisitions';
import { getUsableVendor, getVendor } from './vendors';

export interface OrderLineInput extends LineInput {
  unitPrice: number;
  taxRate?: number | null;
  /** Set by this module (never by a client) for lines copied from a requisition. */
  requisitionLineId?: string | null;
}

export interface OrderValues {
  vendorId: string;
  orderDate: Date;
  expectedDeliveryDate?: Date | null;
  deliveryAddress?: string | null;
  paymentTermsDays?: number | null;
  notes?: string | null;
  discount?: number | null;
  shipping?: number | null;
  lines: OrderLineInput[];
}

export interface ListOrdersOptions extends PageOptions {
  search?: string;
  status?: OrderStatusValue;
  /** Any of these statuses (e.g. every state goods can be received in). */
  statuses?: OrderStatusValue[];
  vendorId?: string;
  requisitionId?: string;
  /** Only orders made for purchasing's own requisitions, or only a store's. */
  source?: 'purchasing' | 'store';
  /** Only the orders made for this store's requisitions. */
  physicalStoreId?: string;
  fromDate?: Date;
  toDate?: Date;
}

const {
  DRAFT,
  PENDING_APPROVAL,
  APPROVED,
  SENT,
  PARTIALLY_RECEIVED,
  RECEIVED,
  CLOSED,
  CANCELLED,
} = OrderStatus;

/** Statuses an order can be cancelled from. */
const CANCELLABLE: OrderStatusValue[] = [DRAFT, PENDING_APPROVAL, APPROVED, SENT];

export function orderTotals(
  lines: Pick<OrderLine, 'quantity' | 'unitPrice' | 'taxRate'>[],
  discount: number,
  shipping: number
) {
  const { subtotal, taxTotal } = totalsOf(lines);
  const gross = roundMoney(subtotal + taxTotal);
  if (discount > gross) {
    throw purchasingError('BAD_USER_INPUT', 'The discount is more than the order total.');
  }
  return { subtotal, taxTotal, total: roundMoney(gross - discount + shipping) };
}

async function normalize(values: OrderValues) {
  assertLineCount(values.lines);
  const vendor = await getUsableVendor(values.vendorId);

  const lines: OrderLine[] = [];
  for (let i = 0; i < values.lines.length; i += 1) {
    const input = values.lines[i];
    const base = await normalizeBaseLine(input, i);
    lines.push({
      ...base,
      ...(cleanText(input.requisitionLineId)
        ? { requisitionLineId: cleanText(input.requisitionLineId) }
        : {}),
      unitPrice: roundMoney(requireNonNegative(input.unitPrice, `Line ${i + 1}: price`)),
      taxRate: requireTaxRate(input.taxRate),
      receivedQuantity: 0,
      invoicedQuantity: 0,
    });
  }
  const discount = roundMoney(requireNonNegative(values.discount, 'The discount'));
  const shipping = roundMoney(requireNonNegative(values.shipping, 'The shipping charge'));
  const paymentTermsDays = values.paymentTermsDays ?? vendor.paymentTermsDays;
  if (paymentTermsDays != null && (!Number.isInteger(paymentTermsDays) || paymentTermsDays < 0)) {
    throw purchasingError('BAD_USER_INPUT', 'Payment terms must be a whole number of days.');
  }
  return {
    vendorId: values.vendorId,
    orderDate: values.orderDate,
    expectedDeliveryDate: values.expectedDeliveryDate ?? undefined,
    deliveryAddress: cleanText(values.deliveryAddress),
    paymentTermsDays: paymentTermsDays ?? undefined,
    notes: cleanText(values.notes),
    lines,
    discount,
    shipping,
    ...orderTotals(lines, discount, shipping),
  };
}

export async function getOrder(_id: string): Promise<PurchasingOrderDocument> {
  const doc = await PurchasingOrders.findOneAsync({ _id: { $eq: _id } });
  if (!doc) throw purchasingError('NOT_FOUND', 'Purchase order not found.');
  return doc;
}

/** The status an order in a receiving state has, given what was received. */
export function receivingStatus(
  order: Pick<PurchasingOrderDocument, 'lines' | 'sentAt'>
): OrderStatusValue {
  const allReceived = order.lines.every((l) => l.receivedQuantity >= l.quantity);
  if (allReceived) return RECEIVED;
  if (order.lines.some((l) => l.receivedQuantity > 0)) return PARTIALLY_RECEIVED;
  return order.sentAt ? SENT : APPROVED;
}

const withoutUndefined = <T extends object>(value: T): T =>
  Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;

/** An order belongs to the store its requisition was raised by, if any. */
const sourceOf = ({ source, externalSourceId }: PurchasingRequisitionDocument) =>
  source && externalSourceId ? { source, externalSourceId } : {};

async function insertOrder(
  data: Awaited<ReturnType<typeof normalize>>,
  links: { requisitionId: string; quoteId?: string } & ReturnType<typeof sourceOf>,
  user: ActingUser
) {
  const now = new Date();
  const number = await nextDocumentNumber(NumberedDocument.ORDER, now);
  const _id = await PurchasingOrders.insertAsync({
    ...withoutUndefined(data),
    ...links,
    number,
    status: DRAFT,
    version: 1,
    createdAt: now,
    createdBy: user._id,
    updatedAt: now,
    updatedBy: user._id,
  });
  await audit(EntityType.PURCHASING_ORDER, _id, OperationType.CREATE, { number, vendorId: data.vendorId, total: data.total, ...links }, user);
  return _id;
}

/**
 * Marks the requisition as ordered when a first order is made from it, and
 * reopens one that was closed. Returns it, for the order's store link.
 */
async function linkRequisition(requisitionId: string, user: ActingUser) {
  const requisition = await getRequisition(requisitionId);
  if (requisition.status === RequisitionStatus.APPROVED) {
    await setRequisitionOrdered(requisitionId, true, user);
  } else if (requisition.status === RequisitionStatus.CLOSED) {
    await moveStatus(
      PurchasingRequisitions,
      requisitionId,
      [RequisitionStatus.CLOSED],
      { status: RequisitionStatus.ORDERED },
      user,
      'This requisition'
    );
  } else if (requisition.status !== RequisitionStatus.ORDERED) {
    throw purchasingError('BAD_USER_INPUT', 'Only an approved requisition can be ordered.');
  }
  return requisition;
}

export async function createOrderFromRequisition(
  requisitionId: string,
  vendorId: string,
  user: ActingUser
) {
  return runInTransaction(async () => {
    const requisition = await getRequisition(requisitionId);
    const vendor = await getVendor(vendorId);
    const data = await normalize({
      vendorId,
      orderDate: new Date(),
      paymentTermsDays: vendor.paymentTermsDays,
      lines: requisition.lines.map((l) => ({
        internalCatalogId: l.internalCatalogId,
        externalCatalogId: l.externalCatalogId,
        requisitionLineId: l._id,
        description: l.description,
        unit: l.unit,
        quantity: l.quantity,
        unitPrice: l.estimatedUnitPrice ?? 0,
      })),
    });
    await linkRequisition(requisitionId, user);
    const _id = await insertOrder(data, { requisitionId, ...sourceOf(requisition) }, user);
    return getOrder(_id);
  });
}

export async function createOrderFromQuote(quoteId: string, user: ActingUser) {
  return runInTransaction(async () => {
    const quote = await getQuote(quoteId);
    if (quote.status === QuoteStatus.REJECTED) {
      throw purchasingError('BAD_USER_INPUT', 'This quote was rejected.');
    }
    if (!quote.requisitionId) {
      throw purchasingError('BAD_USER_INPUT', 'This quote is not linked to a requisition, so no order can be made from it.');
    }
    const data = await normalize({
      vendorId: quote.vendorId,
      orderDate: new Date(),
      lines: quote.lines.map((l) => ({
        internalCatalogId: l.internalCatalogId,
        externalCatalogId: l.externalCatalogId,
        requisitionLineId: l.requisitionLineId,
        description: l.description,
        unit: l.unit,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
      })),
    });
    if (quote.status === QuoteStatus.RECEIVED) await selectQuote(quoteId, user);
    const requisition = await linkRequisition(quote.requisitionId, user);
    const _id = await insertOrder(
      data,
      { quoteId, requisitionId: quote.requisitionId, ...sourceOf(requisition) },
      user
    );
    return getOrder(_id);
  });
}

/**
 * The lines of a draft order made from a requisition stay the requisition's:
 * none can be added or removed or changed to another item. Only the price and
 * tax can change, and the quantity can go down but never above what was
 * requested.
 */
async function requisitionLineInputs(
  existing: PurchasingOrderDocument,
  inputs: OrderLineInput[]
): Promise<OrderLineInput[]> {
  // A legacy order's lines are free-form, and a client can't make them requisition lines.
  if (!existing.lines.some((l) => l.requisitionLineId)) {
    return inputs.map((input) => ({ ...input, requisitionLineId: undefined }));
  }
  if (inputs.length !== existing.lines.length) {
    throw purchasingError('BAD_USER_INPUT', 'Lines can not be added to or removed from an order made from a requisition.');
  }
  const requisition = existing.requisitionId ? await getRequisition(existing.requisitionId) : null;
  const seen = new Set<string>();
  return inputs.map((input, i) => {
    const current = existing.lines.find((l) => l._id === cleanText(input._id));
    if (!current || seen.has(current._id)) {
      throw purchasingError('BAD_USER_INPUT', `Line ${i + 1} is not a line of this order.`);
    }
    seen.add(current._id);
    const requested = requisition?.lines.find((l) => l._id === current.requisitionLineId)?.quantity;
    if (requested == null) {
      throw purchasingError('BAD_USER_INPUT', `Line ${i + 1} is not on the requisition any more.`);
    }
    if (input.quantity > requested) {
      throw purchasingError('BAD_USER_INPUT', `Line ${i + 1}: only ${requested} ${current.unit} was requested.`);
    }
    return {
      ...input,
      _id: current._id,
      description: current.description,
      unit: current.unit,
      internalCatalogId: current.internalCatalogId,
      externalCatalogId: current.externalCatalogId,
      requisitionLineId: current.requisitionLineId,
    };
  });
}

/** Only a draft can be edited. The requisition and quote links stay as they are. */
export async function updateOrder(_id: string, version: number, values: OrderValues, user: ActingUser) {
  return runInTransaction(async () => {
    const existing = await getOrder(_id);
    if (existing.status !== DRAFT) {
      throw purchasingError('CONFLICT', 'Only a draft order can be edited.');
    }
    const data = await normalize({ ...values, lines: await requisitionLineInputs(existing, values.lines) });
    const { expectedDeliveryDate, deliveryAddress, paymentTermsDays, notes, ...always } = data;
    const optional = { expectedDeliveryDate, deliveryAddress, paymentTermsDays, notes };
    const set: Record<string, unknown> = { ...always };
    const unset: string[] = [];
    (Object.keys(optional) as (keyof typeof optional)[]).forEach((field) => {
      if (optional[field] !== undefined) set[field] = optional[field];
      else unset.push(field);
    });
    await updateIfUnchanged(PurchasingOrders, _id, version, set, user, unset);
    await audit(EntityType.PURCHASING_ORDER, _id, OperationType.UPDATE, { vendorId: data.vendorId, total: data.total }, user, existing);
    return getOrder(_id);
  });
}

async function transition(
  _id: string,
  from: OrderStatusValue[],
  to: OrderStatusValue,
  fields: Record<string, unknown>,
  user: ActingUser,
  extra?: (existing: PurchasingOrderDocument) => Promise<void>
) {
  return runInTransaction(async () => {
    const existing = await getOrder(_id);
    await moveStatus(PurchasingOrders, _id, from, { status: to, ...fields }, user, 'This order');
    if (extra) await extra(existing);
    await audit(EntityType.PURCHASING_ORDER, _id, OperationType.UPDATE, { status: to, ...(fields.rejectionReason ? { rejectionReason: fields.rejectionReason } : {}) }, user, existing);
    return getOrder(_id);
  });
}

export async function submitOrder(_id: string, user: ActingUser) {
  const existing = await getOrder(_id);
  if (existing.lines.some((l) => l.unitPrice <= 0)) {
    throw purchasingError('BAD_USER_INPUT', 'Every line needs a price before the order is submitted.');
  }
  return transition(_id, [DRAFT], PENDING_APPROVAL, { submittedAt: new Date(), submittedBy: user._id }, user);
}

/** Approving remembers each catalog item's price and vendor for next time. */
export const approveOrder = (_id: string, user: ActingUser) =>
  transition(
    _id,
    [PENDING_APPROVAL],
    APPROVED,
    { approvedAt: new Date(), approvedBy: user._id },
    user,
    async (order) => {
      for (const line of order.lines) {
        if (!line.internalCatalogId) continue;
        await PurchasingCatalogItems.updateAsync(
          { _id: { $eq: line.internalCatalogId } },
          { $set: { lastUnitPrice: line.unitPrice, lastVendorId: order.vendorId } }
        );
      }
    }
  );

/** Sends a submitted order back to a draft with a reason. */
export async function rejectOrder(_id: string, reason: string, user: ActingUser) {
  const rejectionReason = requireText(reason, 'A reason', 1000);
  return transition(_id, [PENDING_APPROVAL], DRAFT, { rejectionReason }, user);
}

export const markOrderSent = (_id: string, user: ActingUser) =>
  transition(_id, [APPROVED], SENT, { sentAt: new Date(), sentBy: user._id }, user);

export const closeOrder = (_id: string, user: ActingUser) =>
  transition(
    _id,
    [PARTIALLY_RECEIVED, RECEIVED],
    CLOSED,
    { closedAt: new Date(), closedBy: user._id },
    user,
    async (order) => {
      if (order.requisitionId) await syncRequisitionClosure(order.requisitionId, user);
    }
  );

/** Lets the requisition be ordered again once none of its orders are live. */
async function releaseRequisition(order: PurchasingOrderDocument, user: ActingUser) {
  if (!order.requisitionId) return;
  const live = await PurchasingOrders.find({
    requisitionId: { $eq: order.requisitionId },
    _id: { $ne: order._id },
    status: { $ne: CANCELLED },
  }).countAsync();
  if (live > 0) {
    // The orders that are left may all be done by now.
    await syncRequisitionClosure(order.requisitionId, user);
    return;
  }
  const requisition = await getRequisition(order.requisitionId);
  if (requisition.status === RequisitionStatus.ORDERED) {
    await setRequisitionOrdered(order.requisitionId, false, user);
  }
}

/** An order with receipts or invoices can't be cancelled; void those first. */
export async function cancelOrder(_id: string, user: ActingUser) {
  return transition(
    _id,
    CANCELLABLE,
    CANCELLED,
    { cancelledAt: new Date(), cancelledBy: user._id },
    user,
    async (order) => {
      const receipts = await PurchasingReceipts.find({ orderId: { $eq: _id }, status: 'posted' }).countAsync();
      const invoices = await PurchasingInvoices.find({ orderId: { $eq: _id }, status: { $ne: 'voided' } }).countAsync();
      if (receipts > 0 || invoices > 0) {
        throw purchasingError('CONFLICT', 'This order has receipts or invoices. Void them before cancelling it.');
      }
      await releaseRequisition(order, user);
    }
  );
}

export async function deleteOrder(_id: string, user: ActingUser) {
  await runInTransaction(async () => {
    const existing = await getOrder(_id);
    if (existing.status !== DRAFT) {
      throw purchasingError('CONFLICT', 'Only a draft order can be deleted. Cancel it instead.');
    }
    await PurchasingOrders.removeAsync({ _id: { $eq: _id }, status: DRAFT });
    await deleteOwnerAttachments('order', _id);
    await releaseRequisition(existing, user);
    await audit(EntityType.PURCHASING_ORDER, _id, OperationType.DELETE, { number: existing.number }, user);
  });
}

export async function listOrders({
  search,
  status,
  statuses,
  vendorId,
  requisitionId,
  source,
  physicalStoreId,
  fromDate,
  toDate,
  ...paging
}: ListOrdersOptions = {}): Promise<Page<PurchasingOrderDocument>> {
  const selector: Record<string, unknown> = {};
  const text = search?.trim();
  if (text) selector.number = new RegExp(escapeRegExp(text), 'i');
  if (status) selector.status = status;
  else if (statuses?.length) selector.status = { $in: statuses };
  if (vendorId) selector.vendorId = vendorId;
  if (requisitionId) selector.requisitionId = requisitionId;
  if (physicalStoreId) {
    selector.source = RequisitionSource.STORE;
    selector.externalSourceId = physicalStoreId;
  } else if (source === 'store') {
    selector.source = RequisitionSource.STORE;
  } else if (source === 'purchasing') {
    selector.source = { $exists: false };
  }
  if (fromDate || toDate) {
    selector.orderDate = {
      ...(fromDate ? { $gte: fromDate } : {}),
      ...(toDate ? { $lte: toDate } : {}),
    };
  }
  const { skip, limit } = pageWindow(paging);
  const [totalResults, data] = await Promise.all([
    PurchasingOrders.find(selector).countAsync(),
    PurchasingOrders.find(selector, { sort: { orderDate: -1, createdAt: -1 }, skip, limit }).fetchAsync(),
  ]);
  return { totalResults, data };
}

/** A store's own order, once it is approved. */
export async function getStoreOrder(
  _id: string,
  physicalStoreId: string
): Promise<PurchasingOrderDocument | null> {
  return (await PurchasingOrders.findOneAsync({
    _id: { $eq: _id },
    source: RequisitionSource.STORE,
    externalSourceId: { $eq: physicalStoreId },
    status: { $in: StoreVisibleOrderStatuses },
  })) ?? null;
}

/** The approved orders made for a store's requisitions, optionally only in some states. */
export async function listStoreOrders({
  physicalStoreId,
  statuses,
  ...rest
}: Omit<ListOrdersOptions, 'source' | 'status' | 'vendorId' | 'fromDate' | 'toDate'> & {
  physicalStoreId: string;
}): Promise<Page<PurchasingOrderDocument>> {
  const visible = statuses?.length
    ? statuses.filter((status) => StoreVisibleOrderStatuses.includes(status))
    : StoreVisibleOrderStatuses;
  return listOrders({ ...rest, physicalStoreId, statuses: visible });
}
