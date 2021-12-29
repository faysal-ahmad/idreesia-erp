import { AuditLogs } from 'meteor/idreesia-common/server/collections/common';
import { EntityType } from 'meteor/idreesia-common/constants/audit';

export default {
  Query: {
    pagedPortalAuditLogs(obj, { filter }) {
      const updatedFilter = Object.assign({}, filter, {
        entityTypes: [EntityType.VISITOR, EntityType.KARKUN],
      });

      return AuditLogs.searchAuditLogs(updatedFilter);
    },
  },
};
