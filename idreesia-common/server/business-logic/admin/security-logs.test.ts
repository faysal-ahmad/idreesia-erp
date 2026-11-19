import { describe, expect, it } from 'vitest';

import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';

import { searchSecurityLogs } from './security-logs';

const log = (
  fields: Record<string, unknown>,
  day: number
): Promise<string> =>
  SecurityLogs.insertAsync({
    operationType: 'LOGIN',
    dataSource: 'web',
    operationTime: new Date(Date.UTC(2024, 0, day)),
    ...fields,
  } as never);

const days = (result: { data: Array<{ operationTime: Date }> }) =>
  result.data.map(row => row.operationTime.getUTCDate());

describe('searchSecurityLogs', () => {
  it('returns the newest entries first with a total count', async () => {
    await log({}, 1);
    await log({}, 3);
    await log({}, 2);

    const result = await searchSecurityLogs();
    expect(result.totalResults).toBe(3);
    expect(days(result)).toEqual([3, 2, 1]);
  });

  it('filters by data source, operation type and user', async () => {
    await log({ dataSource: 'web', userId: 'a' }, 1);
    await log({ dataSource: 'mobile', userId: 'b' }, 2);
    await log({ operationType: 'PASSWORD_RESET', userId: 'a' }, 3);

    expect(
      days(await searchSecurityLogs({ dataSources: ['mobile'] }))
    ).toEqual([2]);
    expect(
      days(await searchSecurityLogs({ operationTypes: ['PASSWORD_RESET'] }))
    ).toEqual([3]);
    expect(days(await searchSecurityLogs({ userIds: ['a'] }))).toEqual([3, 1]);
  });

  it('ignores empty filter lists', async () => {
    await log({}, 1);
    const result = await searchSecurityLogs({
      dataSources: [],
      operationTypes: [],
      userIds: [],
    });
    expect(result.totalResults).toBe(1);
  });

  it('filters by an inclusive date range', async () => {
    for (const day of [1, 2, 3, 4]) await log({}, day);

    expect(
      days(await searchSecurityLogs({ startDate: new Date(Date.UTC(2024, 0, 2)) }))
    ).toEqual([4, 3, 2]);
    expect(
      days(await searchSecurityLogs({ endDate: new Date(Date.UTC(2024, 0, 3)) }))
    ).toEqual([3, 2, 1]);
    const both = await searchSecurityLogs({
      startDate: new Date(Date.UTC(2024, 0, 2)),
      endDate: new Date(Date.UTC(2024, 0, 3)),
    });
    expect(both.totalResults).toBe(2);
  });

  it('pages the results but counts all of them', async () => {
    for (const day of [1, 2, 3]) await log({}, day);
    const page = await searchSecurityLogs({ pageIndex: '1', pageSize: '2' });
    expect(page.totalResults).toBe(3);
    expect(days(page)).toEqual([1]);
  });
});
