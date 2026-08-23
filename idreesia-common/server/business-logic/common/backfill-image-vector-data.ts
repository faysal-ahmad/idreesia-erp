import { People } from 'meteor/idreesia-common/server/collections/common';
import { computeImageVectorData } from './compute-image-vector-data';

// Sequential/blocking by design - these OpenCV calls aren't parallelizable without worker
// threads, and this is only ever run manually (no defaultSchedule - see job-definitions-registry.ts)
// precisely because of how long the initial backlog takes; see the "Backfill" section of the
// computing-face-vectors-in-idreesia-erp plan doc for the measured ~13-22 minute one-time cost.
export async function backfillImageVectorData(): Promise<number> {
  let counter = 0;

  // A person only ever lacks `imageVectorData` entirely if it's never been attempted -
  // computeImageVectorData() always returns a status (including 'error') and every call site
  // writes that result, so this condition alone already excludes previously-errored images
  // from being retried here.
  const people = await People.find(
    {
      'sharedData.imageId': { $exists: true, $ne: null },
      'sharedData.imageVectorData': { $exists: false },
    },
    { fields: { 'sharedData.imageId': 1 } }
  ).fetchAsync();

  for (const { _id, sharedData } of people) {
    const imageVectorData = await computeImageVectorData(sharedData.imageId);
    await People.updateAsync(_id, {
      $set: { 'sharedData.imageVectorData': imageVectorData },
    });
    counter++;
  }

  return counter;
}
