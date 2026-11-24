import { beforeEach, describe, expect, it, vi } from 'vitest';

import { People } from 'meteor/idreesia-common/server/collections/common';

import { updatePeopleRegistrationImageSettings } from '../admin/system-settings';
import { backfillImageVectorData } from './backfill-image-vector-data';

const compute = vi.hoisted(() => ({
  calls: [] as { key: unknown; options: unknown }[],
}));

// Face recognition needs native OpenCV, which only exists inside Meteor.
vi.mock('./compute-image-vector-data', () => ({
  MODEL_VERSION: 'current',
  computeImageVectorData: async (data: { imageKey?: string }, options: unknown) => {
    compute.calls.push({ key: data.imageKey, options });
    return { status: 'computed', modelVersion: 'current', computedAt: new Date(0) };
  },
}));
vi.mock('./face-detection', () => ({ unloadFaceDetectionModel: () => undefined }));
vi.mock('./face-recognition', () => ({ unloadFaceRecognitionModel: () => undefined }));

const addPerson = (_id: string, sharedData: Record<string, unknown>) =>
  (
    People.rawCollection() as unknown as { insertOne(d: object): Promise<unknown> }
  ).insertOne({ _id, sharedData });

beforeEach(() => {
  compute.calls = [];
});

describe('backfillImageVectorData', () => {
  it('computes with the default People Registration settings', async () => {
    await addPerson('p1', { imageKey: 'k1' });
    expect(await backfillImageVectorData()).toBe(1);
    expect(compute.calls).toEqual([
      {
        key: 'k1',
        options: { minDetectionScore: 0.6, minFacePixels: 96, minSharpness: 50, minFacePose: 60 },
      },
    ]);
  });

  it('computes with the saved People Registration settings', async () => {
    await addPerson('p1', { imageKey: 'k1' });
    await updatePeopleRegistrationImageSettings(
      { minDetectionScore: 0.8, minFacePixels: 120, minSharpness: 45, minFacePose: 55 },
      { _id: 'u1' }
    );
    await backfillImageVectorData();
    expect(compute.calls[0].options).toEqual({
      minDetectionScore: 0.8,
      minFacePixels: 120,
      minSharpness: 45,
      minFacePose: 55,
    });
  });

  it('skips people whose vector is already current', async () => {
    await addPerson('p1', {
      imageKey: 'k1',
      imageVectorData: { status: 'computed', modelVersion: 'current' },
    });
    expect(await backfillImageVectorData()).toBe(0);
    expect(compute.calls).toEqual([]);
  });
});
