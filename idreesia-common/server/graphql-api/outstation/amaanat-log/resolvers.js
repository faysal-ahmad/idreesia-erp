import {
  AmaanatLogs,
  Cities,
  CityMehfils,
} from 'meteor/idreesia-common/server/collections/outstation';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

import getAmaanatLogs from './queries';

export default {
  AmaanatLogType: {
    city: ammanatLogType => {
      if (!ammanatLogType.cityId) return null;
      return Cities.findOne(ammanatLogType.cityId);
    },
    cityMehfil: ammanatLogType => {
      if (!ammanatLogType.cityMehfilId) return null;
      return CityMehfils.findOne(ammanatLogType.cityMehfilId);
    },
  },

  Query: {
    outstationAmaanatLogById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_VIEW_AMAANAT_LOGS,
          PermissionConstants.OUTSTATION_MANAGE_AMAANAT_LOGS,
        ])
      ) {
        return null;
      }

      return AmaanatLogs.findOne({ _id });
    },

    pagedOutstationAmaanatLogs(obj, { queryString }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_VIEW_AMAANAT_LOGS,
          PermissionConstants.OUTSTATION_MANAGE_AMAANAT_LOGS,
        ])
      ) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      return getAmaanatLogs(queryString);
    },
  },
};
