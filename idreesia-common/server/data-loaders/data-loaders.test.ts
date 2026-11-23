import { describe, expect, it, vi } from 'vitest';

import { Committees, Users } from 'meteor/idreesia-common/server/collections/admin';
import { Attachments, People } from 'meteor/idreesia-common/server/collections/common';
import { Jobs, Teams } from 'meteor/idreesia-common/server/collections/hr';
import {
  ItemCategories,
  Locations,
  PhysicalStores,
  StockItems,
  Vendors,
} from 'meteor/idreesia-common/server/collections/inventory';
import { Cities, CityMehfils } from 'meteor/idreesia-common/server/collections/outstation';
import {
  PurchasingOrders,
  PurchasingVendors,
} from 'meteor/idreesia-common/server/collections/purchasing';

import { getDataLoaders } from './index';
import { getKarkunTeams } from './hr/karkun-teams';
import { getLocationCommittees } from './admin/location-committees';

// Every "by id" loader batches the ids requested in one tick into a single
// $in query and answers in the order asked, with undefined for missing ids.
const byIdLoaders = [
  ['common.attachments', Attachments, (l: any) => l.common.attachments],
  ['common.people', People, (l: any) => l.common.people],
  ['hr.jobs', Jobs, (l: any) => l.hr.jobs],
  ['inventory.itemCategories', ItemCategories, (l: any) => l.inventory.itemCategories],
  ['inventory.locations', Locations, (l: any) => l.inventory.locations],
  ['inventory.physicalStores', PhysicalStores, (l: any) => l.inventory.physicalStores],
  ['inventory.stockItems', StockItems, (l: any) => l.inventory.stockItems],
  ['inventory.vendors', Vendors, (l: any) => l.inventory.vendors],
  ['purchasing.orders', PurchasingOrders, (l: any) => l.purchasing.orders],
  ['purchasing.vendors', PurchasingVendors, (l: any) => l.purchasing.vendors],
  ['outstation.cities', Cities, (l: any) => l.outstation.cities],
  ['outstation.cityMehfils', CityMehfils, (l: any) => l.outstation.cityMehfils],
] as const;

describe.each(byIdLoaders)('%s loader', (_name, collection, pick) => {
  it('batches, keeps the requested order and returns undefined for missing ids', async () => {
    const raw = (collection as any).rawCollection();
    await raw.insertMany([{ _id: 'a' }, { _id: 'b' }, { _id: 'c' }]);
    const findSpy = vi.spyOn(collection as any, 'find');

    const loader = pick(getDataLoaders());
    const results = await Promise.all([
      loader.load('c'),
      loader.load('missing'),
      loader.load('a'),
      loader.load('c'),
    ]);

    expect(results.map((r: any) => r?._id)).toEqual([
      'c',
      undefined,
      'a',
      'c',
    ]);
    // One query for the whole batch (duplicates are de-duplicated by the loader).
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(findSpy.mock.calls[0][0]).toEqual({
      _id: { $in: ['c', 'missing', 'a'] },
    });
    findSpy.mockRestore();
  });

  it('caches within one loader instance only', async () => {
    const raw = (collection as any).rawCollection();
    await raw.insertMany([{ _id: 'a' }]);
    const findSpy = vi.spyOn(collection as any, 'find');
    const loaders = getDataLoaders();

    await pick(loaders).load('a');
    await pick(loaders).load('a');
    expect(findSpy).toHaveBeenCalledTimes(1);

    await pick(getDataLoaders()).load('a');
    expect(findSpy).toHaveBeenCalledTimes(2);
    findSpy.mockRestore();
  });
});

describe('users loader', () => {
  it('loads users by person id, undefined when the person has no user', async () => {
    await (Users.rawCollection() as any).insertMany([
      { _id: 'u1', username: 'one', personId: 'p1' },
      { _id: 'u2', username: 'two', personId: 'p2' },
    ] as any);

    const loader = getDataLoaders().common.users;
    const results = await Promise.all([
      loader.load('p2'),
      loader.load('nobody'),
      loader.load('p1'),
    ]);
    expect(results.map(r => r?.personId)).toEqual(['p2', undefined, 'p1']);
  });
});

describe('karkun teams loader', () => {
  const team = (_id: string, name: string, karkunIds: string[]) => ({
    _id,
    name,
    members: karkunIds.map(karkunId => ({ karkunId })),
  });

  it('returns each karkun the teams they belong to, sorted by team name', async () => {
    await (Teams.rawCollection() as any).insertMany([
      team('t1', 'Zeta', ['k1', 'k2']),
      team('t2', 'Alpha', ['k1']),
      team('t3', 'Mid', ['k3']),
    ] as any);

    const result = await getKarkunTeams(['k1', 'k2', 'k3', 'k4']);
    expect(result.map(teams => teams.map(t => t.name))).toEqual([
      ['Alpha', 'Zeta'],
      ['Zeta'],
      ['Mid'],
      [],
    ]);
  });

  it('copes with teams that have no members', async () => {
    await (Teams.rawCollection() as any).insertMany([
      { _id: 't1', name: 'Empty', members: null },
      { _id: 't2', name: 'None' },
      team('t3', 'Real', ['k1']),
    ] as any);
    const [teams] = await getKarkunTeams(['k1']);
    expect(teams.map(t => t.name)).toEqual(['Real']);
  });

  it('batches through the loader into one query', async () => {
    await (Teams.rawCollection() as any).insertMany([team('t1', 'A', ['k1', 'k2'])] as any);
    const findSpy = vi.spyOn(Teams, 'find');
    const loader = getDataLoaders().hr.karkunTeams;
    const [a, b] = await Promise.all([loader.load('k1'), loader.load('k2')]);
    expect(a).toHaveLength(1);
    expect(b).toHaveLength(1);
    expect(findSpy).toHaveBeenCalledTimes(1);
    findSpy.mockRestore();
  });
});

describe('location committees loader', () => {
  it('returns each location its committees sorted by name, empty when none', async () => {
    await (Committees.rawCollection() as any).insertMany([
      { _id: 'c1', name: 'Zeta', locationId: 'l1' },
      { _id: 'c2', name: 'Alpha', locationId: 'l1' },
      { _id: 'c3', name: 'Mid', locationId: 'l2' },
      { _id: 'c4', name: 'Central' },
    ] as any);

    const result = await getLocationCommittees(['l1', 'l2', 'l3']);
    expect(result.map(list => list.map(c => c.name))).toEqual([['Alpha', 'Zeta'], ['Mid'], []]);
  });

  it('batches through the loader into one query', async () => {
    const findSpy = vi.spyOn(Committees, 'find');
    const loader = getDataLoaders().admin.locationCommittees;
    await Promise.all([loader.load('l1'), loader.load('l2')]);
    expect(findSpy).toHaveBeenCalledTimes(1);
    findSpy.mockRestore();
  });
});
