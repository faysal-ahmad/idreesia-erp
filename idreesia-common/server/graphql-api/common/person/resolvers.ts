import {
  Jobs,
  KarkunDuties,
} from 'meteor/idreesia-common/server/collections/hr';
import {
  Attachments,
  People,
} from 'meteor/idreesia-common/server/collections/common';
import { PeopleTags } from 'meteor/idreesia-common/server/collections/admin';
import {
  Cities,
  CityMehfils,
} from 'meteor/idreesia-common/server/collections/outstation';
import { compact } from 'meteor/idreesia-common/utilities/lodash';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

interface PersonSharedDataType {
  imageId?: string;
  tagIds?: string[];
}

interface PersonKarkunDataType {
  _id: string;
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
  PersonSharedDataType: {
    image: async (personSharedDataType: PersonSharedDataType) => {
      const { imageId } = personSharedDataType;
      if (imageId) {
        return Attachments.findOneAsync({ _id: { $eq: imageId } });
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
    city: async (personKarkunDataType: PersonKarkunDataType) => {
      if (!personKarkunDataType.cityId) return null;
      return Cities.findOneAsync(personKarkunDataType.cityId);
    },
    cityMehfil: async (personKarkunDataType: PersonKarkunDataType) => {
      if (!personKarkunDataType.cityMehfilId) return null;
      return CityMehfils.findOneAsync(personKarkunDataType.cityMehfilId);
    },
    duties: async (personKarkunDataType: PersonKarkunDataType) =>
      KarkunDuties.find({
        karkunId: { $eq: personKarkunDataType._id },
      }).fetchAsync(),
    attachments: async (personKarkunDataType: PersonKarkunDataType) => {
      const { attachmentIds } = personKarkunDataType;
      if (attachmentIds && attachmentIds.length > 0) {
        return Attachments.find({ _id: { $in: attachmentIds } }).fetchAsync();
      }

      return [];
    },
  },
  PersonEmployeeDataType: {
    job: async (personEmployeeDataType: PersonEmployeeDataType) => {
      if (!personEmployeeDataType.jobId) return null;
      return Jobs.findOneAsync(personEmployeeDataType.jobId);
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
