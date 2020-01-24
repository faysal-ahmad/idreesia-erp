import { UserGroups } from 'meteor/idreesia-common/server/collections/admin';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

import { getUserGroups } from './queries';

export default {
  Query: {
    pagedUserGroups(obj, { queryString }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_VIEW_USERS_AND_GROUPS,
          PermissionConstants.ADMIN_MANAGE_USERS_AND_GROUPS,
        ])
      ) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      return getUserGroups(queryString);
    },

    userGroupById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_VIEW_USERS_AND_GROUPS,
          PermissionConstants.ADMIN_MANAGE_USERS_AND_GROUPS,
        ])
      ) {
        return null;
      }

      return UserGroups.findOne(_id);
    },
  },

  Mutation: {
    createUserGroup(obj, { name, description }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_MANAGE_USERS_AND_GROUPS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage User Groups in the System.'
        );
      }

      const existingGroup = UserGroups.findOne({ name });
      if (existingGroup) {
        throw new Error(`User Group name '${name}' is already in use.`);
      }

      const date = new Date();
      const userGroupId = UserGroups.insert({
        name,
        description,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return UserGroups.findOne(userGroupId);
    },

    updateUserGroup(obj, { _id, name, description }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_MANAGE_USERS_AND_GROUPS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage User Groups in the System.'
        );
      }

      const date = new Date();
      UserGroups.update(_id, {
        $set: {
          name,
          description,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return UserGroups.findOne(_id);
    },

    deleteUserGroup(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_MANAGE_USERS_AND_GROUPS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage User Groups in the System.'
        );
      }

      return UserGroups.remove(_id);
    },

    setUserGroupPermissions(obj, { _id, permissions }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_MANAGE_USERS_AND_GROUPS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage User Groups in the System.'
        );
      }

      UserGroups.update(_id, { $set: { permissions } });
      return UserGroups.findOne(_id);
    },

    setUserGroupInstanceAccess(obj, { _id, instances }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_MANAGE_USERS_AND_GROUPS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage User Groups in the System.'
        );
      }

      UserGroups.update(_id, { $set: { instances } });
      return UserGroups.findOne(_id);
    },
  },
};
