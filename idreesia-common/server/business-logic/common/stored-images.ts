import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import sharp from 'sharp';

import {
  getPublicFileUrl,
  PUBLIC_IMMUTABLE_FILE,
  putFile,
} from 'meteor/idreesia-common/server/file-storage';

// Same normalisation as security-server profile photos (profiles.ts).
const MAX_IMAGE_SIDE = 1280;
const JPEG_QUALITY = 90;
// 2x the largest avatar display size (80px, in person-name.tsx) for retina.
const THUMBNAIL_SIDE = 160;
const THUMBNAIL_JPEG_QUALITY = 80;

export interface StoredImage {
  imageKey: string;
  imageThumbnailKey: string | null;
}

/** Rotates per EXIF, caps the size and re-encodes as JPEG. */
export const normalizeImage = (image: Buffer): Promise<Buffer> =>
  sharp(image)
    .rotate()
    .resize(MAX_IMAGE_SIDE, MAX_IMAGE_SIDE, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: JPEG_QUALITY })
    .toBuffer();

export const makeImageThumbnail = (image: Buffer): Promise<Buffer> =>
  sharp(image)
    .resize(THUMBNAIL_SIDE, THUMBNAIL_SIDE, { fit: 'cover' })
    .jpeg({ quality: THUMBNAIL_JPEG_QUALITY })
    .toBuffer();

/**
 * Decodes base64 image data (with or without a data: URL prefix) and
 * normalises it, rejecting anything that isn't a readable image.
 */
export async function decodeAndNormalizeImage(
  imageData: string
): Promise<Buffer> {
  const base64 = imageData.replace(/^data:[^;]+;base64,/, '');
  try {
    return await normalizeImage(Buffer.from(base64, 'base64'));
  } catch {
    throw new Error('The uploaded file is not a valid image.');
  }
}

const getExtension = (mimeType: string) => {
  const subtype = mimeType.split('/')[1]?.toLowerCase();
  if (!subtype || subtype === 'jpeg') return 'jpg';
  return subtype.replace(/[^a-z0-9]/g, '') || 'jpg';
};

/**
 * Stores an image (and optionally its thumbnail) as public, immutable files
 * under `<folder>/<ownerId>/`. The random id in the key keeps the public URL
 * unguessable, and a new key per image means a cached URL never shows a
 * stale image.
 */
export async function storeImage(
  folder: string,
  ownerId: string,
  image: Buffer,
  mimeType: string,
  thumbnail: Buffer | null = null
): Promise<StoredImage> {
  const baseKey = `${folder}/${ownerId}/${Random.id()}`;
  const imageKey = `${baseKey}.${getExtension(mimeType)}`;
  await putFile(imageKey, image, mimeType, PUBLIC_IMMUTABLE_FILE);

  let imageThumbnailKey: string | null = null;
  if (thumbnail) {
    imageThumbnailKey = `${baseKey}.thumb.jpg`;
    await putFile(
      imageThumbnailKey,
      thumbnail,
      'image/jpeg',
      PUBLIC_IMMUTABLE_FILE
    );
  }

  return { imageKey, imageThumbnailKey };
}

/**
 * URL of a stored image: its public object storage URL, or - for an image
 * not yet migrated - the legacy /download-file URL of its Attachments copy.
 */
export function getStoredImageUrl(
  imageKey: string | null | undefined,
  legacyAttachmentId: string | null | undefined
): string | null {
  if (imageKey) return getPublicFileUrl(imageKey);
  if (legacyAttachmentId) {
    return Meteor.absoluteUrl(
      `download-file?attachmentId=${encodeURIComponent(legacyAttachmentId)}`
    );
  }
  return null;
}
