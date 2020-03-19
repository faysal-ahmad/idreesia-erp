import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';
import { CityMehfils } from 'meteor/idreesia-common/server/collections/outstation';
import { Portals } from 'meteor/idreesia-common/server/collections/portals';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  CityMehfilType: {
    karkunCount: cityMehfilType =>
      Karkuns.find({
        cityMehfilId: { $eq: cityMehfilType._id },
      }).count(),
  },

  Query: {
    allCityMehfils() {
      return CityMehfils.find({}, { sort: { name: 1 } }).fetch();
    },

    cityMehfilsByCityId(obj, { cityId }) {
      return CityMehfils.find(
        {
          cityId,
        },
        { sort: { name: 1 } }
      ).fetch();
    },

    cityMehfilsByPortalId(obj, { portalId }) {
      const portal = Portals.findOne(portalId);
      return CityMehfils.find(
        {
          cityId: { $in: portal.cityIds },
        },
        { sort: { name: 1 } }
      ).fetch();
    },

    cityMehfilById(obj, { _id }) {
      return CityMehfils.findOne(_id);
    },
  },

  Mutation: {
    createCityMehfil(
      obj,
      {
        name,
        cityId,
        address,
        mehfilStartYear,
        timingDetails,
        lcdAvailability,
        tabAvailability,
        otherMehfilDetails,
      },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_SETUP_DATA,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage City Mehfils Setup Data in the System.'
        );
      }

      const date = new Date();
      const cityMehfilId = CityMehfils.insert({
        name,
        cityId,
        address,
        mehfilStartYear,
        timingDetails,
        lcdAvailability,
        tabAvailability,
        otherMehfilDetails,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return CityMehfils.findOne(cityMehfilId);
    },

    updateCityMehfil(
      obj,
      {
        _id,
        name,
        cityId,
        address,
        mehfilStartYear,
        timingDetails,
        lcdAvailability,
        tabAvailability,
        otherMehfilDetails,
      },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_SETUP_DATA,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage City Mehfils Setup Data in the System.'
        );
      }

      const date = new Date();
      CityMehfils.update(_id, {
        $set: {
          name,
          cityId,
          address,
          mehfilStartYear,
          timingDetails,
          lcdAvailability,
          tabAvailability,
          otherMehfilDetails,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return CityMehfils.findOne(_id);
    },

    removeCityMehfil(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_SETUP_DATA,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage City Mehfils Setup Data in the System.'
        );
      }

      const karkunCount = Karkuns.find({
        cityMehfilId: { $eq: _id },
      }).count();

      if (karkunCount > 0) {
        throw new Error(
          'You cannot delete this City Mehfil because there are Karkuns associated with it.'
        );
      }

      return CityMehfils.remove(_id);
    },
  },
};
