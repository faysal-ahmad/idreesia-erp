import {
  InvoiceStatus,
  NumberedDocument,
  PaymentMethod,
  PaymentStatus,
  type PaymentMethodValue,
  type PaymentStatusValue,
} from 'meteor/idreesia-common/constants/purchasing';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import {
  PurchasingInvoices,
  PurchasingPayments,
  type PaymentAllocation,
  type PurchasingPaymentDocument,
} from 'meteor/idreesia-common/server/collections/purchasing';
import { escapeRegExp } from 'meteor/idreesia-common/utilities/lodash';

import { purchasingError } from './errors';
import {
  EntityType,
  OperationType,
  audit,
  cleanText,
  moveStatus,
  pageWindow,
  requireText,
  roundMoney,
  type ActingUser,
  type Page,
  type PageOptions,
} from './internal';
import { getInvoice, statusForPaid } from './invoices';
import { nextDocumentNumber } from './numbering';
import { getUsableVendor } from './vendors';

export interface PaymentValues {
  vendorId: string;
  paymentDate: Date;
  method: PaymentMethodValue;
  reference?: string | null;
  notes?: string | null;
  allocations: PaymentAllocation[];
}

export interface ListPaymentsOptions extends PageOptions {
  search?: string;
  status?: PaymentStatusValue;
  vendorId?: string;
  fromDate?: Date;
  toDate?: Date;
}

const METHODS: string[] = Object.values(PaymentMethod);

export async function getPayment(_id: string): Promise<PurchasingPaymentDocument> {
  const doc = await PurchasingPayments.findOneAsync({ _id: { $eq: _id } });
  if (!doc) throw purchasingError('NOT_FOUND', 'Payment not found.');
  return doc;
}

/** Sets an invoice's paid amount if it is still what it was read as. */
async function setPaid(invoiceId: string, from: number, to: number, total: number, user: ActingUser) {
  const changed = await PurchasingInvoices.updateAsync(
    { _id: { $eq: invoiceId }, paidAmount: { $eq: from }, status: { $ne: InvoiceStatus.VOIDED } },
    {
      $set: { paidAmount: to, status: statusForPaid(total, to), updatedAt: new Date(), updatedBy: user._id },
      $inc: { version: 1 },
    }
  );
  if (!changed) {
    throw purchasingError('CONFLICT', 'An invoice was changed by someone else. Reload and try again.');
  }
}

/**
 * Pays invoices of one vendor. Each allocation is at most what is still
 * owed on its invoice, and each invoice's paid amount and status follow, in
 * one transaction.
 */
export async function postPayment(values: PaymentValues, user: ActingUser) {
  if (!METHODS.includes(values.method)) {
    throw purchasingError('BAD_USER_INPUT', 'Choose how the payment was made.');
  }
  if (values.allocations.length === 0) {
    throw purchasingError('BAD_USER_INPUT', 'Choose at least one invoice to pay.');
  }

  return runInTransaction(async () => {
    await getUsableVendor(values.vendorId);
    const seen = new Set<string>();
    const allocations: PaymentAllocation[] = [];
    for (const input of values.allocations) {
      if (seen.has(input.invoiceId)) {
        throw purchasingError('BAD_USER_INPUT', 'An invoice is listed twice.');
      }
      seen.add(input.invoiceId);
      const amount = roundMoney(input.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw purchasingError('BAD_USER_INPUT', 'Each amount must be more than zero.');
      }
      const invoice = await getInvoice(input.invoiceId);
      if (invoice.vendorId !== values.vendorId) {
        throw purchasingError('BAD_USER_INPUT', `Invoice ${invoice.number} belongs to a different vendor.`);
      }
      if (invoice.status === InvoiceStatus.VOIDED || invoice.status === InvoiceStatus.PAID) {
        throw purchasingError('CONFLICT', `Invoice ${invoice.number} can't be paid.`);
      }
      const owed = roundMoney(invoice.total - invoice.paidAmount);
      if (amount > owed) {
        throw purchasingError('BAD_USER_INPUT', `Invoice ${invoice.number}: only ${owed} is still owed.`);
      }
      await setPaid(invoice._id, invoice.paidAmount, roundMoney(invoice.paidAmount + amount), invoice.total, user);
      allocations.push({ invoiceId: invoice._id, amount });
    }

    const now = new Date();
    const number = await nextDocumentNumber(NumberedDocument.PAYMENT, now);
    const amount = roundMoney(allocations.reduce((sum, a) => sum + a.amount, 0));
    const reference = cleanText(values.reference);
    const notes = cleanText(values.notes);
    const _id = await PurchasingPayments.insertAsync({
      number,
      vendorId: values.vendorId,
      paymentDate: values.paymentDate,
      method: values.method,
      ...(reference ? { reference } : {}),
      ...(notes ? { notes } : {}),
      amount,
      allocations,
      status: PaymentStatus.POSTED,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });
    await audit(EntityType.PURCHASING_PAYMENT, _id, OperationType.CREATE, { number, amount, vendorId: values.vendorId }, user);
    return getPayment(_id);
  });
}

/** Cancels a payment: what it paid is owed again on each invoice. */
export async function voidPayment(_id: string, reason: string, user: ActingUser) {
  const voidReason = requireText(reason, 'A reason', 1000);
  return runInTransaction(async () => {
    const payment = await getPayment(_id);
    if (payment.status !== PaymentStatus.POSTED) {
      throw purchasingError('CONFLICT', 'This payment is already voided.');
    }
    for (const allocation of payment.allocations) {
      const invoice = await getInvoice(allocation.invoiceId);
      const to = Math.max(0, roundMoney(invoice.paidAmount - allocation.amount));
      await setPaid(invoice._id, invoice.paidAmount, to, invoice.total, user);
    }
    await moveStatus(
      PurchasingPayments,
      _id,
      [PaymentStatus.POSTED],
      { status: PaymentStatus.VOIDED, voidedAt: new Date(), voidedBy: user._id, voidReason },
      user,
      'This payment'
    );
    await audit(EntityType.PURCHASING_PAYMENT, _id, OperationType.UPDATE, { status: PaymentStatus.VOIDED, voidReason }, user, payment);
    return getPayment(_id);
  });
}

export async function listPayments({
  search,
  status,
  vendorId,
  fromDate,
  toDate,
  ...paging
}: ListPaymentsOptions = {}): Promise<Page<PurchasingPaymentDocument>> {
  const selector: Record<string, unknown> = {};
  const text = search?.trim();
  if (text) {
    const regex = new RegExp(escapeRegExp(text), 'i');
    selector.$or = [{ number: regex }, { reference: regex }];
  }
  if (status) selector.status = status;
  if (vendorId) selector.vendorId = vendorId;
  if (fromDate || toDate) {
    selector.paymentDate = {
      ...(fromDate ? { $gte: fromDate } : {}),
      ...(toDate ? { $lte: toDate } : {}),
    };
  }
  const { skip, limit } = pageWindow(paging);
  const [totalResults, data] = await Promise.all([
    PurchasingPayments.find(selector).countAsync(),
    PurchasingPayments.find(selector, { sort: { paymentDate: -1, createdAt: -1 }, skip, limit }).fetchAsync(),
  ]);
  return { totalResults, data };
}
