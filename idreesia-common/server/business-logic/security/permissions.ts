import { DataSource, ModuleNames } from 'meteor/idreesia-common/constants';
import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';
import {
  SecurityPermissionCatalog,
  type SecurityPermissionGroup,
} from 'meteor/idreesia-common/constants/security';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { UserGroups, Users } from 'meteor/idreesia-common/server/collections/admin';
import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';

import { securityError } from './errors';
import { type ActingUser } from './internal';
import { userNameResolver } from './user-names';

const ALL_KEYS = SecurityPermissionCatalog.flatMap((group) =>
  group.permissions.map((permission) => permission.key)
);

export interface PermissionHolder {
  userId: string;
  personId?: string;
  username?: string;
  displayName?: string;
}

export interface PermissionGroupHolder {
  groupId: string;
  name: string;
}

export interface PermissionAssignment {
  key: string;
  name: string;
  description: string;
  users: PermissionHolder[];
  /** Security user groups that hold the permission. */
  groups: PermissionGroupHolder[];
}

export interface PermissionAssignmentGroup {
  featureKey: string;
  featureName: string;
  permissions: PermissionAssignment[];
}

export function assertSecurityPermission(permissionKey: string) {
  if (!ALL_KEYS.includes(permissionKey)) {
    throw securityError('BAD_USER_INPUT', 'That is not a Security permission.');
  }
}

const holderOf = (user: {
  _id: string;
  personId?: string;
  username?: string;
  profile?: { name?: string };
}, nameOf: (user: any) => string | undefined): PermissionHolder => ({
  userId: user._id,
  personId: user.personId,
  username: user.username,
  displayName: nameOf(user),
});

/**
 * every Security permission with the users who hold it, directly or through a
 * user group. Locked accounts are left out. Super admins hold every permission
 * implicitly and are not listed. Security user groups that hold a permission
 * are listed too.
 */
export async function listPermissionAssignments(): Promise<PermissionAssignmentGroup[]> {
  // Any group can grant a Security permission, whatever its module.
  const grantingGroups = await UserGroups.find(
    { permissions: { $in: ALL_KEYS } },
    { sort: { name: 1 } }
  ).fetchAsync();
  const groupIds = grantingGroups.map((g) => g._id as string);

  const holders = await Users.find({
    locked: { $ne: true },
    isSuperAdmin: { $ne: true },
    $or: [{ permissions: { $in: ALL_KEYS } }, { groups: { $in: groupIds } }],
  }).fetchAsync();

  const nameOf = await userNameResolver(holders);
  const securityGroups = grantingGroups.filter(
    (g) => g.moduleName === ModuleNames.security
  );
  const byName = (a: PermissionHolder, b: PermissionHolder) =>
    (a.displayName || a.username || '').localeCompare(b.displayName || b.username || '');

  return SecurityPermissionCatalog.map((group: SecurityPermissionGroup) => ({
    featureKey: group.featureKey,
    featureName: group.featureName,
    permissions: group.permissions.map((permission) => {
      const grantedBy = new Set(
        grantingGroups
          .filter((g) => (g.permissions ?? []).includes(permission.key))
          .map((g) => g._id as string)
      );
      return {
        key: permission.key,
        name: permission.name,
        description: permission.description,
        users: holders
          .filter(
            (user) =>
              (user.permissions ?? []).includes(permission.key) ||
              (user.groups ?? []).some((id) => grantedBy.has(id))
          )
          .map((user) => holderOf(user, nameOf))
          .sort(byName),
        groups: securityGroups
          .filter((g) => (g.permissions ?? []).includes(permission.key))
          .map((g) => ({ groupId: g._id as string, name: g.name })),
      };
    }),
  }));
}

async function changePermission(
  permissionKey: string,
  selector: { userId: string } | { karkunId: string },
  add: boolean,
  actingUser: ActingUser
) {
  assertSecurityPermission(permissionKey);

  await runInTransaction(async () => {
    const user =
      'userId' in selector
        ? await Users.findOneAsync(selector.userId)
        : await Users.findOneAsync({ personId: selector.karkunId });
    if (!user) {
      throw securityError(
        'NOT_FOUND',
        'karkunId' in selector
          ? 'This karkun does not have a user account.'
          : 'That user was not found.'
      );
    }
    if (add && user.locked) {
      throw securityError('BAD_USER_INPUT', "This karkun's user account is locked.");
    }
    const userId = user._id as string;
    if (user.isSuperAdmin) {
      throw securityError(
        'BAD_USER_INPUT',
        'A super admin already holds every permission.'
      );
    }

    const holds = (user.permissions ?? []).includes(permissionKey);
    if (holds === add) return; // Nothing to change.

    await Users.updateAsync(
      userId,
      add
        ? { $addToSet: { permissions: permissionKey } }
        : { $pull: { permissions: permissionKey } }
    );

    await SecurityLogs.insertAsync({
      userId,
      operationType: SecurityOperationType.PERMISSIONS_CHANGED,
      operationBy: actingUser._id,
      operationTime: new Date(),
      operationDetails: {
        permissionsAdded: add ? [permissionKey] : [],
        permissionsRemoved: add ? [] : [permissionKey],
      },
      dataSource: DataSource.OPERATIONS,
      dataSourceDetail: null,
    });
  });
  return true;
}

/** Gives a permission to the user account of a karkun. */
export const addPermissionUser = (
  permissionKey: string,
  karkunId: string,
  actingUser: ActingUser
) => changePermission(permissionKey, { karkunId }, true, actingUser);

export const removePermissionUser = (
  permissionKey: string,
  userId: string,
  actingUser: ActingUser
) => changePermission(permissionKey, { userId }, false, actingUser);
