import { Portals } from 'meteor/idreesia-common/server/collections/portals';
import {
  filterByInstanceAccess,
  hasOnePermission,
} from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    allPortals(obj, params, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_VIEW_PORTALS,
          PermissionConstants.ADMIN_MANAGE_PORTALS,
        ])
      ) {
        return [];
      }

      return Portals.find({}).fetch();
    },

    allAccessiblePortals(obj, params, { user }) {
      const portals = Portals.find({}).fetch();
      const filteredPortals = filterByInstanceAccess(user._id, portals);
      return filteredPortals;
    },

    companyById(obj, { id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_VIEW_PORTALS,
          PermissionConstants.ADMIN_MANAGE_PORTALS,
        ])
      ) {
        return null;
      }

      return Portals.findOne(id);
    },
  },

  Mutation: {
    createPortal(obj, { name, cities }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.ADMIN_MANAGE_PORTALS])
      ) {
        throw new Error(
          'You do not have permission to manage Portals in the System.'
        );
      }

      const date = new Date();
      const portalId = Portals.insert({
        name,
        cities,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Portals.findOne(portalId);
    },

    updatePortal(obj, { _id, name, cities }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.ADMIN_MANAGE_PORTALS])
      ) {
        throw new Error(
          'You do not have permission to manage Portals in the System.'
        );
      }

      const date = new Date();
      Portals.update(_id, {
        $set: {
          name,
          cities,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Portals.findOne(_id);
    },
  },
};
