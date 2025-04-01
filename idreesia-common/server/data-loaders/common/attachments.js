import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';

export async function getAttachments(attachmentIds) {
  const attachments = await Attachments.find({
    _id: { $in: attachmentIds },
  }).fetchAsync();

  const attachmentsMap = keyBy(attachments, '_id');
  return attachmentIds.map(id => attachmentsMap[id]);
}

export const attachmentsDataLoader = () => new DataLoader(getAttachments);
