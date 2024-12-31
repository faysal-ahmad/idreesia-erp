import { compact } from 'meteor/idreesia-common/utilities/lodash';
import {
  Attachments,
  People,
} from 'meteor/idreesia-common/server/collections/common';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  VisitorType: {
    image: async visitorType => {
      const { imageId } = visitorType;
      if (imageId) {
        return Attachments.findOne({ _id: { $eq: imageId } });
      }

      return null;
    },
  },

  Query: {
    distinctCities: async () => {
      const distincFunction = Meteor.wrapAsync(
        People.rawCollection().distinct,
        People.rawCollection()
      );

      return compact(distincFunction('visitorData.city'));
    },

    distinctCountries: async () => {
      const distincFunction = Meteor.wrapAsync(
        People.rawCollection().distinct,
        People.rawCollection()
      );

      return compact(distincFunction('visitorData.country'));
    },

    pagedVisitors: async (obj, { filter }) =>
      People.searchPeople(filter, {
        includeVisitors: true,
      }).then(result => ({
        data: result.data.map(person => People.personToVisitor(person)),
        totalResults: result.totalResults,
      })),
  },

  Mutation: {
    fixCitySpelling: async (
      obj,
      { existingSpelling, newSpelling },
      { user }
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
      const outstationCity = Cities.findOne({
        name: existingSpelling,
      });

      if (outstationCity) {
        throw new Error(
          'Spellings for this city cannot be changed as it exists in the Outstation city list.'
        );
      }

      const date = new Date();
      const count = People.update(
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
