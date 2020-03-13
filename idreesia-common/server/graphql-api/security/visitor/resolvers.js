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
    createSecurityVisitor(obj, values, { user }) {
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
          ...values,
          dataSource: DataSource.SECURITY,
        },
        user
      );
    },

    updateSecurityVisitor(obj, values, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Visitors in the System.'
        );
      }

      return Visitors.updateVisitor(values, user);
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

    setSecurityVisitorImage(obj, values, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Visitors in the System.'
        );
      }

      return Visitors.updateVisitor(values, user);
    },

    updateSecurityVisitorNotes(obj, values, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Visitors in the System.'
        );
      }

      return Visitors.updateVisitor(values, user);
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
