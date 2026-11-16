import { describe, expect, it } from 'vitest';

import { People } from 'meteor/idreesia-common/server/collections/common';

import {
  assertCnicNotInUse,
  assertContactNotInUse,
  isCnicInUse,
  isContactNumberInUse,
} from './person-uniqueness';

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

describe('isCnicInUse', () => {
  it('is true for a person who is not deleted', async () => {
    await addPerson('a', { cnicNumber: '111' });
    expect(await isCnicInUse('111')).toBe(true);
    expect(await isCnicInUse('222')).toBe(false);
  });

  it('ignores deleted people', async () => {
    await addPerson('a', { cnicNumber: '111' }, { deletedAt: new Date() });
    expect(await isCnicInUse('111')).toBe(false);
  });
});

describe('isContactNumberInUse', () => {
  it('checks both contact number fields', async () => {
    await addPerson('a', { contactNumber1: '0300' });
    await addPerson('b', { contactNumber2: '0311' });
    expect(await isContactNumberInUse('0300')).toBe(true);
    expect(await isContactNumberInUse('0311')).toBe(true);
    expect(await isContactNumberInUse('0322')).toBe(false);
  });

  it('ignores deleted people', async () => {
    await addPerson('a', { contactNumber1: '0300' }, { deletedAt: new Date() });
    expect(await isContactNumberInUse('0300')).toBe(false);
  });
});

describe('assertCnicNotInUse', () => {
  it('names the person who has the number', async () => {
    await addPerson('a', { name: 'Ali', cnicNumber: '111' });
    await expect(assertCnicNotInUse('111')).rejects.toThrow(
      'This CNIC number is already set for Ali.'
    );
    await expect(assertCnicNotInUse('111', 'other')).rejects.toThrow('Ali');
  });

  it('lets a person keep their own number', async () => {
    await addPerson('a', { cnicNumber: '111' });
    await expect(assertCnicNotInUse('111', 'a')).resolves.toBeUndefined();
    await expect(assertCnicNotInUse('999')).resolves.toBeUndefined();
  });
});

describe('assertContactNotInUse', () => {
  it('names the person who has the number', async () => {
    await addPerson('a', { name: 'Ali', contactNumber2: '0300' });
    await expect(assertContactNotInUse('0300')).rejects.toThrow(
      'This contact number is already set for Ali.'
    );
  });

  it('lets a person keep their own number', async () => {
    await addPerson('a', { contactNumber1: '0300' });
    await expect(assertContactNotInUse('0300', 'a')).resolves.toBeUndefined();
  });
});
