import { KarkunDuties } from 'meteor/idreesia-common/server/collections/hr';

export default {
  Mutation: {
    createPortalKarkunDuty(obj, { karkunId, dutyId }) {
      const newDuty = {
        karkunId,
        dutyId,
      };
      const karkunDutyId = KarkunDuties.insert(newDuty);
      return KarkunDuties.findOne(karkunDutyId);
    },

    removePortalKarkunDuty(obj, { _id }) {
      return KarkunDuties.remove(_id);
    },
  },
};
