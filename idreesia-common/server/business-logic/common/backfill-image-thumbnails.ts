import { People } from 'meteor/idreesia-common/server/collections/common';
import type { ProgressReporter } from 'meteor/idreesia-common/server/business-logic/jobs/report-progress';
import { generateImageThumbnail } from './generate-image-thumbnail';

export async function backfillImageThumbnails(
  reportProgress?: ProgressReporter
): Promise<number> {
  let counter = 0;

  const people = await People.find(
    {
      'sharedData.imageId': { $exists: true, $ne: null },
      'sharedData.imageThumbnailId': { $exists: false },
    },
    { fields: { 'sharedData.imageId': 1 } }
  ).fetchAsync();

  for (const { _id, sharedData } of people) {
    const thumbnailId = await generateImageThumbnail(sharedData.imageId);
    if (thumbnailId) {
      await People.updateAsync(_id, {
        $set: { 'sharedData.imageThumbnailId': thumbnailId },
      });
    }
    counter++;
    await reportProgress?.(counter / people.length);
  }

  return counter;
}
