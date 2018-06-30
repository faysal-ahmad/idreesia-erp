import moment from 'moment';
import { parse } from 'query-string';
import { get } from 'lodash';

import { ReturnForms } from '/imports/lib/collections/inventory';
import { Formats } from '/imports/lib/constants';

export function getReturnFormsByStockItemId(stockItemId) {
  const pipeline = [
    {
      $match: {
        items: {
          $elemMatch: {
            stockItemId: { $eq: stockItemId },
          },
        },
      },
    },
    {
      $sort: { returnDate: -1 },
    },
  ];

  return ReturnForms.aggregate(pipeline);
}

export default function getReturnForms(queryString) {
  const params = parse(queryString);
  const pipeline = [];

  const {
    physicalStoreId,
    showApproved,
    showUnapproved,
    startDate,
    endDate,
    pageIndex = '0',
    pageSize = '10',
  } = params;

  if (physicalStoreId && physicalStoreId !== '') {
    pipeline.push({
      $match: {
        physicalStoreId: { $eq: physicalStoreId },
      },
    });
  }

  if (showApproved === 'false' && showUnapproved === 'false') {
    return {
      issuanceForms: [],
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

  if (startDate && startDate !== '') {
    const mStartDate = moment
      .utc(startDate, Formats.DATE_FORMAT)
      .subtract(1, 'd')
      .endOf('day');
    if (mStartDate.isValid()) {
      pipeline.push({
        $match: {
          returnDate: { $gt: mStartDate.toDate() },
        },
      });
    }
  }

  if (endDate && endDate !== '') {
    const mEndDate = moment
      .utc(endDate, Formats.DATE_FORMAT)
      .add(1, 'd')
      .startOf('day');
    if (mEndDate.isValid()) {
      pipeline.push({
        $match: {
          returnDate: { $lt: mEndDate.toDate() },
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
    { $sort: { issueDate: -1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const returnForms = ReturnForms.aggregate(resultsPipeline).toArray();
  const totalResults = ReturnForms.aggregate(countingPipeline).toArray();

  return Promise.all([returnForms, totalResults]).then(results => ({
    returnForms: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
