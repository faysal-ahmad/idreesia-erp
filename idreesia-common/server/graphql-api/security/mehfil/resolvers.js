import {
  Mehfils,
  MehfilKarkuns,
} from 'meteor/idreesia-common/server/collections/security';

export default {
  MehfilType: {
    karkunCount: mehfilType =>
      MehfilKarkuns.find({
        mehfilId: { $eq: mehfilType._id },
      }).count(),
    mehfilKarkuns: mehfilType =>
      MehfilKarkuns.find({
        mehfilId: { $eq: mehfilType._id },
      }).fetch(),
  },

  Query: {
    allMehfils() {
      return Mehfils.find({}, { sort: { mehfilDate: -1 } }).fetch();
    },

    mehfilById(obj, { _id }) {
      return Mehfils.findOne(_id);
    },
  },

  Mutation: {
    createMehfil(obj, { name, mehfilDate }, { user }) {
      const date = new Date();
      const mehfilId = Mehfils.insert({
        name,
        mehfilDate,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Mehfils.findOne(mehfilId);
    },

    updateMehfil(obj, { _id, name, mehfilDate }, { user }) {
      const date = new Date();
      Mehfils.update(_id, {
        $set: {
          name,
          mehfilDate,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Mehfils.findOne(_id);
    },

    removeMehfil(obj, { _id }) {
      const karkunCount = MehfilKarkuns.find({
        mehfilId: { $eq: _id },
      }).count();

      if (karkunCount > 0) {
        throw new Error(
          'This Mehfil cannot be deleted since it has karkuns associated with it.'
        );
      }

      return Mehfils.remove(_id);
    },
  },
};
