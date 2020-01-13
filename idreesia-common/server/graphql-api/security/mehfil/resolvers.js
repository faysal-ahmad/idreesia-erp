import {
  Mehfils,
  MehfilKarkuns,
} from 'meteor/idreesia-common/server/collections/security';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  MehfilType: {
    karkunCount: mehfilType =>
      MehfilKarkuns.find({
        mehfilId: { $eq: mehfilType._id },
      }).count(),
    mehfilKarkuns: mehfilType =>
      MehfilKarkuns.find({
        mehfilId: { $eq: mehfilType._id },
      }).fetch(),
  },

  Query: {
    allMehfils(obj, {}, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_VIEW_MEHFILS,
          PermissionConstants.SECURITY_MANAGE_MEHFILS,
        ])
      ) {
        return [];
      }

      return Mehfils.find({}, { sort: { mehfilDate: 1 } }).fetch();
    },
    mehfilById(obj, { id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_VIEW_MEHFILS,
          PermissionConstants.SECURITY_MANAGE_MEHFILS,
        ])
      ) {
        return null;
      }

      return Mehfils.findOne(id);
    },
  },

  Mutation: {
    createMehfil(obj, { name, mehfilDate }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_MEHFILS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Mehfils Data in the System.'
        );
      }

      const date = new Date();
      const mehfilId = Mehfils.insert({
        name,
        mehfilDate,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Mehfils.findOne(mehfilId);
    },

    updateMehfil(obj, { id, name, mehfilDate }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_MEHFILS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Mehfils Data in the System.'
        );
      }

      const date = new Date();
      Mehfils.update(id, {
        $set: {
          name,
          mehfilDate,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Mehfils.findOne(id);
    },

    removeMehfil(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_MEHFILS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Mehfils Data in the System.'
        );
      }

      const karkunCount = MehfilKarkuns.find({
        mehfilId: { $eq: _id },
      }).count();

      if (karkunCount > 0) {
        throw new Error(
          'This Mehfil cannot be deleted since it has karkuns associated with it.'
        );
      }

      return Mehfils.remove(_id);
    },
  },
};
