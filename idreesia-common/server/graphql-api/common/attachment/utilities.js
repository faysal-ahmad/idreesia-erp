import { formatDate } from 'meteor/idreesia-common/utilities/date-fns';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';

function getName() {
  return `Image_${formatDate(new Date(), 'DD-MM-YY_HH:mm')}.jpeg`;
}

export async function createAttachment(
  { name, description, mimeType, data },
  { user }
) {
  let updateData = data;
  if (data.startsWith('data:image/jpeg;base64,')) {
    updateData = data.slice(23);
  }

  const date = new Date();
  const attachmentId = await Attachments.insertAsync({
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
