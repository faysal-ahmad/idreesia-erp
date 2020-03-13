import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
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

      const multanCity = Cities.getMultanCity();
      return Karkuns.createKarkun(
        {
          cityId: multanCity._id,
          ...values,
        },
        user
      );
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

    setHrKarkunProfileImage(obj, values, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_KARKUNS])
      ) {
        throw new Error(
          'You do not have permission to manage Karkuns in the System.'
        );
      }

      return Karkuns.updateKarkun(values, user);
    },

    addHrKarkunAttachment(obj, { _id, attachmentId }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_KARKUNS])
      ) {
        throw new Error(
          'You do not have permission to manage Karkuns in the System.'
        );
      }

      return Karkuns.addAttachment({ _id, attachmentId }, user);
    },

    removeHrKarkunAttachment(obj, { _id, attachmentId }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_KARKUNS])
      ) {
        throw new Error(
          'You do not have permission to manage Karkuns in the System.'
        );
      }

      return Karkuns.removeAttachment({ _id, attachmentId }, user);
    },
  },
};
