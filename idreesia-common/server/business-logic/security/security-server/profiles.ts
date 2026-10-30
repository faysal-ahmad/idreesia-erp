import sharp from 'sharp';
import { Random } from 'meteor/random';

import { ImageVectorStatus } from 'meteor/idreesia-common/constants';
import { computeVectorFromImageBuffer } from 'meteor/idreesia-common/server/business-logic/common/compute-image-vector-data';
import {
  SecurityServerAlerts,
  SecurityServerProfiles,
} from 'meteor/idreesia-common/server/collections/security';
import {
  deleteFiles,
  getFile,
  putFile,
  StorageFolders,
} from 'meteor/idreesia-common/server/file-storage';
import type {
  SecurityServerProfileDocument,
  SecurityServerProfileImageDocument,
} from 'meteor/idreesia-common/server/collections/security/security-server-profiles';

import { ProfileImageRejectedError } from './profile-image-rejected-error';
import type { ProfileValues, SyncImage, SyncUser } from './types';

// Profile images are normalised before storage: upright (EXIF orientation
// applied), no larger than this on the long side, re-encoded as JPEG.
const MAX_IMAGE_SIDE = 1280;
const JPEG_QUALITY = 90;

// 2x the thumbnail in the profiles list (40x40, security-server.styles.css)
// for retina.
const THUMBNAIL_SIDE = 80;
const THUMBNAIL_JPEG_QUALITY = 80;

/**
 * Stores a list-sized JPEG of a profile photo next to it and returns its key,
 * or null when it could not be made - the list then falls back to the photo.
 */
async function putProfileThumbnail(
  imageKey: string,
  jpeg: Buffer
): Promise<string | null> {
  try {
    const thumbnail = await sharp(jpeg)
      .resize(THUMBNAIL_SIDE, THUMBNAIL_SIDE, { fit: 'cover' })
      .jpeg({ quality: THUMBNAIL_JPEG_QUALITY })
      .toBuffer();
    const thumbnailKey = imageKey.replace(/\.jpg$/, '.thumb.jpg');
    await putFile(thumbnailKey, thumbnail, 'image/jpeg');
    return thumbnailKey;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Profile thumbnail failed for '${imageKey}':`, error);
    return null;
  }
}

const getImageFileKeys = ({
  imageKey,
  thumbnailKey,
}: SecurityServerProfileImageDocument) =>
  thumbnailKey ? [imageKey, thumbnailKey] : [imageKey];

const REJECTION_MESSAGES: Record<string, string> = {
  [ImageVectorStatus.NO_FACE]: 'No face found in the image.',
  [ImageVectorStatus.MULTIPLE_FACES]:
    'More than one face found. Use a photo of just one person.',
  [ImageVectorStatus.TOO_SMALL]: 'The face is too small. Use a closer photo.',
  [ImageVectorStatus.ERROR]:
    'The image could not be processed. Try a different photo.',
};

const getActiveProfile = async (profileId: string) => {
  const profile = await SecurityServerProfiles.findOneAsync({
    _id: profileId,
    deletedAt: { $exists: false },
  });
  if (!profile) throw new Error('Profile not found.');
  return profile;
};

export async function createSecurityServerProfile(
  user: SyncUser,
  { name, isTest }: ProfileValues
): Promise<string> {
  const date = new Date();
  return SecurityServerProfiles.insertAsync({
    name: name.trim(),
    isTest,
    images: [],
    createdAt: date,
    createdBy: user._id,
    updatedAt: date,
    updatedBy: user._id,
  });
}

export async function updateSecurityServerProfile(
  user: SyncUser,
  profileId: string,
  { name, isTest }: ProfileValues
): Promise<void> {
  const existing = await getActiveProfile(profileId);
  const trimmedName = name.trim();

  await SecurityServerProfiles.updateAsync(profileId, {
    $set: {
      name: trimmedName,
      isTest,
      updatedAt: new Date(),
      updatedBy: user._id,
    },
  });

  if (existing.name !== trimmedName || existing.isTest !== isTest) {
    await SecurityServerAlerts.updateAsync(
      { profileId },
      { $set: { profileName: trimmedName, profileIsTest: isTest } },
      { multi: true }
    );
  }
}

/**
 * Soft-deletes the profile and removes its images from storage. Its alerts,
 * and their snapshots, are kept.
 */
export async function deleteSecurityServerProfile(
  user: SyncUser,
  profileId: string
): Promise<void> {
  const existing = await getActiveProfile(profileId);
  const imageKeys = existing.images.flatMap(getImageFileKeys);

  const date = new Date();
  await SecurityServerProfiles.updateAsync(profileId, {
    $set: {
      images: [],
      deletedAt: date,
      deletedBy: user._id,
      updatedAt: date,
      updatedBy: user._id,
    },
    $unset: { defaultImageId: '' },
  });

  if (imageKeys.length > 0) {
    await deleteFiles(imageKeys);
  }
}

/**
 * Adds an enrollment photo uploaded in the ERP. The photo is rejected unless
 * it passes the same face quality gate the security server applies to its own
 * uploads, so the security server never receives an image it can't use.
 */
export async function addSecurityServerProfileImage(
  user: SyncUser,
  profileId: string,
  { data }: SyncImage
): Promise<string> {
  await getActiveProfile(profileId);

  let normalized: Buffer;
  try {
    normalized = await sharp(data)
      .rotate()
      .resize(MAX_IMAGE_SIDE, MAX_IMAGE_SIDE, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: JPEG_QUALITY })
      .toBuffer();
  } catch {
    throw new ProfileImageRejectedError(
      REJECTION_MESSAGES[ImageVectorStatus.ERROR]
    );
  }

  // Checked on the normalised image - exactly what the security server will
  // download. The vector itself is discarded; the server computes its own.
  const { status } = computeVectorFromImageBuffer(normalized);
  if (status !== ImageVectorStatus.COMPUTED) {
    throw new ProfileImageRejectedError(
      REJECTION_MESSAGES[status] ?? REJECTION_MESSAGES[ImageVectorStatus.ERROR]
    );
  }

  return storeSecurityServerProfileImage(user, profileId, normalized);
}

/**
 * Stores a JPEG as one of the profile's photos, with no quality check. Used
 * directly for photos the security server syncs up, which it already checked
 * when they were uploaded there.
 */
export async function storeSecurityServerProfileImage(
  user: SyncUser,
  profileId: string,
  jpeg: Buffer,
  externalId?: string
): Promise<string> {
  const imageId = Random.id();
  const imageKey = `${StorageFolders.SecurityServerProfileImages}/${profileId}/${imageId}.jpg`;
  await putFile(imageKey, jpeg, 'image/jpeg');
  const thumbnailKey = await putProfileThumbnail(imageKey, jpeg);

  const date = new Date();
  await SecurityServerProfiles.updateAsync(profileId, {
    $push: {
      images: {
        _id: imageId,
        ...(externalId ? { externalId } : {}),
        imageKey,
        ...(thumbnailKey ? { thumbnailKey } : {}),
        uploadedAt: date,
        uploadedBy: user._id,
      },
    },
    $set: { updatedAt: date, updatedBy: user._id },
  });

  return imageId;
}

export async function removeSecurityServerProfileImage(
  user: SyncUser,
  profileId: string,
  imageId: string
): Promise<void> {
  const profile = await getActiveProfile(profileId);
  const image = profile.images.find(({ _id }) => _id === imageId);
  if (!image) throw new Error('Image not found.');

  // Remove the reference before the object, so a failure part-way never
  // leaves the profile pointing at an image that doesn't exist. A removed
  // default photo falls back to the oldest remaining one.
  await SecurityServerProfiles.updateAsync(profileId, {
    $pull: { images: { _id: imageId } },
    $set: { updatedAt: new Date(), updatedBy: user._id },
    ...(profile.defaultImageId === imageId
      ? { $unset: { defaultImageId: '' } }
      : {}),
  });
  await deleteFiles(getImageFileKeys(image));
}

export async function setSecurityServerProfileDefaultImage(
  user: SyncUser,
  profileId: string,
  imageId: string
): Promise<void> {
  const profile = await getActiveProfile(profileId);
  if (!profile.images.some(({ _id }) => _id === imageId)) {
    throw new Error('Image not found.');
  }
  await SecurityServerProfiles.updateAsync(profileId, {
    $set: {
      defaultImageId: imageId,
      updatedAt: new Date(),
      updatedBy: user._id,
    },
  });
}

/**
 * Makes thumbnails for profile photos stored without one (stored before
 * thumbnails existed, or whose thumbnail failed). Returns how many were
 * created. Not a profile change, so updatedAt is kept and nothing syncs.
 */
export async function createMissingSecurityServerProfileThumbnails(): Promise<number> {
  const profiles = await SecurityServerProfiles.find(
    {
      deletedAt: { $exists: false },
      images: { $elemMatch: { thumbnailKey: { $exists: false } } },
    },
    { fields: { images: 1 } }
  ).fetchAsync();

  let created = 0;
  for (const { _id: profileId, images } of profiles) {
    for (const { _id: imageId, imageKey, thumbnailKey } of images) {
      if (thumbnailKey) continue;
      let jpeg: Buffer;
      try {
        ({ body: jpeg } = await getFile(imageKey));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Profile image '${imageKey}' could not be read:`, error);
        continue;
      }
      const newThumbnailKey = await putProfileThumbnail(imageKey, jpeg);
      if (newThumbnailKey) {
        await SecurityServerProfiles.updateAsync(
          { _id: profileId, 'images._id': imageId },
          { $set: { 'images.$.thumbnailKey': newThumbnailKey } }
        );
        created++;
      }
    }
  }
  return created;
}

/** The default photo, or the oldest one when none was chosen. */
export const resolveSecurityServerProfileDefaultImageId = (
  profile: Pick<SecurityServerProfileDocument, 'defaultImageId' | 'images'>
): string | null => profile.defaultImageId ?? profile.images[0]?._id ?? null;
