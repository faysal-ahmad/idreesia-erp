import { Migrations } from 'meteor/percolate:migrations';

import { AuditLogs } from 'meteor/idreesia-common/server/collections/common';

Migrations.add({
  version: 29,
  async up() {
    const auditLogs = AuditLogs.rawCollection();
    await auditLogs.createIndex({ entityId: 1 }, { background: true });
    await auditLogs.createIndex({ entityType: 1 }, { background: true });
    await auditLogs.createIndex({ operationType: 1 }, { background: true });
    await auditLogs.createIndex({ operationTime: 1 }, { background: true });
    await auditLogs.createIndex({ operationBy: 1 }, { background: true });
  },
});
