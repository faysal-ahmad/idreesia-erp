import { Duties } from 'meteor/idreesia-common/server/collections/hr';

export default {
  Mutation: {
    createOutstationMehfilDuty: async (
      obj,
      { name, description },
      { user }
    ) => {
      const date = new Date();
      const dutyId = Duties.insert({
        name,
        isMehfilDuty: true,
        description,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Duties.findOne(dutyId);
    },

    updateOutstationMehfilDuty: async (
      obj,
      { _id, name, description },
      { user }
    ) => {
      const date = new Date();
      Duties.update(_id, {
        $set: {
          name,
          description,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Duties.findOne(_id);
    },

    removeOutstationMehfilDuty: async (obj, { _id }) => Duties.remove(_id),
  },
};
