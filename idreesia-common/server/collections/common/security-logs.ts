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
  operationTypes?: string[];
  userIds?: string[];
  startDate?: Date;
  endDate?: Date;
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

    const {
      dataSources,
      operationTypes,
      userIds,
      startDate,
      endDate,
      pageIndex = '0',
      pageSize = '20',
    } = params;

    const matchStage: Record<string, unknown> = {};
    if (dataSources && dataSources.length > 0) {
      matchStage.dataSource = { $in: dataSources };
    }
    if (operationTypes && operationTypes.length > 0) {
      matchStage.operationType = { $in: operationTypes };
    }
    if (userIds && userIds.length > 0) {
      matchStage.userId = { $in: userIds };
    }
    if (startDate || endDate) {
      matchStage.operationTime = {
        ...(startDate ? { $gte: startDate } : {}),
        ...(endDate ? { $lte: endDate } : {}),
      };
    }
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

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
