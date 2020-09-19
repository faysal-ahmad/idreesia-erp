import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { Portals } from 'meteor/idreesia-common/server/collections/portals';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

import { isKarkunInPortal } from './helpers';

export default {
  Query: {
    pagedOutstationPortalUsers(obj, { filter }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_VIEW_PORTAL_USERS_AND_GROUPS,
          PermissionConstants.OUTSTATION_MANAGE_PORTAL_USERS_AND_GROUPS,
        ])
      ) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      const portals = Portals.find({}).fetch();
      const portalIds = portals.map(portal => portal._id);
      return Users.searchOutstationPortalUsers(filter, portalIds);
    },

    outstationPortalUserById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_VIEW_PORTAL_USERS_AND_GROUPS,
          PermissionConstants.OUTSTATION_MANAGE_PORTAL_USERS_AND_GROUPS,
        ])
      ) {
        return null;
      }

      const _user = Users.findOneUser(_id);
      return _user;
    },
  },

  Mutation: {
    createOutstationPortalUser(
      obj,
      { portalId, userName, password, karkunId },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_PORTAL_USERS_AND_GROUPS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Portal Users in the System.'
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

      const karkunInPortal = isKarkunInPortal(karkunId, portalId);
      if (!karkunInPortal) {
        throw new Error(
          `This karkun does not belong to any city in the portal.`
        );
      }

      let newUserId = null;
      newUserId = Accounts.createUser({
        username: userName,
        password,
      });

      Users.update(newUserId, {
        $set: {
          locaked: false,
          karkunId,
          instances: [portalId],
        },
      });

      return Users.findOneUser(newUserId);
    },

    updateOutstationPortalUser(
      obj,
      { portalId, userId, password, locked },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_PORTAL_USERS_AND_GROUPS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Users in the System.'
        );
      }

      const _user = Users.findOneUser(userId);
      const karkunInPortal = isKarkunInPortal(_user.karkunId, portalId);
      if (!karkunInPortal) {
        throw new Error(
          `This karkun does not belong to any city in the portal.`
        );
      }

      if (password) {
        Accounts.setPassword(userId, password);
      }

      Users.update(userId, {
        $set: {
          locked,
          instances: [portalId],
        },
      });

      return Users.findOneUser(userId);
    },

    setOutstationPortalUserPermissions(obj, { userId, permissions }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_PORTAL_USERS_AND_GROUPS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Users in this Mehfil Portal.'
        );
      }

      Users.update(userId, { $set: { permissions } });
      return Users.findOneUser(userId);
    },
  },
};
