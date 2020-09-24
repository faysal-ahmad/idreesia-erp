import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { DataSource } from 'meteor/idreesia-common/constants';

import { isKarkunInPortal } from './helpers';

export default {
  Query: {
    pagedPortalUsers(obj, { portalId, filter }) {
      const updatedFilter = Object.assign({}, filter, {
        portalAccess: portalId,
      });

      return Users.searchUsers(updatedFilter);
    },

    portalUserById(obj, { portalId, _id }) {
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
      const karkunInPortal = isKarkunInPortal(karkunId, portalId);
      if (!karkunInPortal) {
        throw new Error(
          `This karkun does not belong to any city in the portal.`
        );
      }

      const createdUser = Users.createUser(
        { userName, password, karkunId },
        user,
        DataSource.PORTAL,
        portalId
      );

      return Users.setInstanceAccess(
        createdUser._id,
        [portalId],
        user,
        DataSource.PORTAL,
        portalId
      );
    },

    updatePortalUser(obj, { portalId, userId, password, locked }, { user }) {
      const _user = Users.findOneUser(userId);
      const karkunInPortal = isKarkunInPortal(_user.karkunId, portalId);
      if (!karkunInPortal) {
        throw new Error(
          `This karkun does not belong to any city in the portal.`
        );
      }

      return Users.updateUser(
        { userId, password, locked },
        user,
        DataSource.PORTAL,
        portalId
      );
    },

    setPortalUserPermissions(obj, { portalId, userId, permissions }, { user }) {
      const _user = Users.findOneUser(userId);
      if (_user.instances.indexOf(portalId) !== -1) {
        return Users.setPermissions(
          { userId, permissions },
          user,
          DataSource.PORTAL,
          portalId
        );
      }

      return Users.findOneUser(userId);
    },
  },
};
