import { KarkunDuties } from 'meteor/idreesia-common/server/collections/hr';
import {
  hasInstanceAccess,
  hasOnePermission,
} from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  Mutation: {
    createPortalKarkunDuty(obj, { portalId, karkunId, dutyId }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.PORTAL_MANAGE_KARKUNS])
      ) {
        throw new Error(
          'You do not have permission to manage Portal Karkun Duties in the System.'
        );
      }

      if (hasInstanceAccess(user._id, portalId) === false) {
        throw new Error(
          'You do not have permission to manage Karkuns in this Mehfil Portal.'
        );
      }

      const newDuty = {
        karkunId,
        dutyId,
      };
      const karkunDutyId = KarkunDuties.insert(newDuty);
      return KarkunDuties.findOne(karkunDutyId);
    },

    removePortalKarkunDuty(obj, { portalId, _id }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.PORTAL_MANAGE_KARKUNS])
      ) {
        throw new Error(
          'You do not have permission to manage Portal Karkun Duties in the System.'
        );
      }

      if (hasInstanceAccess(user._id, portalId) === false) {
        throw new Error(
          'You do not have permission to manage Karkuns in this Mehfil Portal.'
        );
      }

      return KarkunDuties.remove(_id);
    },
  },
};
