import { beforeEach, describe, expect, it } from 'vitest';

import { SecurityServerAlerts } from 'meteor/idreesia-common/server/collections/security';

import {
  getSecurityServerAlertGroups,
  getSecurityServerAlerts,
  NOT_REVIEWED,
} from './alert-search';

const add = (
  _id: string,
  profileId: string,
  timestamp: string,
  extra: Record<string, unknown> = {}
) =>
  (SecurityServerAlerts.rawCollection() as any).insertOne({
    _id,
    profileId,
    profileName: `name-${profileId}`,
    profileIsTest: false,
    channelId: 'ch1',
    timestamp: new Date(timestamp),
    imageKey: `img-${_id}`,
    thumbnailKey: `thumb-${_id}`,
    ...extra,
  } as any);

const ids = async (filter = {}) =>
  (await getSecurityServerAlerts(filter)).data.map((a: any) => a._id);

beforeEach(async () => {
  await add('a1', 'p1', '2024-03-01T10:00:00');
  await add('a2', 'p1', '2024-03-02T10:00:00', { review: 'CORRECT' });
  await add('a3', 'p2', '2024-03-03T10:00:00', { channelId: 'ch2', review: 'FALSE_POSITIVE' });
  await add('a4', 'p3', '2024-03-04T10:00:00', { profileIsTest: true });
});

describe('getSecurityServerAlerts', () => {
  it('lists newest first and hides test-profile alerts by default', async () => {
    const { data, totalResults } = await getSecurityServerAlerts();
    expect(data.map((a: any) => a._id)).toEqual(['a3', 'a2', 'a1']);
    expect(totalResults).toBe(3);
  });

  it('includes test alerts when asked', async () => {
    expect(await ids({ includeTest: 'true' })).toEqual(['a4', 'a3', 'a2', 'a1']);
  });

  it('shows a test profile alerts when that profile is asked for explicitly', async () => {
    expect(await ids({ profileId: 'p3' })).toEqual(['a4']);
  });

  it('filters by profile and channel', async () => {
    expect(await ids({ profileId: 'p1' })).toEqual(['a2', 'a1']);
    expect(await ids({ channelId: 'ch2' })).toEqual(['a3']);
    expect(await ids({ profileId: 'p1', channelId: 'ch2' })).toEqual([]);
  });

  it('filters by review state, including not reviewed', async () => {
    expect(await ids({ review: 'CORRECT' })).toEqual(['a2']);
    expect(await ids({ review: 'FALSE_POSITIVE' })).toEqual(['a3']);
    expect(await ids({ review: NOT_REVIEWED })).toEqual(['a1']);
  });

  it('filters by whole days at both ends', async () => {
    expect(await ids({ startDate: '02-03-2024' })).toEqual(['a3', 'a2']);
    expect(await ids({ endDate: '02-03-2024' })).toEqual(['a2', 'a1']);
    expect(await ids({ startDate: '02-03-2024', endDate: '02-03-2024' })).toEqual(['a2']);
  });

  it('pages the results but counts all of them', async () => {
    const page = await getSecurityServerAlerts({ pageIndex: '1', pageSize: '2' });
    expect(page.data.map((a: any) => a._id)).toEqual(['a1']);
    expect(page.totalResults).toBe(3);
  });

  it('rejects invalid paging values', async () => {
    await expect(getSecurityServerAlerts({ pageSize: 'many' })).rejects.toThrow(
      'pageIndex or pageSize'
    );
  });
});

describe('getSecurityServerAlertGroups', () => {
  it('rolls alerts up per profile, most recently seen first', async () => {
    const { data, totalResults } = await getSecurityServerAlertGroups();
    expect(totalResults).toBe(2);
    expect(data.map((g: any) => g.profileId)).toEqual(['p2', 'p1']);
    expect(data[1]).toMatchObject({
      profileId: 'p1',
      profileName: 'name-p1',
      alertCount: 2,
      notReviewedCount: 1,
      firstTimestamp: new Date('2024-03-01T10:00:00'),
      lastTimestamp: new Date('2024-03-02T10:00:00'),
      latestImageKey: 'img-a2',
      latestThumbnailKey: 'thumb-a2',
    });
  });

  it('applies the same filters as the flat list', async () => {
    const { data } = await getSecurityServerAlertGroups({ review: NOT_REVIEWED });
    expect(data.map((g: any) => g.profileId)).toEqual(['p1']);
    expect((data[0] as any).alertCount).toBe(1);
    expect((await getSecurityServerAlertGroups({ includeTest: 'true' })).totalResults).toBe(3);
  });

  it('pages the groups', async () => {
    const page = await getSecurityServerAlertGroups({ pageIndex: '1', pageSize: '1' });
    expect(page.data.map((g: any) => g.profileId)).toEqual(['p1']);
    expect(page.totalResults).toBe(2);
  });
});
