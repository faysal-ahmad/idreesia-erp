import { Visitors } from 'meteor/idreesia-common/server/collections/security';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';
import { DataSource } from 'meteor/idreesia-common/constants/security';

import { processCsvData } from './helpers';

export default {
  Query: {
    pagedSecurityVisitors(obj, { filter }, { user }) {
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

      return Visitors.searchVisitors(filter);
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

      return Visitors.findByCnicOrContactNumber(cnicNumber, contactNumber);
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
        birthDate,
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

      return Visitors.createVisitor(
        {
          name,
          parentName,
          cnicNumber,
          ehadDate,
          birthDate,
          referenceName,
          contactNumber1,
          contactNumber2,
          emailAddress,
          address,
          city,
          country,
          imageData,
          dataSource: DataSource.SECURITY,
        },
        user
      );
    },

    updateSecurityVisitor(
      obj,
      {
        _id,
        name,
        parentName,
        cnicNumber,
        ehadDate,
        birthDate,
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

      return Visitors.updateVisitor(
        {
          _id,
          name,
          parentName,
          cnicNumber,
          ehadDate,
          birthDate,
          referenceName,
          contactNumber1,
          contactNumber2,
          emailAddress,
          address,
          city,
          country,
        },
        user
      );
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
