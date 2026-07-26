// @ts-nocheck
import { endOfDay, endOfMonth, startOfDay, startOfMonth } from 'date-fns';
import { parse } from 'query-string';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { IssuanceForms } from 'meteor/idreesia-common/server/collections/inventory';
import { Formats } from 'meteor/idreesia-common/constants';
import { parseDate } from 'meteor/idreesia-common/utilities/date-fns';

export function getIssuanceFormsByStockItemId(physicalStoreId, stockItemId) {
  const pipeline = [
    {
      $match: {
        physicalStoreId: { $eq: physicalStoreId },
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

export function getIssuanceFormsByMonth(physicalStoreId, monthString) {
  const month = parseDate(monthString, Formats.DATE_FORMAT);

  const pipeline = [
    {
      $match: {
        physicalStoreId: { $eq: physicalStoreId },
      },
    },
    {
      $match: {
        issueDate: {
          $gte: startOfMonth(month),
          $lte: endOfMonth(month),
        },
      },
    },
    {
      $sort: { issueDate: -1 },
    },
  ];

  return IssuanceForms.aggregate(pipeline);
}

export default function getIssuanceForms(queryString, physicalStoreId) {
  const params = parse(queryString);
  const pipeline = [
    {
      $match: {
        physicalStoreId: { $eq: physicalStoreId },
      },
    },
  ];

  const {
    showApproved,
    showUnapproved,
    locationId,
    startDate,
    endDate,
    pageIndex = '0',
    pageSize = '20',
  } = params;

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

  if (locationId) {
    pipeline.push({
      $match: {
        locationId: { $eq: locationId },
      },
    });
  }

  if (startDate) {
    pipeline.push({
      $match: {
        issueDate: {
          $gte: startOfDay(parseDate(startDate, Formats.DATE_FORMAT)),
        },
      },
    });
  }
  if (endDate) {
    pipeline.push({
      $match: {
        issueDate: {
          $lte: endOfDay(parseDate(endDate, Formats.DATE_FORMAT)),
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
    { $sort: { issueDate: -1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const issuanceForms = IssuanceForms.aggregate(resultsPipeline);
  const totalResults = IssuanceForms.aggregate(countingPipeline);

  return Promise.all([issuanceForms, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
