import { OrgLocations } from 'meteor/idreesia-common/server/collections/admin';
import {
  searchAdminUserKarkuns,
} from 'meteor/idreesia-common/server/business-logic/admin';
import type { PickerPeopleParams } from 'meteor/idreesia-common/server/business-logic/common';

export default {
  Query: {
    adminKarkunLocations: async () =>
      OrgLocations.find({}, { sort: { name: 1 } }).fetchAsync(),

    pagedAdminUserKarkuns: async (_obj: unknown, args: PickerPeopleParams) =>
      searchAdminUserKarkuns(args),
  },
};
