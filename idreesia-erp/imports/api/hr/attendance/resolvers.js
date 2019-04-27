import { Attendances, Karkuns } from "meteor/idreesia-common/collections/hr";
import { hasOnePermission } from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

import { processAttendanceSheet } from "./helpers";

export default {
  AttendanceType: {
    karkun: attendanceType =>
      Karkuns.findOne({
        _id: { $eq: attendanceType.karkunId },
      }),
  },

  Query: {
    attendanceByDutyId(obj, { dutyId, month }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_VIEW_ATTENDANCES,
          PermissionConstants.HR_MANAGE_ATTENDANCES,
        ])
      ) {
        return [];
      }

      return Attendances.find({
        dutyId,
        month,
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
  },
};
