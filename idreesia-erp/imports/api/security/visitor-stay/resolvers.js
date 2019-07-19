import moment from "moment";
import { compact } from "lodash";

import { Duties, DutyShifts } from "meteor/idreesia-common/collections/hr";
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
    dutyName: visitorStay => {
      if (!visitorStay.dutyId) return null;
      const duty = Duties.findOne(visitorStay.dutyId);
      return duty ? duty.name : null;
    },
    shiftName: visitorStay => {
      if (!visitorStay.shiftId) return null;
      const shift = DutyShifts.findOne(visitorStay.shiftId);
      return shift ? shift.name : null;
    },
    dutyShiftName: visitorStay => {
      if (!visitorStay.dutyId) return null;
      const duty = Duties.findOne(visitorStay.dutyId);
      const shift = visitorStay.shiftId
        ? DutyShifts.findOne(visitorStay.shiftId)
        : null;

      if (!shift) return duty.name;
      return `${duty.name} - ${shift.name}`;
    },
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

    distinctStayAllowedBy() {
      const distincFunction = Meteor.wrapAsync(
        VisitorStays.rawCollection().distinct,
        VisitorStays.rawCollection()
      );

      return compact(distincFunction("stayAllowedBy"));
    },
  },

  Mutation: {
    createVisitorStay(
      obj,
      {
        visitorId,
        fromDate,
        toDate,
        stayReason,
        stayAllowedBy,
        dutyId,
        shiftId,
        notes,
      },
      { user }
    ) {
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

      const date = new Date();
      const visitorStayId = VisitorStays.insert({
        visitorId,
        fromDate: mFromDate.toDate(),
        toDate: mToDate.toDate(),
        numOfDays: days,
        stayReason,
        stayAllowedBy,
        dutyId,
        shiftId,
        notes,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return VisitorStays.findOne(visitorStayId);
    },

    updateVisitorStay(
      obj,
      {
        _id,
        fromDate,
        toDate,
        stayReason,
        stayAllowedBy,
        dutyId,
        shiftId,
        notes,
      },
      { user }
    ) {
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

      const date = new Date();
      VisitorStays.update(_id, {
        $set: {
          fromDate: mFromDate.toDate(),
          toDate: mToDate.toDate(),
          numOfDays: days,
          stayReason,
          stayAllowedBy,
          dutyId,
          shiftId,
          notes,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return VisitorStays.findOne(_id);
    },

    cancelVisitorStay(obj, { _id }, { user }) {
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
      VisitorStays.update(_id, {
        $set: {
          cancelledDate: date,
          updatedAt: date,
          updatedBy: user._id,
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
