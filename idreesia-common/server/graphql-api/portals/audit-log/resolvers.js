import { AuditLogs } from 'meteor/idreesia-common/server/collections/common';
import {
  hasInstanceAccess,
  hasOnePermission,
} from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';
import { EntityTypes } from 'meteor/idreesia-common/constants/audit';

export default {
  Query: {
    pagedPortalAuditLogs(obj, { portalId, filter }, { user }) {
      if (
        hasInstanceAccess(user._id, portalId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.PORTALS_VIEW_AUDIT_LOGS,
        ])
      ) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      const updatedFilter = Object.assign({}, filter, {
        entityTypes: [EntityTypes.VISITOR, EntityTypes.KARKUN],
      });

      return AuditLogs.searchAuditLogs(updatedFilter);
    },
  },
};
