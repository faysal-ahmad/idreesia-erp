import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';

type LoaderRecord = Record<string, unknown>;

export async function getAttachments(attachmentIds: readonly string[]) {
  const attachments = await Attachments.find({
    _id: { $in: attachmentIds },
  }).fetchAsync();

  const attachmentsMap = keyBy(attachments, '_id') as unknown as Record<
    string,
    LoaderRecord
  >;
  return attachmentIds.map(id => attachmentsMap[id]);
}

export const attachmentsDataLoader = () =>
  new DataLoader<string, LoaderRecord | undefined>(getAttachments);
