import { parse } from "query-string";
import { get } from "lodash";

import { ItemTypes } from "/imports/lib/collections/inventory";

export default function getItemTypes(queryString) {
  const params = parse(queryString);
  const pipeline = [];

  const { itemCategoryId, pageIndex = "0", pageSize = "10" } = params;

  if (itemCategoryId && itemCategoryId !== "") {
    pipeline.push({
      $match: {
        itemCategoryId: { $eq: itemCategoryId },
      },
    });
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
