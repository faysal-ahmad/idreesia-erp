import { describe, expect, it, vi } from 'vitest';

import {
  EntityType,
  OperationType,
} from 'meteor/idreesia-common/constants/audit';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import {
  AuditLogs,
  Attachments,
  People,
} from 'meteor/idreesia-common/server/collections/common';
import { Committees } from 'meteor/idreesia-common/server/collections/admin';
import { DutyDayAttendances, Salaries, Teams } from 'meteor/idreesia-common/server/collections/hr';
import {
  MehfilKarkuns,
  VisitorStays,
} from 'meteor/idreesia-common/server/collections/security';

import { getPersonRelationCounts, hasNonOwnedRelations } from './get-person-relation-counts';
import { hardDeletePerson } from './hard-delete-person';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

// Face recognition needs native OpenCV, which the committee code pulls in.
vi.mock('meteor/idreesia-common/server/business-logic/common/compute-image-vector-data', () => ({
  computeVectorFromImageBuffer: vi.fn(),
}));

const user = { _id: 'admin' };

// Fixtures go straight to the driver: these tests are about relations, not
// about the schemas of the related collections.
const raw = (collection: { rawCollection(): unknown }, doc: object) =>
  (collection.rawCollection() as { insertOne(d: object): Promise<unknown> }).insertOne(doc);

const insertPerson = (_id: string, fields: object = {}) =>
  raw(People, { _id, sharedData: { name: _id }, ...fields });

const countOf = (
  counts: Record<string, { counts: Array<{ name: string; count: number }> }>,
  personId: string,
  name: string
) => counts[personId].counts.find(c => c.name === name)?.count;

describe('getPersonRelationCounts', () => {
  it('counts each relation per person, with a total', async () => {
    await raw(Salaries, { _id: 's1', karkunId: 'p1' });
    await raw(Salaries, { _id: 's2', karkunId: 'p1' });
    await raw(Teams, { _id: 't1', members: [{ karkunId: 'p1' }, { karkunId: 'p2' }] });
    await raw(Committees, { _id: 'c1', members: [{ karkunId: 'p2' }] });
    await raw(VisitorStays, { _id: 'v1', visitorId: 'p1' });
    await raw(Users, { _id: 'user1', personId: 'p2' });
    await raw(AuditLogs, { _id: 'a1', entityId: 'p1' });

    const counts = await getPersonRelationCounts(['p1', 'p2', 'p3']);

    expect(countOf(counts, 'p1', 'Salary Records')).toBe(2);
    expect(countOf(counts, 'p1', 'Team Memberships')).toBe(1);
    expect(countOf(counts, 'p1', 'Stay History')).toBe(1);
    expect(countOf(counts, 'p1', 'Audit Logs')).toBe(1);
    expect(counts.p1.total).toBe(5);
    expect(countOf(counts, 'p2', 'Team Memberships')).toBe(1);
    expect(countOf(counts, 'p2', 'Committee Memberships')).toBe(1);
    expect(countOf(counts, 'p2', 'User Account')).toBe(1);
    expect(counts.p3.total).toBe(0);
  });

  it('counts a form once when the person is on it in two roles', async () => {
    const { IssuanceForms } = await import(
      'meteor/idreesia-common/server/collections/inventory'
    );
    await raw(IssuanceForms, { _id: 'f1', issuedBy: 'p1', issuedTo: 'p1' });
    await raw(IssuanceForms, { _id: 'f2', issuedBy: 'p1', issuedTo: 'p2' });

    const counts = await getPersonRelationCounts(['p1', 'p2']);
    expect(countOf(counts, 'p1', 'Issuance Forms')).toBe(2);
    expect(countOf(counts, 'p2', 'Issuance Forms')).toBe(1);
  });
});

describe('hasNonOwnedRelations', () => {
  it('only blocks on relations the person does not own', () => {
    expect(hasNonOwnedRelations([{ name: 'Team Memberships', count: 3 }])).toBe(false);
    expect(hasNonOwnedRelations([{ name: 'Salary Records', count: 0 }])).toBe(false);
    expect(hasNonOwnedRelations([{ name: 'User Account', count: 1 }])).toBe(true);
  });
});

describe('hardDeletePerson', () => {
  it('skips a person who was not soft deleted', async () => {
    await insertPerson('p1');
    expect(await hardDeletePerson('p1', user)).toBe(0);
    expect(await People.findOneAsync('p1')).toBeDefined();
  });

  it('skips a person that does not exist', async () => {
    expect(await hardDeletePerson('missing', user)).toBe(0);
  });

  it.each([
    ['Salaries', () => raw(Salaries, { _id: 's', karkunId: 'p1' })],
    ['a user account', () => raw(Users, { _id: 'acct', personId: 'p1' })],
  ])('skips a person who still has %s', async (_label, addRelation) => {
    await insertPerson('p1', { deletedAt: new Date() });
    await addRelation();
    await raw(VisitorStays, { _id: 'v1', visitorId: 'p1' });

    expect(await hardDeletePerson('p1', user)).toBe(0);
    expect(await People.findOneAsync('p1')).toBeDefined();
    expect(await VisitorStays.findOneAsync('v1')).toBeDefined();
  });

  it('deletes the person with the records they own, and audits the delete', async () => {
    await insertPerson('p1', { deletedAt: new Date() });
    await insertPerson('p2');
    await raw(Teams, { _id: 't1', members: [{ karkunId: 'p1' }, { karkunId: 'p2' }] });
    await raw(DutyDayAttendances, {
      _id: 'd1',
      karkuns: [{ karkunId: 'p1' }, { karkunId: 'p2' }],
    });
    await raw(Committees, { _id: 'c1', members: [{ karkunId: 'p1' }, { karkunId: 'p2' }] });
    await raw(VisitorStays, { _id: 'v1', visitorId: 'p1' });
    await raw(VisitorStays, { _id: 'v2', visitorId: 'p2' });
    await raw(MehfilKarkuns, { _id: 'm1', karkunId: 'p1' });
    await raw(AuditLogs, { _id: 'old', entityId: 'p1' });

    expect(await hardDeletePerson('p1', user)).toBe(1);

    expect(await People.findOneAsync('p1')).toBeUndefined();
    expect(await People.findOneAsync('p2')).toBeDefined();
    expect((await Teams.findOneAsync('t1'))?.members).toEqual([{ karkunId: 'p2' }]);
    expect((await DutyDayAttendances.findOneAsync('d1'))?.karkuns).toEqual([
      { karkunId: 'p2' },
    ]);
    expect((await Committees.findOneAsync('c1'))?.members).toEqual([{ karkunId: 'p2' }]);
    expect(await VisitorStays.findOneAsync('v1')).toBeUndefined();
    expect(await VisitorStays.findOneAsync('v2')).toBeDefined();
    expect(await MehfilKarkuns.findOneAsync('m1')).toBeUndefined();

    // Earlier audit logs go; the delete itself is the one left.
    const logs = await AuditLogs.find({ entityId: 'p1' }).fetchAsync();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      entityType: EntityType.PERSON,
      operationType: OperationType.DELETE,
      operationBy: 'admin',
    });
  });

  it('removes the person attachments along with them', async () => {
    await raw(Attachments, { _id: 'att1', fileKey: 'profile-attachments/att1.pdf' });
    await insertPerson('p1', {
      deletedAt: new Date(),
      karkunData: { attachmentIds: ['att1'] },
    });
    await hardDeletePerson('p1', user);
    expect(await Attachments.findOneAsync('att1')).toBeUndefined();
  });

  it('leaves everything in place when the audit log cannot be written', async () => {
    await insertPerson('p1', { deletedAt: new Date() });
    await raw(Teams, { _id: 't1', members: [{ karkunId: 'p1' }] });
    await raw(VisitorStays, { _id: 'v1', visitorId: 'p1' });
    await raw(AuditLogs, { _id: 'old', entityId: 'p1' });
    vi.spyOn(AuditLogs, 'insertAsync').mockRejectedValueOnce(new Error('boom'));

    await expect(hardDeletePerson('p1', user)).rejects.toThrow('boom');

    expect(await People.findOneAsync('p1')).toBeDefined();
    expect((await Teams.findOneAsync('t1'))?.members).toHaveLength(1);
    expect(await VisitorStays.findOneAsync('v1')).toBeDefined();
    expect(await AuditLogs.findOneAsync('old')).toBeDefined();
  });
});
