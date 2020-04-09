import { Wazaif } from 'meteor/idreesia-common/server/collections/wazaif-management';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';
import { without } from 'meteor/idreesia-common/utilities/lodash';

export default {
  WazeefaType: {
    images: wazeefaType => {
      const { imageIds } = wazeefaType;
      if (imageIds && imageIds.length > 0) {
        return Attachments.find({ _id: { $in: imageIds } }).fetch();
      }

      return [];
    },
  },

  Query: {
    pagedWazaif(obj, { filter }) {
      return Wazaif.searchWazaif(filter);
    },

    wazeefaById(obj, { _id }) {
      return Wazaif.findOne(_id);
    },
  },

  Mutation: {
    createWazeefa(obj, { name, revisionNumber, revisionDate }, { user }) {
      const date = new Date();
      const wazeefaId = Wazaif.insert({
        name,
        revisionNumber,
        revisionDate,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Wazaif.findOne(wazeefaId);
    },

    updateWazeefa(obj, { _id, name, revisionNumber, revisionDate }, { user }) {
      const date = new Date();
      Wazaif.update(_id, {
        $set: {
          name,
          revisionNumber,
          revisionDate,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Wazaif.findOne(_id);
    },

    deleteWazeefa(obj, { _id }) {
      const wazeefa = Wazaif.findOne(_id);
      const { imageIds } = wazeefa;
      if (imageIds && imageIds.length > 0) {
        Attachments.remove({ _id: { $in: imageIds } });
      }

      return Wazaif.remove(_id);
    },

    setWazeefaImages(obj, { _id, imageIds }, { user }) {
      const date = new Date();
      Wazaif.update(_id, {
        $set: {
          imageIds,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Wazaif.findOne(_id);
    },

    removeWazeefaImage(obj, { _id, imageId }, { user }) {
      const wazeefa = Wazaif.findOne(_id);
      const { imageIds } = wazeefa;
      const updatedImageIds = without(imageIds, imageId);
      const date = new Date();
      Wazaif.update(_id, {
        $set: {
          imageIds: updatedImageIds,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      // Remove the image from the attachments as well
      Attachments.remove(imageId);

      return Wazaif.findOne(_id);
    },
  },
};
