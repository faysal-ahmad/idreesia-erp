import { People } from 'meteor/idreesia-common/server/collections/common';

import { computeVectorFromImageBuffer } from './compute-image-vector-data';
import { storePersonImage } from './person-images';
import { decodeAndNormalizeImage, makeImageThumbnail } from './stored-images';

interface UserRef {
  _id: string;
}

/**
 * Sets a person's profile photo from base64 image data: stores the photo and
 * its thumbnail in object storage, computes its face vector, and removes the
 * photo it replaces.
 */
export async function setPersonImage(
  user: UserRef,
  personId: string,
  imageData: string
) {
  const image = await decodeAndNormalizeImage(imageData);

  let thumbnail: Buffer | null = null;
  try {
    thumbnail = await makeImageThumbnail(image);
  } catch (error) {
    // Lists fall back to the full photo when there is no thumbnail.
    // eslint-disable-next-line no-console
    console.error(`Thumbnail failed for person '${personId}':`, error);
  }

  const imageVectorData = computeVectorFromImageBuffer(image);
  const { imageKey, imageThumbnailKey } = await storePersonImage(
    personId,
    image,
    'image/jpeg',
    thumbnail
  );

  return People.setImage(
    personId,
    { imageKey, imageThumbnailKey, imageVectorData },
    user
  );
}
