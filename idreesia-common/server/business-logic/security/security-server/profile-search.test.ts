import { beforeEach, describe, expect, it } from 'vitest';

import { SecurityServerProfiles } from 'meteor/idreesia-common/server/collections/security';

import { getSecurityServerProfiles } from './profile-search';

const add = (_id: string, name: string, extra: Record<string, unknown> = {}) =>
  (SecurityServerProfiles.rawCollection() as any).insertOne({
    _id,
    name,
    isTest: false,
    images: [],
    ...extra,
  } as any);

const ids = async (filter = {}) =>
  (await getSecurityServerProfiles(filter)).data.map((p: any) => p._id);

beforeEach(async () => {
  await add('p1', 'Bilal');
  await add('p2', 'Ahmed');
  await add('p3', 'Test Person', { isTest: true });
  await add('p4', 'Deleted One', { deletedAt: new Date() });
});

describe('getSecurityServerProfiles', () => {
  it('lists active, non-test profiles by name', async () => {
    const { data, totalResults } = await getSecurityServerProfiles();
    expect(data.map((p: any) => p.name)).toEqual(['Ahmed', 'Bilal']);
    expect(totalResults).toBe(2);
  });

  it('includes test and deleted profiles only when asked', async () => {
    expect(await ids({ includeTest: 'true' })).toEqual(['p2', 'p1', 'p3']);
    expect(await ids({ includeDeleted: 'true' })).toEqual(['p2', 'p1', 'p4']);
    expect(await ids({ includeTest: 'true', includeDeleted: 'true' })).toHaveLength(4);
    expect(await ids({ includeTest: 'false' })).toEqual(['p2', 'p1']);
  });

  it('searches the name case-insensitively', async () => {
    expect(await ids({ name: 'BIL' })).toEqual(['p1']);
    expect(await ids({ name: 'zzz' })).toEqual([]);
  });

  it('treats the search text literally, not as a pattern', async () => {
    expect(await ids({ name: '.*' })).toEqual([]);
    await add('p5', 'A.B (x)');
    expect(await ids({ name: '(x)' })).toEqual(['p5']);
  });

  it('pages the results but counts all of them', async () => {
    const page = await getSecurityServerProfiles({ pageIndex: '1', pageSize: '1' });
    expect(page.data.map((p: any) => p._id)).toEqual(['p1']);
    expect(page.totalResults).toBe(2);
  });

  it('rejects invalid paging values', async () => {
    await expect(getSecurityServerProfiles({ pageIndex: 'x' })).rejects.toThrow(
      'pageIndex or pageSize'
    );
  });
});
