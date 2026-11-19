import { OrgLocationTypes } from 'meteor/idreesia-common/constants/organization';
import { OrgLocations } from 'meteor/idreesia-common/server/collections/admin';

export default {
  Query: {
    referenceCityMehfilLocations: async () =>
      OrgLocations.find(
        { type: { $in: [OrgLocationTypes.CITY, OrgLocationTypes.MEHFIL] } },
        { sort: { name: 1 } }
      ).fetchAsync(),
  },
};
