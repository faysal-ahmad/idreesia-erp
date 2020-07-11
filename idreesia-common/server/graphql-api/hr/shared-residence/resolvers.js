import {
  Karkuns,
  SharedResidences,
} from 'meteor/idreesia-common/server/collections/hr';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

import { getSharedResidences } from './queries';

export default {
  HRSharedResidenceType: {
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
    allHRSharedResidences() {
      return SharedResidences.find({}).fetch();
    },
    pagedHRSharedResidences(obj, { queryString }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_VIEW_SHARED_RESIDENCES,
          PermissionConstants.HR_MANAGE_SHARED_RESIDENCES,
        ])
      ) {
        return {
          totalResults: 0,
          data: [],
        };
      }

      return getSharedResidences(queryString);
    },
    hrSharedResidenceById(obj, { _id }, { user }) {
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
    createHRSharedResidence(obj, { name, address, ownerKarkunId }, { user }) {
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
        name,
        address,
        ownerKarkunId,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return SharedResidences.findOne(dutyId);
    },

    updateHRSharedResidence(
      obj,
      { _id, name, address, ownerKarkunId },
      { user }
    ) {
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
          name,
          address,
          ownerKarkunId,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return SharedResidences.findOne(_id);
    },

    removeHRSharedResidence(obj, { _id }, { user }) {
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
