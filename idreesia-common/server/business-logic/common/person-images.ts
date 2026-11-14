import {
  deleteFiles,
  StorageFolders,
} from 'meteor/idreesia-common/server/file-storage';

import { getStoredImageUrl, storeImage, type StoredImage } from './stored-images';

export interface PersonImageFields {
  imageKey?: string | null;
  imageThumbnailKey?: string | null;
}

export interface PersonImageUrls {
  imageUrl: string | null;
  imageThumbnailUrl: string | null;
}

/** Stores a person's photo and thumbnail under people-images/<personId>/. */
export const storePersonImage = (
  personId: string,
  image: Buffer,
  mimeType: string,
  thumbnail: Buffer | null
): Promise<StoredImage> =>
  storeImage(StorageFolders.PeopleImages, personId, image, mimeType, thumbnail);

/**
 * URLs of a person's photo and thumbnail in object storage. The thumbnail
 * falls back to the full photo.
 */
export function getPersonImageUrls(
  sharedData: PersonImageFields | null | undefined
): PersonImageUrls {
  const imageUrl = getStoredImageUrl(sharedData?.imageKey);
  return {
    imageUrl,
    imageThumbnailUrl:
      getStoredImageUrl(sharedData?.imageThumbnailKey) ?? imageUrl,
  };
}

/**
 * Deletes a person's stored profile photo files in object storage.
 */
export async function removePersonImageFiles(
  sharedData: PersonImageFields | null | undefined
): Promise<void> {
  if (!sharedData) return;

  const keysToDelete = [sharedData.imageKey, sharedData.imageThumbnailKey]
    .filter(Boolean) as string[];
  if (keysToDelete.length > 0) {
    try {
      await deleteFiles(keysToDelete);
    } catch (error) {
      // An orphaned file is harmless; failing the update over it is not.
      // eslint-disable-next-line no-console
      console.error(`Failed to delete people images ${keysToDelete}:`, error);
    }
  }
}
