import { parse } from 'query-string';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
import { Portals } from 'meteor/idreesia-common/server/collections/portals';

export default function getCities(queryString) {
  const params = parse(queryString);
  const pipeline = [];

  const { region, portalId, pageIndex = '0', pageSize = '20' } = params;
  const countingPipeline = pipeline.concat({
    $count: 'total',
  });

  if (region) {
    pipeline.push({
      $match: {
        region: { $eq: region },
      },
    });
  }

  if (portalId) {
    const portal = Portals.findOne(portalId);
    pipeline.push({
      $match: {
        _id: { $in: portal.cityIds },
      },
    });
  }

  const nPageIndex = parseInt(pageIndex, 10);
  const nPageSize = parseInt(pageSize, 10);
  const resultsPipeline = pipeline.concat([
    { $sort: { name: 1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const cities = Cities.aggregate(resultsPipeline).toArray();
  const totalResults = Cities.aggregate(countingPipeline).toArray();

  return Promise.all([cities, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
