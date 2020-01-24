import { parse } from 'query-string';
import { get } from 'meteor/idreesia-common/utilities/lodash';
import { mapUser } from './helpers';

const wrapAsync = Meteor.wrapAsync ? Meteor.wrapAsync : Meteor._wrapAsync;
function aggregate(pipelines, options) {
  const rawCollection = Meteor.users.rawCollection();
  return wrapAsync(rawCollection.aggregate.bind(rawCollection))(
    pipelines,
    options
  );
}

export function getUsers(queryString) {
  const params = parse(queryString);
  const pipeline = [];

  const { pageIndex = '0', pageSize = '20' } = params;

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
