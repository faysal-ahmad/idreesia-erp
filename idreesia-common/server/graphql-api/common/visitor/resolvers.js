import { compact } from 'meteor/idreesia-common/utilities/lodash';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';
import { Visitors } from 'meteor/idreesia-common/server/collections/security';
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
