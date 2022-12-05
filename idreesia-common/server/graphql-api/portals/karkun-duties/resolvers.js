import { KarkunDuties } from 'meteor/idreesia-common/server/collections/hr';

export default {
  Mutation: {
    createPortalKarkunDuty: async (obj, { karkunId, dutyId }) => {
      const newDuty = {
        karkunId,
        dutyId,
      };
      const karkunDutyId = KarkunDuties.insert(newDuty);
      return KarkunDuties.findOne(karkunDutyId);
    },

    removePortalKarkunDuty: async (obj, { _id }) => KarkunDuties.remove(_id),
  },
};
