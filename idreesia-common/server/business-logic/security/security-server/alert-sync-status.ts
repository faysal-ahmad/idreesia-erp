import { Mongo } from 'meteor/mongo';

// When the security server last got through to the ERP with its alerts. It
// checks in after every alert push run, even one with nothing to send, so a
// stale time means it is down or can't reach the ERP - not just that nobody
// was detected.
interface SecurityServerAlertSyncDocument {
  _id: string;
  lastSyncedAt: Date;
}

const SecurityServerAlertSync = new Mongo.Collection<SecurityServerAlertSyncDocument>(
  'security-server-alert-sync'
);

const SINGLETON_ID = 'singleton';

export async function recordSecurityServerAlertSync(): Promise<void> {
  await SecurityServerAlertSync.updateAsync(
    { _id: SINGLETON_ID },
    { $set: { lastSyncedAt: new Date() } },
    { upsert: true }
  );
}

/** Null until the security server has checked in for the first time. */
export async function getSecurityServerAlertLastSyncedAt(): Promise<Date | null> {
  const doc = await SecurityServerAlertSync.findOneAsync({ _id: SINGLETON_ID });
  return doc?.lastSyncedAt ?? null;
}
