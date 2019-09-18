import {
  Karkuns,
  SharedResidences,
} from 'meteor/idreesia-common/collections/hr';
import { hasOnePermission } from 'meteor/idreesia-common/api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  SharedResidenceType: {
    residentCount: sharedResidenceType =>
      Karkuns.find({
        sharedResidenceId: { $eq: sharedResidenceType._id },
      }).count(),
    owner: sharedResidenceType => {
      if (!sharedResidenceType.ownerKarkunId) return null;
      return Karkuns.findOne({
        _id: { $eq: sharedResidenceType.ownerKarkunId },
      });
    },
    residents: sharedResidenceType =>
      Karkuns.find({
        sharedResidenceId: { $eq: sharedResidenceType._id },
      }).fetch(),
  },

  Query: {
    allSharedResidences(obj, {}, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_VIEW_SHARED_RESIDENCES,
          PermissionConstants.HR_MANAGE_SHARED_RESIDENCES,
        ])
      ) {
        return [];
      }

      return SharedResidences.find({}, { sort: { address: 1 } }).fetch();
    },
    sharedResidenceById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_VIEW_SHARED_RESIDENCES,
          PermissionConstants.HR_MANAGE_SHARED_RESIDENCES,
        ])
      ) {
        return null;
      }

      return SharedResidences.findOne(_id);
    },
  },

  Mutation: {
    createSharedResidence(obj, { address, ownerKarkunId }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_MANAGE_SHARED_RESIDENCES,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Shared Residences in the System.'
        );
      }

      const date = new Date();
      const dutyId = SharedResidences.insert({
        address,
        ownerKarkunId,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return SharedResidences.findOne(dutyId);
    },

    updateSharedResidence(obj, { _id, address, ownerKarkunId }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_MANAGE_SHARED_RESIDENCES,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Shared Residences in the System.'
        );
      }

      const date = new Date();
      SharedResidences.update(_id, {
        $set: {
          address,
          ownerKarkunId,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return SharedResidences.findOne(_id);
    },

    removeSharedResidence(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_MANAGE_SHARED_RESIDENCES,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Shared Residences in the System.'
        );
      }

      const residentCount = Karkuns.find({
        sharedResidenceId: { $eq: _id },
      }).count();

      if (residentCount > 0) {
        throw new Error(
          'You cannot remove a Shared Residence while Karkuns are associated with it.'
        );
      }

      return SharedResidences.remove(_id);
    },
  },
};
