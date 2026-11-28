import { describe, expect, it } from 'vitest';

import { OrgLocations, Users } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { searchCommitteeKarkuns } from 'meteor/idreesia-common/server/business-logic/admin/committee/committee-karkuns';
import {
  searchHrEmployeeCandidateKarkuns,
  searchHrKarkunCandidatePeople,
} from 'meteor/idreesia-common/server/business-logic/hr/picker-karkuns';
import { searchStorePermissionKarkuns } from 'meteor/idreesia-common/server/business-logic/inventory/store-access/store-access-karkuns';

import { findMultanCityLocation, searchPickerPeople } from './picker-people';

type Doc = Record<string, unknown>;

// Fixtures go straight to the driver: these tests are about the filters.
const insert = (collection: { rawCollection(): unknown }, doc: Doc) =>
  (collection.rawCollection() as { insertOne(d: Doc): Promise<unknown> }).insertOne(doc);

const addPerson = (_id: string, doc: Doc = {}) =>
  insert(People, {
    _id,
    sharedData: { name: _id, parentName: `father of ${_id}`, cnicNumber: `cnic-${_id}` },
    ...doc,
  });

const addMultan = async () => {
  await insert(OrgLocations, { _id: 'pakistan', name: 'Pakistan', type: 'country' });
  await insert(OrgLocations, {
    _id: 'multan',
    name: 'Multan',
    type: 'city',
    allParentIds: ['pakistan'],
  });
};

describe('person picker search', () => {
  it('returns only the picker fields of the people in the scope', async () => {
    await addPerson('k1', { isKarkun: true });
    await addPerson('v1', { isVisitor: true });

    const result = await searchPickerPeople({}, { flags: { includeKarkuns: true } });

    expect(result).toEqual({
      data: [
        {
          _id: 'k1',
          name: 'k1',
          parentName: 'father of k1',
          cnicNumber: 'cnic-k1',
          contactNumber1: undefined,
          imageUrl: null,
          imageThumbnailUrl: null,
        },
      ],
      totalResults: 1,
    });
  });

  it('applies the scope filter alongside what was typed', async () => {
    await addPerson('k1', { isKarkun: true, karkunData: { mehfilLocationId: 'm1' } });
    await addPerson('k2', { isKarkun: true, karkunData: { mehfilLocationId: 'm2' } });

    const result = await searchPickerPeople(
      { cnicNumber: 'cnic-k1' },
      { filter: { mehfilLocationId: 'm1' }, flags: { includeKarkuns: true } }
    );

    expect(result.data.map(person => person._id)).toEqual(['k1']);
  });

  it('marks who has a user account when asked', async () => {
    await addPerson('k1', { isKarkun: true });
    await addPerson('k2', { isKarkun: true });
    await insert(Users, { _id: 'u1', personId: 'k1', username: 'k1' });

    const result = await searchPickerPeople(
      {},
      { flags: { includeKarkuns: true }, markUserAccounts: true }
    );

    expect(result.data.map(person => [person._id, person.hasUserAccount])).toEqual([
      ['k1', true],
      ['k2', false],
    ]);
  });

  it('finds the Multan city under Pakistan', async () => {
    expect(await findMultanCityLocation()).toBeNull();
    await addMultan();
    expect((await findMultanCityLocation())?._id).toBe('multan');
  });
});

describe('committee karkun search', () => {
  it('finds nobody when the Multan city location does not exist', async () => {
    await addPerson('k1', { isKarkun: true });
    expect(await searchCommitteeKarkuns({})).toEqual({ data: [], totalResults: 0 });
  });

  it('lists only the karkuns of Multan', async () => {
    await addMultan();
    await addPerson('k1', { isKarkun: true, karkunData: { cityLocationId: 'multan' } });
    await addPerson('k2', { isKarkun: true, karkunData: { cityLocationId: 'lahore' } });
    await addPerson('v1', { isVisitor: true });

    const result = await searchCommitteeKarkuns({});

    expect(result.data.map(person => person._id)).toEqual(['k1']);
    expect(result.totalResults).toBe(1);
  });
});

describe('store permission karkun search', () => {
  it('finds nobody without the Multan city location', async () => {
    expect(await searchStorePermissionKarkuns({})).toEqual({ data: [], totalResults: 0 });
  });

  it('lists only Multan karkuns with an unlocked user account', async () => {
    await addMultan();
    const multan = { isKarkun: true, karkunData: { cityLocationId: 'multan' } };
    await addPerson('k1', multan);
    await addPerson('k2', multan); // no user account
    await addPerson('k3', multan); // locked account
    await addPerson('k4', { isKarkun: true, karkunData: { cityLocationId: 'lahore' } });
    await insert(Users, { _id: 'u1', personId: 'k1', username: 'k1' });
    await insert(Users, { _id: 'u3', personId: 'k3', username: 'k3', locked: true });
    await insert(Users, { _id: 'u4', personId: 'k4', username: 'k4' });

    const result = await searchStorePermissionKarkuns({});

    expect(result.data.map(person => person._id)).toEqual(['k1']);
  });
});

describe('HR candidate searches', () => {
  it('offers Multan karkuns who are not employees yet, to make employees', async () => {
    await addMultan();
    await addPerson('k1', { isKarkun: true, karkunData: { cityLocationId: 'multan' } });
    await addPerson('k2', {
      isKarkun: true,
      isEmployee: true,
      karkunData: { cityLocationId: 'multan' },
    });
    await addPerson('k3', { isKarkun: true, karkunData: { cityLocationId: 'lahore' } });

    const result = await searchHrEmployeeCandidateKarkuns({});

    expect(result.data.map(person => person._id)).toEqual(['k1']);
  });

  it('offers people who are not karkuns yet, to make karkuns', async () => {
    await addPerson('k1', { isKarkun: true });
    await addPerson('v1', { isVisitor: true });
    await addPerson('e1', { isEmployee: true });

    const result = await searchHrKarkunCandidatePeople({});

    expect(result.data.map(person => person._id)).toEqual(['e1', 'v1']);
  });
});
