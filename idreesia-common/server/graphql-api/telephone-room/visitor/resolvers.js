import { Visitors } from 'meteor/idreesia-common/server/collections/security';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';
import { DataSource } from 'meteor/idreesia-common/constants/security';

export default {
  Query: {
    pagedTelephoneRoomVisitors(obj, { filter }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.TR_VIEW_VISITORS,
          PermissionConstants.TR_MANAGE_VISITORS,
        ])
      ) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      return Visitors.searchVisitors(filter);
    },

    telephoneRoomVisitorById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.TR_VIEW_VISITORS,
          PermissionConstants.TR_MANAGE_VISITORS,
        ])
      ) {
        return null;
      }

      return Visitors.findOne(_id);
    },

    telephoneRoomVisitorsByCnic(
      obj,
      { cnicNumbers, partialCnicNumber },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.TR_VIEW_VISITORS,
          PermissionConstants.TR_MANAGE_VISITORS,
        ])
      ) {
        return null;
      }

      if (cnicNumbers.length > 0) {
        return Visitors.find({
          cnicNumber: { $in: cnicNumbers },
        }).fetch();
      }

      if (partialCnicNumber) {
        return Visitors.find({
          cnicNumber: { $regex: new RegExp(`-${partialCnicNumber}-`, 'i') },
        }).fetch();
      }

      return null;
    },
  },

  Mutation: {
    createTelephoneRoomVisitor(obj, values, { user }) {
      if (
        user &&
        !hasOnePermission(user._id, [PermissionConstants.TR_MANAGE_VISITORS])
      ) {
        throw new Error(
          'You do not have permission to manage Visitors in the System.'
        );
      }

      return Visitors.createVisitor(
        {
          ...values,
          dataSource: DataSource.TELEPHONE_ROOM,
        },
        user
      );
    },

    updateTelephoneRoomVisitor(obj, values, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.TR_MANAGE_VISITORS])
      ) {
        throw new Error(
          'You do not have permission to manage Visitors in the System.'
        );
      }

      return Visitors.updateVisitor(values, user);
    },

    deleteTelephoneRoomVisitor(obj, { _id }, { user }) {
      if (!hasOnePermission(user._id, [PermissionConstants.TR_DELETE_DATA])) {
        throw new Error(
          'You do not have permission to delete Visitors in the System.'
        );
      }

      return Visitors.remove(_id);
    },

    setTelephoneRoomVisitorImage(obj, values, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.TR_MANAGE_VISITORS])
      ) {
        throw new Error(
          'You do not have permission to manage Visitors in the System.'
        );
      }

      return Visitors.updateVisitor(values, user);
    },
  },
};
