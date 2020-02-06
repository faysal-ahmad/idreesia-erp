import { parse } from 'query-string';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { Visitors } from 'meteor/idreesia-common/server/collections/security';
import { Portals } from 'meteor/idreesia-common/server/collections/portals';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';

export function getPortalVisitors(portalId, queryString) {
  const portal = Portals.findOne(portalId);
  const cities = Cities.find({ _id: { $in: portal.cityIds } });
  const cityNames = cities.map(city => city.name);

  const params = parse(queryString);
  const pipeline = [];

  const {
    name,
    cnicNumber,
    phoneNumber,
    pageIndex = '0',
    pageSize = '20',
  } = params;

  if (name) {
    pipeline.push({
      $match: { $text: { $search: name } },
    });
  }

  pipeline.push({
    $match: {
      city: { $in: cityNames },
    },
  });

  if (cnicNumber) {
    pipeline.push({
      $match: {
        cnicNumber: { $eq: cnicNumber },
      },
    });
  }

  if (phoneNumber) {
    pipeline.push({
      $match: {
        $or: [{ contactNumber1: phoneNumber }, { contactNumber2: phoneNumber }],
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

  const visitors = Visitors.aggregate(resultsPipeline).toArray();
  const totalResults = Visitors.aggregate(countingPipeline).toArray();

  return Promise.all([visitors, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
