import { describe, expect, it } from 'vitest';

import { EntityType } from 'meteor/idreesia-common/constants/audit';
import { AuditLogs, People } from 'meteor/idreesia-common/server/collections/common';

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

describe('searchAuditLogs with a person selector', () => {
  const log = (entityId: string, entityType: string, minute: number) =>
    AuditLogs.insertAsync({
      entityId,
      entityType,
      operationType: 'update',
      operationBy: 'u1',
      operationTime: new Date(2026, 0, 1, 0, minute),
    } as any);

  it("adds the person entries of the matching people to the module's own", async () => {
    const raw = People.rawCollection() as any;
    await raw.insertOne({ _id: 'karkun', isKarkun: true, sharedData: { name: 'K' } });
    await raw.insertOne({ _id: 'visitor', isVisitor: true, sharedData: { name: 'V' } });
    await log('karkun', EntityType.KARKUN, 1);
    await log('karkun', EntityType.PERSON, 2);
    await log('visitor', EntityType.PERSON, 3);
    await log('karkun', EntityType.EMPLOYEE, 4);

    const result = await searchAuditLogs({
      entityTypes: [EntityType.KARKUN],
      personEntitySelector: { isKarkun: true },
    });

    expect(result.totalResults).toBe(2);
    expect(result.data.map(row => row.entityType)).toEqual([
      EntityType.PERSON,
      EntityType.KARKUN,
    ]);
    expect(result.data[0]).not.toHaveProperty('scopedPerson');
  });

  it('leaves person entries out without a selector', async () => {
    await log('someone', EntityType.PERSON, 1);
    await log('someone', EntityType.KARKUN, 2);

    const result = await searchAuditLogs({ entityTypes: [EntityType.KARKUN] });
    expect(result.data.map(row => row.entityType)).toEqual([EntityType.KARKUN]);
  });
});
