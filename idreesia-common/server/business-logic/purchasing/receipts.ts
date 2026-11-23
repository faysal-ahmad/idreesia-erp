import {
  NumberedDocument,
  OrderStatus,
  ReceiptStatus,
  ReceivableOrderStatuses,
  type ReceiptStatusValue,
} from 'meteor/idreesia-common/constants/purchasing';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import {
  PurchasingOrders,
  PurchasingReceipts,
  type PurchasingReceiptDocument,
  type ReceiptLine,
} from 'meteor/idreesia-common/server/collections/purchasing';
import { escapeRegExp } from 'meteor/idreesia-common/utilities/lodash';
import { Random } from 'meteor/random';

import { purchasingError } from './errors';
import {
  EntityType,
  OperationType,
  audit,
  cleanText,
  moveStatus,
  pageWindow,
  requireNonNegative,
  requireText,
  roundQuantity,
  updateIfUnchanged,
  type ActingUser,
  type Page,
  type PageOptions,
} from './internal';
import { nextDocumentNumber } from './numbering';
import { getOrder, receivingStatus } from './orders';

export interface ReceiptLineInput {
  orderLineId: string;
  receivedQuantity: number;
  rejectedQuantity?: number | null;
  remarks?: string | null;
}

export interface ReceiptValues {
  orderId: string;
  receivedDate: Date;
  receivedBy?: string | null;
  deliveryNoteNo?: string | null;
  notes?: string | null;
  lines: ReceiptLineInput[];
}

export interface ListReceiptsOptions extends PageOptions {
  search?: string;
  status?: ReceiptStatusValue;
  vendorId?: string;
  orderId?: string;
}

export async function getReceipt(_id: string): Promise<PurchasingReceiptDocument> {
  const doc = await PurchasingReceipts.findOneAsync({ _id: { $eq: _id } });
  if (!doc) throw purchasingError('NOT_FOUND', 'Receipt not found.');
  return doc;
}

/**
 * Records goods received against an order. The accepted quantities are added
 * to the order's lines and the order's status follows, in one transaction.
 * More than was ordered can't be received.
 */
export async function postReceipt(values: ReceiptValues, user: ActingUser) {
  return runInTransaction(async () => {
    const order = await getOrder(values.orderId);
    if (!ReceivableOrderStatuses.includes(order.status)) {
      throw purchasingError('CONFLICT', 'Goods can only be received against an approved order that is not yet fully received.');
    }

    const seen = new Set<string>();
    const lines: ReceiptLine[] = [];
    const received = new Map<string, number>();
    values.lines.forEach((input, i) => {
      const orderLine = order.lines.find((l) => l._id === input.orderLineId);
      if (!orderLine) {
        throw purchasingError('BAD_USER_INPUT', `Line ${i + 1} is not on the order.`);
      }
      if (seen.has(input.orderLineId)) {
        throw purchasingError('BAD_USER_INPUT', `Line ${i + 1} is listed twice.`);
      }
      seen.add(input.orderLineId);
      const accepted = roundQuantity(requireNonNegative(input.receivedQuantity, `Line ${i + 1}: received quantity`));
      const rejected = roundQuantity(requireNonNegative(input.rejectedQuantity, `Line ${i + 1}: rejected quantity`));
      if (accepted === 0 && rejected === 0) return;
      if (roundQuantity(orderLine.receivedQuantity + accepted) > orderLine.quantity) {
        throw purchasingError(
          'BAD_USER_INPUT',
          `Line ${i + 1}: only ${roundQuantity(orderLine.quantity - orderLine.receivedQuantity)} ${orderLine.unit} of "${orderLine.description}" is still due.`
        );
      }
      received.set(orderLine._id, accepted);
      lines.push({
        _id: Random.id(),
        orderLineId: orderLine._id,
        description: orderLine.description,
        unit: orderLine.unit,
        receivedQuantity: accepted,
        rejectedQuantity: rejected,
        ...(cleanText(input.remarks) ? { remarks: cleanText(input.remarks) } : {}),
      });
    });
    if (lines.length === 0) {
      throw purchasingError('BAD_USER_INPUT', 'Enter a received or rejected quantity for at least one line.');
    }

    const newLines = order.lines.map((l) => ({
      ...l,
      receivedQuantity: roundQuantity(l.receivedQuantity + (received.get(l._id) ?? 0)),
    }));
    const status = receivingStatus({ lines: newLines, sentAt: order.sentAt });
    await updateIfUnchanged(PurchasingOrders, order._id, order.version, { lines: newLines, status }, user);
    if (status !== order.status) {
      await audit(EntityType.PURCHASING_ORDER, order._id, OperationType.UPDATE, { status }, user, order);
    }

    const now = new Date();
    const number = await nextDocumentNumber(NumberedDocument.RECEIPT, now);
    const optional = {
      receivedBy: cleanText(values.receivedBy),
      deliveryNoteNo: cleanText(values.deliveryNoteNo),
      notes: cleanText(values.notes),
    };
    const _id = await PurchasingReceipts.insertAsync({
      number,
      orderId: order._id,
      vendorId: order.vendorId,
      receivedDate: values.receivedDate,
      ...Object.fromEntries(Object.entries(optional).filter(([, v]) => v !== undefined)),
      lines,
      status: ReceiptStatus.POSTED,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });
    await audit(EntityType.PURCHASING_RECEIPT, _id, OperationType.CREATE, { number, orderId: order._id }, user);
    return getReceipt(_id);
  });
}

/**
 * Cancels a receipt: the quantities come off the order again. Not possible
 * once the order is closed or cancelled, or when invoices already bill
 * the goods.
 */
export async function voidReceipt(_id: string, reason: string, user: ActingUser) {
  const voidReason = requireText(reason, 'A reason', 1000);
  return runInTransaction(async () => {
    const receipt = await getReceipt(_id);
    if (receipt.status !== ReceiptStatus.POSTED) {
      throw purchasingError('CONFLICT', 'This receipt is already voided.');
    }
    const order = await getOrder(receipt.orderId);
    if (![...ReceivableOrderStatuses, OrderStatus.RECEIVED].includes(order.status)) {
      throw purchasingError('CONFLICT', 'The order is closed or cancelled, so this receipt can no longer be voided.');
    }

    const newLines = order.lines.map((l) => {
      const back = receipt.lines
        .filter((rl) => rl.orderLineId === l._id)
        .reduce((sum, rl) => sum + rl.receivedQuantity, 0);
      const receivedQuantity = roundQuantity(l.receivedQuantity - back);
      if (receivedQuantity < l.invoicedQuantity) {
        throw purchasingError('CONFLICT', `"${l.description}" is already invoiced. Void the invoice first.`);
      }
      return { ...l, receivedQuantity };
    });
    const status = receivingStatus({ lines: newLines, sentAt: order.sentAt });
    await updateIfUnchanged(PurchasingOrders, order._id, order.version, { lines: newLines, status }, user);
    if (status !== order.status) {
      await audit(EntityType.PURCHASING_ORDER, order._id, OperationType.UPDATE, { status }, user, order);
    }

    await moveStatus(
      PurchasingReceipts,
      _id,
      [ReceiptStatus.POSTED],
      { status: ReceiptStatus.VOIDED, voidedAt: new Date(), voidedBy: user._id, voidReason },
      user,
      'This receipt'
    );
    await audit(EntityType.PURCHASING_RECEIPT, _id, OperationType.UPDATE, { status: ReceiptStatus.VOIDED, voidReason }, user, receipt);
    return getReceipt(_id);
  });
}

export async function listReceipts({
  search,
  status,
  vendorId,
  orderId,
  ...paging
}: ListReceiptsOptions = {}): Promise<Page<PurchasingReceiptDocument>> {
  const selector: Record<string, unknown> = {};
  const text = search?.trim();
  if (text) {
    const regex = new RegExp(escapeRegExp(text), 'i');
    selector.$or = [{ number: regex }, { deliveryNoteNo: regex }];
  }
  if (status) selector.status = status;
  if (vendorId) selector.vendorId = vendorId;
  if (orderId) selector.orderId = orderId;
  const { skip, limit } = pageWindow(paging);
  const [totalResults, data] = await Promise.all([
    PurchasingReceipts.find(selector).countAsync(),
    PurchasingReceipts.find(selector, { sort: { receivedDate: -1, createdAt: -1 }, skip, limit }).fetchAsync(),
  ]);
  return { totalResults, data };
}
