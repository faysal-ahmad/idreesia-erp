import moment from 'moment';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';

function getName() {
  const timestamp = moment();
  return `Image_${timestamp.format('DD-MM-YY_HH:mm')}.jpeg`;
}

export function createAttachment(
  { name, description, mimeType, data },
  { user }
) {
  let updateData = data;
  if (data.startsWith('data:image/jpeg;base64,')) {
    updateData = data.slice(23);
  }

  const date = new Date();
  const attachmentId = Attachments.insert({
    name: name || getName(),
    description,
    mimeType: mimeType || 'image/jpeg',
    data: updateData,
    createdAt: date,
    createdBy: user._id,
    updatedAt: date,
    updatedBy: user._id,
  });

  return attachmentId;
}
