import { Portals } from 'meteor/idreesia-common/server/collections/portals';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
import { filterByInstanceAccess } from 'meteor/idreesia-common/server/graphql-api/security';

export default {
  PortalType: {
    cities: async portalType =>
      Cities.find(
        {
          _id: { $in: portalType.cityIds },
        },
        { sort: { name: 1 } }
      ).fetch(),
  },

  Query: {
    allPortals: async () => Portals.find({}, { sort: { name: 1 } }).fetch(),

    allAccessiblePortals: async (obj, params, { user }) => {
      const portals = Portals.find({}, { sort: { name: 1 } }).fetch();
      const filteredPortals = filterByInstanceAccess(user, portals);
      return filteredPortals;
    },

    portalById: async (obj, { _id }) => Portals.findOne(_id),
  },

  Mutation: {
    createPortal: async (obj, { name, cityIds }, { user }) => {
      const existingPortal = Portals.findOne({ name });
      if (existingPortal) {
        throw new Error('Another portal with the same name already exists.');
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

    updatePortal: async (obj, { _id, name, cityIds }, { user }) => {
      const existingPortal = Portals.findOne({ name });
      if (existingPortal && existingPortal._id !== _id) {
        throw new Error('Another portal with the same name already exists.');
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
