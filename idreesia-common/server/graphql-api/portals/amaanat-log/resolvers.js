import { parse } from 'query-string';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { AmaanatLogs } from 'meteor/idreesia-common/server/collections/accounts';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

import getAmaanatLogs from './queries';

const userHasPortalLevelAccess = user =>
  hasOnePermission(user, [
    PermissionConstants.PORTALS_VIEW_AMAANAT_LOGS,
    PermissionConstants.PORTALS_MANAGE_AMAANAT_LOGS,
  ]);

export default {
  Query: {
    portalAmaanatLogById(obj, { _id }, { user }) {
      const amaanatLog = AmaanatLogs.findOne({ _id });
      if (!userHasPortalLevelAccess(user)) {
        const person = People.findOne(user.personId);
        const cityMehfilId = person?.karkunData?.cityMehfilId;
        if (!cityMehfilId || amaanatLog.cityMehfilId !== cityMehfilId) {
          return null;
        }
      }

      return amaanatLog;
    },

    pagedPortalAmaanatLogs(obj, { portalId, queryString }, { user }) {
      const params = parse(queryString);
      // Check whether the user is allowed to see all amaanat logs for
      // the portal, or just the logs for the mehfil that he belongs to.
      if (!userHasPortalLevelAccess(user)) {
        // Add filter for the mehfil to the params
        const person = People.findOne(user.personId);
        const cityMehfilId = person?.karkunData?.cityMehfilId;
        if (!cityMehfilId) {
          return {
            data: [],
            totalResults: 0,
          };
        }

        const updatedParams = {
          ...params,
          cityMehfilId,
        };

        return getAmaanatLogs(portalId, updatedParams);
      }

      return getAmaanatLogs(portalId, params);
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
      if (!userHasPortalLevelAccess(user)) {
        const person = People.findOne(user.personId);
        if (
          !person?.karkunData?.cityMehfilId ||
          person?.karkunData?.cityMehfilId !== cityMehfilId
        ) {
          return null;
        }
      }

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
      const amaanatLog = AmaanatLogs.findOne({ _id });
      if (!userHasPortalLevelAccess(user)) {
        const person = People.findOne(user.personId);
        if (
          !person?.karkunData?.cityMehfilId ||
          amaanatLog.cityMehfilId !== person?.karkunData?.cityMehfilId ||
          amaanatLog.cityMehfilId !== cityMehfilId
        ) {
          return amaanatLog;
        }
      }

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

    removePortalAmaanatLog(obj, { _id }, { user }) {
      const amaanatLog = AmaanatLogs.findOne({ _id });
      if (!userHasPortalLevelAccess(user)) {
        const person = People.findOne(user.personId);
        const cityMehfilId = person?.karkunData?.cityMehfilId;
        if (!cityMehfilId || amaanatLog.cityMehfilId !== cityMehfilId) {
          return 0;
        }
      }

      return AmaanatLogs.remove(_id);
    },
  },
};
