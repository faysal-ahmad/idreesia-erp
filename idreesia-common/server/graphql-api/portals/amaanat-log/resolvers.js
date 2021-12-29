import { AmaanatLogs } from 'meteor/idreesia-common/server/collections/accounts';

import getAmaanatLogs from './queries';

export default {
  Query: {
    portalAmaanatLogById(obj, { _id }) {
      return AmaanatLogs.findOne({ _id });
    },

    pagedPortalAmaanatLogs(obj, { portalId, queryString }) {
      return getAmaanatLogs(portalId, queryString);
    },
  },

  Mutation: {
    createPortalAmaanatLog(
      obj,
      {
        cityId,
        cityMehfilId,
        sentDate,
        totalAmount,
        hadiaPortion,
        sadqaPortion,
        zakaatPortion,
        langarPortion,
        otherPortion,
        otherPortionDescription,
      },
      { user }
    ) {
      const date = new Date();
      const amaanatLogId = AmaanatLogs.insert({
        cityId,
        cityMehfilId,
        sentDate,
        totalAmount,
        hadiaPortion,
        sadqaPortion,
        zakaatPortion,
        langarPortion,
        otherPortion,
        otherPortionDescription,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return AmaanatLogs.findOne(amaanatLogId);
    },

    updatePortalAmaanatLog(
      obj,
      {
        _id,
        cityId,
        cityMehfilId,
        sentDate,
        totalAmount,
        hadiaPortion,
        sadqaPortion,
        zakaatPortion,
        langarPortion,
        otherPortion,
        otherPortionDescription,
      },
      { user }
    ) {
      const date = new Date();
      AmaanatLogs.update(
        {
          _id: { $eq: _id },
        },
        {
          $set: {
            cityId,
            cityMehfilId,
            sentDate,
            totalAmount,
            hadiaPortion,
            sadqaPortion,
            zakaatPortion,
            langarPortion,
            otherPortion,
            otherPortionDescription,
            updatedAt: date,
            updatedBy: user._id,
          },
        }
      );

      return AmaanatLogs.findOne(_id);
    },

    removePortalAmaanatLog(obj, { _id }) {
      return AmaanatLogs.remove(_id);
    },
  },
};
