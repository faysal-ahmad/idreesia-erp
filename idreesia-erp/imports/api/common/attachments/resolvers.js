import { Attachments } from "meteor/idreesia-common/collections/common";

export default {
  Query: {
    attachmentsById(obj, { ids }) {
      return Attachments.find({
        _id: { $in: ids },
      }).fetch();
    },
  },

  Mutation: {
    createAttachment(obj, { name, mimeType, data }) {
      let updateData = data;
      if (data.startsWith("data:image/jpeg;base64,")) {
        updateData = data.slice(23);
      }
      const attachmentId = Attachments.insert({
        name,
        mimeType,
        data: updateData,
      });

      return Attachments.findOne(attachmentId);
    },
    removeAttachment(obj, { _id }) {
      return Attachments.remove(_id);
    },
  },
};
