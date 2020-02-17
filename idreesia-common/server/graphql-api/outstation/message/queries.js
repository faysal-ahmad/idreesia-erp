import { parse } from 'query-string';
import { Messages } from 'meteor/idreesia-common/server/collections/communication';
import { get } from 'meteor/idreesia-common/utilities/lodash';

export function getMessages(queryString) {
  const params = parse(queryString);
  const pipeline = [];
  const { pageIndex = '0', pageSize = '20' } = params;

  const countingPipeline = pipeline.concat({
    $count: 'total',
  });

  const nPageIndex = parseInt(pageIndex, 10);
  const nPageSize = parseInt(pageSize, 10);
  const resultsPipeline = pipeline.concat([
    { $sort: { createdAt: -1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const messages = Messages.aggregate(resultsPipeline).toArray();
  const totalResults = Messages.aggregate(countingPipeline).toArray();

  return Promise.all([messages, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
