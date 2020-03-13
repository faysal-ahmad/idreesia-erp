import { Mongo } from 'meteor/mongo';

import { AuditLog as AuditLogSchema } from 'meteor/idreesia-common/server/schemas/common';

class AuditLogs extends Mongo.Collection {
  constructor(name = 'common-audit-log', options = {}) {
    const auditLogs = super(name, options);
    auditLogs.attachSchema(AuditLogSchema);
    return auditLogs;
  }
}

export default new AuditLogs();
