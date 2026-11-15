import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';

import { findOneUser, type MappedUser } from './map-user';
import { isTwoFactorEnabled } from './two-factor-status';

interface UserRef {
  _id: string;
}

interface SuperAdminCandidate {
  locked?: boolean;
  isSuperAdmin?: boolean;
}

/**
 * Whether the user has super-admin rights: every permission, every instance
 * and every committee. A locked account has no rights at all, flag or not.
 */
export const isSuperAdmin = (user?: SuperAdminCandidate | null) =>
  !!user && user.locked !== true && user.isSuperAdmin === true;

/** Number of unlocked super-admins other than `excludeUserId`. */
const countOtherActiveSuperAdmins = (excludeUserId: string) =>
  Users.find({
    _id: { $ne: excludeUserId },
    isSuperAdmin: true,
    locked: { $ne: true },
  }).countAsync();

/**
 * Throws when `userId` is the only unlocked super-admin, so the last one can't
 * be revoked or locked and leave nobody able to manage super-admins.
 */
export async function assertNotLastSuperAdmin(userId: string) {
  if ((await countOtherActiveSuperAdmins(userId)) === 0) {
    throw new Error('The last super admin cannot be removed or locked.');
  }
}

/**
 * A super-admin account can only be changed by another super-admin, so that
 * someone who manages users can't take one over (reset its password or
 * two-factor) or lock it. The caller is read from the database, not trusted
 * from the request.
 */
export async function assertCanManageUser(targetUserId: string, caller: UserRef) {
  const target = await Users.findOneAsync(targetUserId);
  if (target?.isSuperAdmin !== true) return;

  const callerUser = await Users.findOneAsync(caller._id);
  if (!isSuperAdmin(callerUser)) {
    throw new Error('Only a super admin can change a super admin account.');
  }
}

/**
 * Grants or revokes super-admin rights. Only a super-admin can do this. The
 * user being made a super-admin must be unlocked and have two-factor
 * authentication enabled. The last unlocked super-admin can't be revoked.
 */
export async function setSuperAdmin(
  { userId, isSuperAdmin: grant }: { userId: string; isSuperAdmin: boolean },
  user: UserRef,
  dataSource: string,
  dataSourceDetail: string | null = null
): Promise<MappedUser> {
  return runInTransaction(async () => {
    const caller = await Users.findOneAsync(user._id);
    if (!isSuperAdmin(caller)) {
      throw new Error('Only a super admin can grant or revoke super admin rights.');
    }

    const target = await Users.findOneAsync(userId);
    if (!target) {
      throw new Error('User not found.');
    }

    if ((target.isSuperAdmin === true) === grant) {
      return findOneUser(userId);
    }

    if (grant) {
      if (target.locked === true) {
        throw new Error('A locked user cannot be made a super admin.');
      }
      if (!isTwoFactorEnabled(target)) {
        throw new Error(
          'Two-factor authentication must be enabled before making a user a super admin.'
        );
      }
      await Users.updateAsync(userId, { $set: { isSuperAdmin: true } });
    } else {
      if (target.locked !== true) {
        await assertNotLastSuperAdmin(userId);
      }
      await Users.updateAsync(userId, { $unset: { isSuperAdmin: '' } });
    }

    await SecurityLogs.insertAsync({
      userId,
      operationType: grant
        ? SecurityOperationType.SUPER_ADMIN_GRANTED
        : SecurityOperationType.SUPER_ADMIN_REVOKED,
      operationBy: user._id,
      operationTime: new Date(),
      dataSource,
      dataSourceDetail,
    });

    return findOneUser(userId);
  });
}
