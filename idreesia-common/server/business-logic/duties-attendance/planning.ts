import {
  DUTIES_ATTENDANCE_MAX_SOURCE_LENGTH,
  DUTIES_ATTENDANCE_PLAN_DAY_COUNT,
  DUTIES_ATTENDANCE_SELF_SOURCE,
  DutyAttendanceStatuses,
  type DutyAttendanceStatus,
} from 'meteor/idreesia-common/constants/duties-attendance';
import {
  isInTransaction,
  runInTransaction,
} from 'meteor/idreesia-common/server/collections';
import { OrgLocationFeatureAllowedTypes } from 'meteor/idreesia-common/constants/organization';
import { OrgLocations } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { getPersonImageUrls } from 'meteor/idreesia-common/server/business-logic/common/person-images';
import {
  DutiesAttendanceDayOverrides,
  DutiesAttendanceDayRecords,
  DutiesAttendanceDuties,
  type AttendanceGeoLocation,
  type DayRecordKarkun,
  type DutiesAttendanceDayOverrideDocument,
  type DutiesAttendanceDayRecordDocument,
  type DutiesAttendanceDutyDocument,
  type DutyMember,
} from 'meteor/idreesia-common/server/collections/duties-attendance';
import {
  addCalendarDays,
  dayOfWeek,
  formatKarachiDate,
  isCalendarDate,
  todayInKarachi,
  type DayOfWeek,
} from 'meteor/idreesia-common/server/business-logic/hr-common/duty-planning-dates';
import { ensureKarkuns } from 'meteor/idreesia-common/server/business-logic/hr-karkuns/ensure-karkuns';

import { dutiesAttendanceError } from './errors';
import { assertWithinGeofence } from './geofence';
import {
  ensureDutiesAttendanceIndexes,
  isDuplicateKey,
  requireDuty,
  requireLocation,
  requireUserId,
  stamp,
  touch,
  uniqueIds,
} from './internal';

// A duty has a direct roster: its members, each optionally limited to some
// weekdays. Future days are planned by changing the roster or by per-day
// overrides (people added for, or taken off, a single day). At the start of
// each day the roster for that day is written to a day record and locked;
// from then on only attendance can change. Dates are YYYY-MM-DD strings in
// the Asia/Karachi time zone.

interface PersonDocument {
  _id: string;
  sharedData?: {
    name?: string | null;
    contactNumber1?: string | null;
    contactNumber2?: string | null;
    imageKey?: string | null;
    imageThumbnailKey?: string | null;
  } | null;
}

async function loadPeople(ids: string[]): Promise<Map<string, PersonDocument>> {
  const unique = uniqueIds(ids);
  if (unique.length === 0) return new Map();
  const people = (await People.find({
    _id: { $in: unique },
  }).fetchAsync()) as PersonDocument[];
  return new Map(people.map(person => [person._id, person]));
}

const personName = (people: Map<string, PersonDocument>, karkunId: string) =>
  people.get(karkunId)?.sharedData?.name || '';

const personImages = (people: Map<string, PersonDocument>, karkunId: string) =>
  getPersonImageUrls(people.get(karkunId)?.sharedData);

const personContacts = (people: Map<string, PersonDocument>, karkunId: string) => {
  const shared = people.get(karkunId)?.sharedData;
  return {
    contactNumber1: shared?.contactNumber1 || null,
    contactNumber2: shared?.contactNumber2 || null,
  };
};

export function assertDate(value: string, label: string) {
  if (!isCalendarDate(value)) {
    throw dutiesAttendanceError(
      'BAD_USER_INPUT',
      `Please select a valid ${label}.`
    );
  }
}

export function datesBetween(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  for (
    let cursor = startDate;
    cursor <= endDate;
    cursor = addCalendarDays(cursor, 1)
  ) {
    dates.push(cursor);
  }
  return dates;
}

const byName = <T extends { name: string }>(left: T, right: T) =>
  left.name.localeCompare(right.name);

function memberAvailable(member: DutyMember, weekday: DayOfWeek) {
  const days = member.daysOfWeek ?? [];
  return days.length === 0 || days.includes(weekday);
}

function overrideIds(override?: DutiesAttendanceDayOverrideDocument) {
  const addedKarkunIds = uniqueIds(override?.addedKarkunIds);
  const absentKarkunIds = uniqueIds(override?.absentKarkunIds).filter(
    karkunId => !addedKarkunIds.includes(karkunId)
  );
  return { addedKarkunIds, absentKarkunIds };
}

/** Who is on duty on a day: available members, less absent, plus added. */
export function composeKarkuns(args: {
  duty: DutiesAttendanceDutyDocument;
  weekday: DayOfWeek;
  override?: DutiesAttendanceDayOverrideDocument;
  people: Map<string, PersonDocument>;
}): DayRecordKarkun[] {
  const { duty, weekday, people } = args;
  const { addedKarkunIds, absentKarkunIds } = overrideIds(args.override);
  const byKarkun = new Map<string, DayRecordKarkun>();

  (duty.members ?? []).forEach(member => {
    if (!member?.karkunId || byKarkun.has(member.karkunId)) return;
    if (!memberAvailable(member, weekday)) return;
    if (absentKarkunIds.includes(member.karkunId)) return;
    byKarkun.set(member.karkunId, {
      karkunId: member.karkunId,
      name: personName(people, member.karkunId),
      addedForDay: false,
    });
  });

  addedKarkunIds.forEach(karkunId => {
    const existing = byKarkun.get(karkunId);
    if (existing) {
      existing.addedForDay = true;
      return;
    }
    byKarkun.set(karkunId, {
      karkunId,
      name: personName(people, karkunId),
      addedForDay: true,
    });
  });

  return [...byKarkun.values()].sort((left, right) =>
    (left.name ?? '').localeCompare(right.name ?? '')
  );
}

/**
 * The first day a duty is planned: the day it was created or last made active.
 * Its roster can still be set up on that day (see lockDutyDaysThroughToday).
 */
export const firstPlanningDate = () => todayInKarachi();

/** The first day the duty has day records (YYYY-MM-DD). */
export function dutyStartDate(duty: DutiesAttendanceDutyDocument) {
  return (
    duty.startDate ||
    (duty.createdAt
      ? addCalendarDays(formatKarachiDate(duty.createdAt), 1)
      : '0000-01-01')
  );
}

/**
 * Writes the locked day record for every date in the range that has no record
 * yet, from the day the duty starts. Dates after today are ignored: they are
 * still being planned. A day nobody is on duty still gets a (empty) record,
 * so a roster set up later is never applied to days that came before it. An
 * inactive duty is not planned.
 */
export async function lockDays(
  duty: DutiesAttendanceDutyDocument,
  fromDate: string,
  toDate: string
) {
  if (duty.isActive === false) return;
  const today = todayInKarachi();
  const startDate = fromDate > dutyStartDate(duty) ? fromDate : dutyStartDate(duty);
  const lastDate = toDate > today ? today : toDate;
  if (startDate > lastDate) return;

  const range = { $gte: startDate, $lte: lastDate };
  const existing = (await DutiesAttendanceDayRecords.find(
    { dutyId: duty._id, date: range },
    { fields: { date: 1 } }
  ).fetchAsync()) as Array<{ date: string }>;
  const lockedDates = new Set(existing.map(record => record.date));

  const overrides = (await DutiesAttendanceDayOverrides.find({
    dutyId: duty._id,
    date: range,
  }).fetchAsync()) as DutiesAttendanceDayOverrideDocument[];
  const overrideByDate = new Map(
    overrides.map(override => [override.date, override])
  );

  const pending = datesBetween(startDate, lastDate).filter(
    date => !lockedDates.has(date)
  );
  if (pending.length === 0) return;

  const people = await loadPeople([
    ...(duty.members ?? []).map(member => member.karkunId),
    ...overrides.flatMap(override => uniqueIds(override.addedKarkunIds)),
  ]);

  for (const date of pending) {
    const karkuns = composeKarkuns({
      duty,
      weekday: dayOfWeek(date),
      override: overrideByDate.get(date),
      people,
    });
    try {
      await DutiesAttendanceDayRecords.insertAsync({
        locationId: duty.locationId,
        dutyId: duty._id,
        date,
        karkuns,
        createdAt: new Date(),
      });
    } catch (error) {
      // Locked concurrently. Inside a transaction the error has already
      // aborted it, so it must propagate (the driver retries the transaction).
      if (!isDuplicateKey(error) || isInTransaction()) throw error;
    }
  }
}

/**
 * Whether today can still be planned: it is the day the duty starts and has
 * no record yet (nobody has marked attendance or looked at it as locked). The
 * first day stays open so the roster and the day's people can be set up.
 */
export async function isTodayOpen(duty: DutiesAttendanceDutyDocument) {
  const today = todayInKarachi();
  if (duty.isActive === false || dutyStartDate(duty) !== today) return false;
  const record = await DutiesAttendanceDayRecords.findOneAsync(
    { dutyId: duty._id, date: today },
    { fields: { _id: 1 } }
  );
  return !record;
}

/**
 * Locks every day up to today for a duty, so that a change to its roster only
 * affects days that are still being planned. The day the duty starts is still
 * being set up, so it is left open until the duty has started; a change made
 * that day applies to it. Run it inside the transaction that changes the
 * roster.
 */
export async function lockDutyDaysThroughToday(
  duty: DutiesAttendanceDutyDocument
) {
  const today = todayInKarachi();
  const start = dutyStartDate(duty);
  await lockDays(duty, start, start < today ? today : addCalendarDays(today, -1));
}

/**
 * The job body: writes today's locked record for every active duty of every
 * mehfil. Returns how many duties were processed.
 */
export async function createTodayDayRecords(
  reportProgress?: (fraction: number) => Promise<void>
) {
  await ensureDutiesAttendanceIndexes();
  const today = todayInKarachi();
  const mehfils = await OrgLocations.find(
    { type: { $in: OrgLocationFeatureAllowedTypes } },
    { fields: { _id: 1 } }
  ).fetchAsync();
  const duties = await DutiesAttendanceDuties.find({
    locationId: { $in: mehfils.map(({ _id }) => _id as string) },
    isActive: { $ne: false },
  }).fetchAsync();

  for (let index = 0; index < duties.length; index += 1) {
    await lockDays(duties[index], today, today);
    if (reportProgress) await reportProgress((index + 1) / duties.length);
  }
  if (duties.length === 0 && reportProgress) await reportProgress(1);
  return duties.length;
}

// ---------------------------------------------------------------------------
// Planning
// ---------------------------------------------------------------------------

export async function setDutyDayOverride(args: {
  locationId: string;
  dutyId: string;
  date: string;
  addedKarkunIds?: Array<string | null> | null;
  absentKarkunIds?: Array<string | null> | null;
  userId: string;
}) {
  requireUserId(args.userId);
  await ensureDutiesAttendanceIndexes();
  const duty = await requireDuty(args.dutyId, {
    locationId: args.locationId,
  });
  assertDate(args.date, 'date');
  const today = todayInKarachi();
  if (
    args.date < today ||
    (args.date === today && !(await isTodayOpen(duty)))
  ) {
    throw dutiesAttendanceError(
      'BAD_USER_INPUT',
      'Only days that have not started can be changed. The plan for today is locked.'
    );
  }

  const addedKarkunIds = uniqueIds(args.addedKarkunIds);
  const absentKarkunIds = uniqueIds(args.absentKarkunIds).filter(
    karkunId => !addedKarkunIds.includes(karkunId)
  );
  try {
    await ensureKarkuns([...addedKarkunIds, ...absentKarkunIds]);
  } catch (error) {
    throw dutiesAttendanceError(
      'BAD_USER_INPUT',
      error instanceof Error ? error.message : 'Please select valid karkuns.'
    );
  }

  const selector = { dutyId: duty._id, date: args.date };
  const existing = await DutiesAttendanceDayOverrides.findOneAsync(selector);

  if (addedKarkunIds.length === 0 && absentKarkunIds.length === 0) {
    if (existing) await DutiesAttendanceDayOverrides.removeAsync(existing._id);
  } else if (existing) {
    await DutiesAttendanceDayOverrides.updateAsync(existing._id, {
      $set: { addedKarkunIds, absentKarkunIds, ...touch(args.userId) },
    });
  } else {
    await DutiesAttendanceDayOverrides.insertAsync({
      locationId: duty.locationId,
      ...selector,
      addedKarkunIds,
      absentKarkunIds,
      ...stamp(args.userId),
    });
  }
  return true;
}

export interface PlanKarkun {
  karkunId: string;
  name: string;
  /** On the roster but taken off for this day. */
  off: boolean;
  /** Added for this day only. */
  addedForDay: boolean;
  imageUrl: string | null;
  imageThumbnailUrl: string | null;
  contactNumber1: string | null;
  contactNumber2: string | null;
  attendance: DutyAttendanceStatus | null;
}

export interface PlanDay {
  date: string;
  dayOfWeek: DayOfWeek;
  locked: boolean;
  karkuns: PlanKarkun[];
  addedKarkunIds: string[];
  absentKarkunIds: string[];
}

/**
 * Seven days of a duty's plan from `startDate`. Days up to today are locked:
 * they show the record, with attendance. Later days, and today when it is the
 * duty's first day, are composed from the roster and the overrides.
 */
export async function getDutyPlanDays(args: {
  locationId: string;
  dutyId: string;
  startDate: string;
}): Promise<{ startDate: string; days: PlanDay[] }> {
  await ensureDutiesAttendanceIndexes();
  const duty = await requireDuty(args.dutyId, {
    locationId: args.locationId,
  });
  assertDate(args.startDate, 'start date');

  const endDate = addCalendarDays(
    args.startDate,
    DUTIES_ATTENDANCE_PLAN_DAY_COUNT - 1
  );
  const range = { $gte: args.startDate, $lte: endDate };
  const today = todayInKarachi();

  // The day the duty starts stays open until it is locked by marking
  // attendance, so its people can be planned.
  const todayOpen = await isTodayOpen(duty);
  await lockDays(
    duty,
    args.startDate,
    todayOpen && endDate >= today ? addCalendarDays(today, -1) : endDate
  );

  const overrides = (await DutiesAttendanceDayOverrides.find({
    dutyId: duty._id,
    date: range,
  }).fetchAsync()) as DutiesAttendanceDayOverrideDocument[];
  const overrideByDate = new Map(
    overrides.map(override => [override.date, override])
  );
  const records = (await DutiesAttendanceDayRecords.find({
    dutyId: duty._id,
    date: range,
  }).fetchAsync()) as DutiesAttendanceDayRecordDocument[];
  const recordByDate = new Map(records.map(record => [record.date, record]));

  const people = await loadPeople([
    ...(duty.members ?? []).map(member => member.karkunId),
    ...overrides.flatMap(override => [
      ...uniqueIds(override.addedKarkunIds),
      ...uniqueIds(override.absentKarkunIds),
    ]),
    ...records.flatMap(record => record.karkuns.map(k => k.karkunId)),
  ]);

  const days: PlanDay[] = datesBetween(args.startDate, endDate).map(date => {
    const weekday = dayOfWeek(date);
    const locked = date < today || (date === today && !todayOpen);
    const override = overrideByDate.get(date);
    const { addedKarkunIds, absentKarkunIds } = overrideIds(override);

    const dayKarkuns: DayRecordKarkun[] = locked
      ? recordByDate.get(date)?.karkuns ?? []
      : composeKarkuns({ duty, weekday, override, people });

    const karkuns: PlanKarkun[] = dayKarkuns.map(karkun => ({
      karkunId: karkun.karkunId,
      name: karkun.name || personName(people, karkun.karkunId),
      off: false,
      addedForDay: karkun.addedForDay,
      attendance: karkun.attendance ?? null,
      ...personImages(people, karkun.karkunId),
      ...personContacts(people, karkun.karkunId),
    }));

    // Members taken off for a future day are listed as off.
    if (!locked) {
      const listed = new Set(karkuns.map(karkun => karkun.karkunId));
      absentKarkunIds.forEach(karkunId => {
        if (listed.has(karkunId)) return;
        const member = (duty.members ?? []).find(
          item => item?.karkunId === karkunId
        );
        if (!member || !memberAvailable(member, weekday)) return;
        listed.add(karkunId);
        karkuns.push({
          karkunId,
          name: personName(people, karkunId),
          off: true,
          addedForDay: false,
          attendance: null,
          ...personImages(people, karkunId),
          ...personContacts(people, karkunId),
        });
      });
    }

    return {
      date,
      dayOfWeek: weekday,
      locked,
      karkuns: karkuns.sort(byName),
      addedKarkunIds,
      absentKarkunIds,
    };
  });

  return { startDate: args.startDate, days };
}

// ---------------------------------------------------------------------------
// Attendance marking
// ---------------------------------------------------------------------------

function normalizeSource(source: string | null | undefined) {
  const trimmed = (source ?? '').trim();
  if (trimmed.length > DUTIES_ATTENDANCE_MAX_SOURCE_LENGTH) {
    throw dutiesAttendanceError(
      'BAD_USER_INPUT',
      `The source can be at most ${DUTIES_ATTENDANCE_MAX_SOURCE_LENGTH} characters.`
    );
  }
  return trimmed || undefined;
}

function normalizeGeo(
  geo: AttendanceGeoLocation | null | undefined
): AttendanceGeoLocation | undefined {
  if (!geo) return undefined;
  const { latitude, longitude, accuracy } = geo;
  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180 ||
    (accuracy != null && (!Number.isFinite(accuracy) || accuracy < 0))
  ) {
    throw dutiesAttendanceError('BAD_USER_INPUT', 'The location is not valid.');
  }
  return {
    latitude,
    longitude,
    ...(accuracy != null ? { accuracy } : {}),
  };
}

export async function setDutyAttendance(args: {
  locationId: string;
  dutyId: string;
  date: string;
  karkunId: string;
  status?: string | null;
  /** How the attendance was marked; kept with the mark. */
  source?: string | null;
  /** Where it was marked from; kept with the mark. */
  geo?: AttendanceGeoLocation | null;
  userId: string;
  /** The caller holds Mark attendance, so may mark anybody. */
  canMarkAnyone: boolean;
  /** The caller's own karkun, for a member marking themselves. */
  callerKarkunId?: string | null;
}) {
  requireUserId(args.userId);
  const isSelfMark = !args.canMarkAnyone;
  const geo = normalizeGeo(args.geo);
  // A member's own mark is always stamped as such, whatever the client sent.
  const source = isSelfMark
    ? DUTIES_ATTENDANCE_SELF_SOURCE
    : normalizeSource(args.source);
  // Indexes are created outside the transaction, which can't create them.
  await ensureDutiesAttendanceIndexes();
  return runInTransaction(async () => {
    const duty = await requireDuty(args.dutyId, {
      locationId: args.locationId,
    });
    assertDate(args.date, 'date');
    if (args.date > todayInKarachi()) {
      throw dutiesAttendanceError(
        'BAD_USER_INPUT',
        'Attendance cannot be recorded for a future day.'
      );
    }

    const status = args.status || null;

    if (isSelfMark) {
      const member = duty.members.find(
        ({ karkunId }) => karkunId === args.karkunId
      );
      if (
        !args.callerKarkunId ||
        args.callerKarkunId !== args.karkunId ||
        !member?.canMarkOwnAttendance
      ) {
        throw dutiesAttendanceError(
          'FORBIDDEN',
          'You are not allowed to mark attendance for this duty.'
        );
      }
      if (args.date !== todayInKarachi()) {
        throw dutiesAttendanceError(
          'FORBIDDEN',
          'You can only mark or unmark your own attendance for today.'
        );
      }
      // Marking needs where you are; unmarking does not.
      if (status && !geo) {
        throw dutiesAttendanceError(
          'BAD_USER_INPUT',
          'Your location is required to mark your own attendance.'
        );
      }
    }
    if (geo) {
      assertWithinGeofence(await requireLocation(duty.locationId), geo);
    }

    if (
      status &&
      !Object.values(DutyAttendanceStatuses).includes(
        status as DutyAttendanceStatus
      )
    ) {
      throw dutiesAttendanceError(
        'BAD_USER_INPUT',
        'Please select present, late, or absent.'
      );
    }

    // Say why, instead of "not on duty": no record is made for these days.
    if (duty.isActive === false) {
      throw dutiesAttendanceError(
        'BAD_USER_INPUT',
        'This duty is not active, so attendance cannot be marked.'
      );
    }
    if (args.date < dutyStartDate(duty)) {
      throw dutiesAttendanceError(
        'BAD_USER_INPUT',
        `This duty starts on ${dutyStartDate(duty)}; attendance cannot be marked before then.`
      );
    }

    await lockDays(duty, args.date, args.date);
    const record = await DutiesAttendanceDayRecords.findOneAsync({
      dutyId: duty._id,
      date: args.date,
    });
    if (!record?.karkuns.some(karkun => karkun.karkunId === args.karkunId)) {
      throw dutiesAttendanceError(
        'BAD_USER_INPUT',
        'This karkun is not on duty on this day.'
      );
    }

    if (isSelfMark) {
      const existing = record.karkuns.find(
        karkun => karkun.karkunId === args.karkunId
      );
      if (status && existing?.attendance) {
        throw dutiesAttendanceError(
          'FORBIDDEN',
          'Your attendance is already marked for this day. Unmark it first to mark it again.'
        );
      }
      // A mark somebody else made is theirs to change.
      if (
        !status &&
        existing?.attendanceSource !== DUTIES_ATTENDANCE_SELF_SOURCE
      ) {
        throw dutiesAttendanceError(
          'FORBIDDEN',
          'Only attendance you marked yourself can be unmarked.'
        );
      }
    }

    const selector = { _id: record._id, 'karkuns.karkunId': args.karkunId };
    if (status) {
      await DutiesAttendanceDayRecords.updateAsync(selector, {
        $set: {
          'karkuns.$.attendance': status,
          'karkuns.$.attendanceUpdatedAt': new Date(),
          'karkuns.$.attendanceUpdatedBy': args.userId,
          // A new mark replaces the source and place of the earlier one.
          ...(source ? { 'karkuns.$.attendanceSource': source } : {}),
          ...(geo ? { 'karkuns.$.attendanceGeo': geo } : {}),
          ...touch(args.userId),
        },
        $unset: {
          ...(source ? {} : { 'karkuns.$.attendanceSource': '' }),
          ...(geo ? {} : { 'karkuns.$.attendanceGeo': '' }),
        },
      });
    } else {
      await DutiesAttendanceDayRecords.updateAsync(selector, {
        $unset: {
          'karkuns.$.attendance': '',
          'karkuns.$.attendanceUpdatedAt': '',
          'karkuns.$.attendanceUpdatedBy': '',
          'karkuns.$.attendanceSource': '',
          'karkuns.$.attendanceGeo': '',
        },
        $set: touch(args.userId),
      });
    }
    return true;
  });
}
