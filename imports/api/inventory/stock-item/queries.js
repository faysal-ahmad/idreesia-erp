import { parse } from 'query-string';
import { ItemTypes, StockItems } from '/imports/lib/collections/inventory';
import { get } from 'lodash';

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

  return ItemTypes.aggregate(pipeline).toArray();
}

export default function getStockItems(queryString, physicalStoreId) {
  const params = parse(queryString);
  const pipeline = [
    {
      $match: {
        physicalStoreId: { $eq: physicalStoreId },
      },
    },
  ];

  const { itemCategoryId, itemTypeName, pageIndex = '0', pageSize = '10' } = params;

  let itemTypeIdsPromise = Promise.resolve([]);
  if (itemCategoryId || itemTypeName) {
    itemTypeIdsPromise = getItemTypeIds(itemCategoryId, itemTypeName);
  }

  return itemTypeIdsPromise.then(itemTypeIdResults => {
    if (itemTypeIdResults.length > 0) {
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

    const stockItems = StockItems.aggregate(resultsPipeline).toArray();
    const totalResults = StockItems.aggregate(countingPipeline).toArray();
    return Promise.all([stockItems, totalResults]).then(results => ({
      stockItems: results[0],
      totalResults: get(results[1], ['0', 'total'], 0),
    }));
  });
}
