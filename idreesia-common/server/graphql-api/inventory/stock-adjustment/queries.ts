import { endOfDay, startOfDay } from 'date-fns';
import { parse } from 'query-string';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { StockAdjustments } from 'meteor/idreesia-common/server/collections/inventory';
import { Formats } from 'meteor/idreesia-common/constants';
import { parseDate } from 'meteor/idreesia-common/utilities/date-fns';

type PipelineStage = Record<string, unknown>;

interface CountResult {
  total: number;
}

export function getStockAdjustmentsByStockItemId(
  physicalStoreId: string,
  stockItemId: string
) {
  const pipeline: PipelineStage[] = [
    {
      $match: {
        physicalStoreId: { $eq: physicalStoreId },
        stockItemId: { $eq: stockItemId },
      },
    },
    {
      $sort: { adjustmentDate: -1 },
    },
  ];

  return StockAdjustments.aggregate(pipeline);
}

export default function getStockAdjustments(
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
    stockItemId,
    showApproved,
    showUnapproved,
    startDate,
    endDate,
    pageIndex = '0',
    pageSize = '20',
  } = params;
  const stockItemIdText = typeof stockItemId === 'string' ? stockItemId : '';
  const startDateText = typeof startDate === 'string' ? startDate : '';
  const endDateText = typeof endDate === 'string' ? endDate : '';

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

  if (stockItemIdText) {
    pipeline.push({
      $match: {
        stockItemId: { $eq: stockItemIdText },
      },
    });
  }

  if (startDateText) {
    pipeline.push({
      $match: {
        adjustmentDate: {
          $gte: startOfDay(parseDate(startDateText, Formats.DATE_FORMAT)),
        },
      },
    });
  }

  if (endDateText) {
    pipeline.push({
      $match: {
        adjustmentDate: {
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
    { $sort: { adjustmentDate: -1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const data = StockAdjustments.aggregate(resultsPipeline);
  const totalResults = StockAdjustments.aggregate<CountResult>(countingPipeline);

  return Promise.all([data, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
