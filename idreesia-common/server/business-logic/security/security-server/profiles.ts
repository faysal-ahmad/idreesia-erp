import sharp from 'sharp';
import { Random } from 'meteor/random';

import { ImageVectorStatus } from 'meteor/idreesia-common/constants';
import { computeVectorFromImageBuffer } from 'meteor/idreesia-common/server/business-logic/common/compute-image-vector-data';
import {
  SecurityServerAlerts,
  SecurityServerProfiles,
} from 'meteor/idreesia-common/server/collections/security';
import {
  deleteFile,
  deleteFiles,
  putFile,
  StorageFolders,
} from 'meteor/idreesia-common/server/file-storage';

import type { ProfileValues, SyncImage, SyncUser } from './types';

// Profile images are normalised before storage: upright (EXIF orientation
// applied), no larger than this on the long side, re-encoded as JPEG.
const MAX_IMAGE_SIDE = 1280;
const JPEG_QUALITY = 90;

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
  const imageKeys = existing.images.map(image => image.imageKey);

  const date = new Date();
  await SecurityServerProfiles.updateAsync(profileId, {
    $set: {
      images: [],
      deletedAt: date,
      deletedBy: user._id,
      updatedAt: date,
      updatedBy: user._id,
    },
  });

  if (imageKeys.length > 0) {
    await deleteFiles(imageKeys);
  }
}

/**
 * Adds an enrollment photo to a profile. The photo is rejected unless it
 * passes the same face quality gate the security server applies when it
 * computes its embedding, so the server never pulls an image it can't use.
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
    throw new Error(REJECTION_MESSAGES[ImageVectorStatus.ERROR]);
  }

  // Checked on the normalised image - exactly what the security server will
  // download. The vector itself is discarded; the server computes its own.
  const { status } = computeVectorFromImageBuffer(normalized);
  if (status !== ImageVectorStatus.COMPUTED) {
    throw new Error(
      REJECTION_MESSAGES[status] ?? REJECTION_MESSAGES[ImageVectorStatus.ERROR]
    );
  }

  const imageId = Random.id();
  const imageKey = `${StorageFolders.SecurityServerProfileImages}/${profileId}/${imageId}.jpg`;
  await putFile(imageKey, normalized, 'image/jpeg');

  const date = new Date();
  await SecurityServerProfiles.updateAsync(profileId, {
    $push: {
      images: {
        _id: imageId,
        imageKey,
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
  // leaves the profile pointing at an image that doesn't exist.
  await SecurityServerProfiles.updateAsync(profileId, {
    $pull: { images: { _id: imageId } },
    $set: { updatedAt: new Date(), updatedBy: user._id },
  });
  await deleteFile(image.imageKey);
}
