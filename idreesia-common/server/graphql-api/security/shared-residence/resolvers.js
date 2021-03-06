import {
  Visitors,
  SharedResidences,
  SharedResidenceResidents,
} from 'meteor/idreesia-common/server/collections/security';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

import { getSharedResidences } from './queries';

export default {
  SharedResidenceType: {
    residentsCount: sharedResidenceType =>
      SharedResidenceResidents.find({
        sharedResidenceId: { $eq: sharedResidenceType._id },
      }).count(),
    residents: sharedResidenceType =>
      SharedResidenceResidents.find({
        sharedResidenceId: { $eq: sharedResidenceType._id },
      }).fetch(),
    attachments: sharedResidenceType => {
      const { attachmentIds } = sharedResidenceType;
      if (attachmentIds && attachmentIds.length > 0) {
        return Attachments.find({ _id: { $in: attachmentIds } }).fetch();
      }

      return [];
    },
  },

  SharedResidenceResidentType: {
    resident: sharedResidenceResidentType =>
      Visitors.findOne(sharedResidenceResidentType.residentId),
  },

  Query: {
    allSharedResidences() {
      return SharedResidences.find({}).fetch();
    },

    pagedSharedResidences(obj, { queryString }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_VIEW_SHARED_RESIDENCES,
          PermissionConstants.SECURITY_MANAGE_SHARED_RESIDENCES,
        ])
      ) {
        return {
          totalResults: 0,
          data: [],
        };
      }

      return getSharedResidences(queryString);
    },

    sharedResidenceById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_VIEW_SHARED_RESIDENCES,
          PermissionConstants.SECURITY_MANAGE_SHARED_RESIDENCES,
        ])
      ) {
        return null;
      }

      return SharedResidences.findOne(_id);
    },
  },

  Mutation: {
    createSharedResidence(obj, { name, address }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_SHARED_RESIDENCES,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Shared Residences in the System.'
        );
      }

      const date = new Date();
      const sharedResidenceId = SharedResidences.insert({
        name,
        address,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return SharedResidences.findOne(sharedResidenceId);
    },

    updateSharedResidence(obj, { _id, name, address }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_SHARED_RESIDENCES,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Shared Residences in the System.'
        );
      }

      const date = new Date();
      SharedResidences.update(_id, {
        $set: {
          name,
          address,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return SharedResidences.findOne(_id);
    },

    removeSharedResidence(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_SHARED_RESIDENCES,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Shared Residences in the System.'
        );
      }

      const residentsCount = Visitors.find({
        sharedResidenceId: { $eq: _id },
      }).count();

      if (residentsCount > 0) {
        throw new Error(
          'You cannot remove a Shared Residence while residents are associated with it.'
        );
      }

      return SharedResidences.remove(_id);
    },

    createResident(
      obj,
      { sharedResidenceId, residentId, isOwner, roomNumber, fromDate, toDate },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_SHARED_RESIDENCES,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Shared Residences in the System.'
        );
      }

      const date = new Date();
      const sharedResidenceResidentId = SharedResidenceResidents.insert({
        sharedResidenceId,
        residentId,
        isOwner,
        roomNumber,
        fromDate,
        toDate,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return SharedResidenceResidents.findOne(sharedResidenceResidentId);
    },

    updateResident(
      obj,
      { _id, isOwner, roomNumber, fromDate, toDate },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_SHARED_RESIDENCES,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Shared Residences in the System.'
        );
      }

      const date = new Date();
      SharedResidenceResidents.update(_id, {
        $set: {
          isOwner,
          roomNumber,
          fromDate,
          toDate,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return SharedResidenceResidents.findOne(_id);
    },

    removeResident(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_SHARED_RESIDENCES,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Shared Residences in the System.'
        );
      }

      return SharedResidenceResidents.remove(_id);
    },

    addSharedResidenceAttachment(obj, { _id, attachmentId }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_SHARED_RESIDENCES,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Shared Residences in the System.'
        );
      }

      const date = new Date();
      SharedResidences.update(_id, {
        $addToSet: {
          attachmentIds: attachmentId,
        },
        $set: {
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return SharedResidences.findOne(_id);
    },

    removeSharedResidenceAttachment(obj, { _id, attachmentId }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_SHARED_RESIDENCES,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Shared Residences in the System.'
        );
      }

      const date = new Date();
      SharedResidences.update(_id, {
        $pull: {
          attachmentIds: attachmentId,
        },
        $set: {
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      Attachments.removeAttachment(attachmentId);
      return SharedResidences.findOne(_id);
    },
  },
};
