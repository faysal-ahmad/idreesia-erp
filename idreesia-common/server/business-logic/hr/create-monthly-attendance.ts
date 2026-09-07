import { Random } from 'meteor/random';
import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  Attendances,
  KarkunDuties,
} from 'meteor/idreesia-common/server/collections/hr';
import type { ProgressReporter } from 'meteor/idreesia-common/server/business-logic/jobs/report-progress';

export async function createMonthlyAttendance(
  formattedMonth: string,
  user: { _id: string },
  reportProgress?: ProgressReporter
) {
  let counter = 0;
  // Get all the people who are employees and have a job assigned to them
  const people = await People.find({
    isEmployee: true,
    'employeeData.jobId': { $exists: true, $ne: null },
    deletedAt: { $exists: false },
  }).fetchAsync();

  // Get all the current karkun duties - fetched up front (rather than after
  // the first loop) so `total` spans both loops and progress reads as one
  // continuous 0-100 scale instead of resetting when the second loop starts.
  const karkunDuties = await KarkunDuties.find({}).fetchAsync();
  const total = people.length + karkunDuties.length;

  const date = new Date();
  let processed = 0;
  for (const { _id, employeeData } of people) {
    processed++;
    await reportProgress?.(processed / total);

    const jobId = employeeData?.jobId;
    if (!jobId) {
      continue;
    }

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

  for (const { karkunId, dutyId, shiftId } of karkunDuties) {
    processed++;
    await reportProgress?.(processed / total);

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
