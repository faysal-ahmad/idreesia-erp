import { afterEach, describe, expect, it, vi } from 'vitest';

import { People } from 'meteor/idreesia-common/server/collections/common';

import { searchPeopleByFaceVector } from './search-people-by-face-vector';

// Atlas $vectorSearch only exists on Atlas: feed in scored candidates instead. Scores are in
// Atlas's normalised (1 + cosine) / 2 space.
const toAtlas = (cosine: number) => (1 + cosine) / 2;
const candidate = (_id: string, cosine: number) => ({ _id, score: toAtlas(cosine) });
const vector = Array.from({ length: 128 }, () => 0.1);

const mockCandidates = (...candidates: ReturnType<typeof candidate>[]) =>
  vi.spyOn(People, 'aggregate').mockResolvedValue(candidates as never);

afterEach(() => {
  vi.restoreAllMocks();
});

describe('searchPeopleByFaceVector', () => {
  it('drops candidates under the default threshold', async () => {
    mockCandidates(candidate('a', 0.7), candidate('b', 0.4));
    const matches = await searchPeopleByFaceVector(vector);
    expect(matches.map(({ person }) => person._id)).toEqual(['a']);
  });

  it('uses the threshold it is given', async () => {
    mockCandidates(candidate('a', 0.7), candidate('b', 0.55));
    const matches = await searchPeopleByFaceVector(vector, 5, { minRawCosine: 0.6 });
    expect(matches.map(({ person }) => person._id)).toEqual(['a']);
  });

  it('returns all matches when the margin is off', async () => {
    mockCandidates(candidate('a', 0.7), candidate('b', 0.69));
    expect(await searchPeopleByFaceVector(vector)).toHaveLength(2);
  });

  it('returns nothing when the runner-up is within the margin', async () => {
    mockCandidates(candidate('a', 0.58), candidate('b', 0.55));
    expect(await searchPeopleByFaceVector(vector, 5, { minMargin: 0.1 })).toEqual([]);
  });

  it('returns the matches when the best is clear of the runner-up, or alone', async () => {
    mockCandidates(candidate('a', 0.72), candidate('b', 0.55));
    expect(await searchPeopleByFaceVector(vector, 5, { minMargin: 0.1 })).toHaveLength(2);
    mockCandidates(candidate('a', 0.58));
    expect(await searchPeopleByFaceVector(vector, 5, { minMargin: 0.1 })).toHaveLength(1);
  });
});
