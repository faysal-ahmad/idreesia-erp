import { People } from 'meteor/idreesia-common/server/collections/common';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import {
  Wazaif,
  StockAdjustments,
} from 'meteor/idreesia-common/server/collections/wazaif-management';

import { getStockAdjustments } from './queries';

export default {
  WazeefaStockAdjustment: {
    refWazeefa: stockAdjustment =>
      Wazaif.findOne({
        _id: { $eq: stockAdjustment.wazeefaId },
      }),
    refAdjustedBy: stockAdjustment => {
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
    pagedWazaifStockAdjustments(obj, { queryString }) {
      return getStockAdjustments(queryString);
    },

    wazeefaStockAdjustmentById(obj, { _id }) {
      return StockAdjustments.findOne(_id);
    },
  },

  Mutation: {
    approveWazeefaStockAdjustment(obj, { _id }, { user }) {
      const date = new Date();
      StockAdjustments.update(_id, {
        $set: {
          approvedOn: date,
          approvedBy: user._id,
        },
      });

      return StockAdjustments.findOne(_id);
    },

    removeWazeefaStockAdjustment(obj, { _id }, { user }) {
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
