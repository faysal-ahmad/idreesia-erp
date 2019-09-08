import { parse } from 'query-string';
import moment from 'moment';
import { get } from 'lodash';

import { Formats } from 'meteor/idreesia-common/constants';
import {
  Visitors,
  VisitorStays,
} from 'meteor/idreesia-common/collections/security';

export function getVisitorStays(queryString) {
  const params = parse(queryString);
  const pipeline = [];

  const {
    visitorId,
    startDate,
    endDate,
    city,
    pageIndex = '0',
    pageSize = '20',
  } = params;

  if (visitorId) {
    pipeline.push({
      $match: {
        visitorId: { $eq: visitorId },
      },
    });
  }

  if (startDate) {
    pipeline.push({
      $match: {
        fromDate: {
          $gte: moment(startDate, Formats.DATE_FORMAT)
            .startOf('day')
            .toDate(),
        },
      },
    });
  }
  if (endDate) {
    pipeline.push({
      $match: {
        toDate: {
          $lte: moment(endDate, Formats.DATE_FORMAT)
            .endOf('day')
            .toDate(),
        },
      },
    });
  }

  if (city) {
    pipeline.push({
      $lookup: {
        from: Visitors._name,
        localField: 'visitorId',
        foreignField: '_id',
        as: 'visitor',
      },
    });

    pipeline.push({
      $match: {
        'visitor.city': { $eq: city },
      },
    });
  }

  const countingPipeline = pipeline.concat({
    $count: 'total',
  });

  const nPageIndex = parseInt(pageIndex, 10);
  const nPageSize = parseInt(pageSize, 10);
  const resultsPipeline = pipeline.concat([
    { $sort: { fromDate: -1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const visitors = VisitorStays.aggregate(resultsPipeline).toArray();
  const totalResults = VisitorStays.aggregate(countingPipeline).toArray();

  return Promise.all([visitors, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
