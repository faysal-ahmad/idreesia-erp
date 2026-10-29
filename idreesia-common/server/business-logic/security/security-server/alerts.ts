import {
  SecurityServerAlerts,
  SecurityServerChannels,
  SecurityServerProfiles,
} from 'meteor/idreesia-common/server/collections/security';
import sharp from 'sharp';

import {
  getFile,
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

// 2x the snapshot cell in the alert lists (112x63, security-server.styles.css)
// for retina.
const THUMBNAIL_WIDTH = 224;
const THUMBNAIL_HEIGHT = 126;
const THUMBNAIL_JPEG_QUALITY = 80;

// Stored next to the full image, e.g. '.../2026/10/abc.jpg' -> '.../abc.thumb.jpg'.
const getAlertThumbnailKey = (imageKey: string) =>
  `${imageKey.replace(/\.[^./]+$/, '')}.thumb.jpg`;

/**
 * Stores a list-sized JPEG of an alert's snapshot and returns its key, or
 * null when it could not be made - the lists then fall back to the full image.
 */
async function putAlertThumbnail(
  imageKey: string,
  imageData: Buffer
): Promise<string | null> {
  try {
    const thumbnail = await sharp(imageData)
      .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, { fit: 'cover' })
      .jpeg({ quality: THUMBNAIL_JPEG_QUALITY })
      .toBuffer();
    const thumbnailKey = getAlertThumbnailKey(imageKey);
    await putFile(thumbnailKey, thumbnail, 'image/jpeg');
    return thumbnailKey;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Alert thumbnail failed for '${imageKey}':`, error);
    return null;
  }
}

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
  {
    profileId,
    channelId,
    timestamp,
    similarityScore,
    faceSizePx,
    faceQuality,
    image,
  }: AlertPayload
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
  const thumbnailKey = await putAlertThumbnail(imageKey, image.data);

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
    ...(faceSizePx != null ? { faceSizePx } : {}),
    ...(faceQuality
      ? {
          faceQualityScore: faceQuality.score,
          faceQualityReasons: faceQuality.reasons,
        }
      : {}),
    imageKey,
    ...(thumbnailKey ? { thumbnailKey } : {}),
    createdAt: date,
    createdBy: user._id,
    updatedAt: date,
    updatedBy: user._id,
  });
}

/**
 * Makes thumbnails for alerts stored without one (raised before thumbnails
 * existed, or whose thumbnail failed). Returns how many were created.
 */
export async function createMissingSecurityServerAlertThumbnails(): Promise<number> {
  const alerts = await SecurityServerAlerts.find(
    { thumbnailKey: { $exists: false } },
    { fields: { imageKey: 1 } }
  ).fetchAsync();

  let created = 0;
  for (const { _id, imageKey } of alerts) {
    let imageData: Buffer;
    try {
      ({ body: imageData } = await getFile(imageKey));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Alert image '${imageKey}' could not be read:`, error);
      continue;
    }
    const thumbnailKey = await putAlertThumbnail(imageKey, imageData);
    if (thumbnailKey) {
      await SecurityServerAlerts.updateAsync(_id, { $set: { thumbnailKey } });
      created++;
    }
  }
  return created;
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
