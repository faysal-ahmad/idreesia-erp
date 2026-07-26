import { Migrations } from 'meteor/percolate:migrations';

import {
  AccountHeads,
  AccountMonthlyBalances,
  Vouchers,
  VoucherDetails,
  Payments,
} from 'meteor/idreesia-common/server/collections/accounts';

const NamespaceNotFound = 26;

async function dropIfExists(db: { dropCollection(name: string): Promise<unknown> | void }, name: string) {
  try {
    await db.dropCollection(name);
  } catch (error) {
    if ((error as { code?: number }).code !== NamespaceNotFound) throw error;
  }
}

Migrations.add({
  version: 42,
  async up() {
    const db = Vouchers.rawDatabase();

    await dropIfExists(db, AccountHeads.rawCollection().collectionName);
    await dropIfExists(db, AccountMonthlyBalances.rawCollection().collectionName);
    await dropIfExists(db, Vouchers.rawCollection().collectionName);
    await dropIfExists(db, VoucherDetails.rawCollection().collectionName);
    await dropIfExists(db, Payments.rawCollection().collectionName);
    await dropIfExists(db, 'accounts-payment-types');
  },
});
