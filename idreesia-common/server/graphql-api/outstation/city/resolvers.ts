import {
  Cities,
  CityMehfils,
} from 'meteor/idreesia-common/server/collections/outstation';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { compact } from 'meteor/idreesia-common/utilities/lodash';

interface CityType {
  _id: string;
  name?: string;
  country?: string;
  peripheryOf?: string;
  region?: string;
}

interface CityArgs extends CityType {
  filter?: Record<string, unknown>;
}

interface ResolverContext {
  user: {
    _id: string;
  };
}

interface CitiesRawCollection {
  distinct(fieldName: string): Promise<unknown[]>;
}

export default {
  CityType: {
    karkunCount: async (cityType: CityType) =>
      People.find({
        isKarkun: true,
        'karkunData.cityId': cityType._id,
      }).countAsync(),

    memberCount: async (cityType: CityType) =>
      People.find({
        isKarkun: false,
        'visitorData.city': cityType.name,
      }).countAsync(),

    mehfils: async (cityType: CityType) =>
      CityMehfils.find(
        {
          cityId: { $eq: cityType._id },
        },
        { sort: { name: 1 } }
      ).fetchAsync(),

    peripheryOfCity: async (cityType: CityType) =>
      cityType.peripheryOf
        ? Cities.findOneAsync({
            _id: { $eq: cityType.peripheryOf },
          })
        : null,
  },

  Query: {
    allCities: async () => Cities.find({}, { sort: { name: 1 } }).fetchAsync(),

    pagedCities: async (_obj: unknown, { filter }: Pick<CityArgs, 'filter'>) =>
      Cities.searchCities(filter ?? {}),

    cityById: async (_obj: unknown, { _id }: Pick<CityArgs, '_id'>) =>
      Cities.findOneAsync(_id),

    distinctRegions: async () => {
      const regions = await (
        Cities.rawCollection() as unknown as CitiesRawCollection
      ).distinct('region');

      return compact(regions);
    },
  },

  Mutation: {
    createCity: async (
      _obj: unknown,
      { name, peripheryOf, country, region }: CityArgs,
      { user }: ResolverContext
    ) => {
      const existingCity = await Cities.findOneAsync({ name, country });
      if (existingCity) {
        throw new Error('A City with this name already exists.');
      }

      if (peripheryOf) {
        // This city cannot be a periphery of a city which is already a periphery
        // of another city.
        const _city = await Cities.findOneAsync({ _id: peripheryOf });
        if (_city?.peripheryOf) {
          throw new Error(
            `This city cannot be made a periphery of ${_city.name} as it is already a periphery of another city.`
          );
        }
      }

      const date = new Date();
      const cityId = await Cities.insertAsync({
        name,
        peripheryOf,
        country,
        region,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Cities.findOneAsync(cityId);
    },

    updateCity: async (
      _obj: unknown,
      { _id, name, peripheryOf, country, region }: CityArgs,
      { user }: ResolverContext
    ) => {
      if (peripheryOf) {
        // This city cannot be a periphery of a city which is already a periphery
        // of another city.
        const _city = await Cities.findOneAsync({ _id: peripheryOf });
        if (_city?.peripheryOf) {
          throw new Error(
            `This city cannot be made a periphery of ${_city.name} as it is already a periphery of another city.`
          );
        }

        // Also, this cannot be set as a periphery city, if other cities are set as
        // periphery of this city.
        const peripheryCount = await Cities.find({
          peripheryOf: _id,
        }).countAsync();
        if (peripheryCount > 0) {
          throw new Error(
            "This city cannot be made a periphery of another city as it already has peripheries of it's own."
          );
        }
      }

      const date = new Date();
      await Cities.updateAsync(_id, {
        $set: {
          name,
          peripheryOf,
          country,
          region,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Cities.findOneAsync(_id);
    },

    removeCity: async (_obj: unknown, { _id }: Pick<CityArgs, '_id'>) => {
      if (!(await Cities.canSafelyDeleteCity(_id))) {
        throw new Error(
          'This City cannot be deleted as there is currently data associated with it.'
        );
      }

      return Cities.removeAsync(_id);
    },
  },
};
