import { Meteor } from 'meteor/meteor';
import { Migrations } from 'meteor/quave:migrations';

import { SecurityEventDuties as SecurityEventDutiesList } from 'meteor/idreesia-common/constants/security';
import {
  SecurityEventDuties,
  SecurityEventKarkuns,
  SecurityServerAlerts,
  SecurityServerChannels,
  SecurityServerProfiles,
  SecurityServerUsageChannelStats,
  SecurityServerUsageServerStats,
  VisitorStays,
} from 'meteor/idreesia-common/server/collections/security';
import { USAGE_STATS_RETENTION_DAYS } from 'meteor/idreesia-common/server/business-logic/security/security-server';

const RETENTION_SECONDS = USAGE_STATS_RETENTION_DAYS * 24 * 60 * 60;

async function createSecurityServerIndexes() {
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
  await alerts.createIndex({ externalId: 1 }, { unique: true, background: true });
  await alerts.createIndex({ timestamp: -1 }, { background: true });
  await alerts.createIndex(
    { profileId: 1, timestamp: -1 },
    { background: true }
  );
  await alerts.createIndex(
    { channelId: 1, timestamp: -1 },
    { background: true }
  );

  // Pushes upsert on the bucket; the TTL drops buckets past retention.
  await SecurityServerUsageServerStats.rawCollection().createIndex(
    { bucketStart: 1 },
    { unique: true, background: true, expireAfterSeconds: RETENTION_SECONDS }
  );
  const channelStats = SecurityServerUsageChannelStats.rawCollection();
  await channelStats.createIndex(
    { channelId: 1, bucketStart: 1 },
    { unique: true, background: true }
  );
  await channelStats.createIndex(
    { bucketStart: 1 },
    { background: true, expireAfterSeconds: RETENTION_SECONDS }
  );
}

// The duties karkuns can be given at a security event. Seeded from the
// constants list when there are none yet.
async function seedSecurityEventDuties() {
  if (await SecurityEventDuties.findOneAsync({})) return;

  const adminUser = await Meteor.users.findOneAsync({ username: 'erp-admin' });
  if (!adminUser) throw new Error('Admin user not found.');
  const date = new Date();
  for (const duty of SecurityEventDutiesList) {
    await SecurityEventDuties.insertAsync({
      name: duty.name,
      urduName: duty.urduName,
      createdAt: date,
      createdBy: adminUser._id,
      updatedAt: date,
      updatedBy: adminUser._id,
    });
  }
}

Migrations.add({
  version: 5,
  name: 'Create security',
  async up() {
    const visitorStays = VisitorStays.rawCollection();
    for (const field of [
      'visitorId',
      'fromDate',
      'toDate',
      'stayReason',
      'stayAllowedBy',
      'dutyId',
      'shiftId',
      'teamName',
    ]) {
      await visitorStays.createIndex({ [field]: 1 }, { background: true });
    }

    const eventKarkuns = SecurityEventKarkuns.rawCollection();
    await eventKarkuns.createIndex({ eventId: 1 }, { background: true });
    await eventKarkuns.createIndex({ karkunId: 1 }, { background: true });
    await eventKarkuns.createIndex(
      { dutyCardBarcodeId: 1 },
      { background: true }
    );

    await createSecurityServerIndexes();
    await seedSecurityEventDuties();
  },
});
