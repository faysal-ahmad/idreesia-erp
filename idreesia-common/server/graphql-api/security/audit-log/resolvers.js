import { AuditLogs } from 'meteor/idreesia-common/server/collections/common';
import { EntityTypes } from 'meteor/idreesia-common/constants/audit';

export default {
  Query: {
    pagedSecurityAuditLogs(obj, { filter }) {
      const updatedFilter = Object.assign({}, filter, {
        entityTypes: [EntityTypes.VISITOR],
      });

      return AuditLogs.searchAuditLogs(updatedFilter);
    },
  },
};
