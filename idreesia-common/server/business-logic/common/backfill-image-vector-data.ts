import { People } from 'meteor/idreesia-common/server/collections/common';
import type { ProgressReporter } from 'meteor/idreesia-common/server/business-logic/jobs/report-progress';
import {
  computeImageVectorData,
  MODEL_VERSION,
} from './compute-image-vector-data';

// Sequential/blocking by design - these OpenCV calls aren't parallelizable without worker
// threads, and this is only ever run manually (no defaultSchedule - see job-definitions-registry.ts)
// precisely because of how long the initial backlog takes; see the "Backfill" section of the
// computing-face-vectors-in-idreesia-erp plan doc for the measured ~13-22 minute one-time cost.
export async function backfillImageVectorData(
  reportProgress?: ProgressReporter
): Promise<number> {
  let counter = 0;

  // Two groups need computing:
  //  - never attempted (no `imageVectorData` at all), and
  //  - computed by an older pipeline, identified by a `modelVersion` other than the current one.
  // The second case is what makes a pipeline correction deployable: embeddings from different
  // versions are not comparable, so every stale record has to be recomputed before a similarity
  // search over the collection means anything. It also re-attempts previously-errored images,
  // which is the desired behaviour after the pipeline itself has changed.
  const people = await People.find(
    {
      'sharedData.imageId': { $exists: true, $ne: null },
      $or: [
        { 'sharedData.imageVectorData': { $exists: false } },
        { 'sharedData.imageVectorData.modelVersion': { $ne: MODEL_VERSION } },
      ],
    },
    { fields: { 'sharedData.imageId': 1 } }
  ).fetchAsync();

  for (const { _id, sharedData } of people) {
    const imageVectorData = await computeImageVectorData(sharedData.imageId);
    await People.updateAsync(_id, {
      $set: { 'sharedData.imageVectorData': imageVectorData },
    });
    counter++;
    await reportProgress?.(counter / people.length);
  }

  return counter;
}
