import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';
import {
  canDeleteKarkun,
  deleteKarkun,
} from 'meteor/idreesia-common/server/business-logic/hr';

import { getKarkuns } from './queries';

export default {
  Query: {
    hrKarkunById(obj, { _id }) {
      return Karkuns.findOne(_id);
    },

    pagedHrKarkuns(obj, { filter }) {
      return getKarkuns(filter);
    },
  },

  Mutation: {
    createHrKarkun(obj, values, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_MANAGE_KARKUNS,
          PermissionConstants.HR_MANAGE_EMPLOYEES,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Karkuns in the System.'
        );
      }

      return Karkuns.createKarkun(values, user);
    },

    updateHrKarkun(obj, values, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_MANAGE_KARKUNS,
          PermissionConstants.HR_MANAGE_EMPLOYEES,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Karkuns in the System.'
        );
      }

      return Karkuns.updateKarkun(values, user);
    },

    deleteHrKarkun(obj, { _id }, { user }) {
      if (!hasOnePermission(user._id, [PermissionConstants.HR_DELETE_DATA])) {
        throw new Error(
          'You do not have permission to delete Karkuns in the System.'
        );
      }

      if (canDeleteKarkun(_id)) {
        return deleteKarkun(_id);
      }

      return 0;
    },

    setHrKarkunWazaifAndRaabta(obj, values, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_KARKUNS])
      ) {
        throw new Error(
          'You do not have permission to manage Karkuns in the System.'
        );
      }

      return Karkuns.updateKarkun(values, user);
    },

    setHrKarkunEmploymentInfo(obj, values, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_EMPLOYEES])
      ) {
        throw new Error(
          'You do not have permission to manage Karkuns in the System.'
        );
      }

      return Karkuns.updateKarkun(values, user);
    },

    setHrKarkunProfileImage(obj, { _id, imageId }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_KARKUNS])
      ) {
        throw new Error(
          'You do not have permission to manage Karkuns in the System.'
        );
      }

      // If the user already has another image attached, then remove that attachment
      // since it will now become orphaned.
      const existingKarkun = Karkuns.findOne(_id);
      if (existingKarkun.imageId) {
        Attachments.remove(existingKarkun.imageId);
      }

      const date = new Date();
      Karkuns.update(_id, {
        $set: {
          imageId,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Karkuns.findOne(_id);
    },

    addHrKarkunAttachment(obj, { _id, attachmentId }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_KARKUNS])
      ) {
        throw new Error(
          'You do not have permission to manage Karkuns in the System.'
        );
      }

      const date = new Date();
      Karkuns.update(_id, {
        $addToSet: {
          attachmentIds: attachmentId,
        },
        $set: {
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Karkuns.findOne(_id);
    },

    removeHrKarkunAttachment(obj, { _id, attachmentId }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_KARKUNS])
      ) {
        throw new Error(
          'You do not have permission to manage Karkuns in the System.'
        );
      }

      const date = new Date();
      Karkuns.update(_id, {
        $pull: {
          attachmentIds: attachmentId,
        },
        $set: {
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      Attachments.remove(attachmentId);
      return Karkuns.findOne(_id);
    },
  },
};
