import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';
import { createChatUser } from 'meteor/idreesia-common/server/chat';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';
import { difference, get } from 'meteor/idreesia-common/utilities/lodash';

import { findOneUser, type MappedUser } from './map-user';
import { assertCanManageUser, assertNotLastSuperAdmin } from './super-admin';

type LooseRecord = Record<string, any>;

interface UserRef {
  _id: string;
}

declare const Accounts: {
  createUserAsync(options: LooseRecord): Promise<string>;
  findUserByUsername(userName?: string): Promise<{ _id: string } | null>;
  setPasswordAsync(userId: string, password: string): Promise<void>;
  setUsername(userId: string, newUsername: string): Promise<void>;
};

// Letters, digits, '.', '-' and '_' only - the characters the chat server
// accepts, so every ERP user name can also be used for a chat account.
const USER_NAME_PATTERN = /^[0-9a-zA-Z._-]+$/;

/**
 * Validates a user name and checks that no other ERP user has it.
 * `Accounts.findUserByUsername` ignores case, so `Ali` and `ali` clash.
 * Returns the trimmed name to store.
 */
async function assertUserNameAvailable(
  userName: string,
  excludeUserId?: string
): Promise<string> {
  const trimmed = userName.trim();
  if (!USER_NAME_PATTERN.test(trimmed)) {
    throw new Error(
      `User name '${trimmed}' may only contain letters, digits, '.', '-' and '_'.`
    );
  }

  const existingUser = await Accounts.findUserByUsername(trimmed);
  if (existingUser && existingUser._id !== excludeUserId) {
    throw new Error(`User name '${trimmed}' is already in use.`);
  }

  return trimmed;
}

export async function createUser(
  { userName: rawUserName, password, email, displayName, personId }: LooseRecord,
  user: UserRef,
  dataSource: string,
  dataSourceDetail: string | null = null
): Promise<MappedUser> {
  return runInTransaction(async () => {
    const userName = rawUserName
      ? await assertUserNameAvailable(rawUserName)
      : rawUserName;

    if (personId) {
      const existingUser = await Users.findOneAsync({ personId });
      if (existingUser) {
        throw new Error(`This person already has a user account.`);
      }
    }

    let newUserId = null;
    if (userName && password) {
      newUserId = await Accounts.createUserAsync({
        username: userName,
        password,
      });

      await Users.updateAsync(newUserId, {
        $set: {
          email,
          personId,
          profile: {
            name: displayName,
          },
        },
      });
    } else if (email) {
      newUserId = await Accounts.createUserAsync({
        email,
      });

      await Users.updateAsync(newUserId, {
        $set: {
          personId,
          profile: {
            name: displayName,
          },
        },
      });
    }

    // Create a security log
    await SecurityLogs.insertAsync({
      userId: newUserId,
      operationType: SecurityOperationType.ACCOUNT_CREATED,
      operationBy: user._id,
      operationTime: new Date(),
      dataSource,
      dataSourceDetail,
    });

    return findOneUser(newUserId);
  });
}

export async function updateUser(
  { userId, userName, password, email, displayName, locked }: LooseRecord,
  user: UserRef,
  dataSource: string,
  dataSourceDetail: string | null = null
): Promise<MappedUser> {
  return runInTransaction(async () => {
    await assertCanManageUser(userId, user);
    const existingUser = await findOneUser(userId);

    if (
      locked === true &&
      existingUser.locked !== true &&
      existingUser.isSuperAdmin
    ) {
      await assertNotLastSuperAdmin(userId);
    }

    // A user name can only be set once. After that it is fixed, because the
    // chat account (if any) is keyed on it.
    if (userName && !existingUser.username) {
      const newUserName = await assertUserNameAvailable(userName, userId);
      await Accounts.setUsername(userId, newUserName);
    }
    if (existingUser.locked !== locked) {
      // Create a security log
      if (locked === true) {
        await SecurityLogs.insertAsync({
          userId,
          operationType: SecurityOperationType.ACCOUNT_LOCKED,
          operationBy: user._id,
          operationTime: new Date(),
          dataSource,
          dataSourceDetail,
        });
      } else {
        await SecurityLogs.insertAsync({
          userId,
          operationType: SecurityOperationType.ACCOUNT_UNLOCKED,
          operationBy: user._id,
          operationTime: new Date(),
          dataSource,
          dataSourceDetail,
        });
      }
    }

    if (password) {
      await Accounts.setPasswordAsync(userId, password);

      // Create a security log
      await SecurityLogs.insertAsync({
        userId,
        operationType: SecurityOperationType.PASSWORD_RESET,
        operationBy: user._id,
        operationTime: new Date(),
        dataSource,
        dataSourceDetail,
      });
    }

    if (email) {
      await Users.updateAsync(userId, {
        $set: {
          emails: [
            {
              address: email,
            },
          ],
          locked,
          profile: {
            name: displayName,
          },
        },
      });
    } else {
      await Users.updateAsync(userId, {
        $unset: {
          emails: '',
        },
        $set: {
          locked,
          profile: {
            name: displayName,
          },
        },
      });
    }

    return findOneUser(userId);
  });
}

export async function setUserPermissions(
  { userId, permissions }: { userId: string; permissions: string[] },
  user: UserRef,
  dataSource: string,
  dataSourceDetail: string | null = null
): Promise<MappedUser> {
  return runInTransaction(async () => {
    await assertCanManageUser(userId, user);
    const existingUser = await findOneUser(userId);

    // A super-admin already has every permission, and the API reports all of
    // them for one, so saving the permissions form would store the full list.
    // Ignore the write and keep what was explicitly granted.
    if (existingUser.isSuperAdmin) {
      return existingUser;
    }

    await Users.updateAsync(userId, { $set: { permissions } });

    // Create a security log
    const permissionsAdded = difference(
      permissions,
      existingUser.permissions || []
    );
    const permissionsRemoved = difference(
      existingUser.permissions || [],
      permissions
    );

    await SecurityLogs.insertAsync({
      userId,
      operationType: SecurityOperationType.PERMISSIONS_CHANGED,
      operationBy: user._id,
      operationTime: new Date(),
      operationDetails: {
        permissionsAdded,
        permissionsRemoved,
      },
      dataSource,
      dataSourceDetail,
    });

    return findOneUser(userId);
  });
}

export async function setUserInstanceAccess(
  { userId, instances }: { userId: string; instances: string[] },
  user: UserRef,
  dataSource: string,
  dataSourceDetail: string | null = null
): Promise<MappedUser> {
  return runInTransaction(async () => {
    await assertCanManageUser(userId, user);
    const existingUser = await findOneUser(userId);
    await Users.updateAsync(userId, { $set: { instances } });

    // Create a security log
    const instancesAdded = difference(instances, existingUser.instances || []);
    const instancesRemoved = difference(existingUser.instances || [], instances);

    await SecurityLogs.insertAsync({
      userId,
      operationType: SecurityOperationType.INSTANCE_ACCESS_CHANGED,
      operationBy: user._id,
      operationTime: new Date(),
      operationDetails: {
        instancesAdded,
        instancesRemoved,
      },
      dataSource,
      dataSourceDetail,
    });

    return findOneUser(userId);
  });
}

/**
 * Creates (or links) the chat account for an ERP user. Needs a saved user
 * name and display name: the user name becomes the chat user name and the
 * display name the chat display name.
 */
export async function createChatAccount(
  { userId }: { userId: string },
  user: UserRef,
  dataSource: string,
  dataSourceDetail: string | null = null
): Promise<MappedUser> {
  return runInTransaction(async () => {
    await assertCanManageUser(userId, user);
    const existingUser = await Users.findOneAsync(userId);
    if (!existingUser) {
      throw new Error('User not found.');
    }
    if (existingUser.chatUserId) {
      throw new Error('This user already has a chat account.');
    }

    const username = existingUser.username?.trim();
    const name = existingUser.profile?.name?.trim();
    if (!username || !name) {
      throw new Error(
        'A user name and display name are required to create a chat account.'
      );
    }

    const chatUserId = await createChatUser({
      username,
      name,
      email: get(existingUser, 'emails.0.address', null),
    });

    await Users.updateAsync(userId, { $set: { chatUserId } });

    await SecurityLogs.insertAsync({
      userId,
      operationType: SecurityOperationType.CHAT_ACCOUNT_CREATED,
      operationBy: user._id,
      operationTime: new Date(),
      dataSource,
      dataSourceDetail,
    });

    return findOneUser(userId);
  });
}

/** Records a login: the user's last login time and a security log entry. */
export async function recordUserLogin(
  userId: string,
  dataSource: string,
  dataSourceDetail: string | null = null
): Promise<void> {
  return runInTransaction(async () => {
    const loginTime = new Date();
    await Users.updateAsync(userId, { $set: { lastLoggedInAt: loginTime } });
    await SecurityLogs.insertAsync({
      userId,
      operationType: SecurityOperationType.LOGIN,
      operationTime: loginTime,
      dataSource,
      dataSourceDetail,
    });
  });
}
