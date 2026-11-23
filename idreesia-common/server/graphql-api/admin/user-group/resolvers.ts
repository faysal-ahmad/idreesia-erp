import { UserGroups } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { DataSource } from 'meteor/idreesia-common/constants';
import {
  createUserGroup,
  listUserGroupMembers,
  removeUserGroup,
  searchUserGroups,
  setUserGroupInstanceAccess,
  setUserGroupPermissions,
  updateUserGroup,
} from 'meteor/idreesia-common/server/business-logic/admin';

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
  moduleName?: string;
  description?: string;
  permissions: string[];
  instances: string[];
}

export default {
  UserGroupMemberType: {
    karkun: async ({ personId }: { personId?: string }) =>
      personId ? People.findOneAsync(personId) : null,
  },

  UserGroupType: {
    users: async ({ _id }: { _id: string }) => listUserGroupMembers(_id),
  },

  Query: {
    pagedUserGroups: async (
      _obj: unknown,
      { queryString }: Pick<UserGroupArgs, 'queryString'>
    ) =>
      searchUserGroups(queryString),

    userGroupById: async (_obj: unknown, { _id }: Pick<UserGroupArgs, '_id'>) =>
      UserGroups.findOneAsync(_id),
  },

  Mutation: {
    createUserGroup: async (
      _obj: unknown,
      params: UserGroupArgs,
      { user }: ResolverContext
    ) =>
      createUserGroup(params, user),

    updateUserGroup: async (
      _obj: unknown,
      params: UserGroupArgs,
      { user }: ResolverContext
    ) =>
      updateUserGroup(params, user),

    deleteUserGroup: async (
      _obj: unknown,
      { _id }: Pick<UserGroupArgs, '_id'>
    ) => removeUserGroup({ _id }),

    setUserGroupPermissions: async (
      _obj: unknown,
      params: UserGroupArgs,
      { user }: ResolverContext
    ) =>
      setUserGroupPermissions(params, user, DataSource.ADMIN),

    setUserGroupInstanceAccess: async (
      _obj: unknown,
      params: UserGroupArgs,
      { user }: ResolverContext
    ) =>
      setUserGroupInstanceAccess(params, user, DataSource.ADMIN),
  },
};
