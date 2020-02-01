import moment from 'moment';

import { toInteger } from 'meteor/idreesia-common/utilities/lodash';
import { Attendances } from 'meteor/idreesia-common/server/collections/hr';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import {
  Formats,
  Permissions as PermissionConstants,
} from 'meteor/idreesia-common/constants';
import { createMonthlyAttendance } from 'meteor/idreesia-common/server/business-logic/hr';

import { getPagedAttendanceByKarkun } from './queries';

export default {
  Query: {
    outstationAttendanceById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_VIEW_KARKUNS,
          PermissionConstants.OUTSTATION_MANAGE_KARKUNS,
          PermissionConstants.OUTSTATION_DELETE_DATA,
        ])
      ) {
        return null;
      }

      return Attendances.findOne(_id);
    },

    pagedOutstationAttendanceByKarkun(obj, { queryString }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_VIEW_KARKUNS,
          PermissionConstants.OUTSTATION_MANAGE_KARKUNS,
          PermissionConstants.OUTSTATION_DELETE_DATA,
        ])
      ) {
        return {
          attendance: [],
          totalResults: 0,
        };
      }
      return getPagedAttendanceByKarkun(queryString);
    },

    outstationAttendanceByMonth(
      obj,
      { month, categoryId, subCategoryId },
      { user }
    ) {
      if (!categoryId) return [];

      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_VIEW_KARKUNS,
          PermissionConstants.OUTSTATION_MANAGE_KARKUNS,
          PermissionConstants.OUTSTATION_DELETE_DATA,
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

      return Attendances.find(query).fetch();
    },
  },

  Mutation: {
    createOutstationAttendances(obj, { month }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_KARKUNS,
          PermissionConstants.OUTSTATION_DELETE_DATA,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage attendances in the System.'
        );
      }

      const formattedMonth = moment(month, Formats.DATE_FORMAT)
        .startOf('month')
        .format('MM-YYYY');

      return createMonthlyAttendance(formattedMonth, user);
    },

    updateOutstationAttendance(
      obj,
      {
        _id,
        attendanceDetails,
        presentCount,
        lateCount,
        absentCount,
        percentage,
      },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_KARKUNS,
          PermissionConstants.OUTSTATION_DELETE_DATA,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage attendances in the System.'
        );
      }

      const date = new Date();
      Attendances.update(_id, {
        $set: {
          attendanceDetails,
          presentCount: toInteger(presentCount),
          lateCount: toInteger(lateCount),
          absentCount: toInteger(absentCount),
          percentage: toInteger(percentage),
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Attendances.findOne(_id);
    },

    deleteOutstationAttendances(obj, { month, ids }, { user }) {
      const currentMonth = moment().startOf('month');
      const passedMonth = moment(month, Formats.DATE_FORMAT);

      if (
        passedMonth.isBefore(currentMonth) &&
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_DELETE_DATA,
        ])
      ) {
        throw new Error(
          'You do not have permission to remove attendances for past months in the System.'
        );
      }

      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_KARKUNS,
          PermissionConstants.OUTSTATION_DELETE_DATA,
        ])
      ) {
        throw new Error(
          'You do not have permission to remove attendances in the System.'
        );
      }

      return Attendances.remove({
        _id: { $in: ids },
      });
    },

    deleteAllOutstationAttendances(
      obj,
      { month, categoryId, subCategoryId },
      { user }
    ) {
      const currentMonth = moment().startOf('month');
      const passedMonth = moment(month, Formats.DATE_FORMAT);

      if (
        passedMonth.isBefore(currentMonth) &&
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_DELETE_DATA,
        ])
      ) {
        throw new Error(
          'You do not have permission to remove attendances for past months in the System.'
        );
      }

      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_KARKUNS,
          PermissionConstants.OUTSTATION_DELETE_DATA,
        ])
      ) {
        throw new Error(
          'You do not have permission to remove attendances in the System.'
        );
      }

      const formattedMonth = moment(month, Formats.DATE_FORMAT)
        .startOf('month')
        .format('MM-YYYY');

      /**
       * categoryId value would either contain the id for a duty, or would contain the string
       * 'all_jobs' in which case we need toremove attendance of employees with the
       * selected job.
       */
      const removeCriteria = {
        month: formattedMonth,
      };

      if (categoryId === 'all_jobs') {
        if (subCategoryId) {
          removeCriteria.jobId = subCategoryId;
        } else {
          removeCriteria.jobId = { $exists: true, $ne: null };
        }
      } else {
        removeCriteria.dutyId = categoryId;
        if (subCategoryId) removeCriteria.shiftId = subCategoryId;
      }

      return Attendances.remove(removeCriteria);
    },
  },
};
