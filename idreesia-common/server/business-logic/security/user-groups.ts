import { DataSource, ModuleNames } from 'meteor/idreesia-common/constants';
import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import {
  UserGroups,
  Users,
  type UserGroupDocument,
} from 'meteor/idreesia-common/server/collections/admin';
import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';
import { escapeRegExp } from 'meteor/idreesia-common/utilities/lodash';

import { securityError } from './errors';
import { assertSecurityPermission } from './permissions';
import { cleanText, requireText, type ActingUser } from './internal';
import { userNameResolver } from './user-names';

/**
 * Security's own user groups: the shared `user-groups` collection, limited
 * to groups whose module is Security. Membership is the group's id in the
 * user's `groups`. A group's permissions are effective for its members.
 */
const MODULE = ModuleNames.security;

export interface GroupMember {
  userId: string;
  personId?: string;
  username?: string;
  displayName?: string;
}

export interface SecurityUserGroup {
  _id: string;
  name: string;
  description?: string;
  users: GroupMember[];
}

const memberOf = (user: {
  _id: string;
  personId?: string;
  username?: string;
  profile?: { name?: string };
}, nameOf: (user: any) => string | undefined): GroupMember => ({
  userId: user._id,
  personId: user.personId,
  username: user.username,
  displayName: nameOf(user),
});

async function getGroup(groupId: string): Promise<UserGroupDocument> {
  const group = await UserGroups.findOneAsync({ _id: groupId, moduleName: MODULE });
  if (!group) throw securityError('NOT_FOUND', 'That group was not found.');
  return group;
}

async function assertNameFree(name: string, exceptId?: string) {
  const clash = await UserGroups.findOneAsync({
    name: { $regex: new RegExp(`^${escapeRegExp(name)}$`, 'i') },
    ...(exceptId ? { _id: { $ne: exceptId } } : {}),
  });
  if (clash) {
    throw securityError('CONFLICT', `A user group named '${name}' already exists.`);
  }
}

/** The Security groups with their members. */
export async function listUserGroups(): Promise<SecurityUserGroup[]> {
  const groups = await UserGroups.find({ moduleName: MODULE }, { sort: { name: 1 } }).fetchAsync();
  if (groups.length === 0) return [];

  const users = await Users.find({
    groups: { $in: groups.map((group) => group._id as string) },
  }).fetchAsync();

  const nameOf = await userNameResolver(users);

  return groups.map((group) => ({
    _id: group._id as string,
    name: group.name,
    description: group.description,
    users: users
      .filter((user) => (user.groups ?? []).includes(group._id as string))
      .map((user) => memberOf(user, nameOf))
      .sort((a, b) =>
        (a.displayName || a.username || '').localeCompare(b.displayName || b.username || '')
      ),
  }));
}

export async function createUserGroup(
  values: { name: string; description?: string | null },
  actingUser: ActingUser
) {
  const name = requireText(values.name, 'The name');
  await assertNameFree(name);
  const now = new Date();
  const _id = await UserGroups.insertAsync({
    name,
    moduleName: MODULE,
    description: cleanText(values.description),
    createdAt: now,
    createdBy: actingUser._id,
    updatedAt: now,
    updatedBy: actingUser._id,
  });
  return UserGroups.findOneAsync(_id);
}

export async function updateUserGroup(
  values: { _id: string; name: string; description?: string | null },
  actingUser: ActingUser
) {
  await getGroup(values._id);
  const name = requireText(values.name, 'The name');
  await assertNameFree(name, values._id);
  const description = cleanText(values.description);
  const changes = { name, updatedAt: new Date(), updatedBy: actingUser._id };
  await UserGroups.updateAsync(
    values._id,
    description
      ? { $set: { ...changes, description } }
      : { $set: changes, $unset: { description: '' } }
  );
  return UserGroups.findOneAsync(values._id);
}

/** Deletes a group that has no members. */
export async function deleteUserGroup(groupId: string) {
  await getGroup(groupId);
  if ((await Users.find({ groups: groupId }).countAsync()) > 0) {
    throw securityError(
      'CONFLICT',
      'This group still has users. Remove them before deleting the group.'
    );
  }
  await UserGroups.removeAsync(groupId);
  return true;
}

async function changeMember(
  groupId: string,
  selector: { userId: string } | { karkunId: string },
  add: boolean
) {
  await runInTransaction(async () => {
    await getGroup(groupId);
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
    await Users.updateAsync(
      user._id as string,
      add ? { $addToSet: { groups: groupId } } : { $pull: { groups: groupId } }
    );
  });
  return true;
}

/** Puts the user account of a karkun in the group. */
export const addGroupMember = (groupId: string, karkunId: string) =>
  changeMember(groupId, { karkunId }, true);

export const removeGroupMember = (groupId: string, userId: string) =>
  changeMember(groupId, { userId }, false);

async function changeGroupPermission(
  groupId: string,
  permissionKey: string,
  add: boolean,
  actingUser: ActingUser
) {
  assertSecurityPermission(permissionKey);

  await runInTransaction(async () => {
    const group = await getGroup(groupId);
    if ((group.permissions ?? []).includes(permissionKey) === add) return; // Nothing to change.

    await UserGroups.updateAsync(
      groupId,
      add ? { $addToSet: { permissions: permissionKey } } : { $pull: { permissions: permissionKey } }
    );

    await SecurityLogs.insertAsync({
      groupId,
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

/** Gives a Security permission to a group. */
export const addGroupPermission = (groupId: string, permissionKey: string, actingUser: ActingUser) =>
  changeGroupPermission(groupId, permissionKey, true, actingUser);

export const removeGroupPermission = (groupId: string, permissionKey: string, actingUser: ActingUser) =>
  changeGroupPermission(groupId, permissionKey, false, actingUser);
