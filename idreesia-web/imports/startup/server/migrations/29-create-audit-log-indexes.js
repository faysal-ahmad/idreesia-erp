import { Migrations } from 'meteor/percolate:migrations';

import { AuditLogs } from 'meteor/idreesia-common/server/collections/common';

Migrations.add({
  version: 29,
  up() {
    const auditLogs = AuditLogs.rawCollection();
    auditLogs.createIndex({ entityId: 1 }, { background: true });
    auditLogs.createIndex({ entityType: 1 }, { background: true });
    auditLogs.createIndex({ operationType: 1 }, { background: true });
    auditLogs.createIndex({ operationTime: 1 }, { background: true });
    auditLogs.createIndex({ operationBy: 1 }, { background: true });
  },
});
