import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { AuditLog as AuditLogSchema } from 'meteor/idreesia-common/server/schemas/common';

export interface AuditLogDocument {
  _id?: string;
  entityId: string;
  entityType: string;
  operationType: string;
  auditValues?: string[] | Record<string, unknown>;
  operationTime: Date;
  operationBy: string;
}

class AuditLogs extends AggregatableCollection<AuditLogDocument> {
  constructor(name = 'common-audit-log', options = {}) {
    super(name, options);
    this.attachSchema(AuditLogSchema);
  }
}

export default new AuditLogs();
