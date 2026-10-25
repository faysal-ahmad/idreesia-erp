import { Migrations } from 'meteor/quave:migrations';

import {
  SecurityServerAlerts,
  SecurityServerChannels,
  SecurityServerProfiles,
} from 'meteor/idreesia-common/server/collections/security';

Migrations.add({
  version: 55,
  async up() {
    // externalId is the security server's own id; pushes upsert on it.
    await SecurityServerChannels.rawCollection().createIndex(
      { externalId: 1 },
      { unique: true, background: true }
    );
    await SecurityServerProfiles.rawCollection().createIndex(
      { externalId: 1 },
      { unique: true, background: true }
    );

    const alerts = SecurityServerAlerts.rawCollection();
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
  },
});
