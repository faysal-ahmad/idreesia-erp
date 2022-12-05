import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { SecurityLog as SecurityLogSchema } from 'meteor/idreesia-common/server/schemas/common';
import { get } from 'meteor/idreesia-common/utilities/lodash';

class SecurityLogs extends AggregatableCollection {
  constructor(name = 'common-security-log', options = {}) {
    const securityLogs = super(name, options);
    securityLogs.attachSchema(SecurityLogSchema);
    return securityLogs;
  }

  // **************************************************************
  // Query Functions
  // **************************************************************
  searchSecurityLogs(params = {}) {
    const pipeline = [];

    const { dataSources, pageIndex = '0', pageSize = '20' } = params;
    pipeline.push({
      $match: {
        dataSource: { $in: dataSources },
      },
    });

    const countingPipeline = pipeline.concat({
      $count: 'total',
    });

    const nPageIndex = parseInt(pageIndex, 10);
    const nPageSize = parseInt(pageSize, 10);
    const resultsPipeline = pipeline.concat([
      { $sort: { operationTime: -1 } },
      { $skip: nPageIndex * nPageSize },
      { $limit: nPageSize },
    ]);

    const securityLogs = this.aggregate(resultsPipeline);
    const totalResults = this.aggregate(countingPipeline);

    return Promise.all([securityLogs, totalResults]).then(results => ({
      data: results[0],
      totalResults: get(results[1], ['0', 'total'], 0),
    }));
  }
}

export default new SecurityLogs();
