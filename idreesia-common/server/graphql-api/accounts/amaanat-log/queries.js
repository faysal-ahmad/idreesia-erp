import moment from 'moment';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import { AmaanatLogs } from 'meteor/idreesia-common/server/collections/accounts';

export default function getAmaanatLogs(filter) {
  const pipeline = [];

  const {
    cityId,
    cityMehfilId,
    startDate,
    endDate,
    pageIndex = '0',
    pageSize = '20',
  } = filter;

  if (cityId) {
    pipeline.push({
      $match: {
        cityId: { $eq: cityId },
      },
    });
  }

  if (cityMehfilId) {
    pipeline.push({
      $match: {
        cityMehfilId: { $eq: cityMehfilId },
      },
    });
  }

  if (startDate) {
    pipeline.push({
      $match: {
        receivedDate: {
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
        receivedDate: {
          $lte: moment(endDate, Formats.DATE_FORMAT)
            .endOf('day')
            .toDate(),
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
    { $sort: { receivedDate: -1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const amaanatLogs = AmaanatLogs.aggregate(resultsPipeline);
  const totalResults = AmaanatLogs.aggregate(countingPipeline);

  return Promise.all([amaanatLogs, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
