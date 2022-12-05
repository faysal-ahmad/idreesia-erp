import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { ModuleNames } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    pagedOutstationUsers: async (obj, { filter }) => {
      const updatedFilter = {
        ...filter,
        moduleAccess: ModuleNames.outstation,
      };
      return Users.searchUsers(updatedFilter);
    },
  },
};
