import { DataSource, ModuleNames } from 'meteor/idreesia-common/constants';
import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';
import {
  HrPermissionCatalog,
  type HrPermissionGroup,
} from 'meteor/idreesia-common/constants/hr';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { UserGroups, Users } from 'meteor/idreesia-common/server/collections/admin';
import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';
import {
  changeCommitteePermission,
  listCommitteesHolding,
} from 'meteor/idreesia-common/server/business-logic/admin/committee/committee-permissions';

import { hrError } from './errors';
import { type ActingUser } from './internal';
import { userNameResolver } from './user-names';

const ALL_KEYS = HrPermissionCatalog.flatMap((group) =>
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

export interface PermissionCommitteeHolder {
  committeeId: string;
  name: string;
  locationName?: string;
}

export interface PermissionAssignment {
  key: string;
  name: string;
  description: string;
  users: PermissionHolder[];
  /** HR user groups that hold the permission. */
  groups: PermissionGroupHolder[];
  /** Committees that hold the permission (their members and coordinators do). */
  committees: PermissionCommitteeHolder[];
}

export interface PermissionAssignmentGroup {
  featureKey: string;
  featureName: string;
  permissions: PermissionAssignment[];
}

export function assertHrPermission(permissionKey: string) {
  if (!ALL_KEYS.includes(permissionKey)) {
    throw hrError('BAD_USER_INPUT', 'That is not an HR permission.');
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
 * every HR permission with the users it is directly assigned to. Locked accounts are left out. Super admins hold every permission
 * implicitly and are not listed. HR user groups that hold a permission
 * are listed separately; their members are not.
 */
export async function listPermissionAssignments(): Promise<PermissionAssignmentGroup[]> {
  // Any group can grant an HR permission, whatever its module.
  const grantingGroups = await UserGroups.find(
    { permissions: { $in: ALL_KEYS } },
    { sort: { name: 1 } }
  ).fetchAsync();

  const holders = await Users.find({
    locked: { $ne: true },
    isSuperAdmin: { $ne: true },
    permissions: { $in: ALL_KEYS },
  }).fetchAsync();

  const nameOf = await userNameResolver(holders);
  const committees = await listCommitteesHolding(ALL_KEYS);
  const hrGroups = grantingGroups.filter(
    (g) => g.moduleName === ModuleNames.hr
  );
  const byName = (a: PermissionHolder, b: PermissionHolder) =>
    (a.displayName || a.username || '').localeCompare(b.displayName || b.username || '');

  return HrPermissionCatalog.map((group: HrPermissionGroup) => ({
    featureKey: group.featureKey,
    featureName: group.featureName,
    permissions: group.permissions.map((permission) => {
      return {
        key: permission.key,
        name: permission.name,
        description: permission.description,
        users: holders
          .filter((user) => (user.permissions ?? []).includes(permission.key))
          .map((user) => holderOf(user, nameOf))
          .sort(byName),
        groups: hrGroups
          .filter((g) => (g.permissions ?? []).includes(permission.key))
          .map((g) => ({ groupId: g._id as string, name: g.name })),
        committees: committees
          .filter((c) => c.permissions.includes(permission.key))
          .map(({ committeeId, name, locationName }) => ({ committeeId, name, locationName })),
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
  assertHrPermission(permissionKey);

  await runInTransaction(async () => {
    const user =
      'userId' in selector
        ? await Users.findOneAsync(selector.userId)
        : await Users.findOneAsync({ personId: selector.karkunId });
    if (!user) {
      throw hrError(
        'NOT_FOUND',
        'karkunId' in selector
          ? 'This karkun does not have a user account.'
          : 'That user was not found.'
      );
    }
    if (add && user.locked) {
      throw hrError('BAD_USER_INPUT', "This karkun's user account is locked.");
    }
    const userId = user._id as string;
    if (user.isSuperAdmin) {
      throw hrError(
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

/** Gives a HR permission to a committee: its members and coordinators hold it. */
export const addCommitteePermission = async (
  permissionKey: string,
  committeeId: string,
  actingUser: ActingUser
) => {
  assertHrPermission(permissionKey);
  return changeCommitteePermission(committeeId, permissionKey, true, actingUser);
};

export const removeCommitteePermission = async (
  permissionKey: string,
  committeeId: string,
  actingUser: ActingUser
) => {
  assertHrPermission(permissionKey);
  return changeCommitteePermission(committeeId, permissionKey, false, actingUser);
};
