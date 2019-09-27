import { get } from 'lodash';

import { AdminJobs } from 'meteor/idreesia-common/server/collections/admin';

export default function getDataImports(jobType, status, pageIndex, pageSize) {
  const pipeline = [];

  if (jobType) {
    pipeline.push({
      $match: {
        jobType: { $eq: jobType },
      },
    });
  }

  if (status) {
    pipeline.push({
      $match: {
        status: { $eq: status },
      },
    });
  }

  const countingPipeline = pipeline.concat({
    $count: 'total',
  });

  const resultsPipeline = pipeline.concat([
    { $sort: { createdAt: -1 } },
    { $skip: pageIndex * pageSize },
    { $limit: pageSize },
  ]);

  const adminJobs = AdminJobs.aggregate(resultsPipeline).toArray();
  const totalResults = AdminJobs.aggregate(countingPipeline).toArray();

  return Promise.all([adminJobs, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
