import sharp from 'sharp';

import { Attachments } from 'meteor/idreesia-common/server/collections/common';

// 2x the largest avatar display size (80px, in person-name.tsx) for retina.
const THUMBNAIL_SIZE = 160;
const THUMBNAIL_JPEG_QUALITY = 80;

export async function generateImageThumbnail(
  attachmentId: string
): Promise<string | null> {
  try {
    const attachment = await Attachments.findOneAsync(attachmentId);
    if (!attachment || !attachment.mimeType.startsWith('image/')) {
      return null;
    }

    const thumbnailBuffer = await sharp(Buffer.from(attachment.data, 'base64'))
      .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, { fit: 'cover' })
      .jpeg({ quality: THUMBNAIL_JPEG_QUALITY })
      .toBuffer();

    return await Attachments.insertAsync({
      name: attachment.name ? `thumb-${attachment.name}` : 'thumbnail.jpg',
      mimeType: 'image/jpeg',
      data: thumbnailBuffer.toString('base64'),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`generateImageThumbnail failed for attachment ${attachmentId}:`, error);
    return null;
  }
}
