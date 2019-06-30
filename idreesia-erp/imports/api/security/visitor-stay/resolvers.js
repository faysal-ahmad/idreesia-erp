import { VisitorStays } from "meteor/idreesia-common/collections/security";
import { hasOnePermission } from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

import { getVisitorStays } from "./queries";

export default {
  Query: {
    pagedVisitorStaysByVisitorId(obj, { queryString }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_VIEW_VISITORS,
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      return getVisitorStays(queryString);
    },

    visitorStayById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_VIEW_VISITORS,
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        return null;
      }

      return VisitorStays.findOne(_id);
    },
  },

  Mutation: {
    createVisitorStay(obj, { visitorId, fromDate, toDate }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Visitors in the System."
        );
      }
      const date = new Date();
      const visitorStayId = VisitorStays.insert({
        visitorId,
        fromDate,
        toDate,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return VisitorStays.findOne(visitorStayId);
    },

    deleteVisitorStay(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Visitors in the System."
        );
      }

      return VisitorStays.remove(_id);
    },
  },
};
