import {
  EntityType,
  OperationType,
} from 'meteor/idreesia-common/constants/audit';
import { People } from 'meteor/idreesia-common/server/collections/common';

import { createAuditLog } from './audit-logs';
import {
  computeVectorFromImageBuffer,
  type ImageVectorData,
} from './compute-image-vector-data';
import { PHOTO_AUDIT_FIELD, PHOTO_AUDIT_VALUE } from './people/people-mutations';
import { removePersonImageFiles, storePersonImage } from './person-images';
import { decodeAndNormalizeImage, makeImageThumbnail } from './stored-images';

interface UserRef {
  _id: string;
}

interface PersonImageInput {
  imageKey: string;
  imageThumbnailKey: string | null;
  imageVectorData: ImageVectorData;
}

/**
 * Points the person at a profile photo already stored in object storage,
 * then removes the photo it replaces - from object storage, or from
 * Attachments for a photo that was never migrated.
 */
async function setPersonImageFiles(
  _id: string,
  { imageKey, imageThumbnailKey, imageVectorData }: PersonImageInput,
  user: UserRef
) {
  const existingPerson = await People.findOneAsync(_id);
  if (!existingPerson) {
    throw new Error(`Person '${_id}' was not found.`);
  }

  const date = new Date();
  await People.updateAsync(_id, {
    $set: {
      'sharedData.imageKey': imageKey,
      'sharedData.imageVectorData': imageVectorData,
      ...(imageThumbnailKey
        ? { 'sharedData.imageThumbnailKey': imageThumbnailKey }
        : {}),
      updatedAt: date,
      updatedBy: user._id,
    },
    ...(imageThumbnailKey
      ? {}
      : { $unset: { 'sharedData.imageThumbnailKey': '' } }),
  });

  await createAuditLog(
    {
      entityId: _id,
      entityType: EntityType.PERSON,
      operationType: OperationType.UPDATE,
      operationBy: user._id,
      operationTime: date,
      auditValues: { [PHOTO_AUDIT_FIELD]: PHOTO_AUDIT_VALUE },
    },
    existingPerson
  );

  await removePersonImageFiles(existingPerson.sharedData);
  return People.findOneAsync(_id);
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

  return setPersonImageFiles(
    personId,
    { imageKey, imageThumbnailKey, imageVectorData },
    user
  );
}
