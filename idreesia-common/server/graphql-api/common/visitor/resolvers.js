import { Attachments } from 'meteor/idreesia-common/server/collections/common';

export default {
  VisitorType: {
    image: visitorType => {
      const { imageId } = visitorType;
      if (imageId) {
        return Attachments.findOne({ _id: { $eq: imageId } });
      }

      return null;
    },
  },
};
