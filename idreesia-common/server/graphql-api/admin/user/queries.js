import moment from 'moment';
import { get, kebabCase } from 'meteor/idreesia-common/utilities/lodash';
import { mapUser } from './helpers';

const wrapAsync = Meteor.wrapAsync ? Meteor.wrapAsync : Meteor._wrapAsync;
function aggregate(pipelines, options) {
  const rawCollection = Meteor.users.rawCollection();
  return wrapAsync(rawCollection.aggregate.bind(rawCollection))(
    pipelines,
    options
  );
}

export function getUsers(params) {
  const pipeline = [];
  const {
    showLocked,
    showUnlocked,
    showActive,
    showInactive,
    moduleAccess,
    portalAccess,
    pageIndex = '0',
    pageSize = '20',
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

  const countingPipeline = pipeline.concat({
    $count: 'total',
  });

  const nPageIndex = parseInt(pageIndex, 10);
  const nPageSize = parseInt(pageSize, 10);
  const resultsPipeline = pipeline.concat([
    { $sort: { name: 1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const users = aggregate(resultsPipeline).toArray();
  const totalResults = aggregate(countingPipeline).toArray();

  return Promise.all([users, totalResults]).then(results => ({
    totalResults: get(results[1], ['0', 'total'], 0),
    data: results[0].map(user => mapUser(user)),
  }));
}
