import { GraphQLError } from 'graphql';

import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';
import {
  StorePermissionInfos,
  isStorePermission,
  type StoreAccessSubjectType,
} from 'meteor/idreesia-common/constants/stores-permissions';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { UserGroups, Users } from 'meteor/idreesia-common/server/collections/admin';
import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';
import {
  PhysicalStoreAccess,
  PhysicalStores,
} from 'meteor/idreesia-common/server/collections/inventory';

import { ensurePhysicalStoreAccessIndexes } from './store-access';

const fail = (code: string, message: string): never => {
  throw new GraphQLError(message, { extensions: { code } });
};

const isDuplicateKey = (error: unknown) =>
  (error as { code?: number }).code === 11000 ||
  (error instanceof Error && error.message.includes('E11000'));

// ---------------------------------------------------------------------------
// Who holds what
// ---------------------------------------------------------------------------

export interface StorePermissionUserHolder {
  userId: string;
  /** The karkun the user account belongs to. */
  personId?: string;
  username?: string;
  displayName?: string;
}

export interface StorePermissionGroupHolder {
  groupId: string;
  name: string;
}

export interface StorePermissionHolders {
  key: string;
  name: string;
  /** The part of the Stores module the permission belongs to. */
  groupName: string;
  users: StorePermissionUserHolder[];
  groups: StorePermissionGroupHolder[];
}

/**
 * Every store permission with the users and the user groups that hold it on the
 * store.
 */
export async function listPhysicalStoreAccess(
  physicalStoreId: string
): Promise<StorePermissionHolders[]> {
  const store = await PhysicalStores.findOneAsync(physicalStoreId);
  if (!store) return fail('NOT_FOUND', 'Store not found.');

  const entries = await PhysicalStoreAccess.find({
    physicalStoreId,
  }).fetchAsync();

  const userIds = entries
    .filter(entry => entry.subjectType === 'user')
    .map(entry => entry.subjectId);
  const groupIds = entries
    .filter(entry => entry.subjectType === 'group')
    .map(entry => entry.subjectId);
  const users = userIds.length
    ? await Users.find({ _id: { $in: userIds } }).fetchAsync()
    : [];
  const groups = groupIds.length
    ? await UserGroups.find({ _id: { $in: groupIds } }).fetchAsync()
    : [];
  const userById = new Map(users.map(user => [user._id as string, user]));
  const groupById = new Map(groups.map(group => [group._id as string, group]));

  return StorePermissionInfos.map(info => ({
    key: info.key,
    name: info.name,
    groupName: info.groupName,
    users: entries
      .filter(
        entry =>
          entry.subjectType === 'user' && entry.permissions.includes(info.key)
      )
      .map(entry => {
        const user = userById.get(entry.subjectId);
        return {
          userId: entry.subjectId,
          personId: user?.personId,
          username: user?.username,
          displayName: user?.displayName,
        };
      }),
    groups: entries
      .filter(
        entry =>
          entry.subjectType === 'group' && entry.permissions.includes(info.key)
      )
      .map(entry => ({
        groupId: entry.subjectId,
        name: groupById.get(entry.subjectId)?.name ?? entry.subjectId,
      })),
  }));
}

// ---------------------------------------------------------------------------
// Giving and taking permissions
// ---------------------------------------------------------------------------

interface ActingUser {
  _id: string;
}

interface Subject {
  type: StoreAccessSubjectType;
  id: string;
}

const assertStoreAndPermission = async (
  physicalStoreId: string,
  permission: string
) => {
  if (!isStorePermission(permission)) {
    fail('BAD_USER_INPUT', `Unknown store permission '${permission}'.`);
  }
  const store = await PhysicalStores.findOneAsync(physicalStoreId);
  if (!store) fail('NOT_FOUND', 'Store not found.');
};

const securityLog = (
  subject: Subject,
  physicalStoreId: string,
  details: { permissionsAdded?: string[]; permissionsRemoved?: string[] },
  actingUserId: string,
  dataSource: string,
  dataSourceDetail: string | null
) =>
  SecurityLogs.insertAsync({
    ...(subject.type === 'user'
      ? { userId: subject.id }
      : { groupId: subject.id }),
    operationType: SecurityOperationType.INSTANCE_ACCESS_CHANGED,
    operationBy: actingUserId,
    operationTime: new Date(),
    operationDetails: { physicalStoreId, ...details },
    dataSource,
    dataSourceDetail,
  } as never);

async function grant(
  physicalStoreId: string,
  permission: string,
  subject: Subject,
  actingUser: ActingUser,
  dataSource: string,
  dataSourceDetail: string | null
): Promise<true> {
  await ensurePhysicalStoreAccessIndexes();
  try {
    await runInTransaction(async () => {
      const selector = {
        physicalStoreId,
        subjectType: subject.type,
        subjectId: subject.id,
      };
      const existing = await PhysicalStoreAccess.findOneAsync(selector);
      const now = new Date();
      if (!existing) {
        await PhysicalStoreAccess.insertAsync({
          ...selector,
          permissions: [permission],
          createdAt: now,
          createdBy: actingUser._id,
          updatedAt: now,
          updatedBy: actingUser._id,
        });
      } else if (!existing.permissions.includes(permission)) {
        await PhysicalStoreAccess.updateAsync(
          { _id: existing._id },
          {
            $set: {
              permissions: [...existing.permissions, permission],
              updatedAt: now,
              updatedBy: actingUser._id,
            },
          }
        );
      } else {
        return;
      }
      await securityLog(
        subject,
        physicalStoreId,
        { permissionsAdded: [permission] },
        actingUser._id,
        dataSource,
        dataSourceDetail
      );
    });
  } catch (error) {
    // A concurrent first grant to the same subject: the other one won, retry.
    if (isDuplicateKey(error)) {
      return grant(
        physicalStoreId,
        permission,
        subject,
        actingUser,
        dataSource,
        dataSourceDetail
      );
    }
    throw error;
  }
  return true;
}

async function revoke(
  physicalStoreId: string,
  permission: string,
  subject: Subject,
  actingUser: ActingUser,
  dataSource: string,
  dataSourceDetail: string | null
): Promise<true> {
  await runInTransaction(async () => {
    const existing = await PhysicalStoreAccess.findOneAsync({
      physicalStoreId,
      subjectType: subject.type,
      subjectId: subject.id,
    });
    if (!existing || !existing.permissions.includes(permission)) {
      fail('NOT_FOUND', 'This permission was not given on this store.');
      return;
    }

    const remaining = existing.permissions.filter(item => item !== permission);
    if (remaining.length === 0) {
      await PhysicalStoreAccess.removeAsync({ _id: existing._id });
    } else {
      await PhysicalStoreAccess.updateAsync(
        { _id: existing._id },
        {
          $set: {
            permissions: remaining,
            updatedAt: new Date(),
            updatedBy: actingUser._id,
          },
        }
      );
    }
    await securityLog(
      subject,
      physicalStoreId,
      { permissionsRemoved: [permission] },
      actingUser._id,
      dataSource,
      dataSourceDetail
    );
  });
  return true;
}

/**
 * Gives a karkun a permission on the store. The karkun is let in through their
 * user account, so they need an unlocked one.
 */
export async function addPhysicalStoreAccessUser(
  { physicalStoreId, permission, karkunId }: {
    physicalStoreId: string;
    permission: string;
    karkunId: string;
  },
  actingUser: ActingUser,
  dataSource: string,
  dataSourceDetail: string | null = null
): Promise<true> {
  await assertStoreAndPermission(physicalStoreId, permission);
  const targetUser = await Users.findOneAsync({ personId: karkunId });
  if (!targetUser) {
    return fail('BAD_USER_INPUT', 'This karkun does not have a user account.');
  }
  if (targetUser.locked) {
    return fail('BAD_USER_INPUT', "This karkun's user account is locked.");
  }
  return grant(
    physicalStoreId,
    permission,
    { type: 'user', id: targetUser._id as string },
    actingUser,
    dataSource,
    dataSourceDetail
  );
}

/** Takes a permission on the store from a user. */
export async function removePhysicalStoreAccessUser(
  { physicalStoreId, permission, userId }: {
    physicalStoreId: string;
    permission: string;
    userId: string;
  },
  actingUser: ActingUser,
  dataSource: string,
  dataSourceDetail: string | null = null
): Promise<true> {
  await assertStoreAndPermission(physicalStoreId, permission);
  return revoke(
    physicalStoreId,
    permission,
    { type: 'user', id: userId },
    actingUser,
    dataSource,
    dataSourceDetail
  );
}

/** Gives a permission on the store to a user group (all of its members). */
export async function addPhysicalStoreAccessGroup(
  { physicalStoreId, permission, groupId }: {
    physicalStoreId: string;
    permission: string;
    groupId: string;
  },
  actingUser: ActingUser,
  dataSource: string,
  dataSourceDetail: string | null = null
): Promise<true> {
  await assertStoreAndPermission(physicalStoreId, permission);
  const group = await UserGroups.findOneAsync(groupId);
  if (!group) return fail('NOT_FOUND', 'User group not found.');
  return grant(
    physicalStoreId,
    permission,
    { type: 'group', id: groupId },
    actingUser,
    dataSource,
    dataSourceDetail
  );
}

/** Takes a permission on the store from a user group. */
export async function removePhysicalStoreAccessGroup(
  { physicalStoreId, permission, groupId }: {
    physicalStoreId: string;
    permission: string;
    groupId: string;
  },
  actingUser: ActingUser,
  dataSource: string,
  dataSourceDetail: string | null = null
): Promise<true> {
  await assertStoreAndPermission(physicalStoreId, permission);
  return revoke(
    physicalStoreId,
    permission,
    { type: 'group', id: groupId },
    actingUser,
    dataSource,
    dataSourceDetail
  );
}
