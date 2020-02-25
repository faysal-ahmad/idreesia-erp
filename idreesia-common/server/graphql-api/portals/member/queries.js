import { parse } from 'query-string';
import moment from 'moment';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { Visitors } from 'meteor/idreesia-common/server/collections/security';
import { Portals } from 'meteor/idreesia-common/server/collections/portals';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';

export function getPortalMembers(portalId, queryString) {
  const portal = Portals.findOne(portalId);
  const cities = Cities.find({ _id: { $in: portal.cityIds } });
  const cityNames = cities.map(city => city.name);

  const params = parse(queryString);
  const pipeline = [];

  const {
    name,
    cnicNumber,
    phoneNumber,
    city,
    ehadDuration,
    pageIndex = '0',
    pageSize = '20',
  } = params;

  if (name) {
    pipeline.push({
      $match: { $text: { $search: name } },
    });
  }

  if (city) {
    pipeline.push({
      $match: {
        city: { $eq: city },
      },
    });
  } else {
    pipeline.push({
      $match: {
        city: { $in: cityNames },
      },
    });
  }

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

  if (ehadDuration) {
    const { scale, duration } = JSON.parse(ehadDuration);
    if (duration) {
      const date = moment()
        .startOf('day')
        .subtract(duration, scale);

      pipeline.push({
        $match: {
          ehadDate: {
            $gte: moment(date).toDate(),
          },
        },
      });
    }
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
