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
import type { AlertPayload, AlertReviewPayload, SyncUser } from './types';

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

const getReviewModifier = (
  { review, reviewedAt }: AlertReviewPayload,
  user: SyncUser
) => {
  const date = new Date();
  if (review) {
    return {
      $set: {
        review,
        reviewedAt: reviewedAt ?? date,
        updatedAt: date,
        updatedBy: user._id,
      },
    };
  }

  return {
    $set: { updatedAt: date, updatedBy: user._id },
    $unset: { review: '' as const, reviewedAt: '' as const },
  };
};

export async function upsertSecurityServerAlert(
  user: SyncUser,
  externalId: string,
  payload: AlertPayload
): Promise<string> {
  const { profileId, channelId, timestamp, similarityScore, image } = payload;

  const [profile, channel] = await Promise.all([
    SecurityServerProfiles.findOneAsync({ externalId: profileId }),
    SecurityServerChannels.findOneAsync({ externalId: channelId }),
  ]);
  if (!profile) {
    throw new SecurityServerSyncError(
      422,
      `Profile '${profileId}' has not been pushed to the ERP.`
    );
  }
  if (!channel) {
    throw new SecurityServerSyncError(
      422,
      `Channel '${channelId}' has not been pushed to the ERP.`
    );
  }

  // Alerts never change on the server apart from their review, so a re-push
  // of a known alert only updates that - the snapshot is never re-uploaded.
  const existing = await SecurityServerAlerts.findOneAsync({ externalId });
  if (existing) {
    await SecurityServerAlerts.updateAsync(
      existing._id,
      getReviewModifier(payload, user)
    );
    return existing._id;
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
  const { review, reviewedAt } = payload;
  return SecurityServerAlerts.insertAsync({
    externalId,
    profileId: profile._id,
    profileExternalId: profileId,
    profileName: profile.name,
    profileIsTest: profile.isTest,
    channelId: channel._id,
    channelExternalId: channelId,
    channelName: channel.name,
    timestamp,
    similarityScore,
    imageKey,
    ...(review ? { review, reviewedAt: reviewedAt ?? date } : {}),
    createdAt: date,
    createdBy: user._id,
    updatedAt: date,
    updatedBy: user._id,
  });
}

export async function setSecurityServerAlertReview(
  user: SyncUser,
  externalId: string,
  payload: AlertReviewPayload
): Promise<void> {
  const existing = await SecurityServerAlerts.findOneAsync({ externalId });
  if (!existing) {
    throw new SecurityServerSyncError(
      404,
      `Alert '${externalId}' has not been pushed to the ERP.`
    );
  }

  await SecurityServerAlerts.updateAsync(
    existing._id,
    getReviewModifier(payload, user)
  );
}
