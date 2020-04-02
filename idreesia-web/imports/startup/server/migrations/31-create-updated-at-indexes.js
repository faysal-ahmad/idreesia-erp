import { Migrations } from 'meteor/percolate:migrations';

import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { Payments } from 'meteor/idreesia-common/server/collections/accounts';
import { Vouchers } from 'meteor/idreesia-common/server/collections/accounts';
import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';
import { Visitors } from 'meteor/idreesia-common/server/collections/security';

Migrations.add({
  version: 31,
  up() {
    Users.rawCollection().createIndex({ updatedAt: 1 }, { background: true });
    Payments.rawCollection().createIndex(
      { updatedAt: 1 },
      { background: true }
    );
    Vouchers.rawCollection().createIndex(
      { updatedAt: 1 },
      { background: true }
    );
    Karkuns.rawCollection().createIndex({ updatedAt: 1 }, { background: true });
    Visitors.rawCollection().createIndex(
      { updatedAt: 1 },
      { background: true }
    );
  },
});
