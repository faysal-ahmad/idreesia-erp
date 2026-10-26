import { Migrations } from 'meteor/quave:migrations';

import {
  SecurityServerAlerts,
  SecurityServerChannels,
  SecurityServerProfiles,
} from 'meteor/idreesia-common/server/collections/security';

Migrations.add({
  version: 55,
  async up() {
    // externalId is the security server's id for the record; its two-way sync
    // looks records up by it. Unset until the security server has the record.
    await SecurityServerChannels.rawCollection().createIndex(
      { externalId: 1 },
      { unique: true, sparse: true, background: true }
    );
    const profiles = SecurityServerProfiles.rawCollection();
    await profiles.createIndex(
      { externalId: 1 },
      { unique: true, sparse: true, background: true }
    );
    await profiles.createIndex(
      { 'images.externalId': 1 },
      { sparse: true, background: true }
    );

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
  },
});
