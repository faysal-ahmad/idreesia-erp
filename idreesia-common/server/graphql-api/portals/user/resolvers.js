import { Users } from 'meteor/idreesia-common/server/collections/admin';
import {
  hasInstanceAccess,
  hasOnePermission,
} from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    pagedPortalUsers(obj, { portalId, filter }, { user }) {
      if (
        hasInstanceAccess(user._id, portalId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.PORTALS_VIEW_USERS_AND_GROUPS,
          PermissionConstants.PORTALS_MANAGE_USERS_AND_GROUPS,
        ])
      ) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      const updatedFilter = Object.assign({}, filter, {
        portalAccess: portalId,
      });

      return Users.searchUsers(updatedFilter);
    },

    portalUserById(obj, { portalId, _id }, { user }) {
      if (
        hasInstanceAccess(user._id, portalId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.PORTALS_VIEW_USERS_AND_GROUPS,
          PermissionConstants.PORTALS_MANAGE_USERS_AND_GROUPS,
        ])
      ) {
        return null;
      }

      const _user = Users.findOneUser(_id);
      if (_user.instances.indexOf(portalId) === -1) return null;
      return _user;
    },
  },

  Mutation: {
    createPortalUser(
      obj,
      { portalId, userName, password, karkunId },
      { user }
    ) {
      if (
        hasInstanceAccess(user._id, portalId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.PORTALS_MANAGE_USERS_AND_GROUPS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Users in this Mehfil Portal.'
        );
      }

      let existingUser = Accounts.findUserByUsername(userName);
      if (existingUser) {
        throw new Error(`User name '${userName}' is already in use.`);
      }

      existingUser = Users.findOne({ karkunId });
      if (existingUser) {
        throw new Error(`This karkun already has a user account.`);
      }

      let newUserId = null;
      newUserId = Accounts.createUser({
        username: userName,
        password,
      });

      Users.update(newUserId, {
        $set: {
          karkunId,
          instances: [portalId],
        },
      });

      return Users.findOneUser(newUserId);
    },

    updatePortalUser(obj, { portalId, userId, password, locked }, { user }) {
      if (
        hasInstanceAccess(user._id, portalId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.PORTALS_MANAGE_USERS_AND_GROUPS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Users in this Mehfil Portal.'
        );
      }

      const _user = Users.findOneUser(userId);
      if (_user.instances.indexOf(portalId) !== -1) {
        if (password) {
          Accounts.setPassword(userId, password);
        }

        if (locked) {
          Users.update(userId, {
            $set: {
              locked,
            },
          });
        }
      }

      return Users.findOneUser(userId);
    },

    setPortalUserPermissions(obj, { portalId, userId, permissions }, { user }) {
      if (
        hasInstanceAccess(user._id, portalId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.PORTALS_MANAGE_USERS_AND_GROUPS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Users in this Mehfil Portal.'
        );
      }

      const _user = Users.findOneUser(userId);
      if (_user.instances.indexOf(portalId) !== -1) {
        Users.update(userId, { $set: { permissions } });
      }

      return Users.findOneUser(userId);
    },
  },
};
