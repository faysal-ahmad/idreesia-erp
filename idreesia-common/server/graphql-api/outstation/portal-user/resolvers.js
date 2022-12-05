import { Random } from 'meteor/random';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { Portals } from 'meteor/idreesia-common/server/collections/portals';
import { DataSource } from 'meteor/idreesia-common/constants';

import { isKarkunInPortal, isKarkunSubscribed } from './helpers';

export default {
  Query: {
    pagedOutstationPortalUsers: async (obj, { filter }) => {
      const portals = Portals.find({}).fetch();
      const portalIds = portals.map(portal => portal._id);
      return Users.searchOutstationPortalUsers(filter, portalIds);
    },

    outstationPortalUserById: async (obj, { _id }) => {
      const user = Users.findOneUser(_id);
      return user;
    },
  },

  Mutation: {
    createOutstationPortalUser: async (
      obj,
      { portalId, userName, karkunId },
      { user }
    ) => {
      const karkunInPortal = isKarkunInPortal(karkunId, portalId);
      if (!karkunInPortal) {
        throw new Error(
          `This karkun does not belong to any city in the portal.`
        );
      }

      const karkunSubscribed = isKarkunSubscribed(karkunId);
      if (!karkunSubscribed) {
        throw new Error(`The karkun needs to be subscribed to 8018.`);
      }

      const password = Random.id(8);
      const createdUser = Users.createUser(
        { userName, password, karkunId },
        user,
        DataSource.OUTSTATION
      );

      return Users.setInstanceAccess(
        {
          userId: createdUser._id,
          instances: [portalId],
        },
        user,
        DataSource.OUTSTATION
      );
    },

    updateOutstationPortalUser: async (
      obj,
      { portalId, userId, locked },
      { user }
    ) => {
      const _user = Users.findOneUser(userId);
      const karkunInPortal = isKarkunInPortal(_user.karkunId, portalId);
      if (!karkunInPortal) {
        throw new Error(
          `This karkun does not belong to any city in the portal.`
        );
      }

      if (!_user.instances || _user.instances.indexOf(portalId) === -1) {
        Users.setInstanceAccess(
          {
            userId,
            instances: [portalId],
          },
          user,
          DataSource.OUTSTATION
        );
      }

      return Users.updateUser({ userId, locked }, user, DataSource.OUTSTATION);
    },

    setOutstationPortalUserPermissions: async (obj, params, { user }) =>
      Users.setPermissions(params, user, DataSource.OUTSTATION),

    resetOutstationPortalUserPassword: async (obj, params, { user }) =>
      Users.resetPassword(params, user, DataSource.OUTSTATION),
  },
};
