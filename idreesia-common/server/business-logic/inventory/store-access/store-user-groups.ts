import { GraphQLError } from 'graphql';

import { ModuleNames } from 'meteor/idreesia-common/constants';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import {
  UserGroups,
  Users,
  type UserGroupDocument,
} from 'meteor/idreesia-common/server/collections/admin';
import { userNameResolver } from 'meteor/idreesia-common/server/business-logic/hr-common/user-names';
import { escapeRegExp } from 'meteor/idreesia-common/utilities/lodash';

import { removeAllPhysicalStoreAccessOfGroup } from './store-access-admin';

/**
 * The Stores module's user groups, shared by all stores: the shared
 * `user-groups` collection, limited to groups whose module is Stores.
 * Membership is the group's id in the user's `groups`. What a group may do on
 * each store is given on that store's access entries (see
 * `PhysicalStoreAccess`), so a group can hold different permissions on
 * different stores.
 */
const MODULE = ModuleNames.stores;
const MAX_NAME_LENGTH = 255;

const fail = (code: string, message: string): never => {
  throw new GraphQLError(message, { extensions: { code } });
};

interface ActingUser {
  _id: string;
}

export interface StoreUserGroupMember {
  userId: string;
  personId?: string;
  username?: string;
  displayName?: string;
}

export interface StoreUserGroup {
  _id: string;
  name: string;
  description?: string;
  users: StoreUserGroupMember[];
}

interface GroupValues {
  name: string;
  description?: string | null;
}

const cleanName = (value: string | null | undefined): string => {
  const name = (value ?? '').trim().replace(/\s+/g, ' ');
  if (!name) fail('BAD_USER_INPUT', 'The name is required.');
  if (name.length > MAX_NAME_LENGTH) fail('BAD_USER_INPUT', 'The name is too long.');
  return name;
};

const cleanDescription = (value?: string | null): string | undefined =>
  value?.trim() || undefined;

async function getGroup(groupId: string): Promise<UserGroupDocument> {
  const group = await UserGroups.findOneAsync({ _id: groupId, moduleName: MODULE });
  if (!group) return fail('NOT_FOUND', 'That group was not found.');
  return group;
}

// Group names are unique across all groups, as everywhere else.
async function assertNameFree(name: string, exceptId?: string) {
  const clash = await UserGroups.findOneAsync({
    name: { $regex: new RegExp(`^${escapeRegExp(name)}$`, 'i') },
    ...(exceptId ? { _id: { $ne: exceptId } } : {}),
  });
  if (clash) {
    fail('CONFLICT', `A user group named '${name}' already exists.`);
  }
}

/** The Stores groups with their members. */
export async function listStoreUserGroups(): Promise<StoreUserGroup[]> {
  const groups = await UserGroups.find(
    { moduleName: MODULE },
    { sort: { name: 1 } }
  ).fetchAsync();
  if (groups.length === 0) return [];

  const users = await Users.find({
    groups: { $in: groups.map(group => group._id as string) },
  }).fetchAsync();
  const nameOf = await userNameResolver(users);

  return groups.map(group => ({
    _id: group._id as string,
    name: group.name,
    description: group.description,
    users: users
      .filter(user => (user.groups ?? []).includes(group._id as string))
      .map(user => ({
        userId: user._id as string,
        personId: user.personId,
        username: user.username,
        displayName: nameOf(user),
      }))
      .sort((a, b) =>
        (a.displayName || a.username || '').localeCompare(
          b.displayName || b.username || ''
        )
      ),
  }));
}

export async function createStoreUserGroup(
  values: GroupValues,
  actingUser: ActingUser
) {
  const name = cleanName(values.name);
  await assertNameFree(name);
  const now = new Date();
  const _id = await UserGroups.insertAsync({
    name,
    moduleName: MODULE,
    description: cleanDescription(values.description),
    createdAt: now,
    createdBy: actingUser._id,
    updatedAt: now,
    updatedBy: actingUser._id,
  });
  return UserGroups.findOneAsync(_id);
}

export async function updateStoreUserGroup(
  values: GroupValues & { _id: string },
  actingUser: ActingUser
) {
  await getGroup(values._id);
  const name = cleanName(values.name);
  await assertNameFree(name, values._id);
  const description = cleanDescription(values.description);
  const changes = { name, updatedAt: new Date(), updatedBy: actingUser._id };
  await UserGroups.updateAsync(
    values._id,
    description
      ? { $set: { ...changes, description } }
      : { $set: changes, $unset: { description: '' } }
  );
  return UserGroups.findOneAsync(values._id);
}

/**
 * Deletes a Stores group that has no members, and takes the permissions it
 * held on every store.
 */
export async function deleteStoreUserGroup(
  groupId: string,
  actingUser: ActingUser,
  dataSource: string
): Promise<true> {
  await runInTransaction(async () => {
    await getGroup(groupId);
    if ((await Users.find({ groups: groupId }).countAsync()) > 0) {
      fail(
        'CONFLICT',
        'This group still has users. Remove them before deleting the group.'
      );
    }
    await removeAllPhysicalStoreAccessOfGroup(groupId, actingUser, dataSource);
    await UserGroups.removeAsync(groupId);
  });
  return true;
}

async function changeMember(
  groupId: string,
  selector: { userId: string } | { karkunId: string },
  add: boolean
): Promise<true> {
  await runInTransaction(async () => {
    await getGroup(groupId);
    const user =
      'userId' in selector
        ? await Users.findOneAsync(selector.userId)
        : await Users.findOneAsync({ personId: selector.karkunId });
    if (!user) {
      fail(
        'NOT_FOUND',
        'karkunId' in selector
          ? 'This karkun does not have a user account.'
          : 'That user was not found.'
      );
      return;
    }
    if (add && user.locked) {
      fail('BAD_USER_INPUT', "This karkun's user account is locked.");
    }
    await Users.updateAsync(
      user._id as string,
      add ? { $addToSet: { groups: groupId } } : { $pull: { groups: groupId } }
    );
  });
  return true;
}

/** Puts the user account of a karkun in a Stores group. */
export const addStoreUserGroupMember = (groupId: string, karkunId: string) =>
  changeMember(groupId, { karkunId }, true);

export const removeStoreUserGroupMember = (groupId: string, userId: string) =>
  changeMember(groupId, { userId }, false);
