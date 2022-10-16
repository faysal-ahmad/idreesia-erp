import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  PrintingOrders,
  Vendors,
  Wazaif,
} from 'meteor/idreesia-common/server/collections/wazaif';

import getWazaifPrintingOrders from './queries';

export default {
  WazaifPrintingOrderType: {
    refVendor: parent =>
      Vendors.findOne({
        _id: { $eq: parent.vendorId },
      }),
    refOrderedBy: parent => {
      if (!parent.orderedBy) return null;
      return People.findOne({
        _id: { $eq: parent.orderedBy },
      });
    },
    refReceivedBy: parent => {
      if (!parent.receivedBy) return null;
      return People.findOne({
        _id: { $eq: parent.receivedBy },
      });
    },
  },
  Query: {
    wazaifPrintingOrderById(obj, { _id }) {
      return PrintingOrders.findOne(_id);
    },

    pagedWazaifPrintingOrders(obj, { queryString }) {
      return getWazaifPrintingOrders(queryString);
    },
  },

  Mutation: {
    createWazaifPrintingOrder(
      obj,
      {
        vendorId,
        orderDate,
        orderedBy,
        deliveryDate,
        receivedBy,
        items,
        status,
        notes,
      },
      { user }
    ) {
      const date = new Date();
      const printingOrderId = PrintingOrders.insert({
        vendorId,
        orderDate,
        orderedBy,
        deliveryDate,
        receivedBy,
        items,
        status,
        notes,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      items.forEach(({ wazeefaId, packets }) => {
        Wazaif.increaseStockLevel(wazeefaId, packets);
      });

      return PrintingOrders.findOne(printingOrderId);
    },

    updateWazaifPrintingOrder(
      obj,
      {
        _id,
        vendorId,
        orderDate,
        orderedBy,
        deliveryDate,
        receivedBy,
        items,
        status,
        notes,
      },
      { user }
    ) {
      const date = new Date();
      const existingOrder = PrintingOrders.findOne(_id);
      const { items: existingItems } = existingOrder;
      // Undo the effect of all previous items
      existingItems.forEach(({ wazeefaId, packets }) => {
        Wazaif.decreaseStockLevel(wazeefaId, packets);
      });

      // Apply the effect of new incoming items
      items.forEach(({ wazeefaId, packets }) => {
        Wazaif.increaseStockLevel(wazeefaId, packets);
      });

      PrintingOrders.update(
        {
          _id: { $eq: _id },
        },
        {
          $set: {
            vendorId,
            orderDate,
            orderedBy,
            deliveryDate,
            receivedBy,
            items,
            status,
            notes,
            updatedAt: date,
            updatedBy: user._id,
          },
        }
      );

      return PrintingOrders.findOne(_id);
    },

    removeWazaifPrintingOrder(obj, { _id }) {
      const existingOrder = PrintingOrders.findOne(_id);
      const { items: existingItems } = existingOrder;
      // Undo the effect of all previous items
      existingItems.forEach(({ wazeefaId, packets }) => {
        Wazaif.decreaseStockLevel(wazeefaId, packets);
      });

      return PrintingOrders.remove(_id);
    },
  },
};
