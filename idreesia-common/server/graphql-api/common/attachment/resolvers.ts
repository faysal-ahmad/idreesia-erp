import { Attachments } from 'meteor/idreesia-common/server/collections/common';

interface AttachmentArgs {
  _id: string;
  name?: string;
  description?: string;
}

interface ResolverContext {
  user: {
    _id: string;
  };
}

export default {
  Mutation: {
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
