import {
  Attendances,
  Karkuns,
} from 'meteor/idreesia-common/server/collections/hr';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

import { getPagedAttendanceByKarkun } from './queries';

export default {
  Query: {
    pagedOutstationAttendanceByKarkun(
      obj,
      { karkunId, queryString },
      { user }
    ) {
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
      return getPagedAttendanceByKarkun(karkunId, queryString);
    },

    outstationAttendanceByMonth(
      obj,
      { month, cityId, cityMehfilId },
      { user }
    ) {
      if (!cityId) return [];

      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_VIEW_KARKUNS,
          PermissionConstants.OUTSTATION_MANAGE_KARKUNS,
          PermissionConstants.OUTSTATION_DELETE_DATA,
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
};
