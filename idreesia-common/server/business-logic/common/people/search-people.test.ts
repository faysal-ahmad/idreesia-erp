import { add, startOfDay } from 'date-fns';
import { describe, expect, it } from 'vitest';

import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  DutyTeamAssignments,
  Teams,
} from 'meteor/idreesia-common/server/collections/hr';
import { OrgLocations } from 'meteor/idreesia-common/server/collections/admin';
import { Users } from 'meteor/idreesia-common/server/collections/admin';

import {
  buildPeopleSearchPipeline,
  MAX_PEOPLE_PAGE_SIZE,
  searchPeople,
} from './search-people';

type Doc = Record<string, unknown>;

// The fixtures go straight to the driver: these tests are about the search
// filters, not about the person schema.
const insert = (collection: { rawCollection(): unknown }, doc: Doc) =>
  (collection.rawCollection() as { insertOne(d: Doc): Promise<unknown> }).insertOne(doc);

const addPerson = (
  _id: string,
  sharedData: Doc = {},
  extra: Doc = {}
) => insert(People, { _id, sharedData: { name: _id, ...sharedData }, ...extra });

const find = async (params: Doc, flags: Doc = {}) => {
  const people = (await searchPeople(params, {
    paginatedResults: false,
    ...flags,
  })) as Array<{ _id: string }>;
  return people.map(person => person._id).sort();
};

describe('shared data filters', () => {
  it('matches a CNIC number exactly', async () => {
    await addPerson('a', { cnicNumber: '111' });
    await addPerson('b', { cnicNumber: '1112' });
    expect(await find({ cnicNumber: '111' })).toEqual(['a']);
  });

  it('matches either contact number', async () => {
    await addPerson('a', { contactNumber1: '0300' });
    await addPerson('b', { contactNumber2: '0300' });
    await addPerson('c', { contactNumber1: '0311' });
    expect(await find({ phoneNumber: '0300' })).toEqual(['a', 'b']);
  });

  it('matches any of several contact numbers', async () => {
    await addPerson('a', { contactNumber1: '0300' });
    await addPerson('b', { contactNumber2: '0311' });
    await addPerson('c', { contactNumber1: '0322' });
    expect(await find({ phoneNumbers: ['0300', '0311'] })).toEqual(['a', 'b']);
  });

  it('prefers a single phone number over a list', async () => {
    await addPerson('a', { contactNumber1: '0300' });
    await addPerson('b', { contactNumber1: '0311' });
    expect(
      await find({ phoneNumber: '0300', phoneNumbers: ['0311'] })
    ).toEqual(['a']);
  });

  it('maps a blood group key to its stored value', async () => {
    await addPerson('a', { bloodGroup: 'A+' });
    await addPerson('b', { bloodGroup: 'B+' });
    expect(await find({ bloodGroup: 'Aplus' })).toEqual(['a']);
  });

  it('filters by ehad date, month and duration', async () => {
    await addPerson('jan1', { ehadDate: new Date(2024, 0, 1) });
    await addPerson('jan31', { ehadDate: new Date(2024, 0, 31, 12) });
    await addPerson('feb', { ehadDate: new Date(2024, 1, 1) });
    await addPerson('recent', { ehadDate: add(startOfDay(new Date()), { days: -3 }) });
    await addPerson('old', { ehadDate: add(startOfDay(new Date()), { years: -5 }) });

    expect(await find({ ehadDate: '01-01-2024' })).toEqual(['jan1']);
    expect(await find({ ehadMonth: '01-2024' })).toEqual(['jan1', 'jan31']);
    expect(
      await find({ ehadDuration: JSON.stringify({ scale: 'days', duration: 30 }) })
    ).toEqual(['recent']);
  });

  it('ignores an ehad duration of zero', async () => {
    await addPerson('a');
    expect(
      await find({ ehadDuration: JSON.stringify({ scale: 'days', duration: 0 }) })
    ).toEqual(['a']);
  });

  it('matches the data source by prefix, ignoring case', async () => {
    await addPerson('a', {}, { dataSource: 'Security-Gate' });
    await addPerson('b', {}, { dataSource: 'karkuns' });
    expect(await find({ dataSource: 'security' })).toEqual(['a']);
  });

  it('filters by tag', async () => {
    await addPerson('a', { tagIds: ['t1', 't2'] });
    await addPerson('b', { tagIds: ['t2'] });
    expect(await find({ tagId: 't1' })).toEqual(['a']);
  });

  it('filters by an inclusive update date range', async () => {
    await addPerson('a', {}, { updatedAt: new Date(2024, 0, 1, 10) });
    await addPerson('b', {}, { updatedAt: new Date(2024, 0, 5, 23) });
    await addPerson('c', {}, { updatedAt: new Date(2024, 0, 9) });

    expect(
      await find({ updatedBetween: JSON.stringify(['02-01-2024', '05-01-2024']) })
    ).toEqual(['b']);
    expect(
      await find({ updatedBetween: JSON.stringify(['02-01-2024', null]) })
    ).toEqual(['b', 'c']);
    expect(
      await find({ updatedBetween: JSON.stringify([null, '01-01-2024']) })
    ).toEqual(['a']);
  });
});

describe('visitor filters', () => {
  const flags = { includeVisitors: true };

  it('filters by city or a list of cities', async () => {
    await addPerson('a', {}, { isVisitor: true, visitorData: { city: 'Karachi' } });
    await addPerson('b', {}, { isVisitor: true, visitorData: { city: 'Lahore' } });
    await addPerson('c', {}, { isVisitor: true, visitorData: { city: 'Multan' } });

    expect(await find({ city: 'Karachi' }, flags)).toEqual(['a']);
    expect(await find({ cityNames: ['Karachi', 'Lahore'] }, flags)).toEqual([
      'a',
      'b',
    ]);
  });

  it('filters by additional info', async () => {
    await addPerson('notes', {}, { isVisitor: true, visitorData: { otherNotes: 'n' } });
    await addPerson('crime', {}, { isVisitor: true, visitorData: { criminalRecord: 'c' } });
    await addPerson('blank', {}, { isVisitor: true, visitorData: { otherNotes: '' } });

    expect(await find({ additionalInfo: 'has-notes' }, flags)).toEqual(['notes']);
    expect(await find({ additionalInfo: 'has-criminal-record' }, flags)).toEqual([
      'crime',
    ]);
    expect(
      await find({ additionalInfo: 'has-notes-or-criminal-record' }, flags)
    ).toEqual(['crime', 'notes']);
  });

  it('only applies visitor filters when visitors are included', async () => {
    await addPerson('a', {}, { visitorData: { city: 'Karachi' } });
    await addPerson('b', {}, { visitorData: { city: 'Lahore' } });
    expect(await find({ city: 'Karachi' })).toEqual(['a', 'b']);
  });
});

describe('karkun filters', () => {
  const flags = { includeKarkuns: true };

  const addKarkun = (_id: string, karkunData: Doc = {}) =>
    addPerson(_id, {}, { isKarkun: true, karkunData });

  it('filters by ehad karkun', async () => {
    await addKarkun('yes', { ehadKarkun: true });
    await addKarkun('no', { ehadKarkun: false });
    expect(await find({ ehadKarkun: 'true' }, flags)).toEqual(['yes']);
    expect(await find({ ehadKarkun: 'false' }, flags)).toEqual(['no']);
  });

  it('finds karkuns not given duty for a duration, or never', async () => {
    await addKarkun('never');
    await addKarkun('long-ago', { lastTarteebDate: add(new Date(), { days: -90 }) });
    await addKarkun('recent', { lastTarteebDate: add(new Date(), { days: -2 }) });
    expect(
      await find(
        { lastTarteeb: JSON.stringify({ scale: 'days', duration: 30 }) },
        flags
      )
    ).toEqual(['long-ago', 'never']);
  });

  it('filters by city, list of cities, region and mehfil', async () => {
    await insert(OrgLocations, { _id: 'zn', name: 'Zone north', type: 'group' });
    await insert(OrgLocations, { _id: 'zs', name: 'Zone south', type: 'group' });
    await insert(OrgLocations, {
      _id: 'c1',
      name: 'One',
      type: 'city',
      allParentIds: ['zn'],
    });
    await insert(OrgLocations, {
      _id: 'c2',
      name: 'Two',
      type: 'city',
      allParentIds: ['zn'],
    });
    await insert(OrgLocations, {
      _id: 'c3',
      name: 'Three',
      type: 'city',
      allParentIds: ['zs'],
    });
    await addKarkun('k1', { cityLocationId: 'c1', mehfilLocationId: 'm1' });
    await addKarkun('k2', { cityLocationId: 'c2' });
    await addKarkun('k3', { cityLocationId: 'c3' });

    expect(await find({ cityLocationId: 'c1' }, flags)).toEqual(['k1']);
    expect(await find({ cityLocationIds: ['c1', 'c3'] }, flags)).toEqual([
      'k1',
      'k3',
    ]);
    expect(await find({ region: 'north' }, flags)).toEqual(['k1', 'k2']);
    expect(await find({ region: 'nowhere' }, flags)).toEqual([]);
    expect(await find({ mehfilLocationId: 'm1' }, flags)).toEqual(['k1']);
  });

  it('prefers a city over a list of cities over a region', async () => {
    await insert(OrgLocations, { _id: 'zn', name: 'Zone north', type: 'group' });
    await insert(OrgLocations, {
      _id: 'c1',
      name: 'One',
      type: 'city',
      allParentIds: ['zn'],
    });
    await addKarkun('k1', { cityLocationId: 'c1' });
    await addKarkun('k2', { cityLocationId: 'c2' });
    expect(
      await find(
        { cityLocationId: 'c2', cityLocationIds: ['c1'], region: 'north' },
        flags
      )
    ).toEqual(['k2']);
  });

  it('finds the karkuns on a duty through their teams', async () => {
    await addKarkun('k1');
    await addKarkun('k2');
    await addKarkun('k3');
    await insert(Teams, {
      _id: 't1',
      dutyId: 'd1',
      members: [{ karkunId: 'k1' }, { karkunId: 'k2' }],
    });
    await insert(Teams, { _id: 't2', dutyId: 'd1', members: [{ karkunId: 'k2' }] });
    await insert(Teams, { _id: 't3', dutyId: 'd2', members: [{ karkunId: 'k3' }] });
    await insert(Teams, { _id: 't4', dutyId: 'd3' });

    expect(await find({ dutyId: 'd1' }, flags)).toEqual(['k1', 'k2']);
    expect(await find({ dutyIds: ['d1', 'd2'] }, flags)).toEqual(['k1', 'k2', 'k3']);
    expect(await find({ dutyId: 'd3' }, flags)).toEqual([]);
  });

  it('narrows a duty to the teams of a shift', async () => {
    await addKarkun('k1');
    await addKarkun('k2');
    await insert(Teams, { _id: 't1', dutyId: 'd1', members: [{ karkunId: 'k1' }] });
    await insert(Teams, { _id: 't2', dutyId: 'd1', members: [{ karkunId: 'k2' }] });
    await insert(DutyTeamAssignments, { _id: 'a1', shiftId: 's1', teamId: 't2' });

    expect(await find({ dutyId: 'd1', dutyShiftId: 's1' }, flags)).toEqual(['k2']);
    expect(await find({ dutyId: 'd1', dutyShiftId: 'other' }, flags)).toEqual([]);
  });

  it('only applies karkun filters when karkuns are included', async () => {
    await addKarkun('a', { cityLocationId: 'c1' });
    await addKarkun('b', { cityLocationId: 'c2' });
    expect(await find({ cityLocationId: 'c1' })).toEqual(['a', 'b']);
  });
});

describe('employee and user account filters', () => {
  it('filters by job, or a list of jobs', async () => {
    await addPerson('a', {}, { isEmployee: true, employeeData: { jobId: 'j1' } });
    await addPerson('b', {}, { isEmployee: true, employeeData: { jobId: 'j2' } });
    await addPerson('c', {}, { isEmployee: true, employeeData: { jobId: 'j3' } });

    expect(await find({ jobId: 'j1' })).toEqual(['a']);
    expect(await find({ jobIds: ['j1', 'j2'] })).toEqual(['a', 'b']);
    expect(await find({ jobIds: [] })).toEqual(['a', 'b', 'c']);
  });

  it('filters by whether the person has a user account', async () => {
    await addPerson('with');
    await addPerson('without');
    await insert(Users, { _id: 'u1', personId: 'with' });

    expect(await find({ userAccount: 'true' })).toEqual(['with']);
    expect(await find({ userAccount: 'false' })).toEqual(['without']);
  });

  it('filters by whether the person has an account that is not locked', async () => {
    await addPerson('active');
    await addPerson('locked');
    await addPerson('both');
    await addPerson('none');
    await insert(Users, { _id: 'u1', personId: 'active' });
    await insert(Users, { _id: 'u2', personId: 'locked', locked: true });
    await insert(Users, { _id: 'u3', personId: 'both', locked: true });
    await insert(Users, { _id: 'u4', personId: 'both' });

    expect(await find({ userAccount: 'active' })).toEqual(['active', 'both']);
    expect(await find({ userAccount: 'true' })).toEqual(['active', 'both', 'locked']);
  });
});

describe('buildPeopleSearchPipeline', () => {
  it('matches the name with $text in the first stage', async () => {
    const pipeline = await buildPeopleSearchPipeline({ name: 'ali' });
    expect(pipeline[0]).toEqual({
      $match: { deletedAt: { $exists: false }, $text: { $search: 'ali' } },
    });
  });

  it('combines the include flags into one stage', async () => {
    const pipeline = await buildPeopleSearchPipeline(
      {},
      { includeKarkuns: true, includeEmployees: true, includeVisitors: false }
    );
    expect(pipeline[pipeline.length - 1]).toEqual({
      $match: {
        $and: [
          { $or: [{ isKarkun: true }, { isEmployee: true }] },
          { isVisitor: { $ne: true } },
        ],
      },
    });
  });
});

describe('paging', () => {
  const seed = async (count: number) => {
    for (let i = 0; i < count; i += 1) {
      await addPerson(`p${String(i).padStart(3, '0')}`, { name: 'Same' });
    }
  };

  it('does not repeat people across pages when names tie', async () => {
    await seed(5);
    const seen: string[] = [];
    for (const pageIndex of ['0', '1', '2']) {
      const page = (await searchPeople({ pageIndex, pageSize: '2' })) as {
        data: Array<{ _id: string }>;
      };
      seen.push(...page.data.map(person => person._id));
    }
    expect(seen).toEqual(['p000', 'p001', 'p002', 'p003', 'p004']);
  });

  it('caps the page size', async () => {
    await seed(MAX_PEOPLE_PAGE_SIZE + 5);
    const page = (await searchPeople({ pageSize: '100000' })) as {
      data: unknown[];
      totalResults: number;
    };
    expect(page.data).toHaveLength(MAX_PEOPLE_PAGE_SIZE);
    expect(page.totalResults).toBe(MAX_PEOPLE_PAGE_SIZE + 5);
  });

  it('falls back to defaults for unusable paging values', async () => {
    await seed(25);
    const page = (await searchPeople({ pageIndex: '-3', pageSize: 'abc' })) as {
      data: Array<{ _id: string }>;
    };
    expect(page.data).toHaveLength(20);
    expect(page.data[0]._id).toBe('p000');
  });

  it('treats a page size of zero as the default', async () => {
    await seed(25);
    const page = (await searchPeople({ pageSize: '0' })) as { data: unknown[] };
    expect(page.data).toHaveLength(20);
  });
});
