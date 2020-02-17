import {
  AmaanatLogs,
  Cities,
  CityMehfils,
} from 'meteor/idreesia-common/server/collections/outstation';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

import getAmaanatLogs from './queries';

export default {
  AmaanatLogType: {
    city: ammanatLogType => {
      if (!ammanatLogType.cityId) return null;
      return Cities.findOne(ammanatLogType.cityId);
    },
    cityMehfil: ammanatLogType => {
      if (!ammanatLogType.cityMehfilId) return null;
      return CityMehfils.findOne(ammanatLogType.cityMehfilId);
    },
  },

  Query: {
    outstationAmaanatLogById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_VIEW_AMAANAT_LOGS,
          PermissionConstants.OUTSTATION_MANAGE_AMAANAT_LOGS,
        ])
      ) {
        return null;
      }

      return AmaanatLogs.findOne({ _id });
    },

    pagedOutstationAmaanatLogs(obj, { filter }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_VIEW_AMAANAT_LOGS,
          PermissionConstants.OUTSTATION_MANAGE_AMAANAT_LOGS,
        ])
      ) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      return getAmaanatLogs(filter);
    },
  },

  Mutation: {
    createOutstationAmaanatLog(
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
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_AMAANAT_LOGS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Amaanat Logs in the System.'
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

    updateOutstationAmaanatLog(
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
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_AMAANAT_LOGS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Amaanat Logs in the System.'
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

    removeOutstationAmaanatLog(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_AMAANAT_LOGS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Amaanat Logs in the System.'
        );
      }

      return AmaanatLogs.remove(_id);
    },
  },
};
