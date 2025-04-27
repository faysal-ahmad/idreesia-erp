import moment from 'moment';

import { toInteger } from 'meteor/idreesia-common/utilities/lodash';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { Attendances } from 'meteor/idreesia-common/server/collections/hr';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import {
  Formats,
  Permissions as PermissionConstants,
} from 'meteor/idreesia-common/constants';
import { ensureMonthlyAttendance } from './helpers';
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
        people = await People.find({
          'karkunData.cityId': { $eq: cityId },
        }).fetchAsync();
      }

      if (cityMehfilId && userCanAccessCityMehfilData(cityMehfilId, user)) {
        people = await People.find({
          'karkunData.cityId': { $eq: cityId },
          'karkunData.cityMehfilId': { $eq: cityMehfilId },
        }).fetchAsync();
      }

      const karkunIds = people.map(({ _id }) => _id);
      await ensureMonthlyAttendance(karkunIds, month, user);
      return Attendances.find({
        month,
        karkunId: { $in: karkunIds },
      }).fetchAsync();
    },
  },

  Mutation: {
    updatePortalAttendance: async (
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

      return Attendances.removeAsync({
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
        people = await People.find({
          'karkunData.cityId': { $eq: cityId },
        }).fetchAsync();
      } else {
        people = await People.find({
          'karkunData.cityId': { $eq: cityId },
          'karkunData.cityMehfilId': { $eq: cityMehfilId },
        }).fetchAsync();
      }

      const karkunIds = people.map(({ _id }) => _id);
      return Attendances.removeAsync({
        month,
        karkunId: { $in: karkunIds },
      });
    },
  },
};
