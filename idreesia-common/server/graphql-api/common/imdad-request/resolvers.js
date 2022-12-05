import {
  Attachments,
  People,
} from 'meteor/idreesia-common/server/collections/common';

export default {
  ImdadRequestType: {
    attachments: async imdadRequestType => {
      const { attachmentIds } = imdadRequestType;
      if (attachmentIds && attachmentIds.length > 0) {
        return Attachments.find({ _id: { $in: attachmentIds } }).fetch();
      }

      return [];
    },

    visitor: async imdadRequestType =>
      People.findOne(imdadRequestType.visitorId),
  },
};
