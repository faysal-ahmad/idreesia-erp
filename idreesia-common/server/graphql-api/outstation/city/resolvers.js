import {
  Cities,
  CityMehfils,
} from 'meteor/idreesia-common/server/collections/outstation';
import { Portals } from 'meteor/idreesia-common/server/collections/portals';
import { compact } from 'meteor/idreesia-common/utilities/lodash';
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

    pagedCities(obj, { filter }) {
      return Cities.searchCities(filter);
    },

    cityById(obj, { _id }) {
      return Cities.findOne(_id);
    },

    citiesByPortalId(obj, { portalId }) {
      const portal = Portals.findOne(portalId);
      return Cities.find(
        { _id: { $in: portal.cityIds } },
        { sort: { name: 1 } }
      ).fetch();
    },

    distinctRegions() {
      const distincFunction = Meteor.wrapAsync(
        Cities.rawCollection().distinct,
        Cities.rawCollection()
      );

      return compact(distincFunction('region'));
    },
  },

  Mutation: {
    createCity(obj, { name, country, region }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_SETUP_DATA,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage City Setup Data in the System.'
        );
      }

      const existingCity = Cities.findOne({ name, country });
      if (existingCity) {
        throw new Error('A City with this name already exists.');
      }

      const date = new Date();
      const cityId = Cities.insert({
        name,
        country,
        region,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Cities.findOne(cityId);
    },

    updateCity(obj, { _id, name, country, region }, { user }) {
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
          region,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Cities.findOne(_id);
    },

    removeCity(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_DELETE_DATA,
        ])
      ) {
        throw new Error(
          'You do not have permission to delete City in the System.'
        );
      }

      if (!Cities.canSafelyDeleteCity(_id)) {
        throw new Error(
          'This City cannot be deleted as there is currently data associated with it.'
        );
      }

      return Cities.remove(_id);
    },
  },
};
