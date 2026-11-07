import { StorageFolders } from 'meteor/idreesia-common/server/file-storage';

import { getStoredImageUrl, storeImage, type StoredImage } from './stored-images';

export interface PersonImageFields {
  imageKey?: string | null;
  imageThumbnailKey?: string | null;
  imageId?: string | null;
  imageThumbnailId?: string | null;
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
 * URLs of a person's photo and thumbnail. Photos not yet migrated to object
 * storage are still served from Attachments through /download-file. The
 * thumbnail falls back to the full photo.
 */
export function getPersonImageUrls(
  sharedData: PersonImageFields | null | undefined
): PersonImageUrls {
  if (sharedData?.imageKey) {
    const imageUrl = getStoredImageUrl(sharedData.imageKey, null);
    return {
      imageUrl,
      imageThumbnailUrl:
        getStoredImageUrl(sharedData.imageThumbnailKey, null) ?? imageUrl,
    };
  }

  const imageUrl = getStoredImageUrl(null, sharedData?.imageId);
  return {
    imageUrl,
    imageThumbnailUrl: imageUrl
      ? getStoredImageUrl(null, sharedData?.imageThumbnailId) ?? imageUrl
      : null,
  };
}
