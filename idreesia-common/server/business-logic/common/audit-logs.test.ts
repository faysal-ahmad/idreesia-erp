import { describe, expect, it } from 'vitest';

import { AuditLogs } from 'meteor/idreesia-common/server/collections/common';

import { createAuditLog, getAuditValues, searchAuditLogs } from './audit-logs';

describe('getAuditValues', () => {
  it('records each field as a from/to pair', () => {
    expect(
      getAuditValues(
        { 'sharedData.name': 'Ahmed' },
        { sharedData: { name: 'Ali' } }
      )
    ).toEqual([
      JSON.stringify({
        fieldName: 'sharedData.name',
        changedFrom: 'Ali',
        changedTo: 'Ahmed',
      }),
    ]);
  });

  it('skips fields that are empty before and after', () => {
    expect(getAuditValues({ notes: '', other: null }, { notes: null })).toEqual(
      []
    );
  });
});

describe('createAuditLog', () => {
  const entry = {
    entityId: 'e1',
    entityType: 'person',
    operationType: 'update',
    operationBy: 'u1',
    operationTime: new Date(),
    auditValues: { name: 'B' },
  };

  it('stores the values as given without an existing entity', async () => {
    await createAuditLog(entry);
    const [log] = await AuditLogs.find({}).fetchAsync();
    expect(log.auditValues).toEqual({ name: 'B' });
  });

  it('stores from/to pairs with an existing entity', async () => {
    await createAuditLog(entry, { name: 'A' });
    const [log] = await AuditLogs.find({}).fetchAsync();
    expect(log.auditValues).toEqual([
      JSON.stringify({ fieldName: 'name', changedFrom: 'A', changedTo: 'B' }),
    ]);
  });
});

describe('searchAuditLogs', () => {
  it('filters by entity and type, newest first, with paging', async () => {
    const at = (minutes: number) => new Date(Date.UTC(2024, 0, 1, 0, minutes));
    const log = (entityId: string, entityType: string, minutes: number) =>
      createAuditLog({
        entityId,
        entityType,
        operationType: 'update',
        operationBy: 'u1',
        operationTime: at(minutes),
      });
    await log('e1', 'person', 1);
    await log('e1', 'person', 2);
    await log('e1', 'person', 3);
    await log('e1', 'city', 4);
    await log('e2', 'person', 5);

    const result = await searchAuditLogs({
      entityId: 'e1',
      entityTypes: ['person'],
      pageIndex: '0',
      pageSize: '2',
    });
    expect(result.totalResults).toBe(3);
    expect(result.data.map(entry => entry.operationTime)).toEqual([
      at(3),
      at(2),
    ]);
  });
});
