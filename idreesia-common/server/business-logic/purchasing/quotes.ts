import { QuoteStatus, RequisitionStatus, type QuoteStatusValue } from 'meteor/idreesia-common/constants/purchasing';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import {
  PurchasingOrders,
  PurchasingQuotes,
  PurchasingRequisitions,
  type PurchasingQuoteDocument,
  type QuoteLine,
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
  normalizeBaseLine,
  pageWindow,
  requireNonNegative,
  roundMoney,
  updateIfUnchanged,
  type ActingUser,
  type LineInput,
  type Page,
  type PageOptions,
} from './internal';
import { getUsableVendor } from './vendors';

export interface QuoteLineInput extends LineInput {
  /** The requisition line being priced. */
  requisitionLineId?: string | null;
  unitPrice: number;
}

export interface QuoteValues {
  requisitionId: string;
  vendorId: string;
  reference?: string | null;
  quoteDate: Date;
  validUntil?: Date | null;
  notes?: string | null;
  lines: QuoteLineInput[];
}

export interface ListQuotesOptions extends PageOptions {
  search?: string;
  status?: QuoteStatusValue;
  vendorId?: string;
  requisitionId?: string;
}

async function normalize(values: QuoteValues) {
  assertLineCount(values.lines);
  await getUsableVendor(values.vendorId);

  const requisitionId = cleanText(values.requisitionId);
  if (!requisitionId) {
    throw purchasingError('BAD_USER_INPUT', 'A quote must be for a requisition.');
  }
  const requisition = await PurchasingRequisitions.findOneAsync({ _id: { $eq: requisitionId } });
  if (!requisition) throw purchasingError('BAD_USER_INPUT', 'Requisition not found.');
  if (requisition.status === RequisitionStatus.CANCELLED) {
    throw purchasingError('BAD_USER_INPUT', 'This requisition is cancelled.');
  }

  // A quote prices (some of) the requisition's own lines: the item stays the
  // requisition's, only the quantity (not above what was requested) and the
  // price are the vendor's.
  const lines: QuoteLine[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < values.lines.length; i += 1) {
    const input = values.lines[i];
    const requested = requisition.lines.find((l) => l._id === cleanText(input.requisitionLineId));
    if (!requested || seen.has(requested._id)) {
      throw purchasingError('BAD_USER_INPUT', `Line ${i + 1}: pick a line of the requisition, once.`);
    }
    seen.add(requested._id);
    if (input.quantity > requested.quantity) {
      throw purchasingError('BAD_USER_INPUT', `Line ${i + 1}: only ${requested.quantity} ${requested.unit} was requested.`);
    }
    const base = await normalizeBaseLine(
      {
        ...input,
        description: requested.description,
        unit: requested.unit,
        internalCatalogId: requested.internalCatalogId,
        externalCatalogId: requested.externalCatalogId,
      },
      i
    );
    lines.push({
      ...base,
      requisitionLineId: requested._id,
      unitPrice: roundMoney(requireNonNegative(input.unitPrice, `Line ${i + 1}: price`)),
    });
  }
  const total = roundMoney(lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0));
  return {
    requisitionId,
    vendorId: values.vendorId,
    reference: cleanText(values.reference),
    quoteDate: values.quoteDate,
    validUntil: values.validUntil ?? undefined,
    notes: cleanText(values.notes),
    lines,
    total,
  };
}

export async function getQuote(_id: string): Promise<PurchasingQuoteDocument> {
  const doc = await PurchasingQuotes.findOneAsync({ _id: { $eq: _id } });
  if (!doc) throw purchasingError('NOT_FOUND', 'Quote not found.');
  return doc;
}

const optionalFields = ['requisitionId', 'reference', 'validUntil', 'notes'] as const;

export async function createQuote(values: QuoteValues, user: ActingUser) {
  const data = await normalize(values);
  return runInTransaction(async () => {
    const now = new Date();
    const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)) as typeof data;
    const _id = await PurchasingQuotes.insertAsync({
      ...clean,
      status: QuoteStatus.RECEIVED,
      version: 1,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });
    await audit(EntityType.PURCHASING_QUOTE, _id, OperationType.CREATE, { vendorId: data.vendorId, total: data.total }, user);
    return getQuote(_id);
  });
}

/** Only a quote that has been neither selected nor rejected can be edited. */
export async function updateQuote(_id: string, version: number, values: QuoteValues, user: ActingUser) {
  const data = await normalize(values);
  return runInTransaction(async () => {
    const existing = await getQuote(_id);
    if (existing.status !== QuoteStatus.RECEIVED) {
      throw purchasingError('CONFLICT', 'Only a quote that is still open can be edited.');
    }
    const set: Record<string, unknown> = {
      vendorId: data.vendorId,
      quoteDate: data.quoteDate,
      lines: data.lines,
      total: data.total,
    };
    const unset: string[] = [];
    optionalFields.forEach((field) => {
      if (data[field] !== undefined) set[field] = data[field];
      else unset.push(field);
    });
    await updateIfUnchanged(PurchasingQuotes, _id, version, set, user, unset);
    await audit(EntityType.PURCHASING_QUOTE, _id, OperationType.UPDATE, { vendorId: data.vendorId, total: data.total }, user, existing);
    return getQuote(_id);
  });
}

/**
 * Picks a quote. The other open quotes for the same requisition are
 * rejected, so exactly one quote wins.
 */
export async function selectQuote(_id: string, user: ActingUser) {
  return runInTransaction(async () => {
    const existing = await getQuote(_id);
    if (existing.status !== QuoteStatus.RECEIVED) {
      throw purchasingError('CONFLICT', 'Only an open quote can be selected.');
    }
    const now = new Date();
    if (existing.requisitionId) {
      const others = await PurchasingQuotes.find({
        requisitionId: { $eq: existing.requisitionId },
        _id: { $ne: _id },
        status: QuoteStatus.RECEIVED,
      }).fetchAsync();
      for (const other of others) {
        await PurchasingQuotes.updateAsync(
          { _id: { $eq: other._id }, status: QuoteStatus.RECEIVED },
          { $set: { status: QuoteStatus.REJECTED, updatedAt: now, updatedBy: user._id }, $inc: { version: 1 } }
        );
        await audit(EntityType.PURCHASING_QUOTE, other._id, OperationType.UPDATE, { status: QuoteStatus.REJECTED }, user, other);
      }
    }
    const changed = await PurchasingQuotes.updateAsync(
      { _id: { $eq: _id }, status: QuoteStatus.RECEIVED },
      { $set: { status: QuoteStatus.SELECTED, updatedAt: now, updatedBy: user._id }, $inc: { version: 1 } }
    );
    if (!changed) throw purchasingError('CONFLICT', 'This quote was changed by someone else. Reload and try again.');
    await audit(EntityType.PURCHASING_QUOTE, _id, OperationType.UPDATE, { status: QuoteStatus.SELECTED }, user, existing);
    return getQuote(_id);
  });
}

/** Rejects an open quote. */
export async function rejectQuote(_id: string, user: ActingUser) {
  return runInTransaction(async () => {
    const existing = await getQuote(_id);
    const changed = await PurchasingQuotes.updateAsync(
      { _id: { $eq: _id }, status: QuoteStatus.RECEIVED },
      { $set: { status: QuoteStatus.REJECTED, updatedAt: new Date(), updatedBy: user._id }, $inc: { version: 1 } }
    );
    if (!changed) throw purchasingError('CONFLICT', 'Only an open quote can be rejected.');
    await audit(EntityType.PURCHASING_QUOTE, _id, OperationType.UPDATE, { status: QuoteStatus.REJECTED }, user, existing);
    return getQuote(_id);
  });
}

/** A quote an order was made from can't be deleted. */
export async function deleteQuote(_id: string, user: ActingUser) {
  await runInTransaction(async () => {
    const existing = await getQuote(_id);
    if ((await PurchasingOrders.find({ quoteId: { $eq: _id } }).countAsync()) > 0) {
      throw purchasingError('CONFLICT', "An order was made from this quote, so it can't be deleted.");
    }
    await PurchasingQuotes.removeAsync({ _id: { $eq: _id } });
    await deleteOwnerAttachments('quote', _id);
    await audit(EntityType.PURCHASING_QUOTE, _id, OperationType.DELETE, { vendorId: existing.vendorId }, user);
  });
}

export async function listQuotes({
  search,
  status,
  vendorId,
  requisitionId,
  ...paging
}: ListQuotesOptions = {}): Promise<Page<PurchasingQuoteDocument>> {
  const selector: Record<string, unknown> = {};
  const text = search?.trim();
  if (text) selector.reference = new RegExp(escapeRegExp(text), 'i');
  if (status) selector.status = status;
  if (vendorId) selector.vendorId = vendorId;
  if (requisitionId) selector.requisitionId = requisitionId;
  const { skip, limit } = pageWindow(paging);
  const [totalResults, data] = await Promise.all([
    PurchasingQuotes.find(selector).countAsync(),
    PurchasingQuotes.find(selector, { sort: { quoteDate: -1, createdAt: -1 }, skip, limit }).fetchAsync(),
  ]);
  return { totalResults, data };
}
