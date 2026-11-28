import { UserGroups } from 'meteor/idreesia-common/server/collections/admin';

import { committeePermissionsOf } from '../committee/committee-permissions';

interface AccessSource {
  permissions?: string[];
  groups?: string[];
  /** The user's karkun: their committees grant permissions too. */
  personId?: string | null;
}

export interface EffectiveAccess {
  permissions: string[];
}

const union = (...lists: Array<string[] | undefined>) => [
  ...new Set(lists.flatMap(list => list ?? [])),
];

/**
 * A user's effective access: their own permissions, those of every user group
 * they belong to, and those of every committee they are a member or
 * coordinator of (see PERMISSION_GRANTING_ROLES). Group ids that no longer
 * exist are ignored.
 */
export async function resolveEffectiveAccess(
  user: AccessSource
): Promise<EffectiveAccess> {
  const groupIds = user.groups ?? [];
  const [groups, committeePermissions] = await Promise.all([
    groupIds.length > 0
      ? UserGroups.find(
          { _id: { $in: groupIds } },
          { fields: { permissions: 1 } }
        ).fetchAsync()
      : Promise.resolve([]),
    committeePermissionsOf(user.personId),
  ]);

  return {
    permissions: union(
      user.permissions,
      ...groups.map(g => g.permissions),
      committeePermissions
    ),
  };
}
