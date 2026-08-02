import {
  Attachments,
  People,
} from 'meteor/idreesia-common/server/collections/common';

interface ImdadRequestType {
  attachmentIds?: string[];
  visitorId: string;
}

export default {
  ImdadRequestType: {
    attachments: async (imdadRequestType: ImdadRequestType) => {
      const { attachmentIds } = imdadRequestType;
      if (attachmentIds && attachmentIds.length > 0) {
        return Attachments.find({ _id: { $in: attachmentIds } }).fetchAsync();
      }

      return [];
    },

    visitor: async (imdadRequestType: ImdadRequestType) =>
      People.findOneAsync(imdadRequestType.visitorId),
  },
};
