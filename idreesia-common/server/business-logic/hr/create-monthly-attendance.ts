import { Random } from 'meteor/random';
import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  Attendances,
  KarkunDuties,
} from 'meteor/idreesia-common/server/collections/hr';

export async function createMonthlyAttendance(formattedMonth: string, user: { _id: string }) {
  let counter = 0;
  // Get all the people who are employees and have a job assigned to them
  const people = await People.find({
    isEmployee: true,
    'employeeData.jobId': { $exists: true, $ne: null },
  }).fetchAsync();

  const date = new Date();
  for (const { _id, employeeData: { jobId } } of people) {
    // Create a new attendance if one does not exist for this karkun/month/job combination
    const existingAttendance = await Attendances.findOneAsync({
      karkunId: _id,
      jobId,
      month: formattedMonth,
    });

    if (!existingAttendance) {
      counter++;
      await Attendances.insertAsync({
        karkunId: _id,
        jobId,
        month: formattedMonth,
        totalCount: 0,
        absentCount: 0,
        presentCount: 0,
        percentage: 0,
        meetingCardBarcodeId: Random.id(8),
        createdAt: date,
        createdBy: user._id,
      });
    }
  }

  // Get all the current karkun duties
  const karkunDuties = await KarkunDuties.find({}).fetchAsync();

  for (const { karkunId, dutyId, shiftId } of karkunDuties) {
    // If there is already an attendance present for this karkun/month/duty/shift combination
    // then update that, otherwise insert a new one.
    const existingAttendance = await Attendances.findOneAsync({
      karkunId,
      dutyId,
      shiftId,
      month: formattedMonth,
    });

    if (!existingAttendance) {
      counter++;
      await Attendances.insertAsync({
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
  }

  return counter;
}
