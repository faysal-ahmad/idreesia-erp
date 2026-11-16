import { describe, expect, it } from 'vitest';

import { People } from 'meteor/idreesia-common/server/collections/common';

import { findDuplicateCnics, findDuplicatePhoneNumbers } from './duplicate-people';

const addPerson = (
  _id: string,
  sharedData: Record<string, unknown>,
  extra: Record<string, unknown> = {}
) =>
  (
    People.rawCollection() as unknown as {
      insertOne(d: object): Promise<unknown>;
    }
  ).insertOne({ _id, sharedData: { name: _id, ...sharedData }, ...extra });

type Group = { value: string; count: number; people: Array<{ _id: string }> };

const idsOf = (group: Group) => group.people.map(person => person._id).sort();

describe('findDuplicateCnics', () => {
  it('groups people who share a CNIC number', async () => {
    await addPerson('a', { cnicNumber: '111' });
    await addPerson('b', { cnicNumber: '111' });
    await addPerson('c', { cnicNumber: '111' });
    await addPerson('d', { cnicNumber: '222' });
    await addPerson('e', { cnicNumber: '222' });
    await addPerson('f', { cnicNumber: '333' });

    const groups = (await findDuplicateCnics()) as unknown as Group[];
    expect(groups.map(group => [group.value, group.count])).toEqual([
      ['111', 3],
      ['222', 2],
    ]);
    expect(idsOf(groups[0])).toEqual(['a', 'b', 'c']);
  });

  it('ignores deleted people and empty CNIC numbers', async () => {
    await addPerson('a', { cnicNumber: '111' });
    await addPerson('b', { cnicNumber: '111' }, { deletedAt: new Date() });
    await addPerson('c', { cnicNumber: '' });
    await addPerson('d', { cnicNumber: '' });
    await addPerson('e', {});
    await addPerson('f', {});

    expect(await findDuplicateCnics()).toEqual([]);
  });
});

describe('findDuplicatePhoneNumbers', () => {
  it('matches a number in either contact field', async () => {
    await addPerson('a', { contactNumber1: '0300' });
    await addPerson('b', { contactNumber2: '0300' });
    await addPerson('c', { contactNumber1: '0311' });

    const groups = (await findDuplicatePhoneNumbers()) as unknown as Group[];
    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({ value: '0300', count: 2 });
    expect(idsOf(groups[0])).toEqual(['a', 'b']);
  });

  it('does not count a person twice for the same number in both fields', async () => {
    await addPerson('a', { contactNumber1: '0300', contactNumber2: '0300' });
    expect(await findDuplicatePhoneNumbers()).toEqual([]);
  });

  it('ignores deleted people and empty numbers', async () => {
    await addPerson('a', { contactNumber1: '0300' });
    await addPerson('b', { contactNumber1: '0300' }, { deletedAt: new Date() });
    await addPerson('c', { contactNumber1: '', contactNumber2: '' });
    await addPerson('d', { contactNumber1: '', contactNumber2: '' });

    expect(await findDuplicatePhoneNumbers()).toEqual([]);
  });
});
