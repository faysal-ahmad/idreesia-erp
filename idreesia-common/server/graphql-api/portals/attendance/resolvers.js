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

const userHasPortalLevelAccess = user =>
  hasOnePermission(user, [
    PermissionConstants.PORTALS_VIEW_KARKUNS,
    PermissionConstants.PORTALS_MANAGE_KARKUNS,
  ]);

const userCanAccessCityMehfilData = (cityMehfilId, user) => {
  if (!userHasPortalLevelAccess(user)) {
    const userPerson = People.findOne(user.personId);
    if (
      !userPerson?.karkunData?.cityMehfilId ||
      userPerson?.karkunData?.cityMehfilId !== cityMehfilId
    ) {
      return false;
    }
  }

  return true;
};

const userCanAccessKarkunData = (karkunId, user) => {
  const karkunPerson = People.findOne(karkunId);
  return userCanAccessCityMehfilData(
    karkunPerson?.karkunData?.cityMehfilId,
    user
  );
};

export default {
  Query: {
    pagedPortalAttendanceByKarkun: async (
      obj,
      { karkunId, queryString },
      { user }
    ) => {
      if (userCanAccessKarkunData(karkunId, user)) {
        return getPagedAttendanceByKarkun(karkunId, queryString);
      }

      return {
        attendance: [],
        totalResults: 0,
      };
    },

    portalAttendanceByMonth: async (
      obj,
      { month, cityId, cityMehfilId },
      { user }
    ) => {
      if (!cityId) return [];

      let people = [];
      if (!cityMehfilId && userHasPortalLevelAccess(user)) {
        // If the user has portal level access, return him the data
        // for the city.
        people = People.find({
          'karkunData.cityId': { $eq: cityId },
        }).fetch();
      }

      if (cityMehfilId && userCanAccessCityMehfilData(cityMehfilId, user)) {
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
    createPortalAttendances: async (obj, { portalId, month }, { user }) =>
      createMonthlyAttendance(portalId, month, user),

    updatePortalAttendance: async (
      obj,
      {
        _id,
        attendanceDetails,
        presentCount,
        lateCount,
        absentCount,
        msVisitCount,
        percentage,
      },
      { user }
    ) => {
      const date = new Date();
      Attendances.update(_id, {
        $set: {
          attendanceDetails,
          presentCount: toInteger(presentCount),
          lateCount: toInteger(lateCount),
          absentCount: toInteger(absentCount),
          msVisitCount: toInteger(msVisitCount),
          percentage: toInteger(percentage),
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Attendances.findOne(_id);
    },

    deletePortalAttendances: async (obj, { month, ids }, { user }) => {
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

    deleteAllPortalAttendances: async (
      obj,
      { month, cityId, cityMehfilId },
      { user }
    ) => {
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
