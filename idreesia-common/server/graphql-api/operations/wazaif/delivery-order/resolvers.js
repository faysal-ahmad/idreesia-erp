import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  Cities,
  CityMehfils,
} from 'meteor/idreesia-common/server/collections/outstation';
import {
  DeliveryOrders,
  Wazaif,
} from 'meteor/idreesia-common/server/collections/wazaif';

import getWazaifDeliveryOrders from './queries';

export default {
  WazaifDeliveryOrderType: {
    refCity: parent =>
      Cities.findOne({
        _id: { $eq: parent.cityId },
      }),
    refCityMehfil: parent =>
      CityMehfils.findOne({
        _id: { $eq: parent.cityMehfilId },
      }),
    refRequestedBy: parent => {
      if (!parent.requestedBy) return null;
      return People.findOne({
        _id: { $eq: parent.requestedBy },
      });
    },
    refDeliveredTo: parent => {
      if (!parent.deliveredTo) return null;
      return People.findOne({
        _id: { $eq: parent.deliveredTo },
      });
    },
  },
  Query: {
    wazaifDeliveryOrderById(obj, { _id }) {
      return DeliveryOrders.findOne(_id);
    },

    pagedWazaifDeliveryOrders(obj, { queryString }) {
      return getWazaifDeliveryOrders(queryString);
    },
  },

  Mutation: {
    createWazaifDeliveryOrder(
      obj,
      {
        cityId,
        cityMehfilId,
        requestedDate,
        requestedBy,
        deliveryDate,
        deliveredTo,
        items,
        status,
        notes,
      },
      { user }
    ) {
      const date = new Date();
      const deliveryOrderId = DeliveryOrders.insert({
        cityId,
        cityMehfilId,
        requestedDate,
        requestedBy,
        deliveryDate,
        deliveredTo,
        items,
        status,
        notes,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      items.forEach(({ wazeefaId, packets }) => {
        Wazaif.decreaseStockLevel(wazeefaId, packets);
      });

      return DeliveryOrders.findOne(deliveryOrderId);
    },

    updateWazaifDeliveryOrder(
      obj,
      {
        _id,
        cityId,
        cityMehfilId,
        requestedDate,
        requestedBy,
        deliveryDate,
        deliveredTo,
        items,
        status,
        notes,
      },
      { user }
    ) {
      const date = new Date();
      const existingOrder = DeliveryOrders.findOne(_id);
      const { items: existingItems } = existingOrder;
      // Undo the effect of all previous items
      existingItems.forEach(({ wazeefaId, packets }) => {
        Wazaif.increaseStockLevel(wazeefaId, packets);
      });

      // Apply the effect of new incoming items
      items.forEach(({ wazeefaId, packets }) => {
        Wazaif.decreaseStockLevel(wazeefaId, packets);
      });

      DeliveryOrders.update(
        {
          _id: { $eq: _id },
          approvedOn: { $eq: null },
          approvedBy: { $eq: null },
        },
        {
          $set: {
            cityId,
            cityMehfilId,
            requestedDate,
            requestedBy,
            deliveryDate,
            deliveredTo,
            items,
            status,
            notes,
            updatedAt: date,
            updatedBy: user._id,
          },
        }
      );

      return DeliveryOrders.findOne(_id);
    },

    removeWazaifDeliveryOrder(obj, { _id }) {
      const existingOrder = DeliveryOrders.findOne(_id);
      const { items: existingItems } = existingOrder;
      // Undo the effect of all previous items
      existingItems.forEach(({ wazeefaId, packets }) => {
        Wazaif.increaseStockLevel(wazeefaId, packets);
      });

      return DeliveryOrders.remove(_id);
    },
  },
};
