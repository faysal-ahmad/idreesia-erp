import { Attachments } from 'meteor/idreesia-common/server/collections/common';

export default {
  Query: {
    attachmentsById(obj, { ids }) {
      return Attachments.find({
        _id: { $in: ids },
      }).fetch();
    },
  },

  Mutation: {
    createAttachment(obj, { name, description, mimeType, data }, { user }) {
      let updateData = data;
      if (data.startsWith('data:image/jpeg;base64,')) {
        updateData = data.slice(23);
      }

      const date = new Date();
      const attachmentId = Attachments.insert({
        name,
        description,
        mimeType,
        data: updateData,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Attachments.findOne(attachmentId);
    },

    updateAttachment(obj, { _id, name, description }, { user }) {
      const date = new Date();
      Attachments.update(_id, {
        $set: {
          name,
          description,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Attachments.findOne(_id);
    },
  },
};
