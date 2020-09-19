import moment from 'moment';
import { get, kebabCase } from 'meteor/idreesia-common/utilities/lodash';

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
  karkunId: user.karkunId,
  locked: user.locked,
  lastLoggedInAt: user.lastLoggedInAt,
  lastActiveAt: user.lastActiveAt,
  permissions: user.permissions || [],
  instances: user.instances || [],
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

Users.searchOutstationPortalUsers = (params, portalIds) => {
  const { pageIndex = '0', pageSize = '20' } = params;
  const initialPipeline = [
    {
      $match: {
        karkunId: { $exists: true, $ne: null },
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

export default Users;
