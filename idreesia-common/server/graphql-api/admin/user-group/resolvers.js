import { UserGroups } from 'meteor/idreesia-common/server/collections/admin';
import { DataSource } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    pagedUserGroups: async (obj, { queryString }) =>
      UserGroups.searchGroups(queryString),

    userGroupById: async (obj, { _id }) => UserGroups.findOne(_id),
  },

  Mutation: {
    createUserGroup: async (obj, params, { user }) =>
      UserGroups.createGroup(params, user),

    updateUserGroup: async (obj, params, { user }) =>
      UserGroups.updateGroup(params, user),

    deleteUserGroup: async (obj, { _id }) => UserGroups.removeGroup(_id),

    setUserGroupPermissions: async (obj, params, { user }) =>
      UserGroups.setPermissions(params, user, DataSource.ADMIN),

    setUserGroupInstanceAccess: async (obj, params, { user }) =>
      UserGroups.setInstanceAccess(params, user, DataSource.ADMIN),
  },
};
