import moment from 'moment';
import { parse } from 'query-string';
import { get } from 'lodash';

import { IssuanceForms } from '/imports/lib/collections/inventory';
import { Formats } from '/imports/lib/constants';

export function getIssuanceFormsByStockItemId(stockItemId, physicalStores) {
  const physicalStoreIds = physicalStores.map(({ _id }) => _id);
  const pipeline = [
    {
      $match: {
        physicalStoreId: { $in: physicalStoreIds },
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

  return IssuanceForms.aggregate(pipeline).toArray();
}

export default function getIssuanceForms(queryString, physicalStores) {
  const params = parse(queryString);
  const physicalStoreIds = physicalStores.map(({ _id }) => _id);
  const pipeline = [
    {
      $match: {
        physicalStoreId: { $in: physicalStoreIds },
      },
    },
  ];

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

  const issuanceForms = IssuanceForms.aggregate(resultsPipeline).toArray();
  const totalResults = IssuanceForms.aggregate(countingPipeline).toArray();

  return Promise.all([issuanceForms, totalResults]).then(results => ({
    issuanceForms: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
