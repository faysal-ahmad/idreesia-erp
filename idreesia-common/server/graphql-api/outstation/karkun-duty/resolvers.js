import { KarkunDuties } from 'meteor/idreesia-common/server/collections/hr';

export default {
  Mutation: {
    createOutstationKarkunDuty: async (obj, { karkunId, dutyId }, { user }) => {
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
      return KarkunDuties.remove(_id);
    },
  },
};
