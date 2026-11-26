import { describe, expect, it } from 'vitest';

import { OrgLocations } from 'meteor/idreesia-common/server/collections/admin';

import { listReferenceLocations } from './reference-locations';

type Doc = Record<string, unknown>;

const insert = (doc: Doc) =>
  (OrgLocations.rawCollection() as unknown as {
    insertOne(d: Doc): Promise<unknown>;
  }).insertOne(doc);

const setUp = async () => {
  await insert({ _id: 'root', name: 'Root', type: 'root', allParentIds: [] });
  await insert({ _id: 'pk', name: 'Pakistan', type: 'country', parentId: 'root', allParentIds: ['root'] });
  await insert({ _id: 'zn', name: 'Zone N', type: 'group', parentId: 'pk', allParentIds: ['root', 'pk'] });
  await insert({ _id: 'lhr', name: 'Lahore', type: 'city', parentId: 'zn', allParentIds: ['root', 'pk', 'zn'] });
  await insert({ _id: 'm1', name: 'Mehfil 1', type: 'mehfil', parentId: 'lhr', allParentIds: ['root', 'pk', 'zn', 'lhr'] });
  await insert({ _id: 'uk', name: 'UK', type: 'country', parentId: 'root', allParentIds: ['root'] });
};

describe('reference locations', () => {
  it('lists every location but the root, with only the picker fields', async () => {
    await setUp();

    const locations = await listReferenceLocations();

    expect(locations.map(location => location._id).sort()).toEqual(
      ['lhr', 'm1', 'pk', 'uk', 'zn'].sort()
    );
    expect(locations.find(location => location._id === 'm1')).toEqual({
      _id: 'm1',
      name: 'Mehfil 1',
      type: 'mehfil',
      parentId: 'lhr',
    });
  });

  it('keeps the ancestors of the requested types and drops the rest', async () => {
    await setUp();

    const locations = await listReferenceLocations(['city']);

    expect(locations.map(location => location._id).sort()).toEqual(['lhr', 'pk', 'zn']);
  });
});
