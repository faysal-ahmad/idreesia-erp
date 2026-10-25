import { Migrations } from 'meteor/quave:migrations';

import { SecurityServerAlerts } from 'meteor/idreesia-common/server/collections/security';

Migrations.add({
  version: 55,
  async up() {
    const alerts = SecurityServerAlerts.rawCollection();
    // externalId is the security server's own alert id; pushes upsert on it.
    await alerts.createIndex(
      { externalId: 1 },
      { unique: true, background: true }
    );
    await alerts.createIndex({ timestamp: -1 }, { background: true });
    await alerts.createIndex(
      { profileId: 1, timestamp: -1 },
      { background: true }
    );
    await alerts.createIndex(
      { channelId: 1, timestamp: -1 },
      { background: true }
    );
    // Cursor for the security server's review pull.
    await alerts.createIndex(
      { reviewUpdatedAt: 1 },
      { sparse: true, background: true }
    );
  },
});
