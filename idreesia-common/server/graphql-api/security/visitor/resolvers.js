import { Accounts } from 'meteor/accounts-base';

import { isNil, compact } from 'meteor/idreesia-common/utilities/lodash';
import { Visitors } from 'meteor/idreesia-common/server/collections/security';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

import { getVisitors } from './queries';
import { checkCnicNotInUse, checkContactNotInUse } from './utilities';
import { createAttachment } from '../../common/attachments/utilities';
import { processCsvData } from './helpers';

export default {
  Query: {
    pagedVisitors(obj, { queryString }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_VIEW_VISITORS,
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      return getVisitors(queryString);
    },

    visitorById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_VIEW_VISITORS,
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        return null;
      }

      return Visitors.findOne(_id);
    },

    visitorByCnic(obj, { cnic }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_VIEW_VISITORS,
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        return null;
      }

      if (cnic) {
        return Visitors.findOne({
          cnicNumber: { $eq: cnic },
        });
      }

      return null;
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
    createVisitor(
      obj,
      {
        name,
        parentName,
        isMinor,
        cnicNumber,
        ehadDate,
        referenceName,
        contactNumber1,
        contactNumber2,
        emailAddress,
        address,
        city,
        country,
        imageData,
      },
      { user }
    ) {
      if (
        user &&
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Visitors in the System.'
        );
      }

      if (cnicNumber) checkCnicNotInUse(cnicNumber);
      if (contactNumber1) checkContactNotInUse(contactNumber1);
      if (contactNumber2) checkContactNotInUse(contactNumber2);
      const guestUser = Accounts.findUserByUsername('erp-guest');

      let imageId = null;
      if (imageData) {
        imageId = createAttachment(
          {
            data: imageData,
          },
          { user: user || guestUser }
        );
      }

      const date = new Date();
      const visitorId = Visitors.insert({
        name,
        parentName,
        isMinor,
        cnicNumber,
        ehadDate,
        referenceName,
        contactNumber1,
        contactNumber2,
        emailAddress,
        address,
        city,
        country,
        imageId,
        verified: !isNil(user),
        createdAt: date,
        createdBy: user ? user._id : guestUser._id,
        updatedAt: date,
        updatedBy: user ? user._id : guestUser._id,
      });

      return Visitors.findOne(visitorId);
    },

    updateVisitor(
      obj,
      {
        _id,
        name,
        parentName,
        isMinor,
        cnicNumber,
        ehadDate,
        referenceName,
        contactNumber1,
        contactNumber2,
        emailAddress,
        address,
        city,
        country,
      },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Visitors in the System.'
        );
      }

      if (cnicNumber) checkCnicNotInUse(cnicNumber, _id);
      if (contactNumber1) checkContactNotInUse(contactNumber1, _id);
      if (contactNumber2) checkContactNotInUse(contactNumber2, _id);

      const date = new Date();
      Visitors.update(_id, {
        $set: {
          name,
          parentName,
          isMinor,
          cnicNumber,
          ehadDate,
          referenceName,
          contactNumber1,
          contactNumber2,
          emailAddress,
          address,
          city,
          country,
          verified: !isNil(user),
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Visitors.findOne(_id);
    },

    deleteVisitor(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Visitors in the System.'
        );
      }

      return Visitors.remove(_id);
    },

    importCsvData(obj, { csvData }, { user }) {
      if (
        user &&
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Visitors in the System.'
        );
      }

      return processCsvData(csvData, new Date(), user);
    },

    setVisitorImage(obj, { _id, imageId }, { user }) {
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
      Visitors.update(_id, {
        $set: {
          imageId,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Visitors.findOne(_id);
    },

    updateNotes(obj, { _id, criminalRecord, otherNotes }, { user }) {
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
      Visitors.update(_id, {
        $set: {
          criminalRecord,
          otherNotes,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Visitors.findOne(_id);
    },

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
