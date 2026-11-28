import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  Duties,
  DutyDayAttendances,
  DutyLocations,
  DutyShifts,
} from 'meteor/idreesia-common/server/collections/hr';

import { getPersonImageUrls } from '../common/person-images';
import { hrError } from '../hr-common/errors';
import { createKioskToken, verifyKioskToken } from './kiosk-token';
import { findKarkunByFaceImage } from '../common/find-karkun-by-face-image';
import { getKarkunDutyAttendanceSheet, type DayKarkun } from './duty-planning';
import { karachiMinutesOfDay as minutesOfDay, todayInKarachi } from '../hr-common/duty-planning-dates';

export interface KioskDutyAttendance {
  // One row per duty, location and shift the karkun was on this month.
  key: string;
  dutyName: string;
  locationName: string;
  shiftName: string;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  percentage: number;
}

export interface KioskUpcomingDuty {
  key: string;
  dutyName: string;
  locationName: string;
  shiftName: string;
  // Karachi time of day, e.g. '9:00 AM'; null when the shift has no times.
  startTime: string | null;
  endTime: string | null;
  // Karachi time of day the karkun checked in / out today, e.g. '9:03 AM'.
  checkedInAt: string | null;
  checkedOutAt: string | null;
}

export interface KioskKarkunRecord {
  // Proves this karkun was just matched; the kiosk sends it back to check in or out.
  token: string;
  name: string | null;
  imageUrl: string | null;
  // The month the attendance is for, e.g. 'November'.
  monthName: string;
  attendance: KioskDutyAttendance[];
  // Today's duties that have not ended yet, by start time.
  upcomingDuties: KioskUpcomingDuty[];
}

export interface AttendanceKioskResult {
  // See findKarkunByFaceImage.
  status: string;
  match: KioskKarkunRecord | null;
}

// Same Karachi month the attendance is computed for.
const currentMonthName = () =>
  new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'Asia/Karachi' }).format(
    new Date()
  );

/**
 * A karkun's attendance for the current month (Karachi time), one row per
 * duty, location and shift.
 */
export async function getKarkunMonthDutyAttendance(
  karkunId: string
): Promise<KioskDutyAttendance[]> {
  const [yyyy, mm] = todayInKarachi().split('-');
  const month = `${mm}-${yyyy}`;
  const rows = (await getKarkunDutyAttendanceSheet(karkunId)).filter(
    row => row.month === month
  );

  const duties = (await Duties.find({
    _id: { $in: [...new Set(rows.map(row => row.dutyId))] },
  }).fetchAsync()) as Array<{ _id: string; name: string }>;
  const locations = (await DutyLocations.find({
    _id: { $in: [...new Set(rows.map(row => row.locationId))] },
  }).fetchAsync()) as Array<{ _id: string; name: string }>;
  const dutyNames = new Map(duties.map(duty => [duty._id, duty.name]));
  const locationNames = new Map(locations.map(location => [location._id, location.name]));

  return rows
    .map(row => ({
      key: row._id,
      dutyName: dutyNames.get(row.dutyId) ?? '',
      locationName: locationNames.get(row.locationId) ?? '',
      shiftName: row.shiftName,
      presentCount: row.presentCount,
      lateCount: row.lateCount,
      absentCount: row.absentCount,
      percentage: row.percentage,
    }))
    .sort(
      (left, right) =>
        left.dutyName.localeCompare(right.dutyName) ||
        left.locationName.localeCompare(right.locationName) ||
        left.shiftName.localeCompare(right.shiftName)
    );
}

const formatMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  return `${hours % 12 || 12}:${String(minutes % 60).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;
};

const formatTime = (value: Date | null | undefined) => {
  const minutes = minutesOfDay(value);
  return minutes === null ? null : formatMinutes(minutes);
};

interface TodaysDuty {
  record: {
    _id: string;
    dutyId: string;
    locationId: string;
    shiftId: string;
    shiftName: string;
  };
  start: number | null;
  end: number | null;
  checkInAt: Date | null;
  checkOutAt: Date | null;
  dutyName: string;
  locationName: string;
}

/**
 * The shifts the karkun is on duty for today (Karachi) that still matter:
 * not ended yet, or checked in and not yet checked out. Ordered by start
 * time; shifts without times come last. Read from today's locked day
 * records, which the daily job creates.
 */
async function getKarkunTodaysDuties(karkunId: string, now: Date): Promise<TodaysDuty[]> {
  const records = (await DutyDayAttendances.find({
    date: todayInKarachi(now),
    'karkuns.karkunId': karkunId,
  }).fetchAsync()) as unknown as Array<
    TodaysDuty['record'] & { karkuns: Array<DayKarkun> }
  >;
  if (records.length === 0) return [];

  const [duties, locations, shifts] = (await Promise.all([
    Duties.find({ _id: { $in: [...new Set(records.map(r => r.dutyId))] } }).fetchAsync(),
    DutyLocations.find({
      _id: { $in: [...new Set(records.map(r => r.locationId))] },
    }).fetchAsync(),
    DutyShifts.find({ _id: { $in: [...new Set(records.map(r => r.shiftId))] } }).fetchAsync(),
  ])) as Array<Array<{ _id: string; name: string; startTime?: string; endTime?: string }>>;
  const dutyNames = new Map(duties.map(d => [d._id, d.name]));
  const locationNames = new Map(locations.map(l => [l._id, l.name]));
  const shiftTimes = new Map(shifts.map(shift => [shift._id, shift]));

  const nowMinutes = minutesOfDay(now) ?? 0;

  return records
    .map(({ karkuns, ...record }) => {
      const shift = shiftTimes.get(record.shiftId);
      const entry = karkuns.find(karkun => karkun.karkunId === karkunId);
      return {
        record,
        start: minutesOfDay(shift?.startTime),
        end: minutesOfDay(shift?.endTime),
        checkInAt: entry?.checkInAt ?? null,
        checkOutAt: entry?.checkOutAt ?? null,
        dutyName: dutyNames.get(record.dutyId) ?? '',
        locationName: locationNames.get(record.locationId) ?? '',
      };
    })
    .filter(({ start, end, checkInAt, checkOutAt }) => {
      if (checkInAt && !checkOutAt) return true;
      if (start === null || end === null) return true;
      // A shift that ends at or before it starts runs past midnight.
      const endAdjusted = end <= start ? end + 24 * 60 : end;
      return endAdjusted > nowMinutes;
    })
    .sort(
      (left, right) =>
        (left.start ?? Number.MAX_SAFE_INTEGER) - (right.start ?? Number.MAX_SAFE_INTEGER) ||
        left.record.shiftName.localeCompare(right.record.shiftName)
    );
}

export async function getKarkunUpcomingDuties(
  karkunId: string,
  now = new Date()
): Promise<KioskUpcomingDuty[]> {
  const duties = await getKarkunTodaysDuties(karkunId, now);
  return duties.map(duty => ({
    key: duty.record._id,
    dutyName: duty.dutyName,
    locationName: duty.locationName,
    shiftName: duty.record.shiftName,
    startTime: duty.start === null ? null : formatMinutes(duty.start),
    endTime: duty.end === null ? null : formatMinutes(duty.end),
    checkedInAt: formatTime(duty.checkInAt),
    checkedOutAt: formatTime(duty.checkOutAt),
  }));
}

/**
 * Checks the karkun in for the first of today's duties (by start time) that
 * has not ended and that they have not checked in to yet.
 */
export async function checkInKarkun(karkunId: string, now = new Date()) {
  const duties = await getKarkunTodaysDuties(karkunId, now);
  const duty = duties.find(({ checkInAt }) => !checkInAt);
  if (!duty) {
    throw hrError(
      'NOT_FOUND',
      duties.length > 0
        ? 'You have already checked in for all of your duties today.'
        : 'You have no duty to check in for today.'
    );
  }
  return setCheckTime(duty.record._id, karkunId, 'checkInAt', now);
}

/**
 * Checks the karkun out of the duty they most recently checked in to and
 * have not checked out of yet.
 */
export async function checkOutKarkun(karkunId: string, now = new Date()) {
  const duties = await getKarkunTodaysDuties(karkunId, now);
  const duty = duties
    .filter(({ checkInAt, checkOutAt }) => checkInAt && !checkOutAt)
    .sort((left, right) => right.checkInAt!.getTime() - left.checkInAt!.getTime())[0];
  if (!duty) throw hrError('NOT_FOUND', 'You have no duty to check out of.');
  return setCheckTime(duty.record._id, karkunId, 'checkOutAt', now);
}

async function setCheckTime(
  recordId: string,
  karkunId: string,
  field: 'checkInAt' | 'checkOutAt',
  now: Date
) {
  // Only sets a time that is not set yet, so a double tap (or two kiosks)
  // can't move an earlier check in or check out later.
  const updated = await DutyDayAttendances.updateAsync(
    {
      _id: recordId,
      karkuns: { $elemMatch: { karkunId, [field]: { $exists: false } } },
    },
    { $set: { [`karkuns.$.${field}`]: now, updatedAt: now } }
  );
  if (updated === 0) {
    throw hrError(
      'CONFLICT',
      field === 'checkInAt' ? 'You are already checked in.' : 'You are already checked out.'
    );
  }
  return now;
}

async function buildKioskRecord(
  karkunId: string,
  name: string | null,
  imageUrl: string | null
): Promise<KioskKarkunRecord> {
  return {
    token: createKioskToken(karkunId),
    name,
    imageUrl,
    monthName: currentMonthName(),
    attendance: await getKarkunMonthDutyAttendance(karkunId),
    upcomingDuties: await getKarkunUpcomingDuties(karkunId),
  };
}

/**
 * What the public attendance kiosk shows for a face photo: the matched
 * karkun's token, name and photo, their attendance this month and today's duties.
 * The kiosk sends the token back to check in or out.
 */
export async function findKarkunRecordByFaceImage(
  imageData: string
): Promise<AttendanceKioskResult> {
  const { status, match } = await findKarkunByFaceImage(imageData);
  if (!match) return { status, match: null };

  return {
    status,
    match: await buildKioskRecord(match.personId, match.name, match.imageUrl),
  };
}

/**
 * Checks in or out the karkun a token (from a match) was issued for, and returns their kiosk record as it is
 * afterwards.
 */
export async function recordKarkunCheckIn(
  token: unknown,
  action: 'check-in' | 'check-out'
): Promise<KioskKarkunRecord> {
  const karkunId = verifyKioskToken(token);
  const person = (await People.findOneAsync({ _id: karkunId, isKarkun: true })) as
    | {
        sharedData?: {
          name?: string | null;
          imageKey?: string | null;
          imageThumbnailKey?: string | null;
        };
      }
    | undefined;
  if (!person) throw hrError('NOT_FOUND', 'This karkun was not found.');

  if (action === 'check-in') await checkInKarkun(karkunId);
  else await checkOutKarkun(karkunId);

  return buildKioskRecord(
    karkunId,
    person.sharedData?.name ?? null,
    getPersonImageUrls(person.sharedData).imageUrl
  );
}
