import moment from 'moment';
import { parse } from 'query-string';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { DeliveryOrders } from 'meteor/idreesia-common/server/collections/wazaif';
import { Formats } from 'meteor/idreesia-common/constants';

export default function getWazaifDeliveryOrders(queryString) {
  const params = parse(queryString);
  const pipeline = [];

  const {
    showPending,
    showCompleted,
    cityMehfilId,
    startDate,
    endDate,
    pageIndex = '0',
    pageSize = '20',
  } = params;

  if (showPending === 'false' && showCompleted === 'false') {
    return {
      data: [],
      totalResults: 0,
    };
  } else if (showPending === 'true' && showCompleted === 'false') {
    pipeline.push({
      $match: {
        status: { $eq: 'pending' },
      },
    });
  } else if (showPending === 'false' && showCompleted === 'true') {
    pipeline.push({
      $match: {
        status: { $eq: 'completed' },
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
        requestedDate: {
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
        requestedDate: {
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
    { $sort: { requestedDate: -1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const deliveryOrders = DeliveryOrders.aggregate(resultsPipeline);
  const totalResults = DeliveryOrders.aggregate(countingPipeline);

  return Promise.all([deliveryOrders, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
