import {
  Attendances,
  Karkuns,
} from 'meteor/idreesia-common/server/collections/hr';
import { Portals } from 'meteor/idreesia-common/server/collections/portals';

export function createMonthlyAttendance(portalId, formattedMonth, user) {
  let counter = 0;
  const portal = Portals.findOne(portalId);

  // Get all the karkuns for the portal
  const karkuns = Karkuns.find({
    cityId: { $in: portal.cityIds },
  }).fetch();

  const date = new Date();
  karkuns.forEach(({ _id }) => {
    // Create a new attendance if one does not exist for this karkun combination
    const existingAttendance = Attendances.findOne({
      karkunId: _id,
      month: formattedMonth,
    });

    if (!existingAttendance) {
      counter++;
      Attendances.insert({
        karkunId: _id,
        month: formattedMonth,
        totalCount: 0,
        absentCount: 0,
        presentCount: 0,
        percentage: 0,
        createdAt: date,
        createdBy: user._id,
      });
    }
  });

  return counter;
}
