import { subMonths } from 'date-fns';
import { parse } from 'query-string';

import { StockItems } from 'meteor/idreesia-common/server/collections/inventory';

type PipelineStage = Record<string, unknown>;

interface StockItemGroupResult {
  _id: string;
}

export async function getPagedStockItems(
  queryString: string,
  physicalStoreId: string
) {
  const params = parse(queryString);
  const {
    categoryId,
    name,
    stockLevel,
    verifyDuration,
    pageIndex = '0',
    pageSize = '20',
  } = params;
  const pipeline: PipelineStage[] = [];
  const nameText = typeof name === 'string' ? name : '';
  const categoryIdText = typeof categoryId === 'string' ? categoryId : '';
  const stockLevelText = typeof stockLevel === 'string' ? stockLevel : '';
  const verifyDurationText =
    typeof verifyDuration === 'string' ? verifyDuration : '';

  if (nameText) {
    if (nameText.length === 1) {
      pipeline.push({
        $match: { name: { $regex: `^${nameText}` } },
      });
    } else {
      pipeline.push({
        $match: { $text: { $search: nameText } },
      });
    }
  }

  pipeline.push({
    $match: {
      physicalStoreId: { $eq: physicalStoreId },
    },
  });

  if (categoryIdText) {
    pipeline.push({
      $match: {
        categoryId: { $eq: categoryIdText },
      },
    });
  }

  if (verifyDurationText === 'less-than-3-months-ago') {
    const m3 = subMonths(new Date(), 3);
    pipeline.push({
      $match: {
        $and: [{ verifiedOn: { $ne: null } }, { verifiedOn: { $gt: m3 } }],
      },
    });
  } else if (verifyDurationText === 'between-3-to-6-months-ago') {
    const m3 = subMonths(new Date(), 3);
    const m6 = subMonths(new Date(), 6);
    pipeline.push({
      $match: {
        $and: [
          { verifiedOn: { $ne: null } },
          { verifiedOn: { $gt: m6 } },
          { verifiedOn: { $lt: m3 } },
        ],
      },
    });
  } else if (verifyDurationText === 'more-than-6-months-ago') {
    const m6 = subMonths(new Date(), 6);
    pipeline.push({
      $match: {
        $or: [{ verifiedOn: { $eq: null } }, { verifiedOn: { $lt: m6 } }],
      },
    });
  }

  if (stockLevelText === 'negative-stock-level') {
    pipeline.push({
      $match: {
        currentStockLevel: { $lt: 0 },
      },
    });
  } else if (stockLevelText === 'less-than-min-stock-level') {
    pipeline.push({
      $match: {
        minStockLevel: { $ne: null },
        $expr: { $gt: ['$minStockLevel', '$currentStockLevel'] },
      },
    });
  }

  // Group the filtered results by the name. This gives us an
  // array of objects with _id set to the grouped stock item name
  const groupingPipeline = pipeline.concat([
    { $group: { _id: '$name' } },
    { $sort: { _id: 1 } },
  ]);

  const groupResults = await StockItems.aggregate<StockItemGroupResult>(
    groupingPipeline
  );
  // Build an array of all the stock item names in the result
  // We will be using the contents of this array to do pagination
  const allNames = groupResults.map(item => item._id);

  const nPageIndex = parseInt(String(pageIndex), 10);
  const nPageSize = parseInt(String(pageSize), 10);
  const pagedNames = allNames.slice(
    nPageIndex * nPageSize,
    nPageIndex * nPageSize + nPageSize
  );

  const resultsPipeline = pipeline.concat([
    { $match: { name: { $in: pagedNames } } },
    { $sort: { name: 1 } },
  ]);

  const stockItems = await StockItems.aggregate(resultsPipeline);
  return {
    data: stockItems,
    totalResults: allNames.length,
  };
}
