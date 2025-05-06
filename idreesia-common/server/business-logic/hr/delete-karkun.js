import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  KarkunDuties,
  Attendances,
  Salaries,
} from 'meteor/idreesia-common/server/collections/hr';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';
import { MehfilKarkuns } from 'meteor/idreesia-common/server/collections/security';

export async function deleteKarkun(karkunId) {
  const existingKarkun = await People.findOneAsync(karkunId);
  const promises = [];

  // Remove the image for the karkun
  if (existingKarkun.sharedData.imageId) {
    promises.push(Attachments.removeAsync(existingKarkun.sharedData.imageId));
  }
  // Remove any file attachments
  if (existingKarkun.karkunData.attachmentIds) {
    promises.push(
      Attachments.removeAsync({
        _id: { $in: existingKarkun.karkunData.attachmentIds },
      })
    );
  }
  // Remove all attendance records for the karkun
  promises.push(Attendances.removeAsync({ karkunId: { $eq: karkunId } }));
  // Remove all karkun duties
  promises.push(KarkunDuties.removeAsync({ karkunId: { $eq: karkunId } }));
  // Remove all salary records
  promises.push(Salaries.removeAsync({ karkunId: { $eq: karkunId } }));
  // Remove all mehfil karkun records
  promises.push(MehfilKarkuns.removeAsync({ karkunId: { $eq: karkunId } }));

  await Promise.all(promises);
  return People.removeAsync(karkunId);
}
