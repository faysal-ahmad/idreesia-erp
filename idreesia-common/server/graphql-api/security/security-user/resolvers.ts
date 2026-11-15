import filter from 'lodash/filter';
import { DataSource, ModuleNames } from 'meteor/idreesia-common/constants';
import {
  findOneUser,
  searchUsers,
  setUserPermissions,
} from 'meteor/idreesia-common/server/business-logic/admin';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  Query: {
    pagedSecurityUsers: async () => {
      const usersFilter = {
        moduleAccess: ModuleNames.security,
      };
      return searchUsers(usersFilter);
    },
  },

  Mutation: {
    setSecurityUserPermissions: async (
      obj,
      { userId, permissions },
      { user }
    ) => {
      // Get the existing permissions for the user
      const userWithPermissions = await findOneUser(userId);
      const existingPermissions = userWithPermissions.permissions ?? [];
      // Filter out the existing permissions for the security module
      const filteredPermissions = filter(
        existingPermissions,
        permission => !permission.startsWith('security')
      );
      // Concatenate the new security permissions with this list
      const newPermissions = filteredPermissions.concat(permissions);
      return setUserPermissions(
        { userId, permissions: newPermissions },
        user,
        DataSource.SECURITY
      );
    },
  },
};

export default resolvers;
