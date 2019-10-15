import moment from 'moment';

import { toInteger, round } from 'meteor/idreesia-common/utilities/lodash';
import {
  Attendances,
  Karkuns,
  Jobs,
  Duties,
  DutyShifts,
  DutyLocations,
} from 'meteor/idreesia-common/server/collections/hr';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import {
  Formats,
  Permissions as PermissionConstants,
} from 'meteor/idreesia-common/constants';
import { createMonthlyAttendance } from 'meteor/idreesia-common/server/business-logic/hr/create-monthly-attendance';
import { processAttendanceSheet } from './helpers';

export default {
  AttendanceType: {
    karkun: attendanceType =>
      Karkuns.findOne({
        _id: { $eq: attendanceType.karkunId },
      }),
    job: attendanceType => {
      if (!attendanceType.jobId) return null;
      return Jobs.findOne({
        _id: { $eq: attendanceType.jobId },
      });
    },
    duty: attendanceType => {
      if (!attendanceType.dutyId) return null;
      return Duties.findOne({
        _id: { $eq: attendanceType.dutyId },
      });
    },
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
    attendanceById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_VIEW_ATTENDANCES,
          PermissionConstants.HR_MANAGE_ATTENDANCES,
        ])
      ) {
        return null;
      }

      return Attendances.findOne(_id);
    },

    attendanceByMonth(obj, { month, categoryId, subCategoryId }, { user }) {
      if (!categoryId) return [];

      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_VIEW_ATTENDANCES,
          PermissionConstants.HR_MANAGE_ATTENDANCES,
        ])
      ) {
        return [];
      }

      const formattedMonth = moment(month, Formats.DATE_FORMAT)
        .startOf('month')
        .format('MM-YYYY');

      /**
       * categoryId value would either contain the id for a duty, or would contain the string
       * 'all_jobs' in which case we need to return attendance of employees with the
       * selected job.
       */
      let query;
      if (categoryId === 'all_jobs') {
        query = {
          month: formattedMonth,
        };
        if (subCategoryId) {
          query.jobId = subCategoryId;
        } else {
          query.jobId = { $exists: true, $ne: null };
        }
      } else {
        query = {
          month: formattedMonth,
          dutyId: categoryId,
        };
        if (subCategoryId) query.shiftId = subCategoryId;
      }

      console.log(query);
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

      const barcodeIdsArray = barcodeIds.split(',');
      return Attendances.find({
        meetingCardBarcodeId: { $in: barcodeIdsArray },
      }).fetch();
    },
  },

  Mutation: {
    createAttendances(obj, { month }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_ATTENDANCES])
      ) {
        throw new Error(
          'You do not have permission to manage attendances in the System.'
        );
      }

      const formattedMonth = moment(month, Formats.DATE_FORMAT)
        .startOf('month')
        .format('MM-YYYY');

      return createMonthlyAttendance(formattedMonth);
    },

    updateAttendance(
      obj,
      { _id, totalCount, presentCount, absentCount },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_ATTENDANCES])
      ) {
        throw new Error(
          'You do not have permission to manage attendances in the System.'
        );
      }

      const date = new Date();
      const numTotalCount = toInteger(totalCount);
      const numPresentCount = toInteger(presentCount);
      const numAbsentCount = toInteger(absentCount);

      Attendances.update(_id, {
        $set: {
          totalCount: numTotalCount,
          presentCount: numPresentCount,
          absentCount: numAbsentCount,
          percentage: round((numPresentCount / numTotalCount) * 100),
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Attendances.findOne(_id);
    },

    uploadAttendances(obj, { csv, month, dutyId, shiftId }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_ATTENDANCES])
      ) {
        throw new Error(
          'You do not have permission to manage attendances in the System.'
        );
      }

      const date = new Date();
      return processAttendanceSheet(csv, month, dutyId, shiftId, date, user);
    },

    deleteAttendances(obj, { ids }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_ATTENDANCES])
      ) {
        throw new Error(
          'You do not have permission to manage attendances in the System.'
        );
      }

      return Attendances.remove({
        _id: { $in: ids },
      });
    },
  },
};
