import { describe, expect, it } from 'vitest';

import { People } from 'meteor/idreesia-common/server/collections/common';
import { Users } from 'meteor/idreesia-common/server/collections/admin';

import {
  linkOrgLocationUser,
  listLinkableUsers,
  listOrgLocationUsers,
} from './org-location-users';

type Doc = Record<string, unknown>;

// Straight to the driver: these tests are about which users are listed, not
// about the schemas.
const insert = (collection: { rawCollection(): unknown }, doc: Doc) =>
  (collection.rawCollection() as { insertOne(d: Doc): Promise<unknown> }).insertOne(doc);

const addKarkun = (_id: string, mehfilLocationId: string, extra: Doc = {}) =>
  insert(People, {
    _id,
    isKarkun: true,
    sharedData: { name: _id },
    karkunData: { mehfilLocationId },
    ...extra,
  });

describe('listOrgLocationUsers', () => {
  it('lists the user accounts of the mehfil karkuns, by username', async () => {
    await addKarkun('a', 'm1');
    await addKarkun('b', 'm1');
    await addKarkun('no-account', 'm1');
    await addKarkun('other-mehfil', 'm2');
    await addKarkun('deleted', 'm1', { deletedAt: new Date() });
    await insert(Users, { _id: 'u2', username: 'zed', personId: 'b' });
    await insert(Users, { _id: 'u1', username: 'amy', personId: 'a' });
    await insert(Users, { _id: 'u3', username: 'other', personId: 'other-mehfil' });
    await insert(Users, { _id: 'u4', username: 'gone', personId: 'deleted' });
    await insert(Users, { _id: 'u5', username: 'not-a-karkun' });

    const result = await listOrgLocationUsers({ locationId: 'm1' });

    expect(result.totalResults).toBe(2);
    expect(result.data.map(user => user.username)).toEqual(['amy', 'zed']);
  });

  it('pages the users', async () => {
    await addKarkun('a', 'm1');
    await addKarkun('b', 'm1');
    await insert(Users, { _id: 'u1', username: 'amy', personId: 'a' });
    await insert(Users, { _id: 'u2', username: 'zed', personId: 'b' });

    const second = await listOrgLocationUsers({
      locationId: 'm1',
      pageIndex: '1',
      pageSize: '1',
    });

    expect(second.totalResults).toBe(2);
    expect(second.data.map(user => user.username)).toEqual(['zed']);
  });
});

describe('listLinkableUsers', () => {
  it('lists only users with no karkun linked that are not service accounts', async () => {
    await insert(Users, { _id: 'u1', username: 'zed' });
    await insert(Users, { _id: 'u2', username: 'amy', personId: null });
    await insert(Users, { _id: 'u3', username: 'linked', personId: 'p1' });
    await insert(Users, { _id: 'u4', username: 'bot', isServiceAccount: true });

    const result = await listLinkableUsers({});

    expect(result.totalResults).toBe(2);
    expect(result.data.map(user => user.username)).toEqual(['amy', 'zed']);
  });

  it('searches by username, display name and email', async () => {
    await insert(Users, { _id: 'u1', username: 'amy', profile: { name: 'Amy A' } });
    await insert(Users, { _id: 'u2', username: 'bob', emails: [{ address: 'bob@x.org' }] });
    await insert(Users, { _id: 'u3', username: 'cy' });

    expect((await listLinkableUsers({ search: 'AMY' })).data).toHaveLength(1);
    expect((await listLinkableUsers({ search: 'x.org' })).data[0].username).toBe('bob');
    expect((await listLinkableUsers({ search: '.*' })).data).toHaveLength(0);
  });
});

describe('linkOrgLocationUser', () => {
  it('links the user to a karkun of the mehfil', async () => {
    await addKarkun('a', 'm1');
    await insert(Users, { _id: 'u1', username: 'amy' });

    const user = await linkOrgLocationUser('m1', 'a', 'u1');

    expect(user.personId).toBe('a');
    expect((await Users.findOneAsync('u1'))?.personId).toBe('a');
  });

  it('rejects a karkun of another mehfil', async () => {
    await addKarkun('a', 'm2');
    await insert(Users, { _id: 'u1', username: 'amy' });

    await expect(linkOrgLocationUser('m1', 'a', 'u1')).rejects.toThrow('not found');
  });

  it('rejects a karkun who already has an account', async () => {
    await addKarkun('a', 'm1');
    await insert(Users, { _id: 'u1', username: 'amy', personId: 'a' });
    await insert(Users, { _id: 'u2', username: 'bob' });

    await expect(linkOrgLocationUser('m1', 'a', 'u2')).rejects.toThrow('already has');
  });

  it('rejects a service account or an already linked user', async () => {
    await addKarkun('a', 'm1');
    await insert(Users, { _id: 'bot', username: 'bot', isServiceAccount: true });
    await insert(Users, { _id: 'u1', username: 'amy', personId: 'other' });

    await expect(linkOrgLocationUser('m1', 'a', 'bot')).rejects.toThrow();
    await expect(linkOrgLocationUser('m1', 'a', 'u1')).rejects.toThrow();
  });
});
