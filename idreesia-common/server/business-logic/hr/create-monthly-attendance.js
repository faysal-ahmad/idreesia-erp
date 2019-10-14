import { Random } from 'meteor/random';
import {
  Attendances,
  KarkunDuties,
} from 'meteor/idreesia-common/server/collections/hr';

export function createMonthlyAttendance(formattedMonth) {
  let counter = 0;
  // Get all the current karkun duties
  const karkunDuties = KarkunDuties.find({}).fetch();

  karkunDuties.forEach(({ karkunId, dutyId, shiftId }) => {
    // If there is already an attendance present for this karkun/month/duty/shift combination
    // then update that, otherwise insert a new one.
    const existingAttendance = Attendances.findOne({
      karkunId,
      dutyId,
      shiftId,
      month: formattedMonth,
    });

    if (!existingAttendance) {
      counter++;
      Attendances.insert({
        karkunId,
        dutyId,
        shiftId,
        month: formattedMonth,
        totalCount: 0,
        absentCount: 0,
        presentCount: 0,
        percentage: 0,
        meetingCardBarcodeId: Random.id(8),
      });
    }
  });

  return counter;
}
