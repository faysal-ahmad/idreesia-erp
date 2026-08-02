import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { SecurityLog as SecurityLogSchema } from 'meteor/idreesia-common/server/schemas/common';
import { get } from 'meteor/idreesia-common/utilities/lodash';

interface SecurityLogDocument {
  _id?: string;
  userId?: string | null;
  groupId?: string | null;
  operationType: string;
  operationDetails?: Record<string, unknown>;
  operationTime: Date;
  operationBy?: string;
  dataSource: string;
  dataSourceDetail?: string | null;
}

interface SearchSecurityLogsParams {
  dataSources?: string[];
  pageIndex?: string;
  pageSize?: string;
}

interface CountResult {
  total: number;
}

class SecurityLogs extends AggregatableCollection<SecurityLogDocument> {
  constructor(name = 'common-security-log', options = {}) {
    super(name, options);
    this.attachSchema(SecurityLogSchema);
  }

  // **************************************************************
  // Query Functions
  // **************************************************************
  searchSecurityLogs(params: SearchSecurityLogsParams = {}) {
    const pipeline: Record<string, unknown>[] = [];

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

    const securityLogs = this.aggregate<SecurityLogDocument>(resultsPipeline);
    const totalResults = this.aggregate<CountResult>(countingPipeline);

    return Promise.all([securityLogs, totalResults]).then(results => ({
      data: results[0],
      totalResults: get(results[1], ['0', 'total'], 0),
    }));
  }
}

export default new SecurityLogs();
