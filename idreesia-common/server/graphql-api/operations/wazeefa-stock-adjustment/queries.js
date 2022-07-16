import moment from 'moment';
import { parse } from 'query-string';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { StockAdjustments } from 'meteor/idreesia-common/server/collections/wazaif-management';
import { Formats } from 'meteor/idreesia-common/constants';

export function getStockAdjustments(queryString) {
  const params = parse(queryString);
  const pipeline = [];

  const {
    wazeefaId,
    showApproved,
    showUnapproved,
    startDate,
    endDate,
    pageIndex = '0',
    pageSize = '20',
  } = params;

  if (showApproved === 'false' && showUnapproved === 'false') {
    return {
      data: [],
      totalResults: 0,
    };
  } else if (showApproved === 'true' && showUnapproved === 'false') {
    pipeline.push({
      $match: {
        approvedOn: { $ne: null },
      },
    });
  } else if (showApproved === 'false' && showUnapproved === 'true') {
    pipeline.push({
      $match: {
        approvedOn: { $eq: null },
      },
    });
  }

  if (wazeefaId) {
    pipeline.push({
      $match: {
        wazeefaId: { $eq: wazeefaId },
      },
    });
  }

  if (startDate) {
    pipeline.push({
      $match: {
        adjustmentDate: {
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
        adjustmentDate: {
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
    { $sort: { adjustmentDate: -1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const data = StockAdjustments.aggregate(resultsPipeline).toArray();
  const totalResults = StockAdjustments.aggregate(countingPipeline).toArray();

  return Promise.all([data, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
