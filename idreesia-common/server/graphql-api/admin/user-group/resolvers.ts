import { UserGroups } from 'meteor/idreesia-common/server/collections/admin';
import { DataSource } from 'meteor/idreesia-common/constants';

interface UserRef {
  _id: string;
}

interface ResolverContext {
  user: UserRef;
}

interface UserGroupArgs {
  _id: string;
  queryString: string;
  name: string;
  moduleName: string;
  description?: string;
  permissions: string[];
  instances: string[];
}

export default {
  Query: {
    pagedUserGroups: async (
      _obj: unknown,
      { queryString }: Pick<UserGroupArgs, 'queryString'>
    ) =>
      UserGroups.searchGroups(queryString),

    userGroupById: async (_obj: unknown, { _id }: Pick<UserGroupArgs, '_id'>) =>
      UserGroups.findOneAsync(_id),
  },

  Mutation: {
    createUserGroup: async (
      _obj: unknown,
      params: UserGroupArgs,
      { user }: ResolverContext
    ) =>
      UserGroups.createGroup(params, user),

    updateUserGroup: async (
      _obj: unknown,
      params: UserGroupArgs,
      { user }: ResolverContext
    ) =>
      UserGroups.updateGroup(params, user),

    deleteUserGroup: async (
      _obj: unknown,
      { _id }: Pick<UserGroupArgs, '_id'>
    ) => UserGroups.removeGroup({ _id }),

    setUserGroupPermissions: async (
      _obj: unknown,
      params: UserGroupArgs,
      { user }: ResolverContext
    ) =>
      UserGroups.setPermissions(params, user, DataSource.ADMIN),

    setUserGroupInstanceAccess: async (
      _obj: unknown,
      params: UserGroupArgs,
      { user }: ResolverContext
    ) =>
      UserGroups.setInstanceAccess(params, user, DataSource.ADMIN),
  },
};
