import { Wazaif } from 'meteor/idreesia-common/server/collections/wazaif-management';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';
import { without, isNil } from 'meteor/idreesia-common/utilities/lodash';

export default {
  Query: {
    pagedOperationsWazaif(obj, { filter }) {
      return Wazaif.searchWazaif(filter);
    },

    operationsWazeefaById(obj, { _id }) {
      return Wazaif.findOne(_id);
    },
  },

  Mutation: {
    createOperationsWazeefa(
      obj,
      { name, revisionNumber, revisionDate, currentStockLevel },
      { user }
    ) {
      const date = new Date();
      const wazeefaId = Wazaif.insert({
        name,
        revisionNumber,
        revisionDate,
        currentStockLevel,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Wazaif.findOne(wazeefaId);
    },

    updateOperationsWazeefa(
      obj,
      { _id, name, revisionNumber, revisionDate },
      { user }
    ) {
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

    setOperationsWazeefaDetails(
      obj,
      { _id, packetCount, subCartonCount, cartonCount },
      { user }
    ) {
      const date = new Date();
      Wazaif.update(_id, {
        $set: {
          wazeefaDetail: {
            packetCount,
            subCartonCount,
            cartonCount,
          },
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Wazaif.findOne(_id);
    },

    setOperationsWazeefaStockLevel(obj, { _id, currentStockLevel }, { user }) {
      const existingWazeefa = Wazaif.findOne(_id);
      const canUpdateStockLevel = isNil(existingWazeefa.currentStockLevel);

      if (canUpdateStockLevel) {
        const date = new Date();
        Wazaif.update(_id, {
          $set: {
            currentStockLevel,
            updatedAt: date,
            updatedBy: user._id,
          },
        });
      }

      return Wazaif.findOne(_id);
    },

    deleteOperationsWazeefa(obj, { _id }) {
      const wazeefa = Wazaif.findOne(_id);
      const { imageIds } = wazeefa;
      if (imageIds && imageIds.length > 0) {
        Attachments.remove({ _id: { $in: imageIds } });
      }

      return Wazaif.remove(_id);
    },

    setOperationsWazeefaImage(obj, { _id, imageIds }, { user }) {
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

    removeOperationsWazeefaImage(obj, { _id, imageId }, { user }) {
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
