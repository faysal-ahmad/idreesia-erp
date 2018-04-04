import { DutyLocations } from '/imports/lib/collections/hr';

export default {
  Query: {
    allDutyLocations() {
      return DutyLocations.find({}).fetch();
    },
    dutyLocationById(obj, { id }, context) {
      return DutyLocations.findOne(id);
    }
  },

  Mutation: {
    createDutyLocation(obj, { name }, { userId }) {
      const date = new Date();
      const dutyLocationId = DutyLocations.insert({
        name,
        createdAt: date,
        createdBy: userId,
        updatedAt: date,
        updatedBy: userId
      });

      return DutyLocations.findOne(dutyLocationId);
    },

    updateDutyLocation(obj, { id, name }, { userId }) {
      const date = new Date();
      DutyLocations.update(id, {
        $set: {
          name,
          updatedAt: date,
          updatedBy: userId
        }
      });

      return DutyLocations.findOne(id);
    }
  }
};
