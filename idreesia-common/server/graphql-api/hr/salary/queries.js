import { Salaries } from 'meteor/idreesia-common/server/collections/hr';
import { parse } from 'query-string';
import { get } from 'meteor/idreesia-common/utilities/lodash';

export function getPagedSalariesByKarkun(queryString) {
  const params = parse(queryString);
  const pipeline = [];
  const { pageIndex = '0', pageSize = '20', karkunId } = params;

  pipeline.push({
    $match: {
      karkunId: { $eq: karkunId },
    },
  });

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

  const karkunSalaries = Salaries.aggregate(resultsPipeline).toArray();
  const totalResults = Salaries.aggregate(countingPipeline).toArray();

  return Promise.all([karkunSalaries, totalResults]).then(results => ({
    salaries: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
