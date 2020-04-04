import { Visitors } from 'meteor/idreesia-common/server/collections/security';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';

export default {
  ImdadRequestType: {
    attachments: imdadRequestType => {
      const { attachmentIds } = imdadRequestType;
      if (attachmentIds && attachmentIds.length > 0) {
        return Attachments.find({ _id: { $in: attachmentIds } }).fetch();
      }

      return [];
    },
    visitor: imdadRequestType => Visitors.findOne(imdadRequestType.visitorId),
  },
};
