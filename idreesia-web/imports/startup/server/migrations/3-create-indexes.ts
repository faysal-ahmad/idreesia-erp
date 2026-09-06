import { Migrations } from 'meteor/quave:migrations';
import { StockItems } from 'meteor/idreesia-common/server/collections/inventory';
// Karkuns collection has since been removed - its data now lives on People.
// import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';
import {
  AccountHeads,
  Vouchers,
  VoucherDetails,
} from 'meteor/idreesia-common/server/collections/accounts';

Migrations.add({
  version: 3,
  async up() {
    // Inventory Indexes
    const stockItems = StockItems.rawCollection();
    await stockItems.createIndex({ name: 'text', company: 'text', details: 'text' });
    await stockItems.createIndex({ categoryId: 1 }, { background: true });

    // HR Indexes - Karkuns collection has since been removed.
    // await Karkuns.rawCollection().createIndex({
    //   firstName: 'text',
    //   lastName: 'text',
    // });

    // Accounts Indexes
    const accountHeads = AccountHeads.rawCollection();
    await accountHeads.createIndex({ number: 1 }, { background: true });
    await accountHeads.createIndex({ parent: 1 }, { background: true });
    await accountHeads.createIndex({ companyId: 1 }, { background: true });

    const vouchers = Vouchers.rawCollection();
    await vouchers.createIndex({ companyId: 1 }, { background: true });
    await vouchers.createIndex({ externalReferenceId: 1 }, { background: true });

    const voucherDetails = VoucherDetails.rawCollection();
    await voucherDetails.createIndex({ companyId: 1 }, { background: true });
    await voucherDetails.createIndex(
      { externalReferenceId: 1 },
      { background: true }
    );
    await voucherDetails.createIndex({ accountHeadId: 1 }, { background: true });
  },
});
