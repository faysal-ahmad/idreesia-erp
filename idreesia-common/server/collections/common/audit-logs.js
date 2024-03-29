import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { AuditLog as AuditLogSchema } from 'meteor/idreesia-common/server/schemas/common';
import { forOwn, get } from 'meteor/idreesia-common/utilities/lodash';

class AuditLogs extends AggregatableCollection {
  constructor(name = 'common-audit-log', options = {}) {
    const auditLogs = super(name, options);
    auditLogs.attachSchema(AuditLogSchema);
    return auditLogs;
  }

  createAuditLog(
    {
      entityId,
      entityType,
      operationType,
      auditValues,
      operationBy,
      operationTime,
    },
    existingEntity
  ) {
    this.insert({
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

  getAuditValues(auditValues, existingEntity) {
    const _auditValues = [];

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
  searchAuditLogs(params = {}) {
    const pipeline = [];

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

    const auditLogs = this.aggregate(resultsPipeline);
    const totalResults = this.aggregate(countingPipeline);

    return Promise.all([auditLogs, totalResults]).then(results => ({
      data: results[0],
      totalResults: get(results[1], ['0', 'total'], 0),
    }));
  }
}

export default new AuditLogs();
