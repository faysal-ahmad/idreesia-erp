import { People } from 'meteor/idreesia-common/server/collections/common';
import { Attendances } from 'meteor/idreesia-common/server/collections/hr';

import { ensureMonthlyAttendance } from './helpers';
import { getPagedAttendanceByKarkun } from './queries';

export default {
  Query: {
    pagedOutstationAttendanceByKarkun: async (
      obj,
      { karkunId, queryString }
    ) => {
      return getPagedAttendanceByKarkun(karkunId, queryString);
    },

    outstationAttendanceByMonth: async (
      obj,
      { month, cityId, cityMehfilId },
      { user }
    ) => {
      if (!cityId) return [];

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
      await ensureMonthlyAttendance(karkunIds, month, user);
      return Attendances.find({
        month,
        karkunId: { $in: karkunIds },
      }).fetchAsync();
    },
  },
};
