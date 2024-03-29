import {
  ImdadRequests,
  ImdadReasons,
} from 'meteor/idreesia-common/server/collections/imdad';

export default {
  ImdadReasonType: {
    usedCount: async imdadReason =>
      ImdadRequests.find({
        imdadReasonId: { $eq: imdadReason._id },
      }).count(),
  },

  Query: {
    allImdadReasons: async () =>
      ImdadReasons.find({}, { sort: { name: 1 } }).fetch(),

    imdadReasonById: async (obj, { _id }) => ImdadReasons.findOne(_id),
  },

  Mutation: {
    createImdadReason: async (obj, { name, description }, { user }) => {
      const date = new Date();
      const imdadReasonId = ImdadReasons.insert({
        name,
        description,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return ImdadReasons.findOne(imdadReasonId);
    },

    updateImdadReason: async (obj, { _id, name, description }, { user }) => {
      const date = new Date();
      ImdadReasons.update(_id, {
        $set: {
          name,
          description,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return ImdadReasons.findOne(_id);
    },

    removeImdadReason: async (obj, { _id }) => {
      // Make sure this is not being used in any payment
      const usedCount = ImdadRequests.find({ imdadReasonId: _id }).count();
      if (usedCount > 0) {
        throw new Error(
          'The Imaded Reason cannot be deleted as it is being used.'
        );
      }

      return ImdadReasons.remove(_id);
    },
  },
};
