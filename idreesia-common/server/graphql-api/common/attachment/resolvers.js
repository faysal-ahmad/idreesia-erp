import { Attachments } from 'meteor/idreesia-common/server/collections/common';

import { createAttachment } from './utilities';

export default {
  Query: {
    attachmentsById: async (obj, { ids }) =>
      Attachments.find({
        _id: { $in: ids },
      }).fetch(),
  },

  Mutation: {
    createAttachment: async (
      obj,
      { name, description, mimeType, data },
      { user }
    ) => {
      const attachmentId = createAttachment(
        { name, description, mimeType, data },
        { user }
      );

      return Attachments.findOne(attachmentId);
    },

    updateAttachment: async (obj, { _id, name, description }, { user }) => {
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
