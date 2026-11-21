import {
  DutiesAttendanceDayRecords,
  DutiesAttendanceDuties,
  type DutiesAttendanceDayRecordDocument,
} from 'meteor/idreesia-common/server/collections/duties-attendance';

import { dutiesAttendanceError } from './errors';
import {
  ensureDutiesAttendanceIndexes,
  getDutyNames,
  requireDuty,
  requireLocation,
} from './internal';
import { lockDays } from './planning';

// Attendance sheet: monthly totals per karkun and duty, computed from the
// locked day records.

export interface AttendanceSheetRow {
  _id: string;
  /** 'MM-yyyy' */
  month: string;
  karkunId: string;
  name: string;
  dutyId: string;
  dutyName: string;
  daysOnDuty: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  unmarkedCount: number;
  percentage: number;
}

const MONTH_PATTERN = /^(0[1-9]|1[0-2])-\d{4}$/;

// 'MM-yyyy' → first and last possible calendar date strings of the month.
function monthRange(month: string) {
  if (!MONTH_PATTERN.test(month)) {
    throw dutiesAttendanceError('BAD_USER_INPUT', 'Please select a valid month.');
  }
  const [mm, yyyy] = month.split('-');
  return { startDate: `${yyyy}-${mm}-01`, endDate: `${yyyy}-${mm}-31` };
}

export function summarizeAttendance(
  records: DutiesAttendanceDayRecordDocument[],
  dutyNames: Map<string, string>
): AttendanceSheetRow[] {
  const rows = new Map<string, AttendanceSheetRow>();
  const sorted = [...records].sort((left, right) =>
    left.date.localeCompare(right.date)
  );

  for (const record of sorted) {
    const [yyyy, mm] = record.date.split('-');
    const month = `${mm}-${yyyy}`;
    for (const karkun of record.karkuns ?? []) {
      const key = [month, karkun.karkunId, record.dutyId].join('|');
      let row = rows.get(key);
      if (!row) {
        row = {
          _id: key,
          month,
          karkunId: karkun.karkunId,
          name: karkun.name ?? '',
          dutyId: record.dutyId,
          dutyName: dutyNames.get(record.dutyId) ?? '',
          daysOnDuty: 0,
          presentCount: 0,
          lateCount: 0,
          absentCount: 0,
          unmarkedCount: 0,
          percentage: 0,
        };
        rows.set(key, row);
      }
      // Records are sorted by date, so the latest name wins.
      row.name = karkun.name || row.name;
      row.daysOnDuty += 1;
      if (karkun.attendance === 'present') row.presentCount += 1;
      else if (karkun.attendance === 'late') row.lateCount += 1;
      else if (karkun.attendance === 'absent') row.absentCount += 1;
      else row.unmarkedCount += 1;
    }
  }

  return [...rows.values()].map(row => ({
    ...row,
    percentage: row.daysOnDuty
      ? Math.round(((row.presentCount + row.lateCount) / row.daysOnDuty) * 100)
      : 0,
  }));
}

/**
 * The attendance sheet of a month for one duty, or for every duty of the
 * location. Locks the month's past days first, so every day somebody was on
 * duty is counted.
 */
export async function getAttendanceSheet(args: {
  locationId: string;
  month: string;
  dutyId?: string | null;
}): Promise<AttendanceSheetRow[]> {
  await ensureDutiesAttendanceIndexes();
  const { startDate, endDate } = monthRange(args.month);
  await requireLocation(args.locationId);

  const duties = args.dutyId
    ? [await requireDuty(args.dutyId, { locationId: args.locationId })]
    : await DutiesAttendanceDuties.find({
        locationId: args.locationId,
      }).fetchAsync();

  for (const duty of duties) {
    await lockDays(duty, startDate, endDate);
  }

  const records = await DutiesAttendanceDayRecords.find({
    locationId: args.locationId,
    dutyId: { $in: duties.map(({ _id }) => _id) },
    date: { $gte: startDate, $lte: endDate },
  }).fetchAsync();

  return summarizeAttendance(
    records,
    await getDutyNames(duties)
  ).sort(
    (left, right) =>
      left.name.localeCompare(right.name) ||
      left.dutyName.localeCompare(right.dutyName)
  );
}
