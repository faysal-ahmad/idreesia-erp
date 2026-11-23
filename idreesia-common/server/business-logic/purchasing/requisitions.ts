import { RequisitionStatus, NumberedDocument, type RequisitionStatusValue } from 'meteor/idreesia-common/constants/purchasing';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import {
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
  neededBy?: Date | null;
  lines: RequisitionLineInput[];
}

export interface ListRequisitionsOptions extends PageOptions {
  search?: string;
  status?: RequisitionStatusValue;
  requestedBy?: string;
}

const { DRAFT, SUBMITTED, APPROVED, REJECTED, ORDERED, CANCELLED } = RequisitionStatus;

async function normalize(values: RequisitionValues) {
  assertLineCount(values.lines);
  const lines: RequisitionLine[] = [];
  for (let i = 0; i < values.lines.length; i += 1) {
    const input = values.lines[i];
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
    neededBy: values.neededBy ?? undefined,
    lines,
    estimatedTotal,
  };
}

export async function getRequisition(_id: string): Promise<PurchasingRequisitionDocument> {
  const doc = await PurchasingRequisitions.findOneAsync({ _id: { $eq: _id } });
  if (!doc) throw purchasingError('NOT_FOUND', 'Requisition not found.');
  return doc;
}

const optionalFields = ['purpose', 'requestedBy', 'neededBy'] as const;

export async function createRequisition(
  values: RequisitionValues,
  user: ActingUser
): Promise<PurchasingRequisitionDocument> {
  const data = await normalize(values);
  return runInTransaction(async () => {
    const now = new Date();
    const number = await nextDocumentNumber(NumberedDocument.REQUISITION, now);
    const clean = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    ) as typeof data;
    const _id = await PurchasingRequisitions.insertAsync({
      ...clean,
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
  user: ActingUser
): Promise<PurchasingRequisitionDocument> {
  const data = await normalize(values);
  return runInTransaction(async () => {
    const existing = await getRequisition(_id);
    if (existing.status !== DRAFT) {
      throw purchasingError('CONFLICT', 'Only a draft requisition can be edited.');
    }
    const { purpose, requestedBy, neededBy, ...always } = data;
    const optional = { purpose, requestedBy, neededBy };
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

export async function submitRequisition(_id: string, user: ActingUser) {
  const existing = await getRequisition(_id);
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
export const reopenRequisition = (_id: string, user: ActingUser) =>
  transition(_id, [REJECTED], DRAFT, {}, user);

export const cancelRequisition = (_id: string, user: ActingUser) =>
  transition(_id, [DRAFT, SUBMITTED, APPROVED], CANCELLED, { cancelledAt: new Date(), cancelledBy: user._id }, user);

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

/** Only a draft that nothing refers to can be deleted. */
export async function deleteRequisition(_id: string, user: ActingUser) {
  await runInTransaction(async () => {
    const existing = await getRequisition(_id);
    if (existing.status !== DRAFT) {
      throw purchasingError('CONFLICT', 'Only a draft requisition can be deleted. Cancel it instead.');
    }
    await PurchasingRequisitions.removeAsync({ _id: { $eq: _id }, status: DRAFT });
    await deleteOwnerAttachments('requisition', _id);
    await audit(EntityType.PURCHASING_REQUISITION, _id, OperationType.DELETE, { number: existing.number }, user);
  });
}

export async function listRequisitions({
  search,
  status,
  requestedBy,
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
  const { skip, limit } = pageWindow(paging);
  const [totalResults, data] = await Promise.all([
    PurchasingRequisitions.find(selector).countAsync(),
    PurchasingRequisitions.find(selector, { sort: { createdAt: -1 }, skip, limit }).fetchAsync(),
  ]);
  return { totalResults, data };
}
