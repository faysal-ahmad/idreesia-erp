import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  PurchasingPettyCashFunds,
  type PurchasingPettyCashFundDocument,
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
  roundMoney,
  updateIfUnchanged,
  type ActingUser,
  type Page,
  type PageOptions,
} from './internal';

export interface PettyCashFundValues {
  name: string;
  custodianPersonId: string;
  floatAmount: number;
  perTransactionLimit?: number | null;
  notes?: string | null;
}

export interface ListPettyCashFundsOptions extends PageOptions {
  search?: string;
  isActive?: boolean;
  custodianPersonId?: string;
}

export async function getPettyCashFund(_id: string): Promise<PurchasingPettyCashFundDocument> {
  const fund = await PurchasingPettyCashFunds.findOneAsync({ _id: { $eq: _id } });
  if (!fund) throw purchasingError('NOT_FOUND', 'Petty cash fund not found.');
  return fund;
}

async function clean(values: PettyCashFundValues) {
  const name = requireText(values.name, 'The name');
  if (!Number.isFinite(values.floatAmount) || values.floatAmount <= 0) {
    throw purchasingError('BAD_USER_INPUT', 'The float must be more than zero.');
  }
  const limit = values.perTransactionLimit;
  if (limit != null && (!Number.isFinite(limit) || limit <= 0)) {
    throw purchasingError('BAD_USER_INPUT', 'The per-transaction limit must be more than zero.');
  }
  const custodianPersonId = cleanText(values.custodianPersonId);
  if (!custodianPersonId || !(await People.findOneAsync({ _id: { $eq: custodianPersonId } }))) {
    throw purchasingError('BAD_USER_INPUT', 'Choose the person who holds the cash.');
  }
  return {
    name,
    custodianPersonId,
    floatAmount: roundMoney(values.floatAmount),
    notes: cleanText(values.notes),
    ...(limit != null ? { perTransactionLimit: roundMoney(limit) } : {}),
  };
}

/** Opens a fund. The custodian is handed the whole float, so the balance starts there. */
export async function createPettyCashFund(values: PettyCashFundValues, user: ActingUser) {
  const fields = await clean(values);
  return runInTransaction(async () => {
    const now = new Date();
    const _id = await PurchasingPettyCashFunds.insertAsync({
      ...Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined)),
      balance: fields.floatAmount,
      isActive: true,
      version: 1,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    } as Omit<PurchasingPettyCashFundDocument, '_id'>);
    await audit(EntityType.PURCHASING_PETTY_CASH_FUND, _id, OperationType.CREATE, { name: fields.name }, user);
    return getPettyCashFund(_id);
  });
}

export async function updatePettyCashFund(_id: string, values: PettyCashFundValues, user: ActingUser) {
  const fields = await clean(values);
  return runInTransaction(async () => {
    const fund = await getPettyCashFund(_id);
    const { perTransactionLimit, notes, ...rest } = fields;
    const unset = [
      ...(perTransactionLimit === undefined ? ['perTransactionLimit'] : []),
      ...(notes === undefined ? ['notes'] : []),
    ];
    await updateIfUnchanged(
      PurchasingPettyCashFunds,
      _id,
      fund.version,
      {
        ...rest,
        ...(perTransactionLimit !== undefined ? { perTransactionLimit } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
      user,
      unset
    );
    await audit(EntityType.PURCHASING_PETTY_CASH_FUND, _id, OperationType.UPDATE, fields, user, fund);
    return getPettyCashFund(_id);
  });
}

export async function setPettyCashFundActive(_id: string, isActive: boolean, user: ActingUser) {
  return runInTransaction(async () => {
    const fund = await getPettyCashFund(_id);
    await updateIfUnchanged(PurchasingPettyCashFunds, _id, fund.version, { isActive }, user);
    await audit(EntityType.PURCHASING_PETTY_CASH_FUND, _id, OperationType.UPDATE, { isActive }, user, fund);
    return getPettyCashFund(_id);
  });
}

export async function listPettyCashFunds({
  search,
  isActive,
  custodianPersonId,
  ...paging
}: ListPettyCashFundsOptions = {}): Promise<Page<PurchasingPettyCashFundDocument>> {
  const selector: Record<string, unknown> = {};
  const text = search?.trim();
  if (text) selector.name = new RegExp(escapeRegExp(text), 'i');
  if (isActive !== undefined) selector.isActive = isActive;
  if (custodianPersonId) selector.custodianPersonId = custodianPersonId;
  const { skip, limit } = pageWindow(paging);
  const [totalResults, data] = await Promise.all([
    PurchasingPettyCashFunds.find(selector).countAsync(),
    PurchasingPettyCashFunds.find(selector, { sort: { name: 1 }, skip, limit }).fetchAsync(),
  ]);
  return { totalResults, data };
}
