import { OrgLocations } from 'meteor/idreesia-common/server/collections/admin';
import { searchPeople } from 'meteor/idreesia-common/server/business-logic/common';

interface LooseRecord {
  [key: string]: any;
}

export default {
  Query: {
    adminKarkunLocations: async () =>
      OrgLocations.find({}, { sort: { name: 1 } }).fetchAsync(),

    pagedAdminKarkuns: async (
      _obj: unknown,
      { filter }: { filter?: LooseRecord }
    ) => {
      const result = (await searchPeople(filter ?? {}, {
        includeKarkuns: true,
        includeEmployees: true,
      })) as { data: unknown[]; totalResults: number };
      return { data: result.data, totalResults: result.totalResults };
    },
  },
};
