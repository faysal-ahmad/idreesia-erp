import moment from 'moment';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import { MessageSource } from 'meteor/idreesia-common/constants/communication';
import { Messages } from 'meteor/idreesia-common/server/collections/communication';

export function getMessages(filter) {
  const { startDate, endDate, pageIndex = '0', pageSize = '20' } = filter;
  const pipeline = [
    {
      $match: {
        source: { $eq: MessageSource.HR },
      },
    },
  ];

  if (startDate) {
    pipeline.push({
      $match: {
        sentDate: {
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
        sentDate: {
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
