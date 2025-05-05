import { People } from 'meteor/idreesia-common/server/collections/common';
import { CityMehfils } from 'meteor/idreesia-common/server/collections/outstation';
import { Portals } from 'meteor/idreesia-common/server/collections/portals';

export default {
  CityMehfilType: {
    karkunCount: async cityMehfilType =>
      People.find({
        isKarkun: true,
        'karkunData.cityMehfilId': { $eq: cityMehfilType._id },
      }).count(),
  },

  Query: {
    allCityMehfils: async () =>
      CityMehfils.find({}, { sort: { name: 1 } }).fetch(),

    cityMehfilsByCityId: async (obj, { cityId }) =>
      CityMehfils.find(
        {
          cityId,
        },
        { sort: { name: 1 } }
      ).fetch(),

    cityMehfilsByPortalId: async (obj, { portalId }) => {
      const portal = Portals.findOne(portalId);
      return CityMehfils.find(
        {
          cityId: { $in: portal.cityIds },
        },
        { sort: { name: 1 } }
      ).fetch();
    },

    cityMehfilById: async (obj, { _id }) => CityMehfils.findOne(_id),
  },

  Mutation: {
    createCityMehfil: async (
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
    ) => {
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

    updateCityMehfil: async (
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
    ) => {
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

    removeCityMehfil: async (obj, { _id }, { user }) => {
      const karkunCount = People.find({
        isKarkun: true,
        'karkunData.cityMehfilId': { $eq: _id },
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
