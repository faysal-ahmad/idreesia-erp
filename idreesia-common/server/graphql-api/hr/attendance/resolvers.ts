import { format, isBefore, startOfMonth } from 'date-fns';

import { toInteger } from 'meteor/idreesia-common/utilities/lodash';
import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  Attendances,
  Jobs,
  Duties,
  DutyShifts,
} from 'meteor/idreesia-common/server/collections/hr';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import {
  Formats,
  Permissions as PermissionConstants,
} from 'meteor/idreesia-common/constants';
import { createMonthlyAttendance } from 'meteor/idreesia-common/server/business-logic/hr/create-monthly-attendance';
import { parseDate } from 'meteor/idreesia-common/utilities/date-fns';
import { getPagedAttendanceByKarkun } from './queries';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  AttendanceType: {
    karkun: async attendanceType =>
      People.findOneAsync({
        _id: { $eq: attendanceType.karkunId },
      }),
    job: async attendanceType => {
      if (!attendanceType.jobId) return null;
      return Jobs.findOneAsync({
        _id: { $eq: attendanceType.jobId },
      });
    },
    duty: async attendanceType => {
      if (!attendanceType.dutyId) return null;
      return Duties.findOneAsync({
        _id: { $eq: attendanceType.dutyId },
      });
    },
    shift: async attendanceType => {
      if (!attendanceType.shiftId) return null;
      return DutyShifts.findOneAsync({
        _id: { $eq: attendanceType.shiftId },
      });
    },
  },

  Query: {
    attendanceById: async (obj, { _id }) => Attendances.findOneAsync(_id),

    pagedAttendanceByKarkun: async (obj, { queryString }) =>
      getPagedAttendanceByKarkun(queryString),

    attendanceByMonth: async (obj, { month, categoryId, subCategoryId }) => {
      if (!categoryId) return [];

      const formattedMonth = format(
        startOfMonth(parseDate(month, Formats.DATE_FORMAT)),
        'MM-yyyy'
      );

      /**
       * categoryId value would either contain the id for a duty, or would contain the string
       * 'all_jobs' in which case we need to return attendance of employees with the
       * selected job.
       */
      const query: Record<string, unknown> = {};
      if (categoryId === 'all_jobs') {
        query.month = formattedMonth;
        if (subCategoryId) {
          query.jobId = subCategoryId;
        } else {
          query.jobId = { $exists: true, $ne: null };
        }
      } else {
        query.month = formattedMonth;
        query.dutyId = categoryId;
        if (subCategoryId) query.shiftId = subCategoryId;
      }

      return Attendances.find(query).fetchAsync();
    },

    attendanceByBarcodeId: async (obj, { barcodeId }) =>
      Attendances.findOneAsync({
        meetingCardBarcodeId: { $eq: barcodeId },
      }),

    attendanceByBarcodeIds: async (obj, { barcodeIds }) => {
      const barcodeIdsArray = barcodeIds.split(',');
      return Attendances.find({
        meetingCardBarcodeId: { $in: barcodeIdsArray },
      }).fetchAsync();
    },
  },

  Mutation: {
    createAttendances: async (obj, { month }, { user }) => {
      const formattedMonth = format(
        startOfMonth(parseDate(month, Formats.DATE_FORMAT)),
        'MM-yyyy'
      );

      return await createMonthlyAttendance(formattedMonth, user);
    },

    updateAttendance: async (
      obj,
      { _id, attendanceDetails, presentCount, absentCount, percentage },
      { user }
    ) => {
      const date = new Date();
      await Attendances.updateAsync(_id, {
        $set: {
          attendanceDetails,
          presentCount: toInteger(presentCount),
          absentCount: toInteger(absentCount),
          percentage: toInteger(percentage),
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Attendances.findOneAsync(_id);
    },

    deleteAttendances: async (obj, { month, ids }, { user }) => {
      const currentMonth = startOfMonth(new Date());
      const passedMonth = parseDate(month, Formats.DATE_FORMAT);

      // @checkPermissions on the schema already requires HR_MANAGE_KARKUNS
      // or HR_DELETE_DATA; past months additionally require HR_DELETE_DATA
      // specifically, which the directive can't express.
      if (
        isBefore(passedMonth, currentMonth) &&
        !hasOnePermission(user, [PermissionConstants.HR_DELETE_DATA])
      ) {
        throw new Error(
          'You do not have permission to remove attendances for past months in the System.'
        );
      }

      return Attendances.removeAsync({
        _id: { $in: ids },
      });
    },

    deleteAllAttendances: async (
      obj,
      { month, categoryId, subCategoryId },
      { user }
    ) => {
      const currentMonth = startOfMonth(new Date());
      const passedMonth = parseDate(month, Formats.DATE_FORMAT);

      // @checkPermissions on the schema already requires HR_MANAGE_KARKUNS
      // or HR_DELETE_DATA; past months additionally require HR_DELETE_DATA
      // specifically, which the directive can't express.
      if (
        isBefore(passedMonth, currentMonth) &&
        !hasOnePermission(user, [PermissionConstants.HR_DELETE_DATA])
      ) {
        throw new Error(
          'You do not have permission to remove attendances for past months in the System.'
        );
      }

      const formattedMonth = format(
        startOfMonth(parseDate(month, Formats.DATE_FORMAT)),
        'MM-yyyy'
      );

      /**
       * categoryId value would either contain the id for a duty, or would contain the string
       * 'all_jobs' in which case we need toremove attendance of employees with the
       * selected job.
       */
      const removeCriteria: Record<string, unknown> = {
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

      return Attendances.removeAsync(removeCriteria);
    },
  },
};

export default resolvers;
