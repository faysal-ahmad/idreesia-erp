import { get } from "lodash";

import { DataImports } from "meteor/idreesia-common/collections/accounts";

export default function getDataImports(companyId, pageIndex, pageSize) {
  const pipeline = [
    {
      $match: {
        companyId: { $eq: companyId },
      },
    },
  ];

  const countingPipeline = pipeline.concat({
    $count: "total",
  });

  const resultsPipeline = pipeline.concat([
    { $sort: { createdAt: -1 } },
    { $skip: pageIndex * pageSize },
    { $limit: pageSize },
  ]);

  const dataImports = DataImports.aggregate(resultsPipeline).toArray();
  const totalResults = DataImports.aggregate(countingPipeline).toArray();

  return Promise.all([dataImports, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ["0", "total"], 0),
  }));
}
