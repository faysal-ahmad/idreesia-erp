import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  Committees,
  Salaries,
  Teams,
} from 'meteor/idreesia-common/server/collections/hr';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';
import { MehfilKarkuns } from 'meteor/idreesia-common/server/collections/security';

export async function deleteKarkun(karkunId: string) {
  const existingKarkun = await People.findOneAsync(karkunId);
  const promises: Promise<unknown>[] = [];

  // Remove the image for the karkun
  if (existingKarkun?.sharedData?.imageId) {
    promises.push(Attachments.removeAsync(existingKarkun.sharedData.imageId));
  }
  // Remove any file attachments
  if (existingKarkun?.karkunData?.attachmentIds) {
    promises.push(
      Attachments.removeAsync({
        _id: { $in: existingKarkun.karkunData.attachmentIds },
      })
    );
  }
  // Remove the karkun from team and committee members
  promises.push(
    Teams.updateAsync(
      { 'members.karkunId': karkunId },
      { $pull: { members: { karkunId } } },
      { multi: true }
    )
  );
  promises.push(
    Committees.updateAsync(
      { 'members.karkunId': karkunId },
      { $pull: { members: { karkunId } } },
      { multi: true }
    )
  );
  // Remove all salary records
  promises.push(Salaries.removeAsync({ karkunId: { $eq: karkunId } }));
  // Remove all mehfil karkun records
  promises.push(MehfilKarkuns.removeAsync({ karkunId: { $eq: karkunId } }));

  await Promise.all(promises);
  return People.removeAsync(karkunId);
}
