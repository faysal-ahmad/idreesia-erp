import moment from 'moment';
import { parse } from 'query-string';

import { StockItems } from 'meteor/idreesia-common/server/collections/inventory';

export function getStatistics(physicalStoreId) {
  const itemsWithImages = StockItems.find({
    physicalStoreId: { $eq: physicalStoreId },
    imageId: { $ne: null },
  }).count();

  const itemsWithoutImages = StockItems.find({
    physicalStoreId: { $eq: physicalStoreId },
    $or: [{ imageId: { $exists: false } }, { imageId: { $eq: null } }],
  }).count();

  const itemsWithPositiveStockLevel = StockItems.find({
    physicalStoreId: { $eq: physicalStoreId },
    currentStockLevel: { $gt: 0 },
  }).count();

  const itemsWithLessThanMinStockLevel = StockItems.find({
    physicalStoreId: { $eq: physicalStoreId },
    minStockLevel: { $ne: null },
    $expr: { $gt: ['$minStockLevel', '$currentStockLevel'] },
  }).count();

  const itemsWithNegativeStockLevel = StockItems.find({
    physicalStoreId: { $eq: physicalStoreId },
    currentStockLevel: { $lt: 0 },
  }).count();

  const m3 = moment()
    .subtract(3, 'months')
    .toDate();
  const m6 = moment()
    .subtract(6, 'months')
    .toDate();

  const itemsVerifiedLessThanThreeMonthsAgo = StockItems.find({
    physicalStoreId: { $eq: physicalStoreId },
    $and: [{ verifiedOn: { $ne: null } }, { verifiedOn: { $gt: m3 } }],
  }).count();

  const itemsVerifiedThreeToSixMonthsAgo = StockItems.find({
    physicalStoreId: { $eq: physicalStoreId },
    $and: [
      { verifiedOn: { $ne: null } },
      { verifiedOn: { $gt: m6 } },
      { verifiedOn: { $lt: m3 } },
    ],
  }).count();

  const itemsVerifiedMoreThanSixMonthsAgo = StockItems.find({
    physicalStoreId: { $eq: physicalStoreId },
    $or: [{ verifiedOn: { $eq: null } }, { verifiedOn: { $lt: m6 } }],
  }).count();

  return {
    physicalStoreId,
    itemsWithImages,
    itemsWithoutImages,
    itemsWithPositiveStockLevel,
    itemsWithLessThanMinStockLevel,
    itemsWithNegativeStockLevel,
    itemsVerifiedLessThanThreeMonthsAgo,
    itemsVerifiedThreeToSixMonthsAgo,
    itemsVerifiedMoreThanSixMonthsAgo,
  };
}

export async function getPagedStockItems(queryString, physicalStoreId) {
  const params = parse(queryString);
  const {
    categoryId,
    name,
    stockLevel,
    verifyDuration,
    pageIndex = '0',
    pageSize = '20',
  } = params;
  const pipeline = [];

  if (name) {
    if (name.length === 1) {
      pipeline.push({
        $match: { name: { $regex: `^${name}` } },
      });
    } else {
      pipeline.push({
        $match: { $text: { $search: name } },
      });
    }
  }

  pipeline.push({
    $match: {
      physicalStoreId: { $eq: physicalStoreId },
    },
  });

  if (categoryId) {
    pipeline.push({
      $match: {
        categoryId: { $eq: categoryId },
      },
    });
  }

  if (verifyDuration === 'less-than-3-months-ago') {
    const m3 = moment()
      .subtract(3, 'months')
      .toDate();
    pipeline.push({
      $match: {
        $and: [{ verifiedOn: { $ne: null } }, { verifiedOn: { $gt: m3 } }],
      },
    });
  } else if (verifyDuration === 'between-3-to-6-months-ago') {
    const m3 = moment()
      .subtract(3, 'months')
      .toDate();
    const m6 = moment()
      .subtract(6, 'months')
      .toDate();
    pipeline.push({
      $match: {
        $and: [
          { verifiedOn: { $ne: null } },
          { verifiedOn: { $gt: m6 } },
          { verifiedOn: { $lt: m3 } },
        ],
      },
    });
  } else if (verifyDuration === 'more-than-6-months-ago') {
    const m6 = moment()
      .subtract(6, 'months')
      .toDate();
    pipeline.push({
      $match: {
        $or: [{ verifiedOn: { $eq: null } }, { verifiedOn: { $lt: m6 } }],
      },
    });
  }

  if (stockLevel === 'negative-stock-level') {
    pipeline.push({
      $match: {
        currentStockLevel: { $lt: 0 },
      },
    });
  } else if (stockLevel === 'less-than-min-stock-level') {
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

  const groupResults = await StockItems.aggregate(groupingPipeline);
  // Build an array of all the stock item names in the result
  // We will be using the contents of this array to do pagination
  const allNames = groupResults.map(item => item._id);

  const nPageIndex = parseInt(pageIndex, 10);
  const nPageSize = parseInt(pageSize, 10);
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
