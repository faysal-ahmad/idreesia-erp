import { parse } from 'query-string';
import { get } from 'lodash';

import { SharedResidences } from 'meteor/idreesia-common/collections/hr';

export function getSharedResidences(queryString) {
  const params = parse(queryString);
  const pipeline = [];

  const { address, karkunName, pageIndex = '0', pageSize = '20' } = params;

  if (address) {
    pipeline.push({
      $match: { $text: { $search: address } },
    });
  }

  if (karkunName) {
    pipeline.push({
      $lookup: {
        from: 'hr-karkuns',
        localField: 'ownerKarkunId',
        foreignField: '_id',
        as: 'owner',
      },
    });
    pipeline.push({
      $match: {
        owner: {
          $elemMatch: {
            $text: { $search: karkunName },
          },
        },
      },
    });

    pipeline.push({
      $lookup: {
        from: 'hr-karkuns',
        localField: '_id',
        foreignField: 'sharedResidenceId',
        as: 'residents',
      },
    });
    pipeline.push({
      $match: {
        residents: {
          $elemMatch: {
            $text: { $search: karkunName },
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
    { $sort: { address: 1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const sharedResidences = SharedResidences.aggregate(
    resultsPipeline
  ).toArray();
  const totalResults = SharedResidences.aggregate(countingPipeline).toArray();

  return Promise.all([sharedResidences, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
