import { parse } from "query-string";
import { get } from "lodash";

import { Karkuns } from "/imports/lib/collections/hr";

export default function getKarkuns(queryString) {
  const params = parse(queryString);
  const pipeline = [];

  const { name, cnicNumber, pageIndex = "0", pageSize = "10" } = params;

  if (name) {
    pipeline.push({
      $match: { $text: { $search: name } },
    });
  }

  if (cnicNumber) {
    pipeline.push({
      $match: {
        cnicNumber: { $eq: cnicNumber },
      },
    });
  }

  const countingPipeline = pipeline.concat({
    $count: "total",
  });

  const nPageIndex = parseInt(pageIndex, 10);
  const nPageSize = parseInt(pageSize, 10);
  const resultsPipeline = pipeline.concat([
    { $sort: { firstName: 1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const karkuns = Karkuns.aggregate(resultsPipeline).toArray();
  const totalResults = Karkuns.aggregate(countingPipeline).toArray();

  return Promise.all([karkuns, totalResults]).then(results => ({
    karkuns: results[0],
    totalResults: get(results[1], ["0", "total"], 0),
  }));
}
