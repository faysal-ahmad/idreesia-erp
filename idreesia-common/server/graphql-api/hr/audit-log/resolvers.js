import { AuditLogs } from 'meteor/idreesia-common/server/collections/common';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    pagedHrAuditLogs(obj, { filter }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_VIEW_AUDIT_LOGS])
      ) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      return AuditLogs.searchAuditLogs(filter);
    },
  },
};
