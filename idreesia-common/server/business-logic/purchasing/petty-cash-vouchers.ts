import { Random } from 'meteor/random';

import {
  AttachmentOwnerType,
  NumberedDocument,
  PettyCashVoucherStatus,
  type PettyCashVoucherStatusValue,
} from 'meteor/idreesia-common/constants/purchasing';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { StockItems } from 'meteor/idreesia-common/server/collections/inventory';
import {
  PurchasingPettyCashFunds,
  PurchasingPettyCashVouchers,
  type PettyCashVoucherLine,
  type PurchasingPettyCashVoucherDocument,
} from 'meteor/idreesia-common/server/collections/purchasing';
import { escapeRegExp } from 'meteor/idreesia-common/utilities/lodash';

import {
  applyStockMovements,
  revertStockMovements,
  type StockMovement,
} from 'meteor/idreesia-common/server/business-logic/inventory/stock-levels';

import { purchasingError } from './errors';
import {
  EntityType,
  OperationType,
  assertLineCount,
  audit,
  cleanText,
  moveStatus,
  pageWindow,
  requireText,
  roundMoney,
  roundQuantity,
  updateIfUnchanged,
  type ActingUser,
  type Page,
  type PageOptions,
} from './internal';
import { nextDocumentNumber } from './numbering';
import { getUsablePettyCashExpenseHead } from './petty-cash-expense-heads';
import { getPettyCashFund } from './petty-cash-funds';
import { deleteOwnerAttachments } from './attachments';
import { getUsableVendor } from './vendors';

export interface PettyCashVoucherLineInput {
  _id?: string | null;
  description: string;
  unit?: string | null;
  quantity: number;
  unitPrice: number;
  physicalStoreId?: string | null;
  externalCatalogId?: string | null;
}

export interface PettyCashVoucherValues {
  fundId: string;
  expenseHeadId: string;
  voucherDate: Date;
  payee?: string | null;
  vendorId?: string | null;
  purpose?: string | null;
  lines: PettyCashVoucherLineInput[];
}

export interface ListPettyCashVouchersOptions extends PageOptions {
  search?: string;
  status?: PettyCashVoucherStatusValue;
  fundId?: string;
  expenseHeadId?: string;
  /** Only the vouchers a replenishment bundles. */
  replenishmentId?: string;
  /** Approved vouchers a replenishment has not picked up yet. */
  unreplenishedOnly?: boolean;
}

export async function getPettyCashVoucher(_id: string): Promise<PurchasingPettyCashVoucherDocument> {
  const doc = await PurchasingPettyCashVouchers.findOneAsync({ _id: { $eq: _id } });
  if (!doc) throw purchasingError('NOT_FOUND', 'Petty cash voucher not found.');
  return doc;
}

/** The part of a voucher an author controls, checked and priced. */
async function normalize(values: PettyCashVoucherValues) {
  assertLineCount(values.lines);
  const lines: PettyCashVoucherLine[] = values.lines.map((input, i) => {
    const where = `Line ${i + 1}`;
    if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
      throw purchasingError('BAD_USER_INPUT', `${where}: the quantity must be more than zero.`);
    }
    if (!Number.isFinite(input.unitPrice) || input.unitPrice < 0) {
      throw purchasingError('BAD_USER_INPUT', `${where}: the price must not be negative.`);
    }
    const physicalStoreId = cleanText(input.physicalStoreId);
    const externalCatalogId = cleanText(input.externalCatalogId);
    if (!!physicalStoreId !== !!externalCatalogId) {
      throw purchasingError('BAD_USER_INPUT', `${where}: choose both the store and the item, or neither.`);
    }
    const quantity = roundQuantity(input.quantity);
    const unitPrice = roundMoney(input.unitPrice);
    return {
      _id: cleanText(input._id) ?? Random.id(),
      description: requireText(input.description, `${where}: description`),
      unit: requireText(input.unit ?? 'each', `${where}: unit`, 50),
      quantity,
      unitPrice,
      amount: roundMoney(quantity * unitPrice),
      ...(physicalStoreId && externalCatalogId ? { physicalStoreId, externalCatalogId } : {}),
    };
  });
  const total = roundMoney(lines.reduce((sum, l) => sum + l.amount, 0));
  if (total <= 0) throw purchasingError('BAD_USER_INPUT', 'The voucher total must be more than zero.');

  const vendorId = cleanText(values.vendorId);
  if (vendorId) await getUsableVendor(vendorId);
  const optional = {
    payee: cleanText(values.payee),
    purpose: cleanText(values.purpose),
    ...(vendorId ? { vendorId } : {}),
  };
  return {
    lines,
    total,
    fields: Object.fromEntries(Object.entries(optional).filter(([, v]) => v !== undefined)),
  };
}

/** Every stock line must name an item that is one of its store's own. */
async function assertStockItemsBelong(lines: PettyCashVoucherLine[]) {
  const pairs = new Map<string, Set<string>>();
  lines.forEach((l) => {
    if (!l.physicalStoreId || !l.externalCatalogId) return;
    if (!pairs.has(l.physicalStoreId)) pairs.set(l.physicalStoreId, new Set());
    pairs.get(l.physicalStoreId)?.add(l.externalCatalogId);
  });
  for (const [physicalStoreId, ids] of pairs) {
    const found = await StockItems.find({
      _id: { $in: [...ids] },
      physicalStoreId: { $eq: physicalStoreId },
    }).countAsync();
    if (found !== ids.size) {
      throw purchasingError('BAD_USER_INPUT', 'A line names an item that is not one of the store\'s items.');
    }
  }
}

/** What an approved voucher adds to (or, voided, takes from) store stock. */
function stockMovementsOf(lines: PettyCashVoucherLine[]): StockMovement[] {
  return lines
    .filter((l) => l.externalCatalogId)
    .map((l) => ({ stockItemId: l.externalCatalogId as string, quantity: l.quantity, isInflow: true }));
}

function assertWithinLimit(total: number, limit?: number) {
  if (limit !== undefined && total > limit) {
    throw purchasingError('BAD_USER_INPUT', `This voucher is over the fund's limit of ${limit} per transaction.`);
  }
}

export async function createPettyCashVoucher(values: PettyCashVoucherValues, user: ActingUser) {
  const { lines, total, fields } = await normalize(values);
  return runInTransaction(async () => {
    const fund = await getPettyCashFund(values.fundId);
    if (!fund.isActive) throw purchasingError('CONFLICT', 'This fund is not active.');
    const head = await getUsablePettyCashExpenseHead(values.expenseHeadId);
    await assertStockItemsBelong(lines);
    const now = new Date();
    const number = await nextDocumentNumber(NumberedDocument.PETTY_CASH_VOUCHER, values.voucherDate);
    const _id = await PurchasingPettyCashVouchers.insertAsync({
      number,
      fundId: fund._id,
      expenseHeadId: head._id,
      voucherDate: values.voucherDate,
      ...fields,
      lines,
      total,
      status: PettyCashVoucherStatus.DRAFT,
      version: 1,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    } as Omit<PurchasingPettyCashVoucherDocument, '_id'>);
    await audit(EntityType.PURCHASING_PETTY_CASH_VOUCHER, _id, OperationType.CREATE, { number, total }, user);
    return getPettyCashVoucher(_id);
  });
}

/** Drafts and rejected vouchers can be changed; the fund stays the same. */
export async function updatePettyCashVoucher(
  _id: string,
  values: Omit<PettyCashVoucherValues, 'fundId'>,
  user: ActingUser
) {
  const existing = await getPettyCashVoucher(_id);
  const { lines, total, fields } = await normalize({ ...values, fundId: existing.fundId });
  return runInTransaction(async () => {
    const voucher = await getPettyCashVoucher(_id);
    if (![PettyCashVoucherStatus.DRAFT, PettyCashVoucherStatus.REJECTED].includes(voucher.status as never)) {
      throw purchasingError('CONFLICT', 'Only a draft or rejected voucher can be edited.');
    }
    // Keeping the head the voucher already has is fine even if it was deactivated since.
    if (values.expenseHeadId !== voucher.expenseHeadId) {
      await getUsablePettyCashExpenseHead(values.expenseHeadId);
    }
    await assertStockItemsBelong(lines);
    const unset = ['payee', 'purpose', 'vendorId'].filter((k) => !(k in fields) || fields[k] === undefined);
    await updateIfUnchanged(
      PurchasingPettyCashVouchers,
      _id,
      voucher.version,
      {
        expenseHeadId: values.expenseHeadId,
        voucherDate: values.voucherDate,
        ...Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined)),
        lines,
        total,
        status: PettyCashVoucherStatus.DRAFT,
      },
      user,
      unset
    );
    await audit(EntityType.PURCHASING_PETTY_CASH_VOUCHER, _id, OperationType.UPDATE, { total }, user, voucher);
    return getPettyCashVoucher(_id);
  });
}

export async function submitPettyCashVoucher(_id: string, user: ActingUser) {
  return runInTransaction(async () => {
    const voucher = await getPettyCashVoucher(_id);
    const fund = await getPettyCashFund(voucher.fundId);
    if (!fund.isActive) throw purchasingError('CONFLICT', 'This fund is not active.');
    assertWithinLimit(voucher.total, fund.perTransactionLimit);
    await moveStatus(
      PurchasingPettyCashVouchers,
      _id,
      [PettyCashVoucherStatus.DRAFT],
      { status: PettyCashVoucherStatus.SUBMITTED, submittedAt: new Date(), submittedBy: user._id },
      user,
      'This voucher'
    );
    await audit(EntityType.PURCHASING_PETTY_CASH_VOUCHER, _id, OperationType.UPDATE, { status: PettyCashVoucherStatus.SUBMITTED }, user, voucher);
    return getPettyCashVoucher(_id);
  });
}

/**
 * Approving is when the money is spent: the fund's cash goes down and any
 * stock lines are received into their stores, in one transaction. The fund
 * can't go below zero.
 */
export async function approvePettyCashVoucher(_id: string, user: ActingUser) {
  return runInTransaction(async () => {
    const voucher = await getPettyCashVoucher(_id);
    const fund = await getPettyCashFund(voucher.fundId);
    assertWithinLimit(voucher.total, fund.perTransactionLimit);
    await moveStatus(
      PurchasingPettyCashVouchers,
      _id,
      [PettyCashVoucherStatus.SUBMITTED],
      { status: PettyCashVoucherStatus.APPROVED, approvedAt: new Date(), approvedBy: user._id },
      user,
      'This voucher'
    );
    const spent = await PurchasingPettyCashFunds.updateAsync(
      { _id: { $eq: fund._id }, balance: { $gte: voucher.total } },
      { $inc: { balance: -voucher.total }, $set: { updatedAt: new Date(), updatedBy: user._id } }
    );
    if (!spent) {
      throw purchasingError('CONFLICT', `The fund only holds ${fund.balance}, which is not enough for this voucher.`);
    }
    await assertStockItemsBelong(voucher.lines);
    await applyStockMovements(stockMovementsOf(voucher.lines));
    await audit(EntityType.PURCHASING_PETTY_CASH_VOUCHER, _id, OperationType.UPDATE, { status: PettyCashVoucherStatus.APPROVED }, user, voucher);
    return getPettyCashVoucher(_id);
  });
}

export async function rejectPettyCashVoucher(_id: string, reason: string, user: ActingUser) {
  const rejectionReason = requireText(reason, 'A reason', 1000);
  return runInTransaction(async () => {
    const voucher = await getPettyCashVoucher(_id);
    await moveStatus(
      PurchasingPettyCashVouchers,
      _id,
      [PettyCashVoucherStatus.SUBMITTED],
      { status: PettyCashVoucherStatus.REJECTED, rejectedAt: new Date(), rejectedBy: user._id, rejectionReason },
      user,
      'This voucher'
    );
    await audit(EntityType.PURCHASING_PETTY_CASH_VOUCHER, _id, OperationType.UPDATE, { status: PettyCashVoucherStatus.REJECTED, rejectionReason }, user, voucher);
    return getPettyCashVoucher(_id);
  });
}

/**
 * Cancels an approved voucher: the cash goes back into the fund and stock
 * lines come back out of their stores. Not possible once a replenishment
 * has picked the voucher up, or when its goods were already issued.
 */
export async function voidPettyCashVoucher(_id: string, reason: string, user: ActingUser) {
  const voidReason = requireText(reason, 'A reason', 1000);
  return runInTransaction(async () => {
    const voucher = await getPettyCashVoucher(_id);
    if (voucher.status !== PettyCashVoucherStatus.APPROVED) {
      throw purchasingError('CONFLICT', 'Only an approved voucher can be voided.');
    }
    if (voucher.replenishmentId) {
      throw purchasingError('CONFLICT', 'This voucher is part of a replenishment, so it can no longer be voided.');
    }

    const movements = stockMovementsOf(voucher.lines);
    const perItem = new Map<string, number>();
    movements.forEach(({ stockItemId, quantity }) =>
      perItem.set(stockItemId, (perItem.get(stockItemId) ?? 0) + quantity)
    );
    for (const [stockItemId, quantity] of perItem) {
      const item = await StockItems.findOneAsync({ _id: { $eq: stockItemId } });
      const line = voucher.lines.find((l) => l.externalCatalogId === stockItemId);
      if (!item || (item.currentStockLevel ?? 0) < quantity) {
        throw purchasingError(
          'CONFLICT',
          `"${line?.description ?? 'An item'}" has already been issued from the store, so this voucher can no longer be voided.`
        );
      }
    }
    await revertStockMovements(movements);
    await PurchasingPettyCashFunds.updateAsync(
      { _id: { $eq: voucher.fundId } },
      { $inc: { balance: voucher.total }, $set: { updatedAt: new Date(), updatedBy: user._id } }
    );
    await moveStatus(
      PurchasingPettyCashVouchers,
      _id,
      [PettyCashVoucherStatus.APPROVED],
      { status: PettyCashVoucherStatus.VOIDED, voidedAt: new Date(), voidedBy: user._id, voidReason },
      user,
      'This voucher'
    );
    await audit(EntityType.PURCHASING_PETTY_CASH_VOUCHER, _id, OperationType.UPDATE, { status: PettyCashVoucherStatus.VOIDED, voidReason }, user, voucher);
    return getPettyCashVoucher(_id);
  });
}

export async function deletePettyCashVoucher(_id: string, user: ActingUser) {
  return runInTransaction(async () => {
    const voucher = await getPettyCashVoucher(_id);
    if (voucher.status !== PettyCashVoucherStatus.DRAFT) {
      throw purchasingError('CONFLICT', 'Only a draft voucher can be deleted.');
    }
    await PurchasingPettyCashVouchers.removeAsync({ _id: { $eq: _id }, status: PettyCashVoucherStatus.DRAFT });
    await deleteOwnerAttachments(AttachmentOwnerType.PETTY_CASH_VOUCHER, _id);
    await audit(EntityType.PURCHASING_PETTY_CASH_VOUCHER, _id, OperationType.DELETE, { number: voucher.number }, user, voucher);
    return true;
  });
}

export async function listPettyCashVouchers({
  search,
  status,
  fundId,
  expenseHeadId,
  replenishmentId,
  unreplenishedOnly,
  ...paging
}: ListPettyCashVouchersOptions = {}): Promise<Page<PurchasingPettyCashVoucherDocument>> {
  const selector: Record<string, unknown> = {};
  const text = search?.trim();
  if (text) {
    const regex = new RegExp(escapeRegExp(text), 'i');
    selector.$or = [{ number: regex }, { payee: regex }, { purpose: regex }];
  }
  if (status) selector.status = status;
  if (fundId) selector.fundId = fundId;
  if (expenseHeadId) selector.expenseHeadId = expenseHeadId;
  if (replenishmentId) selector.replenishmentId = replenishmentId;
  if (unreplenishedOnly) {
    selector.status = PettyCashVoucherStatus.APPROVED;
    selector.replenishmentId = { $exists: false };
  }
  const { skip, limit } = pageWindow(paging);
  const [totalResults, data] = await Promise.all([
    PurchasingPettyCashVouchers.find(selector).countAsync(),
    PurchasingPettyCashVouchers.find(selector, { sort: { voucherDate: -1, createdAt: -1 }, skip, limit }).fetchAsync(),
  ]);
  return { totalResults, data };
}
