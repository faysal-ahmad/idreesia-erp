import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { Portals } from 'meteor/idreesia-common/server/collections/portals';
import { DataSource } from 'meteor/idreesia-common/constants';

import { isKarkunInPortal } from './helpers';

export default {
  Query: {
    pagedOutstationPortalUsers(obj, { filter }) {
      const portals = Portals.find({}).fetch();
      const portalIds = portals.map(portal => portal._id);
      return Users.searchOutstationPortalUsers(filter, portalIds);
    },

    outstationPortalUserById(obj, { _id }) {
      const user = Users.findOneUser(_id);
      return user;
    },
  },

  Mutation: {
    createOutstationPortalUser(
      obj,
      { portalId, userName, password, karkunId },
      { user }
    ) {
      const karkunInPortal = isKarkunInPortal(karkunId, portalId);
      if (!karkunInPortal) {
        throw new Error(
          `This karkun does not belong to any city in the portal.`
        );
      }

      const createdUser = Users.createUser(
        { userName, password, karkunId },
        user,
        DataSource.OUTSTATION
      );

      return Users.setInstanceAccess(
        createdUser._id,
        [portalId],
        user,
        DataSource.OUTSTATION
      );
    },

    updateOutstationPortalUser(
      obj,
      { portalId, userId, password, locked },
      { user }
    ) {
      const _user = Users.findOneUser(userId);
      const karkunInPortal = isKarkunInPortal(_user.karkunId, portalId);
      if (!karkunInPortal) {
        throw new Error(
          `This karkun does not belong to any city in the portal.`
        );
      }

      if (!_user.instances || _user.instances.indexOf(portalId) === -1) {
        Users.setInstanceAccess(
          userId,
          [portalId],
          user,
          DataSource.OUTSTATION
        );
      }

      return Users.updateUser(
        { userId, password, locked },
        user,
        DataSource.OUTSTATION
      );
    },

    setOutstationPortalUserPermissions(obj, params, { user }) {
      return Users.setPermissions(params, user, DataSource.OUTSTATION);
    },
  },
};
