import { Migrations } from 'meteor/quave:migrations';

import {
  Attachments,
  People,
} from 'meteor/idreesia-common/server/collections/common';
import { StockItems } from 'meteor/idreesia-common/server/collections/inventory';

// Images and attachments now live only in object storage (imageKey /
// fileKey). Drop the leftover legacy Attachments references - all null by
// now - and any inline base64 attachment content.
Migrations.add({
  version: 66,
  async up() {
    await People.rawCollection().updateMany(
      {
        $or: [
          { 'sharedData.imageId': { $exists: true } },
          { 'sharedData.imageThumbnailId': { $exists: true } },
        ],
      },
      {
        $unset: {
          'sharedData.imageId': '',
          'sharedData.imageThumbnailId': '',
        },
      }
    );
    await StockItems.rawCollection().updateMany(
      { imageId: { $exists: true } },
      { $unset: { imageId: '' } }
    );
    await Attachments.rawCollection().updateMany(
      { data: { $exists: true } },
      { $unset: { data: '' } }
    );
  },
});
