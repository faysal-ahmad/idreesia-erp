import { Duties } from '/imports/lib/collections/hr';

export default {
  Query: {
    allDuties() {
      return Duties.find({}).fetch();
    },
    dutyById(obj, { id }, context) {
      return Duties.findOne(id);
    }
  },

  Mutation: {
    createDuty(obj, { name }, { userId }) {
      const date = new Date();
      const dutyId = Duties.insert({
        name,
        createdAt: date,
        createdBy: userId,
        updatedAt: date,
        updatedBy: userId
      });

      return Duties.findOne(dutyId);
    },

    updateDuty(obj, { id, name }, { userId }) {
      const date = new Date();
      Duties.update(id, {
        $set: {
          name,
          updatedAt: date,
          updatedBy: userId
        }
      });

      return Duties.findOne(id);
    }
  }
};
