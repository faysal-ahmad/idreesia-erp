import { Migrations } from 'meteor/quave:migrations';

import {
  SecurityServerUsageChannelStats,
  SecurityServerUsageServerStats,
} from 'meteor/idreesia-common/server/collections/security';
import { USAGE_STATS_RETENTION_DAYS } from 'meteor/idreesia-common/server/business-logic/security/security-server';

const RETENTION_SECONDS = USAGE_STATS_RETENTION_DAYS * 24 * 60 * 60;

Migrations.add({
  version: 56,
  async up() {
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
  },
});
