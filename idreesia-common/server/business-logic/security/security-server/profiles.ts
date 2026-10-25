import {
  SecurityServerAlerts,
  SecurityServerProfiles,
} from 'meteor/idreesia-common/server/collections/security';
import type { SecurityServerProfileImageDocument } from 'meteor/idreesia-common/server/collections/security/security-server-profiles';
import {
  deleteFiles,
  putFile,
  StorageFolders,
} from 'meteor/idreesia-common/server/file-storage';

import { SecurityServerSyncError } from './errors';
import { getImageExtension } from './image-files';
import type { ProfilePayload, SyncUser } from './types';

const getProfileImageKey = (
  profileExternalId: string,
  imageExternalId: string,
  mimeType: string
) =>
  `${StorageFolders.SecurityServerProfileImages}/${profileExternalId}/${imageExternalId}.${getImageExtension(mimeType)}`;

export async function upsertSecurityServerProfile(
  user: SyncUser,
  externalId: string,
  { name, isTest, createdAt, updatedAt, images }: ProfilePayload
): Promise<string> {
  const existing = await SecurityServerProfiles.findOneAsync({ externalId });
  const existingImages: SecurityServerProfileImageDocument[] =
    existing?.images ?? [];
  const existingImagesById = new Map(
    existingImages.map(image => [image.externalId, image])
  );

  const newImages = images.filter(({ id }) => !existingImagesById.has(id));
  const newImageKeys = newImages.map(({ id, image }) => {
    if (!image) {
      throw new SecurityServerSyncError(
        422,
        `Image '${id}' is not stored in the ERP yet, so its data is required.`
      );
    }
    return getProfileImageKey(externalId, id, image.mimeType);
  });

  // Upload before writing to Mongo, and delete removed objects only after it,
  // so a failure part-way leaves at worst an orphaned object - never a profile
  // pointing at an object that doesn't exist.
  await Promise.all(
    newImages.map(({ image }, index) =>
      putFile(newImageKeys[index], image!.data, image!.mimeType)
    )
  );

  const newImagesById = new Map(
    newImages.map(({ id }, index) => [
      id,
      { externalId: id, imageKey: newImageKeys[index] },
    ])
  );
  const nextImages = images.map(
    ({ id }) => existingImagesById.get(id) ?? newImagesById.get(id)!
  );
  const incomingIds = new Set(images.map(({ id }) => id));
  const removedImageKeys = existingImages
    .filter(image => !incomingIds.has(image.externalId))
    .map(image => image.imageKey);

  const date = new Date();
  const externalDates = {
    ...(createdAt ? { externalCreatedAt: createdAt } : {}),
    ...(updatedAt ? { externalUpdatedAt: updatedAt } : {}),
  };

  let profileId: string;
  if (!existing) {
    profileId = await SecurityServerProfiles.insertAsync({
      externalId,
      name,
      isTest,
      images: nextImages,
      ...externalDates,
      createdAt: date,
      createdBy: user._id,
      updatedAt: date,
      updatedBy: user._id,
    });
  } else {
    profileId = existing._id;
    await SecurityServerProfiles.updateAsync(profileId, {
      $set: {
        name,
        isTest,
        images: nextImages,
        ...externalDates,
        updatedAt: date,
        updatedBy: user._id,
      },
      $unset: { deletedAt: '', deletedBy: '' },
    });

    if (existing.name !== name || existing.isTest !== isTest) {
      await SecurityServerAlerts.updateAsync(
        { profileId },
        { $set: { profileName: name, profileIsTest: isTest } },
        { multi: true }
      );
    }
  }

  if (removedImageKeys.length > 0) {
    await deleteFiles(removedImageKeys);
  }

  return profileId;
}

/**
 * Soft-deletes the profile and removes its images from storage. Its alerts,
 * and their snapshots, are kept.
 */
export async function deleteSecurityServerProfile(
  user: SyncUser,
  externalId: string
): Promise<void> {
  const existing = await SecurityServerProfiles.findOneAsync({
    externalId,
    deletedAt: { $exists: false },
  });
  if (!existing) return;

  const imageKeys = (existing.images ?? []).map(image => image.imageKey);

  const date = new Date();
  await SecurityServerProfiles.updateAsync(existing._id, {
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
