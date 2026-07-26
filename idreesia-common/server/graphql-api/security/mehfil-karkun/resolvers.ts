// @ts-nocheck
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
      Mehfils.findOneAsync(mehfilKarkunType.mehfilId),
    duty: async mehfilKarkunType =>
      MehfilDuties.findOneAsync(mehfilKarkunType.dutyId),
    karkun: async mehfilKarkunType =>
      People.findOneAsync(mehfilKarkunType.karkunId),
  },

  Query: {
    mehfilKarkunsByMehfilId: async (obj, { mehfilId, dutyId }) => {
      if (dutyId) {
        return MehfilKarkuns.find(
          { mehfilId, dutyId },
          { $sort: { dutyId: 1 } }
        ).fetchAsync();
      }

      return MehfilKarkuns.find({ mehfilId }).fetchAsync();
    },

    mehfilKarkunsByIds: async (obj, { ids }) => {
      const idsArray = ids.split(',');
      return MehfilKarkuns.find({
        _id: { $in: idsArray },
      }).fetchAsync();
    },

    mehfilKarkunByBarcodeId: async (obj, { barcode }) =>
      MehfilKarkuns.findOneAsync({
        dutyCardBarcodeId: barcode,
      }),
  },

  Mutation: {
    addMehfilKarkun: async (obj, { mehfilId, karkunId, dutyId }, { user }) => {
      const existingMehfilKarkun = await MehfilKarkuns.findOneAsync({
        mehfilId,
        karkunId,
        dutyId,
      });

      if (existingMehfilKarkun) return existingMehfilKarkun;

      const date = new Date();
      const mehfilKarkunId = await MehfilKarkuns.insertAsync({
        mehfilId,
        karkunId,
        dutyId,
        dutyCardBarcodeId: Random.id(8),
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return MehfilKarkuns.findOneAsync(mehfilKarkunId);
    },

    setDutyDetail: async (obj, { ids, dutyDetail }, { user }) => {
      const date = new Date();
      await MehfilKarkuns.updateAsync(
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

      return MehfilKarkuns.find({ _id: { $in: ids } }).fetchAsync();
    },

    removeMehfilKarkun: async (obj, { _id }) => MehfilKarkuns.removeAsync(_id),
  },
};
