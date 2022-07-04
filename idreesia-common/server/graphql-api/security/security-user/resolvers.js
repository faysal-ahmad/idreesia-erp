import filter from 'lodash/filter';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { DataSource, ModuleNames } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    pagedSecurityUsers() {
      const usersFilter = {
        moduleAccess: ModuleNames.security,
      };
      return Users.searchUsers(usersFilter);
    },
  },

  Mutation: {
    setSecurityUserPermissions(obj, { userId, permissions }, { user }) {
      // Get the existing permissions for the user
      const userWithPermissions = Users.findOneUser(userId);
      const existingPermissions = userWithPermissions.permissions;
      // Filter out the existing permissions for the security module
      const filteredPermissions = filter(
        existingPermissions,
        permission => !permission.startsWith('security')
      );
      // Concatenate the new security permissions with this list
      const newPermissions = filteredPermissions.concat(permissions);
      return Users.setPermissions(
        { userId, permissions: newPermissions },
        user,
        DataSource.SECURITY
      );
    },
  },
};
