import { parse } from "query-string";
import { StockItems } from "meteor/idreesia-common/collections/inventory";
import { get } from "lodash";

export function getAllStockItems(physicalStoreId) {
  const pipeline = [
    {
      $match: {
        physicalStoreId: { $eq: physicalStoreId },
      },
    },
    { $sort: { name: 1 } },
  ];

  return StockItems.aggregate(pipeline).toArray();
}

export default function getPagedStockItems(queryString, physicalStoreId) {
  const params = parse(queryString);
  const { categoryId, name, pageIndex = "0", pageSize = "10" } = params;
  const pipeline = [];

  if (name) {
    pipeline.push({
      $match: { $text: { $search: name } },
    });
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
    { $sort: { name: 1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const stockItems = StockItems.aggregate(resultsPipeline).toArray();
  const totalResults = StockItems.aggregate(countingPipeline).toArray();
  return Promise.all([stockItems, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ["0", "total"], 0),
  }));
}
