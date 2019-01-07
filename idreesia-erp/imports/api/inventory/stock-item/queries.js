import { parse } from "query-string";
import { ItemTypes, StockItems } from "meteor/idreesia-common/collections/inventory";
import { get } from "lodash";

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

export function getAllStockItems(physicalStoreId) {
  const pipeline = [
    {
      $match: {
        physicalStoreId: { $eq: physicalStoreId },
      },
    },
    {
      $lookup: {
        from: "inventory-item-types",
        localField: "itemTypeId",
        foreignField: "_id",
        as: "itemType",
      },
    },
    { $unwind: "$itemType" },
    { $sort: { "itemType.name": 1 } },
  ];

  return StockItems.aggregate(pipeline)
    .toArray()
    .then(stockItemObjs =>
      stockItemObjs.map(stockItemObj => {
        // eslint-disable-next-line no-param-reassign
        delete stockItemObj.itemType;
        return stockItemObj;
      })
    );
}

export default function getPagedStockItems(queryString, physicalStoreId) {
  const params = parse(queryString);
  const pipeline = [
    {
      $match: {
        physicalStoreId: { $eq: physicalStoreId },
      },
    },
  ];

  const {
    itemCategoryId,
    itemTypeName,
    pageIndex = "0",
    pageSize = "10",
  } = params;

  let itemTypeIdsPromise = Promise.resolve([]);
  if (itemCategoryId || itemTypeName) {
    itemTypeIdsPromise = getItemTypeIds(itemCategoryId, itemTypeName);
  }

  return itemTypeIdsPromise.then(itemTypeIdResults => {
    if (itemTypeIdResults.length > 0) {
      const itemTypeIds = itemTypeIdResults.map(
        itemTypeIdResult => itemTypeIdResult._id
      );
      pipeline.push({
        $match: {
          itemTypeId: { $in: itemTypeIds },
        },
      });
    }

    pipeline.push({
      $lookup: {
        from: "inventory-item-types",
        localField: "itemTypeId",
        foreignField: "_id",
        as: "itemType",
      },
    });
    pipeline.push({
      $unwind: "$itemType",
    });

    const countingPipeline = pipeline.concat({
      $count: "total",
    });

    const nPageIndex = parseInt(pageIndex, 10);
    const nPageSize = parseInt(pageSize, 10);
    const resultsPipeline = pipeline.concat([
      { $sort: { "itemType.name": 1 } },
      { $skip: nPageIndex * nPageSize },
      { $limit: nPageSize },
    ]);

    const stockItems = StockItems.aggregate(resultsPipeline).toArray();
    const totalResults = StockItems.aggregate(countingPipeline).toArray();
    return Promise.all([stockItems, totalResults]).then(results => ({
      stockItems: results[0],
      totalResults: get(results[1], ["0", "total"], 0),
    }));
  });
}
