import {
  Karkuns,
  KarkunDuties,
  Attendances,
} from 'meteor/idreesia-common/server/collections/hr';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';

export function deleteKarkun(karkunId) {
  const existingKarkun = Karkuns.findOne(karkunId);
  // Remove the image for the karkun
  if (existingKarkun.imageId) {
    Attachments.remove(existingKarkun.imageId);
  }
  // Remove any file attachments
  if (existingKarkun.attachmentIds) {
    Attachments.remove({ _id: { $in: existingKarkun.attachmentIds } });
  }
  // Remove all attendance records for the karkun
  Attendances.remove({ karkunId: { $eq: karkunId } });
  // Remove all karkun duties
  KarkunDuties.remove({ karkunId: { $eq: karkunId } });

  KarkunDuties.remove({ karkunId });
  return Karkuns.remove(karkunId);
}
