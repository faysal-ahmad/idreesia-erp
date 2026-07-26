// @ts-nocheck
import { People } from 'meteor/idreesia-common/server/collections/common';
import { CityMehfils } from 'meteor/idreesia-common/server/collections/outstation';

export default {
  CityMehfilType: {
    karkunCount: async cityMehfilType =>
      People.find({
        isKarkun: true,
        'karkunData.cityMehfilId': { $eq: cityMehfilType._id },
      }).countAsync(),
  },

  Query: {
    allCityMehfils: async () =>
      CityMehfils.find({}, { sort: { name: 1 } }).fetchAsync(),

    cityMehfilsByCityId: async (obj, { cityId }) =>
      CityMehfils.find(
        {
          cityId,
        },
        { sort: { name: 1 } }
      ).fetchAsync(),

    cityMehfilById: async (obj, { _id }) => CityMehfils.findOneAsync(_id),
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
      const cityMehfilId = await CityMehfils.insertAsync({
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

      return CityMehfils.findOneAsync(cityMehfilId);
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
      await CityMehfils.updateAsync(_id, {
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

      return CityMehfils.findOneAsync(_id);
    },

    removeCityMehfil: async (obj, { _id }, { user }) => {
      const karkunCount = await People.find({
        isKarkun: true,
        'karkunData.cityMehfilId': { $eq: _id },
      }).countAsync();

      if (karkunCount > 0) {
        throw new Error(
          'You cannot delete this City Mehfil because there are Karkuns associated with it.'
        );
      }

      return CityMehfils.removeAsync(_id);
    },
  },
};
