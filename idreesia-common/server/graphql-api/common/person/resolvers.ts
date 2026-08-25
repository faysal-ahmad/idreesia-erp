import type DataLoader from 'dataloader';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
import { PeopleTags } from 'meteor/idreesia-common/server/collections/admin';
import { compact } from 'meteor/idreesia-common/utilities/lodash';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

type Loader = DataLoader<string, unknown>;

interface Loaders {
  common: {
    attachments: Loader;
  };
  hr: {
    jobs: Loader;
    karkunDuties: DataLoader<string, unknown[]>;
  };
  outstation: {
    cities: Loader;
    cityMehfils: Loader;
  };
}

interface Person {
  _id: string;
  karkunData?: PersonKarkunDataType | null;
}

interface PersonSharedDataType {
  imageId?: string;
  tagIds?: string[];
}

interface PersonKarkunDataType {
  _id?: string;
  cityId?: string;
  cityMehfilId?: string;
  attachmentIds?: string[];
}

interface PersonEmployeeDataType {
  jobId?: string;
}

interface PagedPeopleArgs {
  filter?: Record<string, unknown>;
}

interface FixCitySpellingArgs {
  existingSpelling: string;
  newSpelling: string;
}

interface ResolverContext {
  loaders: Loaders;
  user: {
    _id: string;
    username?: string;
    locked?: boolean;
    permissions?: string[];
  };
}

interface PeopleRawCollection {
  distinct(fieldName: string): Promise<unknown[]>;
}

export default {
  PersonType: {
    karkunData: (person: Person) =>
      person.karkunData ? { ...person.karkunData, _id: person._id } : null,
  },
  PersonSharedDataType: {
    image: async (
      personSharedDataType: PersonSharedDataType,
      _args: unknown,
      { loaders }: ResolverContext
    ) => {
      const { imageId } = personSharedDataType;
      if (imageId) {
        return loaders.common.attachments.load(imageId);
      }

      return null;
    },
    tags: async (personSharedDataType: PersonSharedDataType) => {
      const { tagIds } = personSharedDataType;
      if (tagIds && tagIds.length > 0) {
        return PeopleTags.find({ _id: { $in: tagIds } }).fetchAsync();
      }

      return [];
    },
  },
  PersonKarkunDataType: {
    city: async (
      personKarkunDataType: PersonKarkunDataType,
      _args: unknown,
      { loaders }: ResolverContext
    ) => {
      if (!personKarkunDataType.cityId) return null;
      return loaders.outstation.cities.load(personKarkunDataType.cityId);
    },
    cityMehfil: async (
      personKarkunDataType: PersonKarkunDataType,
      _args: unknown,
      { loaders }: ResolverContext
    ) => {
      if (!personKarkunDataType.cityMehfilId) return null;
      return loaders.outstation.cityMehfils.load(
        personKarkunDataType.cityMehfilId
      );
    },
    duties: async (
      personKarkunDataType: PersonKarkunDataType,
      _args: unknown,
      { loaders }: ResolverContext
    ) => {
      if (!personKarkunDataType._id) return [];
      return loaders.hr.karkunDuties.load(personKarkunDataType._id);
    },
    attachments: async (
      personKarkunDataType: PersonKarkunDataType,
      _args: unknown,
      { loaders }: ResolverContext
    ) => {
      const { attachmentIds } = personKarkunDataType;
      if (attachmentIds && attachmentIds.length > 0) {
        return Promise.all(
          attachmentIds.map(attachmentId =>
            loaders.common.attachments.load(attachmentId)
          )
        );
      }

      return [];
    },
  },
  PersonEmployeeDataType: {
    job: async (
      personEmployeeDataType: PersonEmployeeDataType,
      _args: unknown,
      { loaders }: ResolverContext
    ) => {
      if (!personEmployeeDataType.jobId) return null;
      return loaders.hr.jobs.load(personEmployeeDataType.jobId);
    },
  },

  Query: {
    pagedPeople: async (_obj: unknown, { filter }: PagedPeopleArgs) =>
      People.searchPeople(filter, {
        includeVisitors: true,
        includeKarkuns: true,
        includeEmployees: true,
      }),

    distinctCities: async () => {
      const cities = await (
        People.rawCollection() as unknown as PeopleRawCollection
      ).distinct('visitorData.city');
      return compact(cities);
    },

    distinctCountries: async () => {
      const countries = await (
        People.rawCollection() as unknown as PeopleRawCollection
      ).distinct(
        'visitorData.country'
      );
      return compact(countries);
    },
  },

  Mutation: {
    fixCitySpelling: async (
      _obj: unknown,
      { existingSpelling, newSpelling }: FixCitySpellingArgs,
      { user }: ResolverContext
    ) => {
      if (
        !hasOnePermission(user, [PermissionConstants.SECURITY_MANAGE_VISITORS])
      ) {
        throw new Error(
          'You do not have permission to manage Visitors in the System.'
        );
      }

      // If a city matching the existing spellings is present in the outstation
      // cities list, then do not allow updating the spellings.
      const outstationCity = await Cities.findOneAsync({
        name: existingSpelling,
      });

      if (outstationCity) {
        throw new Error(
          'Spellings for this city cannot be changed as it exists in the Outstation city list.'
        );
      }

      const date = new Date();
      const count = await People.updateAsync(
        {
          'visitorData.city': { $eq: existingSpelling },
        },
        {
          $set: {
            'visitorData.city': newSpelling,
            updatedAt: date,
            updatedBy: user._id,
          },
        },
        { multi: true }
      );

      return count;
    },
  },
};
