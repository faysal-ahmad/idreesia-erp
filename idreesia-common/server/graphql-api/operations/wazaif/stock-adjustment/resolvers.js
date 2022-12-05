import { People } from 'meteor/idreesia-common/server/collections/common';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import {
  Wazaif,
  StockAdjustments,
} from 'meteor/idreesia-common/server/collections/wazaif';

import { getStockAdjustments } from './queries';

export default {
  WazeefaStockAdjustment: {
    refWazeefa: async stockAdjustment =>
      Wazaif.findOne({
        _id: { $eq: stockAdjustment.wazeefaId },
      }),
    refAdjustedBy: async stockAdjustment => {
      const user = Users.findOne(stockAdjustment.adjustedBy);
      if (user && user.personId) {
        return People.findOne({
          _id: { $eq: user.personId },
        });
      }

      return null;
    },
  },
  Query: {
    pagedWazaifStockAdjustments: async (obj, { queryString }) =>
      getStockAdjustments(queryString),

    wazeefaStockAdjustmentById: async (obj, { _id }) =>
      StockAdjustments.findOne(_id),
  },

  Mutation: {
    approveWazeefaStockAdjustment: async (obj, { _id }, { user }) => {
      const date = new Date();
      StockAdjustments.update(_id, {
        $set: {
          approvedOn: date,
          approvedBy: user._id,
        },
      });

      return StockAdjustments.findOne(_id);
    },

    removeWazeefaStockAdjustment: async (obj, { _id }, { user }) => {
      const date = new Date();
      const adjustment = StockAdjustments.findOne(_id);
      const wazeefa = Wazaif.findOne(adjustment.wazeefaId);
      Wazaif.update(wazeefa._id, {
        $set: {
          currentStockLevel: wazeefa.currentStockLevel - adjustment.adjustedBy,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return StockAdjustments.remove(_id);
    },
  },
};
