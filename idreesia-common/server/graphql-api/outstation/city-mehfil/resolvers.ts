import { People } from 'meteor/idreesia-common/server/collections/common';
import { CityMehfils } from 'meteor/idreesia-common/server/collections/outstation';

interface CityMehfilType {
  _id: string;
}

interface CityMehfilArgs {
  _id: string;
  name?: string;
  cityId?: string;
  address?: string;
  mehfilStartYear?: string;
  timingDetails?: string;
  lcdAvailability?: string;
  tabAvailability?: string;
  otherMehfilDetails?: string;
}

interface ResolverContext {
  user: {
    _id: string;
  };
}

export default {
  CityMehfilType: {
    karkunCount: async (cityMehfilType: CityMehfilType) =>
      People.find({
        isKarkun: true,
        'karkunData.cityMehfilId': { $eq: cityMehfilType._id },
      }).countAsync(),
  },

  Query: {
    allCityMehfils: async () =>
      CityMehfils.find({}, { sort: { name: 1 } }).fetchAsync(),

    cityMehfilsByCityId: async (
      _obj: unknown,
      { cityId }: Pick<CityMehfilArgs, 'cityId'>
    ) =>
      CityMehfils.find(
        {
          cityId,
        },
        { sort: { name: 1 } }
      ).fetchAsync(),

    cityMehfilById: async (
      _obj: unknown,
      { _id }: Pick<CityMehfilArgs, '_id'>
    ) => CityMehfils.findOneAsync(_id),
  },

  Mutation: {
    createCityMehfil: async (
      _obj: unknown,
      {
        name,
        cityId,
        address,
        mehfilStartYear,
        timingDetails,
        lcdAvailability,
        tabAvailability,
        otherMehfilDetails,
      }: CityMehfilArgs,
      { user }: ResolverContext
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
      _obj: unknown,
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
      }: CityMehfilArgs,
      { user }: ResolverContext
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

    removeCityMehfil: async (
      _obj: unknown,
      { _id }: Pick<CityMehfilArgs, '_id'>
    ) => {
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
