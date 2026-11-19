import { endOfDay, endOfMonth, startOfDay, startOfMonth } from 'date-fns';
import { parse } from 'query-string';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { IssuanceForms } from 'meteor/idreesia-common/server/collections/inventory';
import { Formats } from 'meteor/idreesia-common/constants';
import { parseDate } from 'meteor/idreesia-common/utilities/date-fns';

type PipelineStage = Record<string, unknown>;

interface CountResult {
  total: number;
}

export function getIssuanceFormsByStockItemId(
  physicalStoreId: string,
  stockItemId: string
) {
  const pipeline: PipelineStage[] = [
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

export function getIssuanceFormsByMonth(
  physicalStoreId: string,
  monthString: string
) {
  const month = parseDate(monthString, Formats.DATE_FORMAT);

  const pipeline: PipelineStage[] = [
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

export default function getIssuanceForms(
  queryString: string,
  physicalStoreId: string
) {
  const params = parse(queryString);
  const pipeline: PipelineStage[] = [
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
  const locationIdText = typeof locationId === 'string' ? locationId : '';
  const startDateText = typeof startDate === 'string' ? startDate : '';
  const endDateText = typeof endDate === 'string' ? endDate : '';

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

  if (locationIdText) {
    pipeline.push({
      $match: {
        locationId: { $eq: locationIdText },
      },
    });
  }

  if (startDateText) {
    pipeline.push({
      $match: {
        issueDate: {
          $gte: startOfDay(parseDate(startDateText, Formats.DATE_FORMAT)),
        },
      },
    });
  }
  if (endDateText) {
    pipeline.push({
      $match: {
        issueDate: {
          $lte: endOfDay(parseDate(endDateText, Formats.DATE_FORMAT)),
        },
      },
    });
  }

  const countingPipeline = pipeline.concat({
    $count: 'total',
  });

  const nPageIndex = parseInt(String(pageIndex), 10);
  const nPageSize = parseInt(String(pageSize), 10);
  const resultsPipeline = pipeline.concat([
    { $sort: { issueDate: -1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const issuanceForms = IssuanceForms.aggregate(resultsPipeline);
  const totalResults = IssuanceForms.aggregate<CountResult>(countingPipeline);

  return Promise.all([issuanceForms, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
