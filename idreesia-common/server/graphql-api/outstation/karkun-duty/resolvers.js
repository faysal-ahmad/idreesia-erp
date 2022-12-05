import { KarkunDuties } from 'meteor/idreesia-common/server/collections/hr';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  Mutation: {
    createOutstationKarkunDuty: async (obj, { karkunId, dutyId }, { user }) => {
      if (
        !hasOnePermission(user, [PermissionConstants.OUTSTATION_MANAGE_KARKUNS])
      ) {
        throw new Error(
          'You do not have permission to manage Outstation Karkun Duties in the System.'
        );
      }

      /*
        const existingKarkunDuty = KarkunDuties.findOne({
          karkunId: { $eq: karkunId },
          dutyId: { $eq: dutyId }
        });
        if (existingKarkunDuty) {
          throw Error('This duty is already assigned to the karkun.');
        }
      */

      const newDuty = {
        karkunId,
        dutyId,
      };
      const karkunDutyId = KarkunDuties.insert(newDuty);
      return KarkunDuties.findOne(karkunDutyId);
    },

    removeOutstationKarkunDuty: async (obj, { _id }, { user }) => {
      if (
        !hasOnePermission(user, [PermissionConstants.OUTSTATION_MANAGE_KARKUNS])
      ) {
        throw new Error(
          'You do not have permission to manage Outstation Karkun Duties in the System.'
        );
      }

      return KarkunDuties.remove(_id);
    },
  },
};
