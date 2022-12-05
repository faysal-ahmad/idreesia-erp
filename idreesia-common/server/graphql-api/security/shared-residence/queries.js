import { parse } from 'query-string';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { SharedResidences } from 'meteor/idreesia-common/server/collections/security';

export function getSharedResidences(queryString) {
  const params = parse(queryString);
  const pipeline = [];

  const { address, residentName, pageIndex = '0', pageSize = '20' } = params;

  if (address) {
    pipeline.push({
      $match: { $text: { $search: address } },
    });
  }

  if (residentName) {
    pipeline.push({
      $lookup: {
        from: 'security-visitors',
        localField: '_id',
        foreignField: 'sharedResidenceId',
        as: 'residents',
      },
    });
    pipeline.push({
      $match: {
        residents: {
          $elemMatch: {
            $text: { $search: name },
          },
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

  const sharedResidences = SharedResidences.aggregate(resultsPipeline);
  const totalResults = SharedResidences.aggregate(countingPipeline);

  return Promise.all([sharedResidences, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
