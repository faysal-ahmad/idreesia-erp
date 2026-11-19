import { describe, expect, it } from 'vitest';

import { People } from 'meteor/idreesia-common/server/collections/common';

import { renameVisitorCountry } from './rename-visitor-country';

type Doc = Record<string, unknown>;

const raw = () =>
  People.rawCollection() as unknown as {
    insertOne(d: Doc): Promise<unknown>;
    findOne(q: Doc): Promise<Doc | null>;
  };

const addPerson = (_id: string, country: string) =>
  raw().insertOne({ _id, sharedData: { name: _id }, visitorData: { country } });

const countryOf = async (_id: string) =>
  ((await raw().findOne({ _id }))?.visitorData as Doc).country;

describe('renameVisitorCountry', () => {
  it('renames the country on every matching person only', async () => {
    await addPerson('a', 'Pakista');
    await addPerson('b', 'Pakista');
    await addPerson('c', 'Iran');

    const count = await renameVisitorCountry('Pakista', ' Pakistan ', {
      _id: 'u1',
    });

    expect(count).toBe(2);
    expect(await countryOf('a')).toBe('Pakistan');
    expect(await countryOf('b')).toBe('Pakistan');
    expect(await countryOf('c')).toBe('Iran');
    expect((await raw().findOne({ _id: 'a' }))?.updatedBy).toBe('u1');
  });

  it('only matches the exact spelling', async () => {
    await addPerson('a', 'pak');
    await addPerson('b', 'Pak');

    expect(await renameVisitorCountry('pak', 'Pakistan', { _id: 'u1' })).toBe(1);
    expect(await countryOf('b')).toBe('Pak');
  });

  it('refuses an empty new name', async () => {
    await addPerson('a', 'pak');
    await expect(
      renameVisitorCountry('pak', '  ', { _id: 'u1' })
    ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
  });
});
