import { parse } from 'query-string';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { UserGroups } from 'meteor/idreesia-common/server/collections/admin';

export function getUserGroups(queryString) {
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

  const userGroups = UserGroups.aggregate(resultsPipeline).toArray();
  const totalResults = UserGroups.aggregate(countingPipeline).toArray();

  return Promise.all([userGroups, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
