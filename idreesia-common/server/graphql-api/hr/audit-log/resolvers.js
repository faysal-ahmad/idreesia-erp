import { AuditLogs } from 'meteor/idreesia-common/server/collections/common';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';
import { EntityType } from 'meteor/idreesia-common/constants/audit';

export default {
  Query: {
    pagedHrAuditLogs: async (obj, { filter }, { user }) => {
      if (!hasOnePermission(user, [PermissionConstants.HR_VIEW_AUDIT_LOGS])) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      const updatedFilter = Object.assign({}, filter, {
        entityTypes: [EntityType.KARKUN],
      });

      return AuditLogs.searchAuditLogs(updatedFilter);
    },
  },
};
