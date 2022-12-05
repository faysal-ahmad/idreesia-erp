import { People } from 'meteor/idreesia-common/server/collections/common';
import { Attendances } from 'meteor/idreesia-common/server/collections/hr';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

import { getPagedAttendanceByKarkun } from './queries';

export default {
  Query: {
    pagedOutstationAttendanceByKarkun: async (
      obj,
      { karkunId, queryString },
      { user }
    ) => {
      if (
        !hasOnePermission(user, [
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
      return getPagedAttendanceByKarkun(karkunId, queryString);
    },

    outstationAttendanceByMonth: async (
      obj,
      { month, cityId, cityMehfilId },
      { user }
    ) => {
      if (!cityId) return [];

      if (
        !hasOnePermission(user, [
          PermissionConstants.OUTSTATION_VIEW_KARKUNS,
          PermissionConstants.OUTSTATION_MANAGE_KARKUNS,
          PermissionConstants.OUTSTATION_DELETE_DATA,
        ])
      ) {
        return [];
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
      return Attendances.find({
        month,
        karkunId: { $in: karkunIds },
      }).fetch();
    },
  },
};
