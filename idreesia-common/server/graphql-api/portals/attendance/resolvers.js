import moment from 'moment';

import { toInteger } from 'meteor/idreesia-common/utilities/lodash';
import {
  Attendances,
  Karkuns,
} from 'meteor/idreesia-common/server/collections/hr';
import {
  hasInstanceAccess,
  hasOnePermission,
} from 'meteor/idreesia-common/server/graphql-api/security';
import {
  Formats,
  Permissions as PermissionConstants,
} from 'meteor/idreesia-common/constants';
import { createMonthlyAttendance } from 'meteor/idreesia-common/server/business-logic/portals/create-monthly-attendance';
import { getPagedAttendanceByKarkun } from './queries';

export default {
  Query: {
    portalAttendanceById(obj, { portalId, _id }, { user }) {
      if (
        hasInstanceAccess(user._id, portalId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.PORTALS_VIEW_KARKUNS,
          PermissionConstants.PORTALS_MANAGE_KARKUNS,
          PermissionConstants.PORTALS_DELETE_DATA,
        ])
      ) {
        return null;
      }

      return Attendances.findOne(_id);
    },

    pagedPortalAttendanceByKarkun(
      obj,
      { portalId, karkunId, queryString },
      { user }
    ) {
      if (
        hasInstanceAccess(user._id, portalId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.PORTALS_VIEW_KARKUNS,
          PermissionConstants.PORTALS_MANAGE_KARKUNS,
          PermissionConstants.PORTALS_DELETE_DATA,
        ])
      ) {
        return {
          data: [],
          totalResults: 0,
        };
      }
      return getPagedAttendanceByKarkun(karkunId, queryString);
    },

    portalAttendanceByMonth(
      obj,
      { portalId, month, cityId, cityMehfilId },
      { user }
    ) {
      if (!cityId) return [];

      if (
        hasInstanceAccess(user._id, portalId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.PORTALS_VIEW_KARKUNS,
          PermissionConstants.PORTALS_MANAGE_KARKUNS,
          PermissionConstants.PORTALS_DELETE_DATA,
        ])
      ) {
        return [];
      }

      let karkuns = [];
      if (!cityMehfilId) {
        karkuns = Karkuns.find({
          cityId: { $eq: cityId },
        }).fetch();
      } else {
        karkuns = Karkuns.find({
          cityId: { $eq: cityId },
          cityMehfilId: { $eq: cityMehfilId },
        }).fetch();
      }

      const karkunIds = karkuns.map(({ _id }) => _id);
      return Attendances.find({
        month,
        karkunId: { $in: karkunIds },
      }).fetch();
    },
  },

  Mutation: {
    createPortalAttendances(obj, { portalId, month }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.PORTALS_MANAGE_KARKUNS,
          PermissionConstants.PORTALS_DELETE_DATA,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Attendances in the System.'
        );
      }

      if (hasInstanceAccess(user._id, portalId) === false) {
        throw new Error(
          'You do not have permission to manage Attendances in this Mehfil Portal.'
        );
      }

      return createMonthlyAttendance(portalId, month, user);
    },

    updatePortalAttendance(
      obj,
      {
        portalId,
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
          PermissionConstants.PORTALS_MANAGE_KARKUNS,
          PermissionConstants.PORTALS_DELETE_DATA,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Attendances in the System.'
        );
      }

      if (hasInstanceAccess(user._id, portalId) === false) {
        throw new Error(
          'You do not have permission to manage Attendances in this Mehfil Portal.'
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

    deletePortalAttendances(obj, { portalId, month, ids }, { user }) {
      const currentMonth = moment().startOf('month');
      const passedMonth = moment(`01-${month}`, Formats.DATE_FORMAT);

      if (
        passedMonth.isBefore(currentMonth) &&
        !hasOnePermission(user._id, [PermissionConstants.PORTALS_DELETE_DATA])
      ) {
        throw new Error(
          'You do not have permission to remove Attendances for past months in the System.'
        );
      }

      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_MANAGE_KARKUNS,
          PermissionConstants.PORTALS_DELETE_DATA,
        ])
      ) {
        throw new Error(
          'You do not have permission to remove Attendances in the System.'
        );
      }

      if (hasInstanceAccess(user._id, portalId) === false) {
        throw new Error(
          'You do not have permission to remove Attendances in this Mehfil Portal.'
        );
      }

      return Attendances.remove({
        _id: { $in: ids },
      });
    },

    deleteAllPortalAttendances(
      obj,
      { portalId, month, cityId, cityMehfilId },
      { user }
    ) {
      const currentMonth = moment().startOf('month');
      const passedMonth = moment(`01-${month}`, Formats.DATE_FORMAT);

      if (
        passedMonth.isBefore(currentMonth) &&
        !hasOnePermission(user._id, [PermissionConstants.PORTALS_DELETE_DATA])
      ) {
        throw new Error(
          'You do not have permission to remove Attendances for past months in the System.'
        );
      }

      if (
        !hasOnePermission(user._id, [PermissionConstants.PORTALS_DELETE_DATA])
      ) {
        throw new Error(
          'You do not have permission to remove Attendances in the System.'
        );
      }

      if (hasInstanceAccess(user._id, portalId) === false) {
        throw new Error(
          'You do not have permission to remove Attendances in this Mehfil Portal.'
        );
      }

      let karkuns = [];
      if (!cityMehfilId) {
        karkuns = Karkuns.find({
          cityId: { $eq: cityId },
        }).fetch();
      } else {
        karkuns = Karkuns.find({
          cityId: { $eq: cityId },
          cityMehfilId: { $eq: cityMehfilId },
        }).fetch();
      }

      const karkunIds = karkuns.map(({ _id }) => _id);
      return Attendances.remove({
        month,
        karkunId: { $in: karkunIds },
      });
    },
  },
};
