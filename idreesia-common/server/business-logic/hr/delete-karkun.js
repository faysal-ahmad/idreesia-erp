import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  KarkunDuties,
  Attendances,
  Salaries,
} from 'meteor/idreesia-common/server/collections/hr';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';
import { MehfilKarkuns } from 'meteor/idreesia-common/server/collections/security';

export function deleteKarkun(karkunId) {
  const existingKarkun = People.findOne(karkunId);
  // Remove the image for the karkun
  if (existingKarkun.sharedData.imageId) {
    Attachments.remove(existingKarkun.sharedData.imageId);
  }
  // Remove any file attachments
  if (existingKarkun.karkunData.attachmentIds) {
    Attachments.remove({
      _id: { $in: existingKarkun.karkunData.attachmentIds },
    });
  }
  // Remove all attendance records for the karkun
  Attendances.remove({ karkunId: { $eq: karkunId } });
  // Remove all karkun duties
  KarkunDuties.remove({ karkunId: { $eq: karkunId } });
  // Remove all salary records
  Salaries.remove({ karkunId: { $eq: karkunId } });
  // Remove all mehfil karkun records
  MehfilKarkuns.remove({ karkunId: { $eq: karkunId } });

  return People.remove(karkunId);
}
