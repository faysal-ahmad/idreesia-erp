import {
  NumberedDocument,
  OrderStatus,
  RequisitionSource,
  RequisitionStatus,
  type RequisitionStatusValue,
} from 'meteor/idreesia-common/constants/purchasing';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { PhysicalStores, StockItems } from 'meteor/idreesia-common/server/collections/inventory';
import {
  PurchasingOrders,
  PurchasingRequisitions,
  type PurchasingRequisitionDocument,
  type RequisitionLine,
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
  requireText,
  roundMoney,
  updateIfUnchanged,
  type ActingUser,
  type LineInput,
  type Page,
  type PageOptions,
} from './internal';
import { nextDocumentNumber } from './numbering';

export interface RequisitionLineInput extends LineInput {
  estimatedUnitPrice?: number | null;
}

export interface RequisitionValues {
  title: string;
  purpose?: string | null;
  requestedBy?: string | null;
  requestedFor?: string | null;
  neededBy?: Date | null;
  lines: RequisitionLineInput[];
}

export interface ListRequisitionsOptions extends PageOptions {
  search?: string;
  status?: RequisitionStatusValue;
  requestedBy?: string;
  /** Only requisitions raised by purchasing, or only those raised by a store. */
  source?: 'purchasing' | 'store';
  /** Only the requisitions this store raised. */
  physicalStoreId?: string;
}

/**
 * Set when a store raises (or works on) a requisition. Purchasing passes no
 * origin. A store's requisitions only ever hold that store's stock items.
 */
export interface RequisitionOrigin {
  physicalStoreId: string;
}

const { DRAFT, SUBMITTED, APPROVED, REJECTED, ORDERED, CLOSED, CANCELLED } = RequisitionStatus;

/** A stock item's unit of measurement, as the text a line carries. */
const UNIT_TEXT: Record<string, string> = {
  quantity: 'unit',
  ft: 'ft',
  m: 'm',
  kg: 'kg',
  lbs: 'lbs',
  l: 'l',
};

/** A store line is always one of the store's own stock items, snapshotted. */
async function storeLineInput(input: RequisitionLineInput, position: number, origin: RequisitionOrigin) {
  const where = `Line ${position + 1}`;
  const stockItemId = cleanText(input.externalCatalogId);
  if (!stockItemId || cleanText(input.internalCatalogId)) {
    throw purchasingError('BAD_USER_INPUT', `${where}: pick one of the store's items.`);
  }
  const item = await StockItems.findOneAsync({
    _id: { $eq: stockItemId },
    physicalStoreId: { $eq: origin.physicalStoreId },
  });
  if (!item) {
    throw purchasingError('BAD_USER_INPUT', `${where}: item not found in this store.`);
  }
  return {
    ...input,
    externalCatalogId: stockItemId,
    description: [item.name, item.company].filter(Boolean).join(' - '),
    unit: UNIT_TEXT[item.unitOfMeasurement as string] ?? 'unit',
  } as RequisitionLineInput;
}

async function storeName(origin: RequisitionOrigin) {
  const store = await PhysicalStores.findOneAsync(
    { _id: { $eq: origin.physicalStoreId } },
    { fields: { name: 1 } }
  );
  return cleanText(store?.name as string | undefined);
}

async function normalize(values: RequisitionValues, origin?: RequisitionOrigin) {
  assertLineCount(values.lines);
  const lines: RequisitionLine[] = [];
  for (let i = 0; i < values.lines.length; i += 1) {
    let input = values.lines[i];
    if (origin) {
      input = await storeLineInput(input, i, origin);
    } else if (cleanText(input.externalCatalogId)) {
      throw purchasingError('BAD_USER_INPUT', `Line ${i + 1}: store items are only for store requisitions.`);
    }
    const base = await normalizeBaseLine(input, i);
    const price = input.estimatedUnitPrice;
    lines.push({
      ...base,
      ...(price != null
        ? { estimatedUnitPrice: roundMoney(requireNonNegative(price, `Line ${i + 1}: price`)) }
        : {}),
    });
  }
  const estimatedTotal = roundMoney(
    lines.reduce((sum, l) => sum + l.quantity * (l.estimatedUnitPrice ?? 0), 0)
  );
  return {
    title: requireText(values.title, 'The title'),
    purpose: cleanText(values.purpose),
    requestedBy: cleanText(values.requestedBy),
    // A store's requisition is always for that store; the store doesn't enter it.
    requestedFor: origin ? await storeName(origin) : cleanText(values.requestedFor),
    neededBy: values.neededBy ?? undefined,
    lines,
    estimatedTotal,
  };
}

/** Whether the requisition was raised by this store. */
const isOwnedBy = (doc: PurchasingRequisitionDocument, origin: RequisitionOrigin) =>
  doc.source === RequisitionSource.STORE && doc.externalSourceId === origin.physicalStoreId;

/** With an origin, only that store's own requisition is found. */
export async function getRequisition(
  _id: string,
  origin?: RequisitionOrigin
): Promise<PurchasingRequisitionDocument> {
  const doc = await PurchasingRequisitions.findOneAsync({ _id: { $eq: _id } });
  if (!doc || (origin && !isOwnedBy(doc, origin))) {
    throw purchasingError('NOT_FOUND', 'Requisition not found.');
  }
  return doc;
}

/**
 * Drafts are worked on only by whoever raised them: a store's draft by that
 * store, purchasing's own by purchasing.
 */
function assertDraftOwner(doc: PurchasingRequisitionDocument, origin?: RequisitionOrigin) {
  if (origin) {
    if (!isOwnedBy(doc, origin)) throw purchasingError('NOT_FOUND', 'Requisition not found.');
  } else if (doc.source === RequisitionSource.STORE) {
    throw purchasingError('CONFLICT', 'A store requisition can only be changed by the store that raised it.');
  }
}

const optionalFields = ['purpose', 'requestedBy', 'requestedFor', 'neededBy'] as const;

export async function createRequisition(
  values: RequisitionValues,
  user: ActingUser,
  origin?: RequisitionOrigin
): Promise<PurchasingRequisitionDocument> {
  const data = await normalize(values, origin);
  return runInTransaction(async () => {
    const now = new Date();
    const number = await nextDocumentNumber(NumberedDocument.REQUISITION, now);
    const clean = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    ) as typeof data;
    const _id = await PurchasingRequisitions.insertAsync({
      ...clean,
      ...(origin
        ? { source: RequisitionSource.STORE, externalSourceId: origin.physicalStoreId }
        : {}),
      number,
      status: DRAFT,
      version: 1,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });
    await audit(EntityType.PURCHASING_REQUISITION, _id, OperationType.CREATE, { number, title: data.title }, user);
    return getRequisition(_id);
  });
}

/** Only a draft can be edited. */
export async function updateRequisition(
  _id: string,
  version: number,
  values: RequisitionValues,
  user: ActingUser,
  origin?: RequisitionOrigin
): Promise<PurchasingRequisitionDocument> {
  return runInTransaction(async () => {
    const existing = await getRequisition(_id);
    assertDraftOwner(existing, origin);
    if (existing.status !== DRAFT) {
      throw purchasingError('CONFLICT', 'Only a draft requisition can be edited.');
    }
    const data = await normalize(values, origin);
    const { purpose, requestedBy, requestedFor, neededBy, ...always } = data;
    const optional = { purpose, requestedBy, requestedFor, neededBy };
    const set: Record<string, unknown> = { ...always };
    const unset: string[] = [];
    optionalFields.forEach((field) => {
      if (optional[field] !== undefined) set[field] = optional[field];
      else unset.push(field);
    });
    await updateIfUnchanged(PurchasingRequisitions, _id, version, set, user, unset);
    await audit(EntityType.PURCHASING_REQUISITION, _id, OperationType.UPDATE, { title: data.title, estimatedTotal: data.estimatedTotal }, user, existing);
    return getRequisition(_id);
  });
}

async function transition(
  _id: string,
  from: RequisitionStatusValue[],
  to: RequisitionStatusValue,
  fields: Record<string, unknown>,
  user: ActingUser
) {
  return runInTransaction(async () => {
    const existing = await getRequisition(_id);
    await moveStatus(PurchasingRequisitions, _id, from, { status: to, ...fields }, user, 'This requisition');
    await audit(EntityType.PURCHASING_REQUISITION, _id, OperationType.UPDATE, { status: to, ...(fields.rejectionReason ? { rejectionReason: fields.rejectionReason } : {}) }, user, existing);
    return getRequisition(_id);
  });
}

export async function submitRequisition(_id: string, user: ActingUser, origin?: RequisitionOrigin) {
  const existing = await getRequisition(_id);
  assertDraftOwner(existing, origin);
  if (existing.lines.length === 0) {
    throw purchasingError('BAD_USER_INPUT', 'Add at least one line before submitting.');
  }
  return transition(_id, [DRAFT], SUBMITTED, { submittedAt: new Date(), submittedBy: user._id }, user);
}

export const approveRequisition = (_id: string, user: ActingUser) =>
  transition(_id, [SUBMITTED], APPROVED, { approvedAt: new Date(), approvedBy: user._id }, user);

export async function rejectRequisition(_id: string, reason: string, user: ActingUser) {
  const rejectionReason = requireText(reason, 'A reason', 1000);
  return transition(
    _id,
    [SUBMITTED],
    REJECTED,
    { rejectedAt: new Date(), rejectedBy: user._id, rejectionReason },
    user
  );
}

/** A rejected requisition goes back to a draft so it can be fixed and resubmitted. */
export async function reopenRequisition(_id: string, user: ActingUser, origin?: RequisitionOrigin) {
  assertDraftOwner(await getRequisition(_id), origin);
  return transition(_id, [REJECTED], DRAFT, {}, user);
}

/** A store can only cancel its own requisitions; purchasing can cancel any. */
export async function cancelRequisition(_id: string, user: ActingUser, origin?: RequisitionOrigin) {
  if (origin) await getRequisition(_id, origin);
  return transition(_id, [DRAFT, SUBMITTED, APPROVED], CANCELLED, { cancelledAt: new Date(), cancelledBy: user._id }, user);
}

/** Called by the orders module when an order is made from, or released from, a requisition. */
export async function setRequisitionOrdered(_id: string, ordered: boolean, user: ActingUser) {
  const existing = await getRequisition(_id);
  await moveStatus(
    PurchasingRequisitions,
    _id,
    ordered ? [APPROVED] : [ORDERED],
    { status: ordered ? ORDERED : APPROVED },
    user,
    'This requisition'
  );
  await audit(EntityType.PURCHASING_REQUISITION, _id, OperationType.UPDATE, { status: ordered ? ORDERED : APPROVED }, user, existing);
}

/**
 * Keeps an ordered requisition's status in step with its orders: it closes
 * once it has orders and every order that isn't cancelled is received or
 * closed, and goes back to ordered when that stops being true. Called by the
 * orders and receipts modules inside their own transactions.
 */
export async function syncRequisitionClosure(_id: string, user: ActingUser) {
  const existing = await getRequisition(_id);
  if (existing.status !== ORDERED && existing.status !== CLOSED) return;
  const orders = await PurchasingOrders.find(
    { requisitionId: { $eq: _id }, status: { $ne: OrderStatus.CANCELLED } },
    { fields: { status: 1 } }
  ).fetchAsync();
  const done: string[] = [OrderStatus.RECEIVED, OrderStatus.CLOSED];
  const allDone = orders.length > 0 && orders.every((o) => done.includes(o.status));
  const target = allDone ? CLOSED : ORDERED;
  if (target === existing.status) return;
  await moveStatus(PurchasingRequisitions, _id, [existing.status], { status: target }, user, 'This requisition');
  await audit(EntityType.PURCHASING_REQUISITION, _id, OperationType.UPDATE, { status: target }, user, existing);
}

/** Purchasing can close an ordered requisition by hand, e.g. when the rest won't be bought. */
export const closeRequisition = (_id: string, user: ActingUser) =>
  transition(_id, [ORDERED], CLOSED, {}, user);

/** Only a draft that nothing refers to can be deleted. */
export async function deleteRequisition(_id: string, user: ActingUser, origin?: RequisitionOrigin) {
  await runInTransaction(async () => {
    const existing = await getRequisition(_id);
    assertDraftOwner(existing, origin);
    if (existing.status !== DRAFT) {
      throw purchasingError('CONFLICT', 'Only a draft requisition can be deleted. Cancel it instead.');
    }
    await PurchasingRequisitions.removeAsync({ _id: { $eq: _id }, status: DRAFT });
    await deleteOwnerAttachments('requisition', _id);
    await audit(EntityType.PURCHASING_REQUISITION, _id, OperationType.DELETE, { number: existing.number }, user);
  });
}

/** The Requested For values entered before, sorted, to suggest on the form. */
export async function listRequestedForValues(): Promise<string[]> {
  const values = (await PurchasingRequisitions.rawCollection().distinct('requestedFor')) as unknown[];
  return values
    .filter((value): value is string => typeof value === 'string' && value !== '')
    .sort((a, b) => a.localeCompare(b));
}

export async function listRequisitions({
  search,
  status,
  requestedBy,
  source,
  physicalStoreId,
  ...paging
}: ListRequisitionsOptions = {}): Promise<Page<PurchasingRequisitionDocument>> {
  const selector: Record<string, unknown> = {};
  const text = search?.trim();
  if (text) {
    const regex = new RegExp(escapeRegExp(text), 'i');
    selector.$or = [{ number: regex }, { title: regex }];
  }
  if (status) selector.status = status;
  if (requestedBy) selector.requestedBy = requestedBy;
  if (physicalStoreId) {
    selector.source = RequisitionSource.STORE;
    selector.externalSourceId = physicalStoreId;
  } else if (source === 'store') {
    selector.source = RequisitionSource.STORE;
  } else if (source === 'purchasing') {
    selector.source = { $exists: false };
  }
  const { skip, limit } = pageWindow(paging);
  const [totalResults, data] = await Promise.all([
    PurchasingRequisitions.find(selector).countAsync(),
    PurchasingRequisitions.find(selector, { sort: { createdAt: -1 }, skip, limit }).fetchAsync(),
  ]);
  return { totalResults, data };
}
