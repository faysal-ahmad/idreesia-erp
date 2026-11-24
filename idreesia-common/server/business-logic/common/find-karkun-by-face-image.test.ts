import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ImageVectorStatus } from 'meteor/idreesia-common/constants';

const mocks = vi.hoisted(() => ({
  compute: vi.fn(),
  search: vi.fn(),
  settings: vi.fn(),
}));

// OpenCV and Atlas $vectorSearch only exist inside Meteor / Atlas.
vi.mock('./compute-image-vector-data', () => ({
  computeVectorFromImageBuffer: mocks.compute,
}));
vi.mock('./search-people-by-face-vector', () => ({
  searchPeopleByFaceVector: mocks.search,
}));
vi.mock('./person-images', () => ({
  getPersonImageUrls: () => ({ imageUrl: 'url' }),
}));
vi.mock('../admin/system-settings', () => ({
  getSelfAttendanceFaceSettings: mocks.settings,
}));

import { findKarkunByFaceImage } from './find-karkun-by-face-image';

const settings = {
  matchThreshold: 0.6,
  minMatchMargin: 0,
  minDetectionScore: 0.7,
  minFacePixels: 80,
  minSharpness: 35,
  minFacePose: 45,
};
const karkun = (id: string, score: number) => ({
  person: { _id: id, isKarkun: true, sharedData: { name: id } },
  score,
});

beforeEach(() => {
  mocks.compute.mockReset().mockReturnValue({
    status: ImageVectorStatus.COMPUTED,
    vector: [1],
  });
  mocks.search.mockReset();
  mocks.settings.mockReset().mockResolvedValue(settings);
});

describe('findKarkunByFaceImage settings', () => {
  it('passes the configured quality gates and threshold through', async () => {
    mocks.search.mockResolvedValue([karkun('a', 0.9)]);
    await findKarkunByFaceImage('abc');
    expect(mocks.compute).toHaveBeenCalledWith(expect.any(Buffer), {
      useLargestFace: true,
      minDetectionScore: 0.7,
      minFacePixels: 80,
      minSharpness: 35,
      minFacePose: 45,
    });
    expect(mocks.search).toHaveBeenCalledWith([1], 5, { minRawCosine: 0.6 });
  });

  it('matches when the margin is off, even with a close runner-up', async () => {
    mocks.search.mockResolvedValue([karkun('a', 0.7), karkun('b', 0.69)]);
    const result = await findKarkunByFaceImage('abc');
    expect(result.match?.personId).toBe('a');
  });

  it('refuses a match whose runner-up is within the margin', async () => {
    mocks.settings.mockResolvedValue({ ...settings, minMatchMargin: 0.1 });
    mocks.search.mockResolvedValue([karkun('a', 0.58), karkun('b', 0.55)]);
    expect(await findKarkunByFaceImage('abc')).toEqual({
      status: ImageVectorStatus.COMPUTED,
      match: null,
    });
  });

  it('accepts a match that clears the margin, or has no runner-up', async () => {
    mocks.settings.mockResolvedValue({ ...settings, minMatchMargin: 0.1 });
    mocks.search.mockResolvedValue([karkun('a', 0.72), karkun('b', 0.4)]);
    expect((await findKarkunByFaceImage('abc')).match?.personId).toBe('a');
    mocks.search.mockResolvedValue([karkun('a', 0.72)]);
    expect((await findKarkunByFaceImage('abc')).match?.personId).toBe('a');
  });

  it('treats a person with several records as one person', async () => {
    mocks.settings.mockResolvedValue({ ...settings, minMatchMargin: 0.1 });
    mocks.search.mockResolvedValue([karkun('a', 0.7), karkun('a', 0.69)]);
    expect((await findKarkunByFaceImage('abc')).match?.personId).toBe('a');
  });
});
