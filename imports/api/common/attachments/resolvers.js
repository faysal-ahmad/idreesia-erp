import { Attachments } from '/imports/lib/collections/common';

export default {
  Query: {
    attachmentsById(obj, { ids }) {
      return Attachments.find({
        _id: { $in: ids },
      }).fetch();
    },
  },

  Mutation: {
    createAttachment(obj, { name, data }) {
      const attachmentId = Attachments.insert({
        name,
        data,
      });

      return Attachments.findOne(attachmentId);
    },
    removeAttachment(obj, { _id }) {
      return Attachments.remove(_id);
    },
  },
};
