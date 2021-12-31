import moment from 'moment';

import { toInteger } from 'meteor/idreesia-common/utilities/lodash';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { Attendances } from 'meteor/idreesia-common/server/collections/hr';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import {
  Formats,
  Permissions as PermissionConstants,
} from 'meteor/idreesia-common/constants';
import { createMonthlyAttendance } from 'meteor/idreesia-common/server/business-logic/portals/create-monthly-attendance';
import { getPagedAttendanceByKarkun } from './queries';

export default {
  Query: {
    portalAttendanceById(obj, { _id }) {
      return Attendances.findOne(_id);
    },

    pagedPortalAttendanceByKarkun(obj, { karkunId, queryString }) {
      return getPagedAttendanceByKarkun(karkunId, queryString);
    },

    portalAttendanceByMonth(obj, { month, cityId, cityMehfilId }) {
      if (!cityId) return [];

      let people = [];
      if (!cityMehfilId) {
        people = People.find({
          'karkunData.cityId': { $eq: cityId },
        }).fetch();
      } else {
        people = People.find({
          'karkunData.cityId': { $eq: cityId },
          'karkunData.cityMehfilId': { $eq: cityMehfilId },
        }).fetch();
      }

      const karkunIds = people.map(({ _id }) => _id);
      return Attendances.find({
        month,
        karkunId: { $in: karkunIds },
      }).fetch();
    },
  },

  Mutation: {
    createPortalAttendances(obj, { portalId, month }, { user }) {
      return createMonthlyAttendance(portalId, month, user);
    },

    updatePortalAttendance(
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

    deletePortalAttendances(obj, { month, ids }, { user }) {
      const currentMonth = moment().startOf('month');
      const passedMonth = moment(`01-${month}`, Formats.DATE_FORMAT);

      if (
        passedMonth.isBefore(currentMonth) &&
        !hasOnePermission(user, [PermissionConstants.PORTALS_DELETE_DATA])
      ) {
        throw new Error(
          'You do not have permission to remove Attendances for past months in the System.'
        );
      }

      return Attendances.remove({
        _id: { $in: ids },
      });
    },

    deleteAllPortalAttendances(obj, { month, cityId, cityMehfilId }, { user }) {
      const currentMonth = moment().startOf('month');
      const passedMonth = moment(`01-${month}`, Formats.DATE_FORMAT);

      if (
        passedMonth.isBefore(currentMonth) &&
        !hasOnePermission(user, [PermissionConstants.PORTALS_DELETE_DATA])
      ) {
        throw new Error(
          'You do not have permission to remove Attendances for past months in the System.'
        );
      }

      let people = [];
      if (!cityMehfilId) {
        people = People.find({
          'karkunData.cityId': { $eq: cityId },
        }).fetch();
      } else {
        people = People.find({
          'karkunData.cityId': { $eq: cityId },
          'karkunData.cityMehfilId': { $eq: cityMehfilId },
        }).fetch();
      }

      const karkunIds = people.map(({ _id }) => _id);
      return Attendances.remove({
        month,
        karkunId: { $in: karkunIds },
      });
    },
  },
};
