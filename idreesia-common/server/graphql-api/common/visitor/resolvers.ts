import { compact } from 'meteor/idreesia-common/utilities/lodash';
import {
  Attachments,
  People,
} from 'meteor/idreesia-common/server/collections/common';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

interface VisitorType {
  imageId?: string;
}

interface PagedVisitorsArgs {
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

type PersonDocument = Parameters<typeof People.personToVisitor>[0];

export default {
  VisitorType: {
    image: async (visitorType: VisitorType) => {
      const { imageId } = visitorType;
      if (imageId) {
        return Attachments.findOneAsync({ _id: { $eq: imageId } });
      }

      return null;
    },
  },

  Query: {
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

    pagedVisitors: async (_obj: unknown, { filter }: PagedVisitorsArgs) =>
      People.searchPeople(filter, {
        includeVisitors: true,
      }).then(result => {
        const pagedResult = result as {
          data: PersonDocument[];
          totalResults: number;
        };
        return {
          data: pagedResult.data.map(person => People.personToVisitor(person)),
          totalResults: pagedResult.totalResults,
        };
      }),
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
