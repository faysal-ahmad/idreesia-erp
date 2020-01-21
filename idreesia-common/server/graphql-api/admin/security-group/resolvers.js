import { SecurityGroups } from 'meteor/idreesia-common/server/collections/admin';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

import { getSecurityGroups } from './queries';

export default {
  Query: {
    pagedSecurityGroup(obj, { queryString }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_VIEW_SECURITY_GROUPS,
          PermissionConstants.ADMIN_MANAGE_SECURITY_GROUPS,
        ])
      ) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      return getSecurityGroups(queryString);
    },

    securityGroupById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_VIEW_SECURITY_GROUPS,
          PermissionConstants.ADMIN_MANAGE_SECURITY_GROUPS,
        ])
      ) {
        return null;
      }

      return SecurityGroups.findOne(_id);
    },
  },

  Mutation: {
    createSecurityGroup(obj, { name, description }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_MANAGE_SECURITY_GROUPS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Security Groups in the System.'
        );
      }

      const existingGroup = SecurityGroups.findOne({ name });
      if (existingGroup) {
        throw new Error(`Security Group name '${name}' is already in use.`);
      }

      const date = new Date();
      const securityGroupId = SecurityGroups.insert({
        name,
        description,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return SecurityGroups.findOne(securityGroupId);
    },

    updateSecurityGroup(obj, { _id, name, description }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_MANAGE_SECURITY_GROUPS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Security Groups in the System.'
        );
      }

      const date = new Date();
      SecurityGroups.update(_id, {
        $set: {
          name,
          description,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return SecurityGroups.findOne(_id);
    },

    deleteSecurityGroup(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_MANAGE_SECURITY_GROUPS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Security Groups in the System.'
        );
      }

      return SecurityGroups.remove(_id);
    },

    setPermissions(obj, { _id, permissions }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_MANAGE_SECURITY_GROUPS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Security Groups in the System.'
        );
      }

      SecurityGroups.update(_id, { $set: { permissions } });
      return SecurityGroups.findOne(_id);
    },

    setInstanceAccess(obj, { _id, instances }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_MANAGE_SECURITY_GROUPS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Security Groups in the System.'
        );
      }

      SecurityGroups.update(_id, { $set: { instances } });
      return SecurityGroups.findOne(_id);
    },
  },
};
