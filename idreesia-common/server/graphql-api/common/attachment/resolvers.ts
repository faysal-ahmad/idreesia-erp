import { updateAttachmentDetails } from 'meteor/idreesia-common/server/business-logic/common/stored-attachments';

import { assertCanManageAttachment, type AttachmentUser } from './access';

interface AttachmentArgs {
  _id: string;
  name?: string;
  description?: string;
}

interface ResolverContext {
  user: AttachmentUser & { _id: string };
}

export default {
  Mutation: {
    // What an attachment belongs to is only known from its category and the
    // form that holds it, so access is checked here, not with a directive.
    updateAttachment: async (
      _obj: unknown,
      { _id, name, description }: AttachmentArgs,
      { user }: ResolverContext
    ) => {
      await assertCanManageAttachment(user, _id);
      return updateAttachmentDetails(_id, { name, description }, user._id);
    },
  },
};
