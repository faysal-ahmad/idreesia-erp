import {
  Cities,
  CityMehfils,
} from 'meteor/idreesia-common/server/collections/outstation';
import { Portals } from 'meteor/idreesia-common/server/collections/portals';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  CityType: {
    mehfils: cityType =>
      CityMehfils.find({
        cityId: { $eq: cityType._id },
      }).fetch(),
  },

  Query: {
    allCities() {
      return Cities.find({}, { sort: { name: 1 } }).fetch();
    },
    cityById(obj, { _id }) {
      return Cities.findOne(_id);
    },
    citiesByPortalId(obj, { portalId }) {
      const portal = Portals.findOne(portalId);
      return Cities.find({ _id: { $in: portal.cityIds } }).fetch();
    },
  },

  Mutation: {
    createCity(obj, { name, country }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_SETUP_DATA,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage City Setup Data in the System.'
        );
      }

      const date = new Date();
      const cityId = Cities.insert({
        name,
        country,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Cities.findOne(cityId);
    },

    updateCity(obj, { _id, name, country }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_SETUP_DATA,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage City Setup Data in the System.'
        );
      }

      const date = new Date();
      Cities.update(_id, {
        $set: {
          name,
          country,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Cities.findOne(_id);
    },

    removeCity(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_SETUP_DATA,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage City Setup Data in the System.'
        );
      }

      return Cities.remove(_id);
    },
  },
};
