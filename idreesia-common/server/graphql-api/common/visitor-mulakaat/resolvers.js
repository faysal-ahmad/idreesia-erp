import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';
import { Visitors } from 'meteor/idreesia-common/server/collections/security';

export default {
  VisitorMulakaatType: {
    visitor: visitorMulakaat =>
      Visitors.findOne({
        _id: { $eq: visitorMulakaat.visitorId },
      }),

    createdByName: visitorMulakaat => {
      if (!visitorMulakaat.createdBy) return null;
      const createdByUser = Meteor.users.findOne(visitorMulakaat.createdBy);
      if (createdByUser.karkunId) {
        const karkun = Karkuns.findOne(createdByUser.karkunId);
        return karkun.name;
      }

      return createdByUser.displayName;
    },

    cancelledByName: visitorMulakaat => {
      if (!visitorMulakaat.cancelledBy) return null;
      const cancelledByUser = Meteor.users.findOne(visitorMulakaat.cancelledBy);
      if (cancelledByUser.karkunId) {
        const karkun = Karkuns.findOne(cancelledByUser.karkunId);
        return karkun.name;
      }

      return cancelledByUser.displayName;
    },
  },
};
