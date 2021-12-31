import { AmaanatLogs } from 'meteor/idreesia-common/server/collections/accounts';
import {
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
    accountsAmaanatLogById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user, [
          PermissionConstants.ACCOUNTS_VIEW_AMAANAT_LOGS,
          PermissionConstants.ACCOUNTS_MANAGE_AMAANAT_LOGS,
        ])
      ) {
        return null;
      }

      return AmaanatLogs.findOne({ _id });
    },

    pagedAccountsAmaanatLogs(obj, { filter }, { user }) {
      if (
        !hasOnePermission(user, [
          PermissionConstants.ACCOUNTS_VIEW_AMAANAT_LOGS,
          PermissionConstants.ACCOUNTS_MANAGE_AMAANAT_LOGS,
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
    createAccountsAmaanatLog(
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
        !hasOnePermission(user, [
          PermissionConstants.ACCOUNTS_MANAGE_AMAANAT_LOGS,
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

    updateAccountsAmaanatLog(
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
        !hasOnePermission(user, [
          PermissionConstants.ACCOUNTS_MANAGE_AMAANAT_LOGS,
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

    removeAccountsAmaanatLog(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user, [
          PermissionConstants.ACCOUNTS_MANAGE_AMAANAT_LOGS,
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
