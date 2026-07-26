import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { AuditLog as AuditLogSchema } from 'meteor/idreesia-common/server/schemas/common';
import { forOwn, get } from 'meteor/idreesia-common/utilities/lodash';

interface AuditLogDocument {
  _id?: string;
  entityId: string;
  entityType: string;
  operationType: string;
  auditValues?: string[] | Record<string, unknown>;
  operationTime: Date;
  operationBy: string;
}

interface CreateAuditLogValues {
  entityId: string;
  entityType: string;
  operationType: string;
  auditValues?: Record<string, unknown>;
  operationBy: string;
  operationTime: Date;
}

interface SearchAuditLogsParams {
  entityId?: string;
  entityTypes?: string[];
  pageIndex?: string;
  pageSize?: string;
}

interface CountResult {
  total: number;
}

class AuditLogs extends AggregatableCollection<AuditLogDocument> {
  constructor(name = 'common-audit-log', options = {}) {
    super(name, options);
    this.attachSchema(AuditLogSchema);
  }

  async createAuditLog(
    {
      entityId,
      entityType,
      operationType,
      auditValues,
      operationBy,
      operationTime,
    }: CreateAuditLogValues,
    existingEntity: Record<string, unknown> | null
  ) {
    await this.insertAsync({
      entityId,
      entityType,
      operationType,
      operationBy,
      operationTime,
      auditValues:
        existingEntity && auditValues
          ? this.getAuditValues(auditValues, existingEntity)
          : auditValues,
    });
  }

  getAuditValues(
    auditValues: Record<string, unknown>,
    existingEntity: Record<string, unknown> | null
  ) {
    const _auditValues: string[] = [];

    forOwn(auditValues, (value, key) => {
      const changedFrom = existingEntity ? get(existingEntity, key) : null;

      if (changedFrom || value) {
        _auditValues.push(
          JSON.stringify({
            fieldName: key,
            changedFrom,
            changedTo: value,
          })
        );
      }
    });

    return _auditValues;
  }

  // **************************************************************
  // Query Functions
  // **************************************************************
  searchAuditLogs(params: SearchAuditLogsParams = {}) {
    const pipeline: Record<string, unknown>[] = [];

    const { entityId, entityTypes, pageIndex = '0', pageSize = '20' } = params;

    if (entityId) {
      pipeline.push({
        $match: {
          entityId: { $eq: entityId },
        },
      });
    }

    if (entityTypes) {
      pipeline.push({
        $match: {
          entityType: { $in: entityTypes },
        },
      });
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

    const auditLogs = this.aggregate<AuditLogDocument>(resultsPipeline);
    const totalResults = this.aggregate<CountResult>(countingPipeline);

    return Promise.all([auditLogs, totalResults]).then(results => ({
      data: results[0],
      totalResults: get(results[1], ['0', 'total'], 0),
    }));
  }
}

export default new AuditLogs();
