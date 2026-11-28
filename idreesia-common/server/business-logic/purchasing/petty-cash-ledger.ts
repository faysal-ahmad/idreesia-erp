import {
  PettyCashReplenishmentStatus,
  PettyCashVoucherStatus,
} from 'meteor/idreesia-common/constants/purchasing';
import {
  PurchasingPettyCashExpenseHeads,
  PurchasingPettyCashReplenishments,
  PurchasingPettyCashVouchers,
} from 'meteor/idreesia-common/server/collections/purchasing';

import { roundMoney } from './internal';
import { getPettyCashFund } from './petty-cash-funds';
import type { DateRange } from './reports';

export interface PettyCashLedgerHead {
  _id: string;
  name: string;
  /** What the period's vouchers spent under this head. */
  total: number;
}

export interface PettyCashLedger {
  /** What the fund held when the period started: its float and everything before. */
  openingBalance: number;
  /** The approved replenishments in the period (debit: cash into the fund). */
  replenishmentTotal: number;
  /** The approved vouchers in the period (credit: cash out of the fund). */
  voucherTotal: number;
  closingBalance: number;
  heads: PettyCashLedgerHead[];
}

const sum = (values: number[]) => roundMoney(values.reduce((s, v) => s + v, 0));

/**
 * A fund's cash book for a period, in totals: what it held at the start, the
 * replenishments that came in, the vouchers spent (also split by expense
 * head) and what it held at the end. Voided vouchers put their cash back, so
 * they are left out. The heads are every active head plus any other head
 * spent against in the period.
 */
export async function pettyCashLedger(fundId: string, range: DateRange = {}): Promise<PettyCashLedger> {
  const fund = await getPettyCashFund(fundId);
  const [vouchers, replenishments] = await Promise.all([
    PurchasingPettyCashVouchers.find({
      fundId: { $eq: fund._id },
      status: PettyCashVoucherStatus.APPROVED,
    }).fetchAsync(),
    PurchasingPettyCashReplenishments.find({
      fundId: { $eq: fund._id },
      status: PettyCashReplenishmentStatus.APPROVED,
    }).fetchAsync(),
  ]);

  const { fromDate, toDate } = range;
  const before = (date: Date) => !!fromDate && date < fromDate;
  const within = (date: Date) => (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
  const replenishedOn = (r: (typeof replenishments)[number]) => r.approvedAt ?? r.createdAt ?? new Date(0);

  // The fund only moves through vouchers and replenishments, so what it held
  // when it was opened is today's balance with those taken back out.
  const openingFloat =
    fund.balance - sum(replenishments.map((r) => r.amount)) + sum(vouchers.map((v) => v.total));
  const openingBalance = roundMoney(
    openingFloat +
      sum(replenishments.filter((r) => before(replenishedOn(r))).map((r) => r.amount)) -
      sum(vouchers.filter((v) => before(v.voucherDate)).map((v) => v.total))
  );

  const periodVouchers = vouchers.filter((v) => within(v.voucherDate));
  const replenishmentTotal = sum(
    replenishments.filter((r) => within(replenishedOn(r))).map((r) => r.amount)
  );
  const voucherTotal = sum(periodVouchers.map((v) => v.total));

  const headTotals = new Map<string, number>();
  periodVouchers.forEach((v) =>
    headTotals.set(v.expenseHeadId, (headTotals.get(v.expenseHeadId) ?? 0) + v.total)
  );
  const heads = await PurchasingPettyCashExpenseHeads.find(
    { $or: [{ isActive: true }, { _id: { $in: [...headTotals.keys()] } }] },
    { sort: { name: 1 } }
  ).fetchAsync();

  return {
    openingBalance,
    replenishmentTotal,
    voucherTotal,
    closingBalance: roundMoney(openingBalance + replenishmentTotal - voucherTotal),
    heads: heads.map((h) => ({ _id: h._id, name: h.name, total: roundMoney(headTotals.get(h._id) ?? 0) })),
  };
}
