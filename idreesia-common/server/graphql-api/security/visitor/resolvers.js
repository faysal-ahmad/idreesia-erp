import { Visitors } from 'meteor/idreesia-common/server/collections/security';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';
import { createAttachment } from 'meteor/idreesia-common/server/graphql-api/common/attachment/utilities';

import { processCsvData } from './helpers';

export default {
  Query: {
    pagedSecurityVisitors(obj, { queryString }, { user }) {
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

      return Visitors.searchVisitors(queryString);
    },

    securityVisitorById(obj, { _id }, { user }) {
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

    securityVisitorByCnic(obj, { cnicNumbers }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_VIEW_VISITORS,
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        return null;
      }

      if (cnicNumbers.length > 0) {
        return Visitors.findOne({
          cnicNumber: { $in: cnicNumbers },
        });
      }

      return null;
    },

    securityVisitorByCnicOrContactNumber(
      obj,
      { cnicNumber, contactNumber },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_VIEW_VISITORS,
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        return null;
      }

      let visitor = null;

      if (cnicNumber) {
        visitor = Visitors.findOne({
          cnicNumber: { $eq: cnicNumber },
        });
      }

      if (visitor) return visitor;

      if (contactNumber) {
        visitor = Visitors.findOne({
          $or: [
            { contactNumber1: contactNumber },
            { contactNumber2: contactNumber },
          ],
        });
      }

      return visitor;
    },
  },

  Mutation: {
    createSecurityVisitor(
      obj,
      {
        name,
        parentName,
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

      if (cnicNumber) Visitors.checkCnicNotInUse(cnicNumber);
      if (contactNumber1) Visitors.checkContactNotInUse(contactNumber1);
      if (contactNumber2) Visitors.checkContactNotInUse(contactNumber2);

      let imageId = null;
      if (imageData) {
        imageId = createAttachment(
          {
            data: imageData,
          },
          { user }
        );
      }

      const date = new Date();
      const visitorId = Visitors.insert({
        name,
        parentName,
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
        dataSource: 'security',
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Visitors.findOne(visitorId);
    },

    updateSecurityVisitor(
      obj,
      {
        _id,
        name,
        parentName,
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

      if (cnicNumber) Visitors.checkCnicNotInUse(cnicNumber, _id);
      if (contactNumber1) Visitors.checkContactNotInUse(contactNumber1, _id);
      if (contactNumber2) Visitors.checkContactNotInUse(contactNumber2, _id);

      const date = new Date();
      Visitors.update(_id, {
        $set: {
          name,
          parentName,
          cnicNumber,
          ehadDate,
          referenceName,
          contactNumber1,
          contactNumber2,
          emailAddress,
          address,
          city,
          country,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Visitors.findOne(_id);
    },

    deleteSecurityVisitor(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.SECURITY_DELETE_DATA])
      ) {
        throw new Error(
          'You do not have permission to delete Visitors in the System.'
        );
      }

      return Visitors.remove(_id);
    },

    setSecurityVisitorImage(obj, { _id, imageId }, { user }) {
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

    updateSecurityVisitorNotes(
      obj,
      { _id, criminalRecord, otherNotes },
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

    importSecurityVisitorsCsvData(obj, { csvData }, { user }) {
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
  },
};
