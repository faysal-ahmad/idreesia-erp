import { Random } from 'meteor/random';
import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';
import {
  Mehfils,
  MehfilKarkuns,
} from 'meteor/idreesia-common/server/collections/security';

export default {
  MehfilKarkunType: {
    karkun: mehfilKarkunType => Karkuns.findOne(mehfilKarkunType.karkunId),
    mehfil: mehfilKarkunType => Mehfils.findOne(mehfilKarkunType.mehfilId),
  },

  Query: {
    mehfilKarkunsByMehfilId(obj, { mehfilId, dutyName }) {
      if (dutyName) {
        return MehfilKarkuns.find({ mehfilId, dutyName }).fetch();
      }

      return MehfilKarkuns.find({ mehfilId }).fetch();
    },

    mehfilKarkunsByIds(obj, { ids }) {
      const idsArray = ids.split(',');
      return MehfilKarkuns.find({
        _id: { $in: idsArray },
      }).fetch();
    },

    mehfilKarkunByBarcodeId(obj, { barcode }) {
      return MehfilKarkuns.findOne({
        dutyCardBarcodeId: barcode,
      });
    },
  },

  Mutation: {
    addMehfilKarkun(obj, { mehfilId, karkunId, dutyName }, { user }) {
      const existingMehfilKarkun = MehfilKarkuns.findOne({
        mehfilId,
        karkunId,
        dutyName,
      });

      if (existingMehfilKarkun) return existingMehfilKarkun;

      const date = new Date();
      const mehfilKarkunId = MehfilKarkuns.insert({
        mehfilId,
        karkunId,
        dutyName,
        dutyCardBarcodeId: Random.id(8),
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return MehfilKarkuns.findOne(mehfilKarkunId);
    },

    setDutyDetail(obj, { ids, dutyDetail }, { user }) {
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

    removeMehfilKarkun(obj, { _id }) {
      return MehfilKarkuns.remove(_id);
    },
  },
};
