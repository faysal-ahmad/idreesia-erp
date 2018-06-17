import moment from 'moment';
import { parse } from 'query-string';
import { get } from 'lodash';

import { IssuanceForms } from '/imports/lib/collections/inventory';
import { Formats } from '/imports/lib/constants';

export function getIssuanceFormsByStockItemId(stockItemId) {
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
      $sort: { issueDate: -1 },
    },
  ];

  return IssuanceForms.aggregate(pipeline);
}

export default function getIssuanceForms(queryString) {
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
          issueDate: { $gt: mStartDate.toDate() },
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
          issueDate: { $lt: mEndDate.toDate() },
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

  return {
    issuanceForms: IssuanceForms.aggregate(resultsPipeline),
    totalResults: get(IssuanceForms.aggregate(countingPipeline), ['0', 'total'], 0),
  };
}
