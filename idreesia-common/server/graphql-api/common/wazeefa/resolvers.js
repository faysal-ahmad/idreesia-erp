import { Attachments } from 'meteor/idreesia-common/server/collections/common';

export default {
  WazeefaType: {
    images: wazeefaType => {
      const { imageIds } = wazeefaType;
      if (imageIds && imageIds.length > 0) {
        return Attachments.find({ _id: { $in: imageIds } }).fetch();
      }

      return [];
    },
  },
};
