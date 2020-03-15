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
      auditValues: this.getAuditValues(auditValues, existingEntity),
    });
  }

  getAuditValues(auditValues, existingEntity) {
    const _auditValues = [];

    forOwn(auditValues, (value, key) => {
      const changedFrom = existingEntity ? existingEntity[key] : null;

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

    const { entityId, pageIndex = '0', pageSize = '20' } = params;

    if (entityId) {
      pipeline.push({
        $match: {
          entityId: { $eq: entityId },
        },
      });
    }

    const countingPipeline = pipeline.concat({
      $count: 'total',
    });

    const nPageIndex = parseInt(pageIndex, 10);
    const nPageSize = parseInt(pageSize, 10);
    const resultsPipeline = pipeline.concat([
      { $sort: { name: 1 } },
      { $skip: nPageIndex * nPageSize },
      { $limit: nPageSize },
    ]);

    const auditLogs = this.aggregate(resultsPipeline).toArray();
    const totalResults = this.aggregate(countingPipeline).toArray();

    return Promise.all([auditLogs, totalResults]).then(results => ({
      data: results[0],
      totalResults: get(results[1], ['0', 'total'], 0),
    }));
  }
}

export default new AuditLogs();
