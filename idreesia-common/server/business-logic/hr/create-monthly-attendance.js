import { Random } from 'meteor/random';
import {
  Attendances,
  KarkunDuties,
  Karkuns,
} from 'meteor/idreesia-common/server/collections/hr';

export function createMonthlyAttendance(formattedMonth) {
  let counter = 0;
  // Get all the karkuns who are employees and have a job assigned to them
  const karkuns = Karkuns.find({
    isEmployee: true,
    jobId: { $exists: true, $ne: null },
  }).fetch();

  karkuns.forEach(({ _id, jobId }) => {
    // If there is already an attendance present for this karkun/month/job combination
    // then update that, otherwise insert a new one.
    const existingAttendance = Attendances.findOne({
      karkunId: _id,
      jobId,
      month: formattedMonth,
    });

    if (!existingAttendance) {
      counter++;
      Attendances.insert({
        karkunId: _id,
        jobId,
        month: formattedMonth,
        totalCount: 0,
        absentCount: 0,
        presentCount: 0,
        percentage: 0,
        meetingCardBarcodeId: Random.id(8),
      });
    }
  });

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
