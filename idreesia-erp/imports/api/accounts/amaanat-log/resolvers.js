import { AmaanatLogs } from "meteor/idreesia-common/collections/accounts";
import { hasOnePermission } from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

import getAmaanatLogs from "./queries";

export default {
  Query: {
    amaanatLogById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_VIEW_AMAANAT_LOGS,
          PermissionConstants.ACCOUNTS_MANAGE_AMAANAT_LOGS,
        ])
      ) {
        return null;
      }

      return AmaanatLogs.findOne({ _id });
    },

    pagedAmaanatLogs(obj, { queryString }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_VIEW_AMAANAT_LOGS,
          PermissionConstants.ACCOUNTS_MANAGE_AMAANAT_LOGS,
        ])
      ) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      return getAmaanatLogs(queryString);
    },
  },

  Mutation: {
    createAmaanatLog(
      obj,
      {
        fromCity,
        receivedDate,
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
          PermissionConstants.ACCOUNTS_MANAGE_AMAANAT_LOGS,
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Amaanat Logs in the System."
        );
      }

      const date = new Date();
      const amaanatLogId = AmaanatLogs.insert({
        fromCity,
        receivedDate,
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

    updateAmaanatLog(
      obj,
      {
        _id,
        fromCity,
        receivedDate,
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
          PermissionConstants.ACCOUNTS_MANAGE_AMAANAT_LOGS,
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Amaanat Logs in the System."
        );
      }

      const date = new Date();
      AmaanatLogs.update(
        {
          _id: { $eq: _id },
        },
        {
          $set: {
            fromCity,
            receivedDate,
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

    removeAmaanatLog(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_MANAGE_AMAANAT_LOGS,
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Amaanat Logs in the System."
        );
      }

      return AmaanatLogs.remove(_id);
    },
  },
};
