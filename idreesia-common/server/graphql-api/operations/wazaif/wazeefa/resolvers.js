import moment from 'moment';
import {
  Wazaif,
  DeliveryOrders,
  PrintingOrders,
  StockAdjustments,
} from 'meteor/idreesia-common/server/collections/wazaif';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';
import { without, isNil } from 'meteor/idreesia-common/utilities/lodash';

export default {
  WazeefaType: {
    formattedName: wazeefaType => {
      const { name, revisionNumber, revisionDate } = wazeefaType;
      let fName = name;
      if (revisionNumber) {
        fName = `${fName}_${revisionNumber}`;
      }

      if (revisionDate) {
        const date = moment(revisionDate);
        fName = `${fName}_${date.format('MMYY')}`;
      }

      return fName;
    },
    images: wazeefaType => {
      const { imageIds } = wazeefaType;
      if (imageIds && imageIds.length > 0) {
        return Attachments.find({ _id: { $in: imageIds } }).fetch();
      }

      return [];
    },
    deliveryOrders: wazeefaType => {
      let packetCount = 0;
      const deliveryOrders = DeliveryOrders.find({
        status: { $eq: 'pending' },
        items: {
          $elemMatch: {
            wazeefaId: { $eq: wazeefaType._id },
          },
        },
      });

      deliveryOrders.forEach(deliveryOrder => {
        const { items } = deliveryOrder;
        items.forEach(item => {
          if (item.wazeefaId === wazeefaType._id) {
            packetCount += item.packets;
          }
        });
      });

      return packetCount;
    },
    printingOrders: wazeefaType => {
      let packetCount = 0;
      const printingOrders = PrintingOrders.find({
        status: { $eq: 'pending' },
        items: {
          $elemMatch: {
            wazeefaId: { $eq: wazeefaType._id },
          },
        },
      });

      printingOrders.forEach(printingOrder => {
        const { items } = printingOrder;
        items.forEach(item => {
          if (item.wazeefaId === wazeefaType._id) {
            packetCount += item.packets;
          }
        });
      });

      return packetCount;
    },
  },

  Query: {
    pagedOperationsWazaif(obj, { filter }) {
      return Wazaif.searchWazaif(filter);
    },

    operationsWazeefaById(obj, { _id }) {
      return Wazaif.findOne(_id);
    },

    operationsWazaifById(obj, { _ids }) {
      return Wazaif.find({
        _id: { $in: _ids },
      });
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
        stockReconciledOn: date,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      StockAdjustments.insert({
        wazeefaId,
        adjustmentDate: date,
        adjustedBy: user._id,
        quantity: currentStockLevel,
        adjustmentReason: 'Set initial stock level',
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

    setOperationsWazeefaStockLevel(
      obj,
      { _id, currentStockLevel, adjustmentReason },
      { user }
    ) {
      const existingWazeefa = Wazaif.findOne(_id);
      const canUpdateStockLevel = isNil(existingWazeefa.currentStockLevel);

      const date = new Date();
      Wazaif.update(_id, {
        $set: {
          currentStockLevel,
          stockReconciledOn: canUpdateStockLevel
            ? date
            : existingWazeefa.canUpdateStockLevel,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      StockAdjustments.insert({
        wazeefaId: _id,
        adjustmentDate: date,
        adjustedBy: user._id,
        quantity: canUpdateStockLevel
          ? currentStockLevel
          : currentStockLevel - existingWazeefa.currentStockLevel,
        adjustmentReason,
      });

      return Wazaif.findOne(_id);
    },

    setOperationsWazeefaStockLevelReconciled(obj, { _id }, { user }) {
      const date = new Date();
      Wazaif.update(_id, {
        $set: {
          stockReconciledOn: date,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

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
