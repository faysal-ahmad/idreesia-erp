import { Random } from 'meteor/random';
import type { Mongo } from 'meteor/mongo';
import { subMinutes } from 'date-fns';
import {
  difference,
  get,
  kebabCase,
} from 'meteor/idreesia-common/utilities/lodash';
import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';
import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';

type LooseRecord = Record<string, any>;

interface AppUser extends LooseRecord {
  _id: string;
  username?: string;
  emails?: Array<{ address?: string; verified?: boolean }>;
  profile?: { name?: string };
  personId?: string;
  locked?: boolean;
  lastLoggedInAt?: Date;
  lastActiveAt?: Date;
  permissions?: string[];
  instances?: string[];
  groups?: string[];
}

interface MappedUser extends LooseRecord {
  _id: string;
  permissions: string[];
  instances: string[];
  groups: string[];
}

interface UserRef {
  _id: string;
}

interface CountResult {
  total: number;
}

interface UserSearchResult {
  totalResults: number;
  data: MappedUser[];
}

interface UsersCollection extends Mongo.Collection<AppUser> {
  aggregate<TResult = AppUser>(
    pipelines: LooseRecord[],
    options?: unknown
  ): Promise<TResult[]>;
  findOneUser(userId: string | null): Promise<MappedUser>;
  findByPersonIds(personIds: string[]): Promise<MappedUser[]>;
  searchUsers(params: LooseRecord): Promise<UserSearchResult> | UserSearchResult;
  createUser(
    values: LooseRecord,
    user: UserRef,
    dataSource: string,
    dataSourceDetail?: string | null
  ): Promise<MappedUser>;
  updateUser(
    values: LooseRecord,
    user: UserRef,
    dataSource: string,
    dataSourceDetail?: string | null
  ): Promise<MappedUser>;
  setPermissions(
    values: { userId: string; permissions: string[] },
    user: UserRef,
    dataSource: string,
    dataSourceDetail?: string | null
  ): Promise<MappedUser>;
  addInstanceAccess(
    values: { userId: string; instances: string[] },
    user: UserRef,
    dataSource: string,
    dataSourceDetail?: string | null
  ): Promise<MappedUser>;
  removeInstanceAccess(
    values: { userId: string; instances: string[] },
    user: UserRef,
    dataSource: string,
    dataSourceDetail?: string | null
  ): Promise<MappedUser>;
  setInstanceAccess(
    values: { userId: string; instances: string[] },
    user: UserRef,
    dataSource: string,
    dataSourceDetail?: string | null
  ): Promise<MappedUser>;
  setGroups(
    values: { userId: string; groups: string[] },
    user: UserRef,
    dataSource: string,
    dataSourceDetail?: string | null
  ): Promise<MappedUser>;
  resetPassword(
    values: { userId?: string; userName?: string },
    user: UserRef,
    dataSource: string,
    dataSourceDetail?: string | null
  ): Promise<MappedUser>;
  lockAccount(
    values: { userId: string },
    user: UserRef,
    dataSource: string,
    dataSourceDetail?: string | null
  ): Promise<MappedUser>;
}

declare const Accounts: {
  createUserAsync(options: LooseRecord): Promise<string>;
  findUserByUsername(userName?: string): Promise<AppUser | null>;
  setPasswordAsync(userId: string, password: string): Promise<void>;
};

const Users = (Meteor as unknown as { users: UsersCollection }).users;

Users.aggregate = <TResult = AppUser>(pipelines: LooseRecord[], options?: unknown) => {
  const rawCollection = Users.rawCollection();
  return rawCollection.aggregate<TResult>(pipelines, options).toArray();
};

const mapUser = (user: AppUser): MappedUser => ({
  _id: user._id,
  username: user.username,
  email: get(user, 'emails.0.address', null),
  emailVerified: get(user, 'emails.0.verified', false),
  displayName: user.profile?.name,
  personId: user.personId,
  locked: user.locked,
  lastLoggedInAt: user.lastLoggedInAt,
  lastActiveAt: user.lastActiveAt,
  permissions: user.permissions || [],
  instances: user.instances || [],
  groups: user.groups || [],
});

const buildPipeline = (params: LooseRecord): LooseRecord[] | UserSearchResult => {
  const pipeline: LooseRecord[] = [];
  const {
    showLocked,
    showUnlocked,
    showActive,
    showInactive,
    moduleAccess,
  } = params;

  if (showLocked === 'true' && showUnlocked === 'false') {
    pipeline.push({
      $match: {
        locked: { $eq: true },
      },
    });
  } else if (showLocked === 'false' && showUnlocked === 'true') {
    pipeline.push({
      $match: {
        locked: { $ne: true },
      },
    });
  } else if (showLocked === 'false' && showUnlocked === 'false') {
    return {
      data: [],
      totalResults: 0,
    };
  }

  const now = subMinutes(new Date(), 3);
  if (showActive === 'true' && showInactive === 'false') {
    pipeline.push({
      $match: {
        lastActiveAt: { $gte: now },
      },
    });
  } else if (showActive === 'false' && showInactive === 'true') {
    pipeline.push({
      $match: {
        $or: [
          { lastActiveAt: { $exists: false } },
          { lastActiveAt: { $lt: now } },
        ],
      },
    });
  } else if (showActive === 'false' && showInactive === 'false') {
    return {
      data: [],
      totalResults: 0,
    };
  }

  if (moduleAccess) {
    const lcModuleName = kebabCase(moduleAccess);
    pipeline.push({
      $match: {
        permissions: {
          $elemMatch: { $regex: `^${lcModuleName}` },
        },
      },
    });
  }

  return pipeline;
};

Users.findOneUser = async userId => {
  const user = await Users.findOneAsync(userId);
  return mapUser(user as AppUser);
};

Users.findByPersonIds = async (personIds: string[]) => {
  const users = await Users.find({
    personId: { $in: personIds },
  }).fetchAsync();

  return users.map((user: AppUser) => mapUser(user));
};

Users.searchUsers = params => {
  const { pageIndex = '0', pageSize = '20' } = params;
  const pipeline = buildPipeline(params);
  if (!Array.isArray(pipeline)) {
    return pipeline;
  }
  const countingPipeline = pipeline.concat({
    $count: 'total',
  });

  const nPageIndex = parseInt(pageIndex, 10);
  const nPageSize = parseInt(pageSize, 10);
  const resultsPipeline = pipeline.concat([
    { $sort: { username: 1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const users = Users.aggregate<AppUser>(resultsPipeline);
  const totalResults = Users.aggregate<CountResult>(countingPipeline);

  return Promise.all([users, totalResults]).then(results => ({
    totalResults: get(results[1], ['0', 'total'], 0),
    data: results[0].map(user => mapUser(user)),
  }));
};


// *******************************************************************
// Common Create/Update methods for User.
// Used from Admin/Outstation/Portals.
// *******************************************************************
Users.createUser = async (
  { userName, password, email, displayName, personId },
  user,
  dataSource,
  dataSourceDetail = null
) => {
  if (userName) {
    const existingUser = await Accounts.findUserByUsername(userName);
    if (existingUser) {
      throw new Error(`User name '${userName}' is already in use.`);
    }
  }

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

  return Users.findOneUser(newUserId);
};

Users.updateUser = async (
  { userId, password, email, displayName, locked },
  user,
  dataSource,
  dataSourceDetail = null
) => {
  const existingUser = await Users.findOneUser(userId);
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

  return Users.findOneUser(userId);
};

Users.setPermissions = async (
  { userId, permissions },
  user,
  dataSource,
  dataSourceDetail = null
) => {
  const existingUser = await Users.findOneUser(userId);
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

  return Users.findOneUser(userId);
};

// Adds the passed instances to the list of existing
// instances that the user has access to.
Users.addInstanceAccess = async (
  { userId, instances },
  user,
  dataSource,
  dataSourceDetail = null
) => {
  const existingUser = await Users.findOneUser(userId);
  const instancesToAdd = difference(instances, existingUser.instances || []);

  if (instancesToAdd.length === 0) {
    // All the passed values were already in the
    // user's instance list
    return Users.findOneUser(userId);
  }

  await Users.updateAsync(userId, {
    $set: {
      instances: (existingUser.instances || []).concat(instancesToAdd),
    },
  });

  // Create a security log
  await SecurityLogs.insertAsync({
    userId,
    operationType: SecurityOperationType.INSTANCE_ACCESS_CHANGED,
    operationBy: user._id,
    operationTime: new Date(),
    operationDetails: {
      instancesAdded: instancesToAdd,
    },
    dataSource,
    dataSourceDetail,
  });

  return Users.findOneUser(userId);
};

// Removes the passed instances from the list of existing
// instances that the user has access to.
Users.removeInstanceAccess = async (
  { userId, instances },
  user,
  dataSource,
  dataSourceDetail = null
) => {
  const existingUser = await Users.findOneUser(userId);
  const instancesToKeep = difference(existingUser.instances || [], instances);

  await Users.updateAsync(userId, {
    $set: {
      instances: instancesToKeep,
    },
  });

  // Create a security log
  await SecurityLogs.insertAsync({
    userId,
    operationType: SecurityOperationType.INSTANCE_ACCESS_CHANGED,
    operationBy: user._id,
    operationTime: new Date(),
    operationDetails: {
      instancesRemoved: instances,
    },
    dataSource,
    dataSourceDetail,
  });

  return Users.findOneUser(userId);
};

Users.setInstanceAccess = async (
  { userId, instances },
  user,
  dataSource,
  dataSourceDetail = null
) => {
  const existingUser = await Users.findOneUser(userId);
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

  return Users.findOneUser(userId);
};

Users.setGroups = async (
  { userId, groups },
  user,
  dataSource,
  dataSourceDetail = null
) => {
  const existingUser = await Users.findOneUser(userId);
  await Users.updateAsync(userId, { $set: { groups } });

  // Create a security log
  const groupsAdded = difference(groups, existingUser.groups || []);
  const groupsRemoved = difference(existingUser.groups || [], groups);

  await SecurityLogs.insertAsync({
    userId,
    operationType: SecurityOperationType.GROUPS_CHANGED,
    operationBy: user._id,
    operationTime: new Date(),
    operationDetails: {
      groupsAdded,
      groupsRemoved,
    },
    dataSource,
    dataSourceDetail,
  });

  return Users.findOneUser(userId);
};

Users.resetPassword = async (
  { userId, userName },
  user,
  dataSource,
  dataSourceDetail = null
) => {
  const existingUser = userId
    ? await Users.findOneUser(userId)
    : await Accounts.findUserByUsername(userName);

  if (!existingUser) {
    throw new Error('User does not exist in the system.');
  }

  const password = Random.id(8);
  await Accounts.setPasswordAsync(existingUser._id, password);

  // Create a security log
  await SecurityLogs.insertAsync({
    userId: existingUser._id,
    operationType: SecurityOperationType.PASSWORD_RESET,
    operationBy: user._id,
    operationTime: new Date(),
    dataSource,
    dataSourceDetail,
  });

  return Users.findOneUser(existingUser._id);
};

Users.lockAccount = async ({ userId }, user, dataSource, dataSourceDetail) => {
  await Users.updateAsync(userId, { $set: { locked: true } });
  await SecurityLogs.insertAsync({
    userId,
    operationType: SecurityOperationType.ACCOUNT_LOCKED,
    operationBy: user._id,
    operationTime: new Date(),
    dataSource,
    dataSourceDetail,
  });

  return Users.findOneUser(userId);
};

export default Users;
