import { describe, expect, it } from 'vitest';

import { UserGroups } from 'meteor/idreesia-common/server/collections/admin';

import { resolveEffectiveAccess } from './effective-access';

const addGroup = (group: { permissions?: string[]; instances?: string[] }) =>
  UserGroups.insertAsync({ name: `g-${Math.random()}`, ...group } as never);

describe('resolveEffectiveAccess', () => {
  it('returns the direct access when the user has no groups', async () => {
    expect(
      await resolveEffectiveAccess({ permissions: ['a'], instances: ['i1'] })
    ).toEqual({ permissions: ['a'], instances: ['i1'] });
    expect(await resolveEffectiveAccess({})).toEqual({
      permissions: [],
      instances: [],
    });
  });

  it('adds the permissions and instances of every group', async () => {
    const g1 = await addGroup({ permissions: ['b'], instances: ['i2'] });
    const g2 = await addGroup({ permissions: ['c'] });
    const result = await resolveEffectiveAccess({
      permissions: ['a'],
      instances: ['i1'],
      groups: [g1, g2],
    });
    expect(result.permissions.sort()).toEqual(['a', 'b', 'c']);
    expect(result.instances.sort()).toEqual(['i1', 'i2']);
  });

  it('de-duplicates overlapping access', async () => {
    const g1 = await addGroup({ permissions: ['a', 'b'] });
    const g2 = await addGroup({ permissions: ['b'] });
    const result = await resolveEffectiveAccess({
      permissions: ['a'],
      groups: [g1, g2],
    });
    expect(result.permissions.sort()).toEqual(['a', 'b']);
  });

  it('gives a user with no direct access just their groups access', async () => {
    const g = await addGroup({ permissions: ['x'] });
    expect(await resolveEffectiveAccess({ groups: [g] })).toEqual({
      permissions: ['x'],
      instances: [],
    });
  });

  it('ignores group ids that do not exist', async () => {
    expect(
      await resolveEffectiveAccess({ permissions: ['a'], groups: ['gone'] })
    ).toEqual({ permissions: ['a'], instances: [] });
  });
});
