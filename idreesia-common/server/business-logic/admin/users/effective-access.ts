import { UserGroups } from 'meteor/idreesia-common/server/collections/admin';

interface AccessSource {
  permissions?: string[];
  instances?: string[];
  groups?: string[];
}

export interface EffectiveAccess {
  permissions: string[];
  instances: string[];
}

const union = (...lists: Array<string[] | undefined>) => [
  ...new Set(lists.flatMap(list => list ?? [])),
];

/**
 * A user's effective access: their own permissions and instances plus those of
 * every user group they belong to. Group ids that no longer exist are ignored.
 */
export async function resolveEffectiveAccess(
  user: AccessSource
): Promise<EffectiveAccess> {
  const groupIds = user.groups ?? [];
  if (groupIds.length === 0) {
    return {
      permissions: user.permissions ?? [],
      instances: user.instances ?? [],
    };
  }

  const groups = await UserGroups.find(
    { _id: { $in: groupIds } },
    { fields: { permissions: 1, instances: 1 } }
  ).fetchAsync();

  return {
    permissions: union(user.permissions, ...groups.map(g => g.permissions)),
    instances: union(user.instances, ...groups.map(g => g.instances)),
  };
}
