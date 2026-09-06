import { Migrations } from 'meteor/quave:migrations';

import { Users } from 'meteor/idreesia-common/server/collections/admin';
// Payments, Vouchers collections have since been dropped - see migration 42.
// import { Payments } from 'meteor/idreesia-common/server/collections/accounts';
// import { Vouchers } from 'meteor/idreesia-common/server/collections/accounts';
// Karkuns collection has since been removed - its data now lives on People.
// import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';
import { Visitors } from 'meteor/idreesia-common/server/collections/security';

Migrations.add({
  version: 31,
  async up() {
    await Users.rawCollection().createIndex({ updatedAt: 1 }, { background: true });
    // Payments, Vouchers collections have since been dropped.
    // await Payments.rawCollection().createIndex(
    //   { updatedAt: 1 },
    //   { background: true }
    // );
    // await Vouchers.rawCollection().createIndex(
    //   { updatedAt: 1 },
    //   { background: true }
    // );
    // await Karkuns.rawCollection().createIndex({ updatedAt: 1 }, { background: true });
    await Visitors.rawCollection().createIndex(
      { updatedAt: 1 },
      { background: true }
    );
  },
});
