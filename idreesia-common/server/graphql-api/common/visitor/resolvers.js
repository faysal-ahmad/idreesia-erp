import { compact } from 'meteor/idreesia-common/utilities/lodash';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';
import { Visitors } from 'meteor/idreesia-common/server/collections/security';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  VisitorType: {
    image: visitorType => {
      const { imageId } = visitorType;
      if (imageId) {
        return Attachments.findOne({ _id: { $eq: imageId } });
      }

      return null;
    },
  },

  Query: {
    pagedVisitors(obj, { filter }) {
      return Visitors.searchVisitors(filter);
    },

    distinctCities() {
      const distincFunction = Meteor.wrapAsync(
        Visitors.rawCollection().distinct,
        Visitors.rawCollection()
      );

      return compact(distincFunction('city'));
    },

    distinctCountries() {
      const distincFunction = Meteor.wrapAsync(
        Visitors.rawCollection().distinct,
        Visitors.rawCollection()
      );

      return compact(distincFunction('country'));
    },
  },

  Mutation: {
    fixCitySpelling(obj, { existingSpelling, newSpelling }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
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
      const count = Visitors.update(
        {
          city: { $eq: existingSpelling },
        },
        {
          $set: {
            city: newSpelling,
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
