import moment from "moment";
import {
  Attendances,
  Karkuns,
  Duties,
  DutyShifts,
  DutyLocations,
} from "meteor/idreesia-common/collections/hr";
import { hasOnePermission } from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";
import { Formats } from "meteor/idreesia-common/constants";

import { processAttendanceSheet } from "./helpers";

export default {
  AttendanceType: {
    karkun: attendanceType =>
      Karkuns.findOne({
        _id: { $eq: attendanceType.karkunId },
      }),
    duty: attendanceType =>
      Duties.findOne({
        _id: { $eq: attendanceType.dutyId },
      }),
    shift: attendanceType => {
      if (!attendanceType.shiftId) return null;
      return DutyShifts.findOne({
        _id: { $eq: attendanceType.shiftId },
      });
    },
    location: attendanceType => {
      if (!attendanceType.locationId) return null;
      return DutyLocations.findOne({
        _id: { $eq: attendanceType.locationId },
      });
    },
  },

  Query: {
    attendanceByMonth(obj, { month, dutyId, shiftId }, { user }) {
      if (!dutyId) return [];

      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_VIEW_ATTENDANCES,
          PermissionConstants.HR_MANAGE_ATTENDANCES,
        ])
      ) {
        return [];
      }

      const formattedMonth = moment(month, Formats.DATE_FORMAT)
        .startOf("month")
        .format("MM-YYYY");

      const query = {
        month: formattedMonth,
        dutyId,
      };
      if (shiftId) query.shiftId = shiftId;

      return Attendances.find(query).fetch();
    },

    attendanceByBarcodeId(obj, { barcodeId }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_VIEW_ATTENDANCES,
          PermissionConstants.HR_MANAGE_ATTENDANCES,
          PermissionConstants.SECURITY_VIEW_KARKUN_VERIFICATION,
        ])
      ) {
        return [];
      }

      return Attendances.findOne({
        meetingCardBarcodeId: { $eq: barcodeId },
      });
    },

    attendanceByBarcodeIds(obj, { barcodeIds }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_VIEW_ATTENDANCES,
          PermissionConstants.HR_MANAGE_ATTENDANCES,
        ])
      ) {
        return [];
      }

      const barcodeIdsArray = barcodeIds.split(",");
      return Attendances.find({
        meetingCardBarcodeId: { $in: barcodeIdsArray },
      }).fetch();
    },
  },

  Mutation: {
    uploadAttendances(obj, { csv, month, dutyId, shiftId }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_ATTENDANCES])
      ) {
        throw new Error(
          "You do not have permission to manage attendances in the System."
        );
      }

      return processAttendanceSheet(csv, month, dutyId, shiftId);
    },

    deleteAttendances(obj, { ids }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_ATTENDANCES])
      ) {
        throw new Error(
          "You do not have permission to manage attendances in the System."
        );
      }

      return Attendances.remove({
        _id: { $in: ids },
      });
    },
  },
};
