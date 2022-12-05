import {
  SharedResidences,
  SharedResidenceResidents,
} from 'meteor/idreesia-common/server/collections/security';
import {
  Attachments,
  People,
} from 'meteor/idreesia-common/server/collections/common';

import { getSharedResidences } from './queries';

export default {
  SharedResidenceType: {
    residentsCount: async sharedResidenceType =>
      SharedResidenceResidents.find({
        sharedResidenceId: { $eq: sharedResidenceType._id },
      }).count(),
    residents: async sharedResidenceType =>
      SharedResidenceResidents.find({
        sharedResidenceId: { $eq: sharedResidenceType._id },
      }).fetch(),
    attachments: async sharedResidenceType => {
      const { attachmentIds } = sharedResidenceType;
      if (attachmentIds && attachmentIds.length > 0) {
        return Attachments.find({ _id: { $in: attachmentIds } }).fetch();
      }

      return [];
    },
  },

  SharedResidenceResidentType: {
    resident: async sharedResidenceResidentType => {
      const person = People.findOne(sharedResidenceResidentType.residentId);
      return People.personToVisitor(person);
    },
  },

  Query: {
    allSharedResidences: async () => SharedResidences.find({}).fetch(),

    pagedSharedResidences: async (obj, { queryString }) =>
      getSharedResidences(queryString),

    sharedResidenceById: async (obj, { _id }) => SharedResidences.findOne(_id),
  },

  Mutation: {
    createSharedResidence: async (obj, { name, address }, { user }) => {
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

    updateSharedResidence: async (obj, { _id, name, address }, { user }) => {
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

    removeSharedResidence: async (obj, { _id }) => {
      const residentsCount = SharedResidenceResidents.find({
        sharedResidenceId: { $eq: _id },
      }).count();

      if (residentsCount > 0) {
        throw new Error(
          'You cannot remove a Shared Residence while residents are associated with it.'
        );
      }

      return SharedResidences.remove(_id);
    },

    createResident: async (
      obj,
      { sharedResidenceId, residentId, isOwner, roomNumber, fromDate, toDate },
      { user }
    ) => {
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

    updateResident: async (
      obj,
      { _id, isOwner, roomNumber, fromDate, toDate },
      { user }
    ) => {
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

    removeResident: async (obj, { _id }) =>
      SharedResidenceResidents.remove(_id),

    addSharedResidenceAttachment: async (
      obj,
      { _id, attachmentId },
      { user }
    ) => {
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

    removeSharedResidenceAttachment: async (
      obj,
      { _id, attachmentId },
      { user }
    ) => {
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
