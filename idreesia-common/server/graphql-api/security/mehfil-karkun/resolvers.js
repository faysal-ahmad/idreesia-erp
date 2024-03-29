import { Random } from 'meteor/random';
import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  Mehfils,
  MehfilKarkuns,
  MehfilDuties,
} from 'meteor/idreesia-common/server/collections/security';

export default {
  MehfilKarkunType: {
    mehfil: async mehfilKarkunType =>
      Mehfils.findOne(mehfilKarkunType.mehfilId),
    duty: async mehfilKarkunType =>
      MehfilDuties.findOne(mehfilKarkunType.dutyId),
    karkun: async mehfilKarkunType => People.findOne(mehfilKarkunType.karkunId),
  },

  Query: {
    mehfilKarkunsByMehfilId: async (obj, { mehfilId, dutyId }) => {
      if (dutyId) {
        return MehfilKarkuns.find(
          { mehfilId, dutyId },
          { $sort: { dutyId: 1 } }
        ).fetch();
      }

      return MehfilKarkuns.find({ mehfilId }).fetch();
    },

    mehfilKarkunsByIds: async (obj, { ids }) => {
      const idsArray = ids.split(',');
      return MehfilKarkuns.find({
        _id: { $in: idsArray },
      }).fetch();
    },

    mehfilKarkunByBarcodeId: async (obj, { barcode }) =>
      MehfilKarkuns.findOne({
        dutyCardBarcodeId: barcode,
      }),
  },

  Mutation: {
    addMehfilKarkun: async (obj, { mehfilId, karkunId, dutyId }, { user }) => {
      const existingMehfilKarkun = MehfilKarkuns.findOne({
        mehfilId,
        karkunId,
        dutyId,
      });

      if (existingMehfilKarkun) return existingMehfilKarkun;

      const date = new Date();
      const mehfilKarkunId = MehfilKarkuns.insert({
        mehfilId,
        karkunId,
        dutyId,
        dutyCardBarcodeId: Random.id(8),
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return MehfilKarkuns.findOne(mehfilKarkunId);
    },

    setDutyDetail: async (obj, { ids, dutyDetail }, { user }) => {
      const date = new Date();
      MehfilKarkuns.update(
        {
          _id: { $in: ids },
        },
        {
          $set: {
            dutyDetail,
            updatedAt: date,
            updatedBy: user._id,
          },
        },
        { multi: true }
      );

      return MehfilKarkuns.find({ _id: { $in: ids } }).fetch();
    },

    removeMehfilKarkun: async (obj, { _id }) => MehfilKarkuns.remove(_id),
  },
};
