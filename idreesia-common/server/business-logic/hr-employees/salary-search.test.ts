import { describe, expect, it } from 'vitest';

import { Salaries } from 'meteor/idreesia-common/server/collections/hr';

import { getPagedSalariesByKarkun } from './salary-search';

const seed = async () => {
  for (let day = 1; day <= 5; day += 1) {
    await Salaries.insertAsync({
      _id: `s${day}`,
      karkunId: 'k1',
      month: `0${day}-2024`,
      createdAt: new Date(2024, 0, day),
    } as any);
  }
  await Salaries.insertAsync({
    _id: 'other',
    karkunId: 'k2',
    createdAt: new Date(2024, 0, 9),
  } as any);
};

describe('getPagedSalariesByKarkun', () => {
  it.each([
    ['karkunId=k1', ['s5', 's4', 's3', 's2', 's1'], 5],
    ['karkunId=k1&pageSize=2', ['s5', 's4'], 5],
    ['karkunId=k1&pageSize=2&pageIndex=1', ['s3', 's2'], 5],
    ['karkunId=k1&pageSize=2&pageIndex=2', ['s1'], 5],
    ['karkunId=k1&pageSize=2&pageIndex=9', [], 5],
    ['karkunId=k2', ['other'], 1],
    ['karkunId=none', [], 0],
  ])('%s', async (query, ids, total) => {
    await seed();
    const result = await getPagedSalariesByKarkun(query);
    expect(result.salaries.map((s: any) => s._id)).toEqual(ids);
    expect(result.totalResults).toBe(total);
  });
});
