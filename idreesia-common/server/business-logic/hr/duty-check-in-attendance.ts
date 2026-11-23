import {
  DutyDayAttendances,
  DutyShifts,
} from 'meteor/idreesia-common/server/collections/hr';

import type { DayKarkun, DutyAttendanceStatus } from './duty-planning';
import {
  addCalendarDays,
  karachiDateTime,
  karachiMinutesOfDay,
  todayInKarachi,
} from './duty-planning-dates';

// A karkun who checks in up to this long after the shift starts still counts
// as present; after that they are late.
export const LATE_GRACE_MINUTES = 15;

/**
 * The attendance a check-in time earns for a shift starting at `shiftStart`:
 * absent without a check-in, present within the grace period, late after it.
 */
export function attendanceFromCheckIn(
  checkInAt: Date | null | undefined,
  shiftStart: Date
): DutyAttendanceStatus {
  if (!checkInAt) return 'absent';
  const graceEnd = shiftStart.getTime() + LATE_GRACE_MINUTES * 60 * 1000;
  return checkInAt.getTime() <= graceEnd ? 'present' : 'late';
}

/**
 * Marks present / late / absent for every karkun on duty on `date` (the
 * previous day by default) from their check-in time and their shift's start
 * time. Marks that were already set, by hand or by an earlier run, are left
 * alone. A shift with no start time can't be judged late: a karkun who
 * checked in is present, and one who didn't stays unmarked. Returns the
 * number of karkuns marked.
 */
export async function markAttendanceFromCheckIns(
  user: { _id: string },
  date = addCalendarDays(todayInKarachi(), -1),
  reportProgress?: (fraction: number) => Promise<void>
) {
  const records = (await DutyDayAttendances.find({ date }).fetchAsync()) as unknown as Array<{
    _id: string;
    shiftId: string;
    karkuns: DayKarkun[];
  }>;
  const shifts = (await DutyShifts.find({
    _id: { $in: [...new Set(records.map(record => record.shiftId))] },
  }).fetchAsync()) as unknown as Array<{ _id: string; startTime?: string | null }>;
  const startMinutes = new Map(
    shifts.map(shift => [shift._id, karachiMinutesOfDay(shift.startTime)])
  );

  let marked = 0;
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    const start = startMinutes.get(record.shiftId) ?? null;

    for (const karkun of record.karkuns) {
      if (karkun.attendance) continue;

      let status: DutyAttendanceStatus | null;
      if (start === null) {
        status = karkun.checkInAt ? 'present' : null;
      } else {
        status = attendanceFromCheckIn(karkun.checkInAt, karachiDateTime(date, start));
      }
      if (!status) continue;

      const now = new Date();
       
      const updated = await DutyDayAttendances.updateAsync(
        {
          _id: record._id,
          karkuns: {
            $elemMatch: { karkunId: karkun.karkunId, attendance: { $exists: false } },
          },
        },
        {
          $set: {
            'karkuns.$.attendance': status,
            'karkuns.$.attendanceUpdatedAt': now,
            'karkuns.$.attendanceUpdatedBy': user._id,
            updatedAt: now,
            updatedBy: user._id,
          },
        }
      );
      marked += updated;
    }
     
    if (reportProgress) await reportProgress((index + 1) / records.length);
  }

  if (reportProgress && records.length === 0) await reportProgress(1);
  return marked;
}
