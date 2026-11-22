import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';

import { findOneUser } from './users/map-user';
import {
  applyChatAccountCreation,
  applyPasswordReset,
  applyUserLocked,
} from './users/user-mutations';

// The few things someone who manages a location (ADMIN_MANAGE_ORG_LOCATIONS)
// may do to the accounts of its karkuns. They are not the user management
// of Access Management: an account outside the location, a service account
// or a super-admin can't be touched from here, nor can your own account be
// locked.

interface UserRef {
  _id: string;
}

const DATA_SOURCE_DETAIL = 'org-location';

async function assertUserOfLocation(locationId: string, userId: string) {
  const target = await Users.findOneAsync(userId);
  const karkun = target?.personId
    ? await People.findOneAsync({
        _id: target.personId,
        isKarkun: true,
        'karkunData.mehfilLocationId': locationId,
        deletedAt: { $exists: false },
      })
    : null;
  if (!target || !karkun || target.isServiceAccount) {
    throw new Error('User not found in this location.');
  }
  if (target.isSuperAdmin === true) {
    throw new Error('Only a super admin can change a super admin account.');
  }
}

export async function resetOrgLocationUserPassword(
  {
    locationId,
    userId,
    password,
  }: { locationId: string; userId: string; password: string },
  user: UserRef,
  dataSource: string
) {
  if (!password) throw new Error('A password is required.');
  return runInTransaction(async () => {
    await assertUserOfLocation(locationId, userId);
    await applyPasswordReset(userId, password, user, dataSource, DATA_SOURCE_DETAIL);
    return findOneUser(userId);
  });
}

export async function setOrgLocationUserLocked(
  {
    locationId,
    userId,
    locked,
  }: { locationId: string; userId: string; locked: boolean },
  user: UserRef,
  dataSource: string
) {
  if (locked && userId === user._id) {
    throw new Error('You cannot lock your own account.');
  }
  return runInTransaction(async () => {
    await assertUserOfLocation(locationId, userId);
    await applyUserLocked(userId, locked, user, dataSource, DATA_SOURCE_DETAIL);
    return findOneUser(userId);
  });
}

export async function createOrgLocationUserChatAccount(
  { locationId, userId }: { locationId: string; userId: string },
  user: UserRef,
  dataSource: string
) {
  return runInTransaction(async () => {
    await assertUserOfLocation(locationId, userId);
    await applyChatAccountCreation(userId, user, dataSource, DATA_SOURCE_DETAIL);
    return findOneUser(userId);
  });
}
