import { parse } from 'query-string';
import { ItemTypes, StockItems } from '/imports/lib/collections/inventory';

function getItemTypeIds(itemCategoryId, itemTypeName) {
  const pipeline = [];

  if (itemTypeName) {
    pipeline.push({
      $match: { $text: { $search: itemTypeName } },
    });
  }

  if (itemCategoryId) {
    pipeline.push({
      $match: {
        itemCategoryId: { $eq: itemCategoryId },
      },
    });
  }

  pipeline.push({
    $project: { _id: 1 },
  });

  return ItemTypes.aggregate(pipeline);
}

export default function getStockItems(queryString) {
  const params = parse(queryString);
  const pipeline = [];

  const {
    physicalStoreId,
    itemCategoryId,
    itemTypeName,
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

  if ((itemCategoryId && itemCategoryId !== '') || (itemTypeName && itemTypeName !== '')) {
    const itemTypeIdResults = getItemTypeIds(itemCategoryId, itemTypeName);
    const itemTypeIds = itemTypeIdResults.map(itemTypeIdResult => itemTypeIdResult._id);
    pipeline.push({
      $match: {
        itemTypeId: { $in: itemTypeIds },
      },
    });
  }

  const countingPipeline = pipeline.concat({
    $count: 'total',
  });

  const nPageIndex = parseInt(pageIndex, 10);
  const nPageSize = parseInt(pageSize, 10);
  const resultsPipeline = pipeline.concat([
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  return {
    stockItems: StockItems.aggregate(resultsPipeline),
    totalResults: StockItems.aggregate(countingPipeline)[0].total,
  };
}
