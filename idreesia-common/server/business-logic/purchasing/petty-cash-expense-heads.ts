import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import {
  PurchasingPettyCashExpenseHeads,
  PurchasingPettyCashVouchers,
  type PurchasingPettyCashExpenseHeadDocument,
} from 'meteor/idreesia-common/server/collections/purchasing';
import { escapeRegExp } from 'meteor/idreesia-common/utilities/lodash';

import { purchasingError } from './errors';
import {
  EntityType,
  OperationType,
  audit,
  cleanText,
  pageWindow,
  requireText,
  updateIfUnchanged,
  type ActingUser,
  type Page,
  type PageOptions,
} from './internal';

export interface PettyCashExpenseHeadValues {
  name: string;
  description?: string | null;
}

export interface ListPettyCashExpenseHeadsOptions extends PageOptions {
  search?: string;
  isActive?: boolean;
}

export async function getPettyCashExpenseHead(
  _id: string
): Promise<PurchasingPettyCashExpenseHeadDocument> {
  const head = await PurchasingPettyCashExpenseHeads.findOneAsync({ _id: { $eq: _id } });
  if (!head) throw purchasingError('NOT_FOUND', 'Expense head not found.');
  return head;
}

/** An expense head a voucher may be booked to: it must exist and be active. */
export async function getUsablePettyCashExpenseHead(_id: string) {
  const head = await getPettyCashExpenseHead(_id);
  if (!head.isActive) {
    throw purchasingError('BAD_USER_INPUT', `The expense head "${head.name}" is not active.`);
  }
  return head;
}

function clean(values: PettyCashExpenseHeadValues) {
  return {
    name: requireText(values.name, 'The name'),
    description: cleanText(values.description),
  };
}

/** Names are unique ignoring case. */
async function assertNameFree(name: string, exceptId?: string) {
  const existing = await PurchasingPettyCashExpenseHeads.findOneAsync({
    name: new RegExp(`^${escapeRegExp(name)}$`, 'i'),
  });
  if (existing && existing._id !== exceptId) {
    throw purchasingError('CONFLICT', 'An expense head with this name already exists.');
  }
}

export async function createPettyCashExpenseHead(values: PettyCashExpenseHeadValues, user: ActingUser) {
  const { name, description } = clean(values);
  return runInTransaction(async () => {
    await assertNameFree(name);
    const now = new Date();
    const _id = await PurchasingPettyCashExpenseHeads.insertAsync({
      name,
      ...(description ? { description } : {}),
      isActive: true,
      version: 1,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    } as Omit<PurchasingPettyCashExpenseHeadDocument, '_id'>);
    await audit(EntityType.PURCHASING_PETTY_CASH_EXPENSE_HEAD, _id, OperationType.CREATE, { name }, user);
    return getPettyCashExpenseHead(_id);
  });
}

export async function updatePettyCashExpenseHead(
  _id: string,
  values: PettyCashExpenseHeadValues,
  user: ActingUser
) {
  const { name, description } = clean(values);
  return runInTransaction(async () => {
    const head = await getPettyCashExpenseHead(_id);
    await assertNameFree(name, _id);
    await updateIfUnchanged(
      PurchasingPettyCashExpenseHeads,
      _id,
      head.version,
      { name, ...(description ? { description } : {}) },
      user,
      description ? [] : ['description']
    );
    await audit(EntityType.PURCHASING_PETTY_CASH_EXPENSE_HEAD, _id, OperationType.UPDATE, { name, description }, user, head);
    return getPettyCashExpenseHead(_id);
  });
}

export async function setPettyCashExpenseHeadActive(_id: string, isActive: boolean, user: ActingUser) {
  return runInTransaction(async () => {
    const head = await getPettyCashExpenseHead(_id);
    await updateIfUnchanged(PurchasingPettyCashExpenseHeads, _id, head.version, { isActive }, user);
    await audit(EntityType.PURCHASING_PETTY_CASH_EXPENSE_HEAD, _id, OperationType.UPDATE, { isActive }, user, head);
    return getPettyCashExpenseHead(_id);
  });
}

/** A head that vouchers were booked to can only be deactivated. */
export async function deletePettyCashExpenseHead(_id: string, user: ActingUser) {
  return runInTransaction(async () => {
    const head = await getPettyCashExpenseHead(_id);
    if ((await PurchasingPettyCashVouchers.find({ expenseHeadId: _id }).countAsync()) > 0) {
      throw purchasingError('CONFLICT', 'Vouchers are booked to this expense head. Deactivate it instead.');
    }
    await PurchasingPettyCashExpenseHeads.removeAsync({ _id: { $eq: _id } });
    await audit(EntityType.PURCHASING_PETTY_CASH_EXPENSE_HEAD, _id, OperationType.DELETE, { name: head.name }, user, head);
    return true;
  });
}

export async function listPettyCashExpenseHeads({
  search,
  isActive,
  ...paging
}: ListPettyCashExpenseHeadsOptions = {}): Promise<Page<PurchasingPettyCashExpenseHeadDocument>> {
  const selector: Record<string, unknown> = {};
  const text = search?.trim();
  if (text) selector.name = new RegExp(escapeRegExp(text), 'i');
  if (isActive !== undefined) selector.isActive = isActive;
  const { skip, limit } = pageWindow(paging);
  const [totalResults, data] = await Promise.all([
    PurchasingPettyCashExpenseHeads.find(selector).countAsync(),
    PurchasingPettyCashExpenseHeads.find(selector, { sort: { name: 1 }, skip, limit }).fetchAsync(),
  ]);
  return { totalResults, data };
}
