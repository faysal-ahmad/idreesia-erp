import { Migrations } from "meteor/percolate:migrations";
import { StockItems } from "meteor/idreesia-common/collections/inventory";
import { Karkuns } from "meteor/idreesia-common/collections/hr";
import {
  AccountHeads,
  Vouchers,
  VoucherDetails,
} from "meteor/idreesia-common/collections/accounts";

Migrations.add({
  version: 3,
  up() {
    // Inventory Indexes
    const stockItems = StockItems.rawCollection();
    stockItems.createIndex({ name: "text", details: "text" });
    stockItems.createIndex({ categoryId: 1 }, { background: true });

    // HR Indexes
    Karkuns.rawCollection().createIndex({
      firstName: "text",
      lastName: "text",
    });

    // Accounts Indexes
    const accountHeads = AccountHeads.rawCollection();
    accountHeads.createIndex({ number: 1 }, { background: true });
    accountHeads.createIndex({ parent: 1 }, { background: true });
    accountHeads.createIndex({ companyId: 1 }, { background: true });

    const vouchers = Vouchers.rawCollection();
    vouchers.createIndex({ companyId: 1 }, { background: true });
    vouchers.createIndex({ externalReferenceId: 1 }, { background: true });

    const voucherDetails = VoucherDetails.rawCollection();
    voucherDetails.createIndex({ companyId: 1 }, { background: true });
    voucherDetails.createIndex(
      { externalReferenceId: 1 },
      { background: true }
    );
    voucherDetails.createIndex({ accountHeadId: 1 }, { background: true });
  },
});
