import { OrgLocationTypes } from 'meteor/idreesia-common/constants/organization';
import { OrgLocations } from 'meteor/idreesia-common/server/collections/admin';
import { listLocationCommitteesForPicker } from 'meteor/idreesia-common/server/business-logic/admin/committee/committee-permissions';
import { listReferenceLocations } from 'meteor/idreesia-common/server/business-logic/admin/reference-locations';

export default {
  Query: {
    referenceCityMehfilLocations: async () =>
      OrgLocations.find(
        { type: { $in: [OrgLocationTypes.CITY, OrgLocationTypes.MEHFIL] } },
        { sort: { name: 1 } }
      ).fetchAsync(),

    referenceOrgLocations: async (
      _obj: unknown,
      { types }: { types?: string[] | null }
    ) => listReferenceLocations(types),

    referenceCommitteesByLocation: async (
      _obj: unknown,
      { locationId }: { locationId: string }
    ) => listLocationCommitteesForPicker(locationId),
  },
};
