import { parse } from "query-string";
import { get } from "lodash";

import { VisitorStays } from "meteor/idreesia-common/collections/security";

export function getVisitorStays(queryString) {
  const params = parse(queryString);
  const pipeline = [];

  const { visitorId, pageIndex = "0", pageSize = "10" } = params;

  if (visitorId) {
    pipeline.push({
      $match: {
        visitorId: { $eq: visitorId },
      },
    });
  }

  const countingPipeline = pipeline.concat({
    $count: "total",
  });

  const nPageIndex = parseInt(pageIndex, 10);
  const nPageSize = parseInt(pageSize, 10);
  const resultsPipeline = pipeline.concat([
    { $sort: { fromDate: -1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const visitors = VisitorStays.aggregate(resultsPipeline).toArray();
  const totalResults = VisitorStays.aggregate(countingPipeline).toArray();

  return Promise.all([visitors, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ["0", "total"], 0),
  }));
}
