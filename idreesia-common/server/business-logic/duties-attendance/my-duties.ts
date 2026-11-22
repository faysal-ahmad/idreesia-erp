import type { DutyAttendanceStatus } from 'meteor/idreesia-common/constants/duties-attendance';
import {
  DutiesAttendanceDayOverrides,
  DutiesAttendanceDayRecords,
  DutiesAttendanceDuties,
  type DutiesAttendanceDayOverrideDocument,
  type DutiesAttendanceDayRecordDocument,
} from 'meteor/idreesia-common/server/collections/duties-attendance';
import { dayOfWeek } from 'meteor/idreesia-common/server/business-logic/hr/duty-planning-dates';

import { getDutyNames } from './internal';
import { listMyDutiesAttendanceLocations } from './locations';
import { assertDate, composeKarkuns } from './planning';

export interface MyDuty {
  locationId: string;
  locationName: string;
  dutyId: string;
  dutyName: string;
  date: string;
  attendance: DutyAttendanceStatus | null;
}

interface MyDutiesUser {
  _id?: string;
  locked?: boolean;
  isSuperAdmin?: boolean;
  personId?: string | null;
}

/**
 * The duties the user is on for a date, in every location whose Duties and
 * Attendance they can open. Days up to today read the locked record; a later
 * day (or one not locked yet) is composed from the roster and overrides.
 * Nothing is written.
 */
export async function listMyDuties(
  user: MyDutiesUser | null | undefined,
  date: string
): Promise<MyDuty[]> {
  assertDate(date, 'date');
  const karkunId = user?.personId;
  if (!karkunId) return [];

  const locations = (await listMyDutiesAttendanceLocations(user)).filter(
    location => location.hasWorkspace
  );
  if (locations.length === 0) return [];
  const locationNames = new Map(
    locations.map(location => [location.locationId, location.name])
  );

  const duties = await DutiesAttendanceDuties.find({
    locationId: { $in: [...locationNames.keys()] },
    isActive: { $ne: false },
  }).fetchAsync();
  if (duties.length === 0) return [];
  const dutyIds = duties.map(duty => duty._id);

  const records = (await DutiesAttendanceDayRecords.find({
    dutyId: { $in: dutyIds },
    date,
  }).fetchAsync()) as DutiesAttendanceDayRecordDocument[];
  const recordByDuty = new Map(records.map(record => [record.dutyId, record]));
  const overrides = (await DutiesAttendanceDayOverrides.find({
    dutyId: { $in: dutyIds },
    date,
  }).fetchAsync()) as DutiesAttendanceDayOverrideDocument[];
  const overrideByDuty = new Map(
    overrides.map(override => [override.dutyId, override])
  );

  const names = await getDutyNames(duties);
  const weekday = dayOfWeek(date);
  const result: MyDuty[] = [];
  duties.forEach(duty => {
    const record = recordByDuty.get(duty._id);
    const karkuns =
      record?.karkuns ??
      composeKarkuns({
        duty,
        weekday,
        override: overrideByDuty.get(duty._id),
        people: new Map(),
      });
    const mine = karkuns.find(karkun => karkun.karkunId === karkunId);
    if (!mine) return;
    result.push({
      locationId: duty.locationId,
      locationName: locationNames.get(duty.locationId) ?? '',
      dutyId: duty._id,
      dutyName: names.get(duty._id) ?? '',
      date,
      attendance: mine.attendance ?? null,
    });
  });

  return result.sort(
    (left, right) =>
      left.locationName.localeCompare(right.locationName) ||
      left.dutyName.localeCompare(right.dutyName)
  );
}
