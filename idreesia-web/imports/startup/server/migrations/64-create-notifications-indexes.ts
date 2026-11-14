import { Migrations } from 'meteor/quave:migrations';

import { Notifications } from 'meteor/idreesia-common/server/collections/common';

Migrations.add({
  version: 64,
  async up() {
    const notifications = Notifications.rawCollection();
    // A user's notifications: by committee and module, newest change first.
    await notifications.createIndex(
      { committeeId: 1, module: 1, updatedAt: -1 },
      { background: true }
    );
    // The purge: expired ones and ones past the retention period.
    await notifications.createIndex({ expiresAt: 1 }, { background: true });
    await notifications.createIndex({ updatedAt: 1 }, { background: true });
  },
});
