import { parse } from "query-string";
import { get } from "lodash";

import { ItemTypes } from "meteor/idreesia-common/collections/inventory";

export default function getItemTypes(queryString) {
  const params = parse(queryString);
  const pipeline = [];

  const {
    itemCategoryId,
    itemTypeName,
    pageIndex = "0",
    pageSize = "10",
    unstockedInPhysicalStoreId,
  } = params;

  if (itemCategoryId) {
    pipeline.push({
      $match: {
        itemCategoryId: { $eq: itemCategoryId },
      },
    });
  }

  if (itemTypeName) {
    pipeline.push({
      $match: { $text: { $search: itemTypeName } },
    });
  }

  if (unstockedInPhysicalStoreId) {
    pipeline.push(
      {
        $lookup: {
          from: "inventory-stock-items",
          let: {
            itemTypeId: "$_id",
            physicalStoreId: unstockedInPhysicalStoreId,
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$itemTypeId", "$$itemTypeId"] },
                    { $eq: ["$physicalStoreId", "$$physicalStoreId"] },
                  ],
                },
              },
            },
          ],
          as: "stockItems",
        },
      },
      {
        $match: {
          stockItems: { $eq: [] },
        },
      },
      { $project: { stockItems: 0 } }
    );
  }

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

  const itemTypes = ItemTypes.aggregate(resultsPipeline).toArray();
  const totalResults = ItemTypes.aggregate(countingPipeline).toArray();

  return Promise.all([itemTypes, totalResults]).then(results => ({
    itemTypes: results[0],
    totalResults: get(results[1], ["0", "total"], 0),
  }));
}
