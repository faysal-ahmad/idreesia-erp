import { Migrations } from 'meteor/quave:migrations';

// AccountHeads, AccountMonthlyBalances, Vouchers, VoucherDetails, Payments collections
// were dropped by this migration and their classes have since been removed from the codebase.
import { PaymentsHistory } from 'meteor/idreesia-common/server/collections/accounts';

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
    const db = PaymentsHistory.rawDatabase();

    await dropIfExists(db, 'accounts-account-heads');
    await dropIfExists(db, 'accounts-account-monthly-balances');
    await dropIfExists(db, 'accounts-vouchers');
    await dropIfExists(db, 'accounts-voucher-details');
    await dropIfExists(db, 'accounts-payments');
    await dropIfExists(db, 'accounts-payment-types');
  },
});
