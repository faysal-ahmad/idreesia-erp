import { Portals } from 'meteor/idreesia-common/server/collections/portals';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
import {
  filterByInstanceAccess,
  hasOnePermission,
} from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  PortalType: {
    cities: portalType =>
      Cities.find({
        _id: { $in: portalType.cityIds },
      }).fetch(),
  },

  Query: {
    allPortals() {
      return Portals.find({}).fetch();
    },

    allAccessiblePortals(obj, params, { user }) {
      const portals = Portals.find({}).fetch();
      const filteredPortals = filterByInstanceAccess(user._id, portals);
      return filteredPortals;
    },

    portalById(obj, { _id }) {
      return Portals.findOne(_id);
    },
  },

  Mutation: {
    createPortal(obj, { name, cityIds }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_SETUP_DATA,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Portals in the System.'
        );
      }

      const date = new Date();
      const portalId = Portals.insert({
        name,
        cityIds,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Portals.findOne(portalId);
    },

    updatePortal(obj, { _id, name, cityIds }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_SETUP_DATA,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Portals in the System.'
        );
      }

      const date = new Date();
      Portals.update(_id, {
        $set: {
          name,
          cityIds,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Portals.findOne(_id);
    },
  },
};
