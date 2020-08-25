import { AmaanatLogs } from 'meteor/idreesia-common/server/collections/accounts';
import {
  hasInstanceAccess,
  hasOnePermission,
} from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

import getAmaanatLogs from './queries';

export default {
  Query: {
    portalAmaanatLogById(obj, { portalId, _id }, { user }) {
      if (
        hasInstanceAccess(user._id, portalId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.PORTALS_VIEW_AMAANAT_LOGS,
          PermissionConstants.PORTALS_MANAGE_AMAANAT_LOGS,
        ])
      ) {
        return null;
      }

      return AmaanatLogs.findOne({ _id });
    },

    pagedPortalAmaanatLogs(obj, { portalId, queryString }, { user }) {
      if (
        hasInstanceAccess(user._id, portalId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.PORTALS_VIEW_AMAANAT_LOGS,
          PermissionConstants.PORTALS_MANAGE_AMAANAT_LOGS,
        ])
      ) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      return getAmaanatLogs(portalId, queryString);
    },
  },

  Mutation: {
    createPortalAmaanatLog(
      obj,
      {
        portalId,
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
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.PORTALS_MANAGE_AMAANAT_LOGS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Amaanat Logs in the System.'
        );
      }

      if (hasInstanceAccess(user._id, portalId) === false) {
        throw new Error(
          'You do not have permission to manage Amaanat Logs in this Mehfil Portal.'
        );
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
        portalId,
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
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.PORTALS_MANAGE_AMAANAT_LOGS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Amaanat Logs in the System.'
        );
      }

      if (hasInstanceAccess(user._id, portalId) === false) {
        throw new Error(
          'You do not have permission to manage Amaanat Logs in this Mehfil Portal.'
        );
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

    removePortalAmaanatLog(obj, { portalId, _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.PORTALS_MANAGE_AMAANAT_LOGS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Amaanat Logs in the System.'
        );
      }

      if (hasInstanceAccess(user._id, portalId) === false) {
        throw new Error(
          'You do not have permission to manage Amaanat Logs in this Mehfil Portal.'
        );
      }

      return AmaanatLogs.remove(_id);
    },
  },
};
