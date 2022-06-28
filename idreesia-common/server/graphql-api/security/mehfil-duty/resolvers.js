import {
  MehfilDuties,
  MehfilKarkuns,
} from 'meteor/idreesia-common/server/collections/security';

export default {
  MehfilDutyType: {
    overallUsedCount: mehfilDutyType =>
      MehfilKarkuns.find({
        dutyId: { $eq: mehfilDutyType._id },
      }).count(),
    mehfilUsedCount: (mehfilDutyType, args, context, info) => {
      const mehfilId = info?.variableValues?.mehfilId;
      if (mehfilId) {
        return MehfilKarkuns.find({
          mehfilId,
          dutyId: { $eq: mehfilDutyType._id },
        }).count();
      }
      return 0;
    },
  },

  Query: {
    allSecurityMehfilDuties() {
      return MehfilDuties.find({}).fetch();
    },
    securityMehfilDutyById(obj, { id }) {
      return MehfilDuties.findOne(id);
    },
  },

  Mutation: {
    createSecurityMehfilDuty(obj, { name, urduName }, { user }) {
      const date = new Date();
      const mehfilDutyId = MehfilDuties.insert({
        name,
        urduName,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return MehfilDuties.findOne(mehfilDutyId);
    },

    updateSecurityMehfilDuty(obj, { id, name, urduName }, { user }) {
      const date = new Date();
      MehfilDuties.update(id, {
        $set: {
          name,
          urduName,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return MehfilDuties.findOne(id);
    },

    removeSecurityMehfilDuty(obj, { _id }) {
      const usedCount = MehfilKarkuns.find({
        dutyId: { $eq: _id },
      }).count();

      if (usedCount > 0) {
        throw new Error(
          'This mehfil duty cannot be deleted as it is currently in use.'
        );
      }

      return MehfilDuties.remove(_id);
    },
  },
};
