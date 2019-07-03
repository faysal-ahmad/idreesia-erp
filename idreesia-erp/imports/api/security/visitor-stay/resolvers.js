import moment from "moment";

import {
  Visitors,
  VisitorStays,
} from "meteor/idreesia-common/collections/security";
import { hasOnePermission } from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";
import { Formats } from "meteor/idreesia-common/constants";

import { getVisitorStays } from "./queries";

export default {
  VisitorStayType: {
    refVisitor: visitorStay =>
      Visitors.findOne({
        _id: { $eq: visitorStay.visitorId },
      }),
  },
  Query: {
    pagedVisitorStays(obj, { queryString }, { user }) {
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

      const mFromDate = moment(fromDate, Formats.DATE_FORMAT);
      const mToDate = moment(toDate, Formats.DATE_FORMAT);
      const days = moment.duration(mToDate.diff(mFromDate)).asDays() + 1;
      const approved = !(days > 3);

      const date = new Date();
      const visitorStayId = VisitorStays.insert({
        visitorId,
        fromDate,
        toDate,
        approved,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return VisitorStays.findOne(visitorStayId);
    },

    approveVisitorStay(obj, { _id, approved, notes }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_APPROVE_VISITOR_STAYS,
        ])
      ) {
        throw new Error(
          "You do not have permission to approve Visitor Stays in the System."
        );
      }

      VisitorStays.update(_id, {
        $set: {
          approved,
          approvedOn: new Date(),
          approvedBy: user._id,
          approvalNotes: notes,
        },
      });

      return VisitorStays.findOne(_id);
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
