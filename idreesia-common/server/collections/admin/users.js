import { Random } from 'meteor/random';
import moment from 'moment';
import {
  difference,
  get,
  kebabCase,
} from 'meteor/idreesia-common/utilities/lodash';
import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';
import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';
import { createJob } from 'meteor/idreesia-common/server/utilities/jobs';
import { JobTypes } from 'meteor/idreesia-common/constants';

const Users = Meteor.users;

const wrapAsync = Meteor.wrapAsync ? Meteor.wrapAsync : Meteor._wrapAsync;
function aggregate(pipelines, options) {
  const rawCollection = Meteor.users.rawCollection();
  return wrapAsync(rawCollection.aggregate.bind(rawCollection))(
    pipelines,
    options
  );
}

const mapUser = user => ({
  _id: user._id,
  username: user.username,
  email: get(user, 'emails.0.address', null),
  displayName: user.displayName,
  personId: user.personId,
  locked: user.locked,
  lastLoggedInAt: user.lastLoggedInAt,
  lastActiveAt: user.lastActiveAt,
  permissions: user.permissions || [],
  instances: user.instances || [],
  groups: user.groups || [],
});

const buildPipeline = params => {
  const pipeline = [];
  const {
    showLocked,
    showUnlocked,
    showActive,
    showInactive,
    moduleAccess,
    portalAccess,
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

  const now = moment().subtract(3, 'minutes');
  if (showActive === 'true' && showInactive === 'false') {
    pipeline.push({
      $match: {
        lastActiveAt: { $gte: now.toDate() },
      },
    });
  } else if (showActive === 'false' && showInactive === 'true') {
    pipeline.push({
      $match: {
        $or: [
          { lastActiveAt: { $exists: false } },
          { lastActiveAt: { $lt: now.toDate() } },
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

  if (portalAccess) {
    pipeline.push({
      $match: {
        instances: {
          $elemMatch: { $eq: portalAccess },
        },
      },
    });
  }

  return pipeline;
};

Users.findOneUser = userId => {
  const user = Meteor.users.findOne(userId);
  return mapUser(user);
};

Users.searchUsers = params => {
  const { pageIndex = '0', pageSize = '20' } = params;
  const pipeline = buildPipeline(params);
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

  const users = aggregate(resultsPipeline).toArray();
  const totalResults = aggregate(countingPipeline).toArray();

  return Promise.all([users, totalResults]).then(results => ({
    totalResults: get(results[1], ['0', 'total'], 0),
    data: results[0].map(user => mapUser(user)),
  }));
};

Users.searchOperationsWazaifUsers = params => {
  const { pageIndex = '0', pageSize = '20' } = params;
  const initialPipeline = [
    {
      $match: {
        personId: { $exists: true, $ne: null },
        permissions: {
          $elemMatch: { $regex: `^operations-wazaif` },
        },
      },
    },
  ];

  const pipeline = initialPipeline.concat(buildPipeline(params));
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

  const users = aggregate(resultsPipeline).toArray();
  const totalResults = aggregate(countingPipeline).toArray();

  return Promise.all([users, totalResults]).then(results => ({
    totalResults: get(results[1], ['0', 'total'], 0),
    data: results[0].map(user => mapUser(user)),
  }));
};

Users.searchOutstationPortalUsers = (params, portalIds) => {
  const { pageIndex = '0', pageSize = '20' } = params;
  const initialPipeline = [
    {
      $match: {
        personId: { $exists: true, $ne: null },
        $or: [
          {
            permissions: {
              $elemMatch: { $regex: `^mehfil-portals` },
            },
          },
          {
            // We want to get back users even if they don't have any
            // permissions related to the portal, but have been given
            // access to a portal.
            instances: { $in: portalIds },
          },
        ],
      },
    },
  ];

  const pipeline = initialPipeline.concat(buildPipeline(params));
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

  const users = aggregate(resultsPipeline).toArray();
  const totalResults = aggregate(countingPipeline).toArray();

  return Promise.all([users, totalResults]).then(results => ({
    totalResults: get(results[1], ['0', 'total'], 0),
    data: results[0].map(user => mapUser(user)),
  }));
};

// *******************************************************************
// Common Create/Update methods for User.
// Used from Admin/Outstation/Portals.
// *******************************************************************
Users.createUser = (
  { userName, password, email, displayName, personId },
  user,
  dataSource,
  dataSourceDetail = null
) => {
  if (userName) {
    const existingUser = Accounts.findUserByUsername(userName);
    if (existingUser) {
      throw new Error(`User name '${userName}' is already in use.`);
    }
  }

  if (personId) {
    const existingUser = Users.findOne({ personId });
    if (existingUser) {
      throw new Error(`This person already has a user account.`);
    }
  }

  let newUserId = null;
  if (userName && password) {
    newUserId = Accounts.createUser({
      username: userName,
      password,
    });

    Users.update(newUserId, {
      $set: {
        email,
        displayName,
        personId,
      },
    });
  } else if (email) {
    newUserId = Accounts.createUser({
      email,
    });

    Users.update(newUserId, {
      $set: {
        displayName,
        personId,
      },
    });
  }

  // Send sms message to user for account creation
  const params = { userId: newUserId, password, email };
  const options = { priority: 'normal', retry: 10 };
  createJob({
    type: JobTypes.SEND_ACCOUNT_CREATED_SMS_MESSAGE,
    params,
    options,
  });

  // Create a security log
  SecurityLogs.insert({
    userId: newUserId,
    operationType: SecurityOperationType.ACCOUNT_CREATED,
    operationBy: user._id,
    operationTime: new Date(),
    dataSource,
    dataSourceDetail,
  });

  return Users.findOneUser(newUserId);
};

Users.updateUser = (
  { userId, password, email, displayName, locked },
  user,
  dataSource,
  dataSourceDetail = null
) => {
  const existingUser = Users.findOneUser(userId);
  if (existingUser.locked !== locked) {
    // Create a security log
    if (locked === true) {
      SecurityLogs.insert({
        userId,
        operationType: SecurityOperationType.ACCOUNT_LOCKED,
        operationBy: user._id,
        operationTime: new Date(),
        dataSource,
        dataSourceDetail,
      });
    } else {
      SecurityLogs.insert({
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
    Accounts.setPassword(userId, password);

    // Send sms message to user for new password
    const params = { userId, password };
    const options = { priority: 'normal', retry: 10 };
    createJob({
      type: JobTypes.SEND_PASSWORD_RESET_SMS_MESSAGE,
      params,
      options,
    });

    // Create a security log
    SecurityLogs.insert({
      userId,
      operationType: SecurityOperationType.PASSWORD_RESET,
      operationBy: user._id,
      operationTime: new Date(),
      dataSource,
      dataSourceDetail,
    });
  }

  if (email) {
    Users.update(userId, {
      $set: {
        'emails.0.address': email,
        displayName,
        locked,
      },
    });
  } else {
    Users.update(userId, {
      $unset: {
        emails: '',
      },
      $set: {
        displayName,
        locked,
      },
    });
  }

  return Users.findOneUser(userId);
};

Users.setPermissions = (
  { userId, permissions },
  user,
  dataSource,
  dataSourceDetail = null
) => {
  const existingUser = Users.findOneUser(userId);
  Users.update(userId, { $set: { permissions } });

  // Create a security log
  const permissionsAdded = difference(
    permissions,
    existingUser.permissions || []
  );
  const permissionsRemoved = difference(
    existingUser.permissions || [],
    permissions
  );

  SecurityLogs.insert({
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

Users.setInstanceAccess = (
  { userId, instances },
  user,
  dataSource,
  dataSourceDetail = null
) => {
  const existingUser = Users.findOneUser(userId);
  Users.update(userId, { $set: { instances } });

  // Create a security log
  const instancesAdded = difference(instances, existingUser.instances || []);
  const instancesRemoved = difference(existingUser.instances || [], instances);

  SecurityLogs.insert({
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

Users.setGroups = (
  { userId, groups },
  user,
  dataSource,
  dataSourceDetail = null
) => {
  const existingUser = Users.findOneUser(userId);
  Users.update(userId, { $set: { groups } });

  // Create a security log
  const groupsAdded = difference(groups, existingUser.groups || []);
  const groupsRemoved = difference(existingUser.groups || [], groups);

  SecurityLogs.insert({
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

Users.resetPassword = (
  { userId, userName },
  user,
  dataSource,
  dataSourceDetail = null
) => {
  const existingUser = userId
    ? Users.findOneUser(userId)
    : Accounts.findUserByUsername(userName);

  if (!existingUser) {
    throw new Error('User does not exist in the system.');
  }

  const password = Random.id(8);
  Accounts.setPassword(existingUser._id, password);

  // Send sms message to user for new password
  const params = { userId: existingUser._id, password };
  const options = { priority: 'normal', retry: 10 };
  createJob({
    type: JobTypes.SEND_PASSWORD_RESET_SMS_MESSAGE,
    params,
    options,
  });

  // Create a security log
  SecurityLogs.insert({
    userId: existingUser._id,
    operationType: SecurityOperationType.PASSWORD_RESET,
    operationBy: user._id,
    operationTime: new Date(),
    dataSource,
    dataSourceDetail,
  });

  return Users.findOneUser(existingUser._id);
};

Users.lockAccount = ({ userId }, user, dataSource, dataSourceDetail) => {
  Users.update(userId, { $set: { locked: true } });
  SecurityLogs.insert({
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
