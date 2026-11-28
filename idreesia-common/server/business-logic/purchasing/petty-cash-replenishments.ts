import {
  NumberedDocument,
  PettyCashReplenishmentStatus,
  PettyCashVoucherStatus,
  type PettyCashReplenishmentStatusValue,
} from 'meteor/idreesia-common/constants/purchasing';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import {
  PurchasingPettyCashFunds,
  PurchasingPettyCashReplenishments,
  PurchasingPettyCashVouchers,
  type PurchasingPettyCashReplenishmentDocument,
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
import { nextDocumentNumber } from './numbering';
import { getPettyCashFund } from './petty-cash-funds';

export interface PettyCashReplenishmentValues {
  fundId: string;
  /** The approved vouchers to bundle. Blank means every one not yet replenished. */
  voucherIds?: string[] | null;
  countedCash?: number | null;
  notes?: string | null;
}

export interface ListPettyCashReplenishmentsOptions extends PageOptions {
  search?: string;
  status?: PettyCashReplenishmentStatusValue;
  fundId?: string;
}

export async function getPettyCashReplenishment(
  _id: string
): Promise<PurchasingPettyCashReplenishmentDocument> {
  const doc = await PurchasingPettyCashReplenishments.findOneAsync({ _id: { $eq: _id } });
  if (!doc) throw purchasingError('NOT_FOUND', 'Replenishment not found.');
  return doc;
}

/**
 * Asks finance to top the fund back up for the vouchers already spent. The
 * vouchers are reserved for the request, so no two requests share one. If the
 * custodian counted the cash, the difference from the books is recorded.
 */
export async function requestPettyCashReplenishment(
  values: PettyCashReplenishmentValues,
  user: ActingUser
) {
  const countedCash = values.countedCash ?? undefined;
  if (countedCash !== undefined && (!Number.isFinite(countedCash) || countedCash < 0)) {
    throw purchasingError('BAD_USER_INPUT', 'The counted cash must not be negative.');
  }
  return runInTransaction(async () => {
    const fund = await getPettyCashFund(values.fundId);
    const selector: Record<string, unknown> = {
      fundId: fund._id,
      status: PettyCashVoucherStatus.APPROVED,
      replenishmentId: { $exists: false },
    };
    if (values.voucherIds?.length) selector._id = { $in: values.voucherIds };
    const vouchers = await PurchasingPettyCashVouchers.find(selector).fetchAsync();
    if (vouchers.length === 0 || (values.voucherIds?.length && vouchers.length !== values.voucherIds.length)) {
      throw purchasingError('BAD_USER_INPUT', 'Choose approved vouchers of this fund that are not in a replenishment yet.');
    }
    const amount = roundMoney(vouchers.reduce((sum, v) => sum + v.total, 0));
    const now = new Date();
    const number = await nextDocumentNumber(NumberedDocument.PETTY_CASH_REPLENISHMENT, now);
    const notes = cleanText(values.notes);
    const _id = await PurchasingPettyCashReplenishments.insertAsync({
      number,
      fundId: fund._id,
      voucherIds: vouchers.map((v) => v._id),
      amount,
      ...(countedCash !== undefined
        ? { countedCash: roundMoney(countedCash), variance: roundMoney(countedCash - fund.balance) }
        : {}),
      ...(notes ? { notes } : {}),
      status: PettyCashReplenishmentStatus.SUBMITTED,
      version: 1,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    } as Omit<PurchasingPettyCashReplenishmentDocument, '_id'>);

    // Reserve the vouchers; a concurrent request that took one makes this fail.
    const reserved = await PurchasingPettyCashVouchers.updateAsync(
      { _id: { $in: vouchers.map((v) => v._id) }, replenishmentId: { $exists: false } },
      { $set: { replenishmentId: _id } },
      { multi: true }
    );
    if (reserved !== vouchers.length) {
      throw purchasingError('CONFLICT', 'A voucher was picked up by another replenishment. Reload and try again.');
    }
    await audit(EntityType.PURCHASING_PETTY_CASH_REPLENISHMENT, _id, OperationType.CREATE, { number, amount }, user);
    return getPettyCashReplenishment(_id);
  });
}

/** Approving puts the cash back into the fund. */
export async function approvePettyCashReplenishment(_id: string, user: ActingUser) {
  return runInTransaction(async () => {
    const replenishment = await getPettyCashReplenishment(_id);
    await moveStatus(
      PurchasingPettyCashReplenishments,
      _id,
      [PettyCashReplenishmentStatus.SUBMITTED],
      { status: PettyCashReplenishmentStatus.APPROVED, approvedAt: new Date(), approvedBy: user._id },
      user,
      'This replenishment'
    );
    await PurchasingPettyCashFunds.updateAsync(
      { _id: { $eq: replenishment.fundId } },
      { $inc: { balance: replenishment.amount }, $set: { updatedAt: new Date(), updatedBy: user._id } }
    );
    await audit(EntityType.PURCHASING_PETTY_CASH_REPLENISHMENT, _id, OperationType.UPDATE, { status: PettyCashReplenishmentStatus.APPROVED }, user, replenishment);
    return getPettyCashReplenishment(_id);
  });
}

/** Rejecting frees the vouchers to be bundled again. */
export async function rejectPettyCashReplenishment(_id: string, reason: string, user: ActingUser) {
  const rejectionReason = requireText(reason, 'A reason', 1000);
  return runInTransaction(async () => {
    const replenishment = await getPettyCashReplenishment(_id);
    await moveStatus(
      PurchasingPettyCashReplenishments,
      _id,
      [PettyCashReplenishmentStatus.SUBMITTED],
      { status: PettyCashReplenishmentStatus.REJECTED, rejectedAt: new Date(), rejectedBy: user._id, rejectionReason },
      user,
      'This replenishment'
    );
    await PurchasingPettyCashVouchers.updateAsync(
      { _id: { $in: replenishment.voucherIds }, replenishmentId: { $eq: _id } },
      { $unset: { replenishmentId: '' } },
      { multi: true }
    );
    await audit(EntityType.PURCHASING_PETTY_CASH_REPLENISHMENT, _id, OperationType.UPDATE, { status: PettyCashReplenishmentStatus.REJECTED, rejectionReason }, user, replenishment);
    return getPettyCashReplenishment(_id);
  });
}

export async function listPettyCashReplenishments({
  search,
  status,
  fundId,
  ...paging
}: ListPettyCashReplenishmentsOptions = {}): Promise<Page<PurchasingPettyCashReplenishmentDocument>> {
  const selector: Record<string, unknown> = {};
  const text = search?.trim();
  if (text) selector.number = new RegExp(escapeRegExp(text), 'i');
  if (status) selector.status = status;
  if (fundId) selector.fundId = fundId;
  const { skip, limit } = pageWindow(paging);
  const [totalResults, data] = await Promise.all([
    PurchasingPettyCashReplenishments.find(selector).countAsync(),
    PurchasingPettyCashReplenishments.find(selector, { sort: { createdAt: -1 }, skip, limit }).fetchAsync(),
  ]);
  return { totalResults, data };
}
