import { Random } from 'meteor/random';
import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';
import { MehfilKarkuns } from 'meteor/idreesia-common/server/collections/security';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  MehfilKarkunType: {
    karkun: mehfilKarkunType => Karkuns.findOne(mehfilKarkunType.karkunId),
  },

  Query: {
    mehfilKarkunsByMehfilId(obj, { mehfilId, dutyName }, { user }) {
      if (
        !dutyName ||
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_VIEW_MEHFILS,
          PermissionConstants.SECURITY_MANAGE_MEHFILS,
        ])
      ) {
        return [];
      }

      return MehfilKarkuns.find({ mehfilId, dutyName }).fetch();
    },

    mehfilKarkunsByIds(obj, { ids }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_VIEW_MEHFILS,
          PermissionConstants.SECURITY_MANAGE_MEHFILS,
        ])
      ) {
        return [];
      }

      const idsArray = ids.split(',');
      return MehfilKarkuns.find({
        _id: { $in: idsArray },
      }).fetch();
    },
  },

  Mutation: {
    addMehfilKarkun(obj, { mehfilId, karkunId, dutyName }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_MEHFILS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Mehfils Data in the System.'
        );
      }

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
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_MEHFILS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Mehfils Data in the System.'
        );
      }

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

    removeMehfilKarkun(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_MEHFILS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Mehfils Data in the System.'
        );
      }

      return MehfilKarkuns.remove(_id);
    },
  },
};
