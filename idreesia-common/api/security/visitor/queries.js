import { parse } from "query-string";
import { get } from "lodash";

import { Visitors } from "meteor/idreesia-common/collections/security";

export function getVisitors(queryString) {
  const params = parse(queryString);
  const pipeline = [];

  const {
    name,
    cnicNumber,
    phoneNumber,
    pageIndex = "0",
    pageSize = "10",
  } = params;

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

  if (phoneNumber) {
    pipeline.push({
      $match: {
        $or: [{ contactNumber1: phoneNumber }, { contactNumber2: phoneNumber }],
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

  const visitors = Visitors.aggregate(resultsPipeline).toArray();
  const totalResults = Visitors.aggregate(countingPipeline).toArray();

  return Promise.all([visitors, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ["0", "total"], 0),
  }));
}