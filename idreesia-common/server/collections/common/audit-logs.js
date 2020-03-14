import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { AuditLog as AuditLogSchema } from 'meteor/idreesia-common/server/schemas/common';
import { forOwn } from 'meteor/idreesia-common/utilities/lodash';

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
      _auditValues.push(
        JSON.stringify({
          fieldName: key,
          changedFrom: existingEntity ? existingEntity[key] : null,
          changedTo: value,
        })
      );
    });

    return _auditValues;
  }
}

export default new AuditLogs();
