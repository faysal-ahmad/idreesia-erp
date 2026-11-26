import { describe, expect, it } from 'vitest';

import { Committees, UserGroups } from 'meteor/idreesia-common/server/collections/admin';

import { resolveEffectiveAccess } from './effective-access';

const addGroup = (group: { permissions?: string[] }) =>
  UserGroups.insertAsync({ name: `g-${Math.random()}`, ...group } as never);

const addCommittee = (
  permissions: string[],
  members: Array<{ karkunId: string; role: string }>
) =>
  Committees.insertAsync({
    name: `c-${Math.random()}`,
    locationId: 'loc',
    permissions,
    members,
  } as never);

describe('resolveEffectiveAccess', () => {
  it('returns the direct access when the user has no groups', async () => {
    expect(await resolveEffectiveAccess({ permissions: ['a'] })).toEqual({
      permissions: ['a'],
    });
    expect(await resolveEffectiveAccess({})).toEqual({ permissions: [] });
  });

  it('adds the permissions of every group', async () => {
    const g1 = await addGroup({ permissions: ['b'] });
    const g2 = await addGroup({ permissions: ['c'] });
    const result = await resolveEffectiveAccess({
      permissions: ['a'],
      groups: [g1, g2],
    });
    expect(result.permissions.sort()).toEqual(['a', 'b', 'c']);
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
    });
  });

  it('ignores group ids that do not exist', async () => {
    expect(
      await resolveEffectiveAccess({ permissions: ['a'], groups: ['gone'] })
    ).toEqual({ permissions: ['a'] });
  });

  describe('committees', () => {
    it('gives members and coordinators the committee permissions', async () => {
      const personId = `p-${Math.random()}`;
      const other = `p-${Math.random()}`;
      await addCommittee(['c1'], [{ karkunId: personId, role: 'member' }]);
      await addCommittee(['c2'], [{ karkunId: other, role: 'coordinator' }]);

      expect(await resolveEffectiveAccess({ personId })).toEqual({
        permissions: ['c1'],
      });
      expect(await resolveEffectiveAccess({ personId: other })).toEqual({
        permissions: ['c2'],
      });
    });

    it.each(['guest', 'observer', 'inherited_observer'])(
      'gives a %s nothing',
      async role => {
        const personId = `p-${Math.random()}`;
        await addCommittee(['c1'], [{ karkunId: personId, role }]);
        expect(await resolveEffectiveAccess({ personId })).toEqual({
          permissions: [],
        });
      }
    );

    it('leaves a user without a karkun unaffected', async () => {
      expect(await resolveEffectiveAccess({ permissions: ['a'] })).toEqual({
        permissions: ['a'],
      });
    });

    it('unions user, group and committee access without duplicates', async () => {
      const personId = `p-${Math.random()}`;
      const g = await addGroup({ permissions: ['a', 'b'] });
      await addCommittee(['b', 'c'], [{ karkunId: personId, role: 'member' }]);
      const result = await resolveEffectiveAccess({
        permissions: ['a'],
        groups: [g],
        personId,
      });
      expect(result.permissions.sort()).toEqual(['a', 'b', 'c']);
    });
  });
});
