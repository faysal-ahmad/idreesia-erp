import moment from 'moment';

import { toInteger } from 'meteor/idreesia-common/utilities/lodash';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { Attendances } from 'meteor/idreesia-common/server/collections/hr';
import { Formats } from 'meteor/idreesia-common/constants';
import { ensureMonthlyAttendance } from './helpers';
import { getPagedAttendanceByKarkun } from './queries';

export default {
  Query: {
    pagedPortalAttendanceByKarkun: async (
      obj,
      { karkunId, queryString },
      { user }
    ) => getPagedAttendanceByKarkun(karkunId, queryString),

    portalAttendanceByMonth: async (
      obj,
      { month, cityId, cityMehfilId },
      { user }
    ) => {
      if (!cityId) return [];

      let people = [];
      if (!cityMehfilId) {
        // If the user has portal level access, return him the data
        // for the city.
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

      if (passedMonth.isBefore(currentMonth)) {
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

      if (passedMonth.isBefore(currentMonth)) {
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
