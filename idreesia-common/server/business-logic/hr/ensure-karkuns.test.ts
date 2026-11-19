import { describe, expect, it } from 'vitest';

import { People } from 'meteor/idreesia-common/server/collections/common';

import { ensureKarkuns } from './ensure-karkuns';

const seed = async () => {
  await People.insertAsync({ _id: 'k1', isKarkun: true } as any);
  await People.insertAsync({ _id: 'k2', isKarkun: true } as any);
  await People.insertAsync({ _id: 'v1', isKarkun: false, isVisitor: true } as any);
};

describe('ensureKarkuns', () => {
  it('accepts valid karkuns, ignoring duplicates, nulls and undefined', async () => {
    await seed();
    await expect(
      ensureKarkuns(['k1', 'k1', 'k2', null, undefined, ''])
    ).resolves.toBeUndefined();
  });

  it('accepts an empty list without querying', async () => {
    await expect(ensureKarkuns([])).resolves.toBeUndefined();
    await expect(ensureKarkuns([null, undefined])).resolves.toBeUndefined();
  });

  it.each([
    ['a person who is not a karkun', ['k1', 'v1']],
    ['an unknown id', ['k1', 'missing']],
  ])('rejects %s', async (_label, ids) => {
    await seed();
    await expect(ensureKarkuns(ids)).rejects.toThrow('Please select a valid karkun.');
  });
});
