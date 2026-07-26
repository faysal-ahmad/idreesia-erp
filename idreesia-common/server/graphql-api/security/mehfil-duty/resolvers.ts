// @ts-nocheck
import {
  MehfilDuties,
  MehfilKarkuns,
} from 'meteor/idreesia-common/server/collections/security';

export default {
  MehfilDutyType: {
    overallUsedCount: async mehfilDutyType =>
      MehfilKarkuns.find({
        dutyId: { $eq: mehfilDutyType._id },
      }).countAsync(),
    mehfilUsedCount: async (mehfilDutyType, args, context, info) => {
      const mehfilId = info?.variableValues?.mehfilId;
      if (mehfilId) {
        return MehfilKarkuns.find({
          mehfilId,
          dutyId: { $eq: mehfilDutyType._id },
        }).countAsync();
      }
      return 0;
    },
  },

  Query: {
    allSecurityMehfilDuties: async () => MehfilDuties.find({}).fetchAsync(),

    securityMehfilDutyById: async (obj, { id }) => MehfilDuties.findOneAsync(id),
  },

  Mutation: {
    createSecurityMehfilDuty: async (obj, { name, urduName }, { user }) => {
      const date = new Date();
      const mehfilDutyId = await MehfilDuties.insertAsync({
        name,
        urduName,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return MehfilDuties.findOneAsync(mehfilDutyId);
    },

    updateSecurityMehfilDuty: async (obj, { id, name, urduName }, { user }) => {
      const date = new Date();
      await MehfilDuties.updateAsync(id, {
        $set: {
          name,
          urduName,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return MehfilDuties.findOneAsync(id);
    },

    removeSecurityMehfilDuty: async (obj, { _id }) => {
      const usedCount = await MehfilKarkuns.find({
        dutyId: { $eq: _id },
      }).countAsync();

      if (usedCount > 0) {
        throw new Error(
          'This mehfil duty cannot be deleted as it is currently in use.'
        );
      }

      return MehfilDuties.removeAsync(_id);
    },
  },
};
