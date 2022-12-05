import filter from 'lodash/filter';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { DataSource, ModuleNames } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    pagedOperationsWazaifUsers: async () => {
      const usersFilter = {
        moduleAccess: ModuleNames.operations,
      };
      return Users.searchOperationsWazaifUsers(usersFilter);
    },
  },

  Mutation: {
    setOperationsWazaifUserPermissions: async (
      obj,
      { userId, permissions },
      { user }
    ) => {
      // Get the existing permissions for the user
      const userWithPermissions = Users.findOneUser(userId);
      const existingPermissions = userWithPermissions.permissions;
      // Filter out the existing permissions for the operations wazaif module
      const filteredPermissions = filter(
        existingPermissions,
        permission => !permission.startsWith('operations-wazaif')
      );
      // Concatenate the new operations wazaif permissions with this list
      const newPermissions = filteredPermissions.concat(permissions);
      return Users.setPermissions(
        { userId, permissions: newPermissions },
        user,
        DataSource.OPERATIONS
      );
    },
  },
};
