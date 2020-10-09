import { UserGroups } from 'meteor/idreesia-common/server/collections/admin';
import { DataSource } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    pagedUserGroups(obj, { queryString }) {
      return UserGroups.searchGroups(queryString);
    },

    userGroupById(obj, { _id }) {
      return UserGroups.findOne(_id);
    },
  },

  Mutation: {
    createUserGroup(obj, params, { user }) {
      return UserGroups.createGroup(params, user);
    },

    updateUserGroup(obj, params, { user }) {
      return UserGroups.updateGroup(params, user);
    },

    deleteUserGroup(obj, { _id }) {
      return UserGroups.removeGroup(_id);
    },

    setUserGroupPermissions(obj, params, { user }) {
      return UserGroups.setPermissions(params, user, DataSource.ADMIN);
    },

    setUserGroupInstanceAccess(obj, params, { user }) {
      return UserGroups.setInstanceAccess(params, user, DataSource.ADMIN);
    },
  },
};
