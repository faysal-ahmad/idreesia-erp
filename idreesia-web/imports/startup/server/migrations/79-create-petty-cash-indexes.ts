import { Migrations } from 'meteor/quave:migrations';

import {
  PurchasingPettyCashExpenseHeads,
  PurchasingPettyCashFunds,
  PurchasingPettyCashReplenishments,
  PurchasingPettyCashVouchers,
} from 'meteor/idreesia-common/server/collections/purchasing';

// Petty cash funds, the expense heads vouchers are booked to, the vouchers spent
// from the funds, and the replenishments that top them back up. Safe to run again.

// Case-insensitive comparison for names.
const CASE_INSENSITIVE = { locale: 'en', strength: 2 } as const;
Migrations.add({
  version: 79,
  async up() {
    const funds = PurchasingPettyCashFunds.rawCollection();
    await funds.createIndex({ isActive: 1, name: 1 }, { background: true });
    await funds.createIndex({ custodianPersonId: 1 }, { background: true });

    const expenseHeads = PurchasingPettyCashExpenseHeads.rawCollection();
    await expenseHeads.createIndex({ name: 1 }, { unique: true, collation: CASE_INSENSITIVE });
    await expenseHeads.createIndex({ isActive: 1, name: 1 }, { background: true });

    const vouchers = PurchasingPettyCashVouchers.rawCollection();
    await vouchers.createIndex({ number: 1 }, { unique: true });
    await vouchers.createIndex({ fundId: 1, status: 1, voucherDate: -1 });
    await vouchers.createIndex({ status: 1, voucherDate: -1 });
    await vouchers.createIndex({ expenseHeadId: 1 });
    await vouchers.createIndex({ replenishmentId: 1 }, { sparse: true });

    const replenishments = PurchasingPettyCashReplenishments.rawCollection();
    await replenishments.createIndex({ number: 1 }, { unique: true });
    await replenishments.createIndex({ fundId: 1, status: 1, createdAt: -1 });
  },
});
