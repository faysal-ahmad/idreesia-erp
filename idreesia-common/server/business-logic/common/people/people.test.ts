import { describe, expect, it, vi } from 'vitest';

import {
  EntityType,
  OperationType,
} from 'meteor/idreesia-common/constants/audit';
import {
  AuditLogs,
  People,
  type PersonDocument,
} from 'meteor/idreesia-common/server/collections/common';

import {
  createPerson,
  getChangedPersonValues,
  isPersonValueChanged,
  removePerson,
  restorePerson,
  searchPeople,
  updatePerson,
} from './index';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

const user = { _id: 'u1' };

const newPerson = (sharedData: Record<string, unknown> = {}, extra = {}) =>
  createPerson(
    {
      dataSource: 'test',
      isVisitor: true,
      sharedData: { name: 'Ali', ...sharedData },
      ...extra,
    },
    user
  );

const auditLogsFor = (entityId: string) =>
  AuditLogs.find({ entityId }).fetchAsync();

describe('isPersonValueChanged', () => {
  it('compares dates by time, not by representation', () => {
    const date = new Date('2024-01-02T00:00:00Z');
    expect(isPersonValueChanged('birthDate', date.toISOString(), date)).toBe(
      false
    );
    expect(
      isPersonValueChanged('birthDate', new Date('2024-01-03T00:00:00Z'), date)
    ).toBe(true);
  });

  it('ignores the order of tag ids', () => {
    expect(isPersonValueChanged('tagIds', ['b', 'a'], ['a', 'b'])).toBe(false);
    expect(isPersonValueChanged('tagIds', ['a'], ['a', 'b'])).toBe(true);
  });

  it('treats two empty values as unchanged', () => {
    expect(isPersonValueChanged('name', null, undefined)).toBe(false);
  });
});

describe('getChangedPersonValues', () => {
  it('returns only changed values, keyed by their dotted path', () => {
    const existing = {
      _id: 'p1',
      isVisitor: true,
      sharedData: { name: 'Ali', contactNumber1: '123' },
      karkunData: { cityLocationId: 'c1' },
    };
    expect(
      getChangedPersonValues(
        {
          _id: 'p1',
          isVisitor: true,
          isKarkun: true,
          sharedData: { name: 'Ali', contactNumber1: '456' },
          karkunData: { cityLocationId: 'c1', mehfilLocationId: 'm1' },
        },
        existing
      )
    ).toEqual({
      isKarkun: true,
      'sharedData.contactNumber1': '456',
      'karkunData.mehfilLocationId': 'm1',
    });
  });
});

describe('createPerson', () => {
  it('requires a data source', async () => {
    await expect(
      createPerson({ sharedData: { name: 'Ali' } }, user)
    ).rejects.toThrow('Data Source is required');
  });

  it('rejects a CNIC or contact number another person has', async () => {
    await newPerson({ cnicNumber: '11111', contactNumber1: '0300' });
    await expect(newPerson({ cnicNumber: '11111' })).rejects.toThrow(
      'This CNIC number is already set for Ali.'
    );
    await expect(newPerson({ contactNumber2: '0300' })).rejects.toThrow(
      'This contact number is already set for Ali.'
    );
  });

  it('ignores deleted people when checking for duplicates', async () => {
    const person = await newPerson({ cnicNumber: '11111' });
    await removePerson(person!._id, user);
    await expect(newPerson({ cnicNumber: '11111' })).resolves.toBeTruthy();
  });

  it('stamps the creator and writes a create audit log', async () => {
    const person = await newPerson();
    expect(person).toMatchObject({ createdBy: 'u1', updatedBy: 'u1' });
    const logs = await auditLogsFor(person!._id);
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      entityType: EntityType.PERSON,
      operationType: OperationType.CREATE,
      operationBy: 'u1',
    });
  });
});

describe('updatePerson', () => {
  it('does nothing when no value changed', async () => {
    const person = await newPerson({ tagIds: ['a', 'b'] });
    await updatePerson(
      { _id: person!._id, sharedData: { name: 'Ali', tagIds: ['b', 'a'] } },
      user
    );
    expect(await auditLogsFor(person!._id)).toHaveLength(1);
  });

  it('saves the changes and audits them as from/to pairs', async () => {
    const person = await newPerson();
    const updated = await updatePerson(
      { _id: person!._id, sharedData: { name: 'Ahmed' } },
      { _id: 'u2' }
    );
    expect(updated).toMatchObject({
      sharedData: { name: 'Ahmed' },
      updatedBy: 'u2',
    });

    const update = (await auditLogsFor(person!._id)).find(
      log => log.operationType === OperationType.UPDATE
    );
    expect(update?.auditValues).toEqual([
      JSON.stringify({
        fieldName: 'sharedData.name',
        changedFrom: 'Ali',
        changedTo: 'Ahmed',
      }),
    ]);
  });

  it('audits a photo change without naming the stored files', async () => {
    const person = await newPerson();
    await updatePerson(
      { _id: person!._id, sharedData: { imageKey: 'people-images/x.jpg' } },
      user
    );
    const update = (await auditLogsFor(person!._id)).find(
      log => log.operationType === OperationType.UPDATE
    );
    expect(update?.auditValues).toEqual([
      JSON.stringify({
        fieldName: 'sharedData.image',
        changedTo: 'updated',
      }),
    ]);
  });

  it('allows a person to keep their own CNIC number', async () => {
    const person = await newPerson({ cnicNumber: '11111' });
    await expect(
      updatePerson(
        { _id: person!._id, sharedData: { cnicNumber: '11111', name: 'B' } },
        user
      )
    ).resolves.toMatchObject({ sharedData: { name: 'B' } });
  });
});

describe('removePerson / restorePerson', () => {
  it('soft-deletes and restores a person', async () => {
    const person = await newPerson();
    await removePerson(person!._id, user);
    expect(await People.findOneAsync(person!._id)).toMatchObject({
      deletedBy: 'u1',
    });

    await restorePerson(person!._id, user);
    const restored = await People.findOneAsync(person!._id);
    expect(restored?.deletedAt).toBeUndefined();
    expect(restored?.deletedBy).toBeUndefined();
  });
});

describe('searchPeople', () => {
  // Names in a search result: the plain list, or a page's `data`.
  const names = (result: unknown) => {
    const people = (Array.isArray(result)
      ? result
      : (result as { data: unknown[] }).data) as PersonDocument[];
    return people.map(person => person.sharedData.name).sort();
  };

  it('applies the tri-state include flags', async () => {
    await newPerson({ name: 'Visitor' }, { isVisitor: true });
    await newPerson({ name: 'Karkun' }, { isVisitor: false, isKarkun: true });
    await newPerson(
      { name: 'Both' },
      { isVisitor: true, isKarkun: true }
    );

    const onlyKarkuns = await searchPeople(
      {},
      { includeKarkuns: true, paginatedResults: false }
    );
    expect(names(onlyKarkuns)).toEqual(['Both', 'Karkun']);

    const karkunsNotVisitors = await searchPeople(
      {},
      { includeKarkuns: true, includeVisitors: false, paginatedResults: false }
    );
    expect(names(karkunsNotVisitors)).toEqual(['Karkun']);
  });

  it('returns deleted people only when asked', async () => {
    await newPerson({ name: 'Kept' });
    const gone = await newPerson({ name: 'Gone' });
    await removePerson(gone!._id, user);

    const active = await searchPeople({}, { paginatedResults: false });
    expect(names(active)).toEqual(['Kept']);

    const deleted = await searchPeople(
      {},
      { onlyDeleted: true, paginatedResults: false }
    );
    expect(names(deleted)).toEqual(['Gone']);
  });

  it('pages results sorted by name with a total count', async () => {
    await Promise.all(['C', 'A', 'B'].map(name => newPerson({ name })));
    const page = await searchPeople({ pageIndex: '1', pageSize: '2' });
    expect(page).toMatchObject({ totalResults: 3 });
    expect(names(page)).toEqual(['C']);
  });
});
