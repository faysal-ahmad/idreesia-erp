import {
  SecurityServerAlerts,
  SecurityServerChannels,
  SecurityServerProfiles,
} from 'meteor/idreesia-common/server/collections/security';
import {
  putFile,
  StorageFolders,
} from 'meteor/idreesia-common/server/file-storage';

import { SecurityServerSyncError } from './errors';
import { getImageExtension } from './image-files';
import type { AlertPayload, AlertReview, SyncUser } from './types';

// Partitioned by the alert's month (UTC) so retention or cleanup can work on
// whole prefixes later.
const getAlertImageKey = (
  alertExternalId: string,
  timestamp: Date,
  mimeType: string
) => {
  const year = timestamp.getUTCFullYear();
  const month = String(timestamp.getUTCMonth() + 1).padStart(2, '0');
  return `${StorageFolders.SecurityServerAlertImages}/${year}/${month}/${alertExternalId}.${getImageExtension(mimeType)}`;
};

/**
 * Stores an alert pushed by the security server. Alerts never change once
 * raised, so re-pushing a known alert is a no-op - the snapshot is never
 * re-uploaded. The payload's profile and channel ids are the security
 * server's own, matched through `externalId`. Profiles and channels deleted in
 * the ERP are still accepted, since the server may not have synced the
 * deletion yet.
 */
export async function upsertSecurityServerAlert(
  user: SyncUser,
  externalId: string,
  { profileId, channelId, timestamp, similarityScore, image }: AlertPayload
): Promise<string> {
  const existing = await SecurityServerAlerts.findOneAsync({ externalId });
  if (existing) return existing._id;

  const [profile, channel] = await Promise.all([
    SecurityServerProfiles.findOneAsync({ externalId: profileId }),
    SecurityServerChannels.findOneAsync({ externalId: channelId }),
  ]);
  if (!profile) {
    throw new SecurityServerSyncError(422, `Unknown profile '${profileId}'.`);
  }
  if (!channel) {
    throw new SecurityServerSyncError(422, `Unknown channel '${channelId}'.`);
  }
  if (!image) {
    throw new SecurityServerSyncError(
      422,
      `Alert '${externalId}' is not stored in the ERP yet, so its image is required.`
    );
  }

  const imageKey = getAlertImageKey(externalId, timestamp, image.mimeType);
  await putFile(imageKey, image.data, image.mimeType);

  const date = new Date();
  return SecurityServerAlerts.insertAsync({
    externalId,
    profileId: profile._id,
    profileName: profile.name,
    profileIsTest: profile.isTest,
    channelId: channel._id,
    channelName: channel.name,
    timestamp,
    similarityScore,
    imageKey,
    createdAt: date,
    createdBy: user._id,
    updatedAt: date,
    updatedBy: user._id,
  });
}

/** Records (or, with null, clears) an ERP user's review of an alert. */
export async function setSecurityServerAlertReview(
  user: SyncUser,
  alertId: string,
  review: AlertReview | null
): Promise<void> {
  const alert = await SecurityServerAlerts.findOneAsync(alertId);
  if (!alert) throw new Error('Alert not found.');

  const date = new Date();
  const audit = { updatedAt: date, updatedBy: user._id };
  await SecurityServerAlerts.updateAsync(
    alertId,
    review
      ? { $set: { review, reviewedAt: date, ...audit } }
      : { $set: audit, $unset: { review: '', reviewedAt: '' } }
  );
}
