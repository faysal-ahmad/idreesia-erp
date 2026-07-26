// @ts-nocheck
import { Attachments } from 'meteor/idreesia-common/server/collections/common';

import { createAttachment } from './utilities';

export default {
  Query: {
    attachmentsById: async (obj, { ids }) =>
      await Attachments.find({
        _id: { $in: ids },
      }).fetchAsync(),
  },

  Mutation: {
    createAttachment: async (
      obj,
      { name, description, mimeType, data },
      { user }
    ) => {
      const attachmentId = await createAttachment(
        { name, description, mimeType, data },
        { user }
      );

      return Attachments.findOneAsync(attachmentId);
    },

    updateAttachment: async (obj, { _id, name, description }, { user }) => {
      const date = new Date();
      await Attachments.updateAsync(_id, {
        $set: {
          name,
          description,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Attachments.findOneAsync(_id);
    },
  },
};
