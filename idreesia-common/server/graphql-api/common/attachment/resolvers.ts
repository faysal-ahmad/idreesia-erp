import { Attachments } from 'meteor/idreesia-common/server/collections/common';

import { createAttachment } from './utilities';

interface AttachmentArgs {
  _id: string;
  ids: string[];
  name?: string;
  description?: string;
  mimeType?: string;
  data: string;
}

interface ResolverContext {
  user: {
    _id: string;
  };
}

export default {
  Query: {
    attachmentsById: async (_obj: unknown, { ids }: Pick<AttachmentArgs, 'ids'>) =>
      await Attachments.find({
        _id: { $in: ids },
      }).fetchAsync(),
  },

  Mutation: {
    createAttachment: async (
      _obj: unknown,
      { name, description, mimeType, data }: AttachmentArgs,
      { user }: ResolverContext
    ) => {
      const attachmentId = await createAttachment(
        { name, description, mimeType, data },
        { user }
      );

      return Attachments.findOneAsync(attachmentId);
    },

    updateAttachment: async (
      _obj: unknown,
      { _id, name, description }: AttachmentArgs,
      { user }: ResolverContext
    ) => {
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
