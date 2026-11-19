import {
  DUTIES_ATTENDANCE_PLAN_DAY_COUNT,
  DutyAttendanceStatuses,
  type DutyAttendanceStatus,
} from 'meteor/idreesia-common/constants/duties-attendance';
import {
  isInTransaction,
  runInTransaction,
} from 'meteor/idreesia-common/server/collections';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { getPersonImageUrls } from 'meteor/idreesia-common/server/business-logic/common/person-images';
import {
  DutiesAttendanceDayOverrides,
  DutiesAttendanceDayRecords,
  DutiesAttendanceDuties,
  DutiesAttendanceWorkspaces,
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
} from 'meteor/idreesia-common/server/business-logic/hr/duty-planning-dates';
import { ensureKarkuns } from 'meteor/idreesia-common/server/business-logic/hr/ensure-karkuns';

import { dutiesAttendanceError } from './errors';
import {
  ensureDutiesAttendanceIndexes,
  isDuplicateKey,
  requireDuty,
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
function composeKarkuns(args: {
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
 * The first day a duty is planned: the day after it was created or last made
 * active, so a new roster can be set up before it starts.
 */
export const firstPlanningDate = () => addCalendarDays(todayInKarachi(), 1);

function dutyStartDate(duty: DutiesAttendanceDutyDocument) {
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
        workspaceId: duty.workspaceId,
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
 * Locks every day up to today for a duty, so that a change to its roster only
 * affects days that are still being planned. Run it inside the transaction
 * that changes the roster.
 */
export async function lockDutyDaysThroughToday(
  duty: DutiesAttendanceDutyDocument
) {
  await lockDays(duty, dutyStartDate(duty), todayInKarachi());
}

/**
 * The job body: writes today's locked record for every active duty of every
 * live workspace. Returns how many duties were processed.
 */
export async function createTodayDayRecords(
  reportProgress?: (fraction: number) => Promise<void>
) {
  await ensureDutiesAttendanceIndexes();
  const today = todayInKarachi();
  const liveWorkspaces = await DutiesAttendanceWorkspaces.find(
    { deletedAt: { $exists: false } },
    { fields: { _id: 1 } }
  ).fetchAsync();
  const duties = await DutiesAttendanceDuties.find({
    workspaceId: { $in: liveWorkspaces.map(({ _id }) => _id) },
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
  workspaceId: string;
  dutyId: string;
  date: string;
  addedKarkunIds?: Array<string | null> | null;
  absentKarkunIds?: Array<string | null> | null;
  userId: string;
}) {
  requireUserId(args.userId);
  await ensureDutiesAttendanceIndexes();
  const duty = await requireDuty(args.dutyId, {
    workspaceId: args.workspaceId,
  });
  assertDate(args.date, 'date');
  if (args.date <= todayInKarachi()) {
    throw dutiesAttendanceError(
      'BAD_USER_INPUT',
      'Only future days can be changed. The plan for today is locked.'
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
      workspaceId: duty.workspaceId,
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
 * they show the record, with attendance. Later days are composed from the
 * roster and the overrides.
 */
export async function getDutyPlanDays(args: {
  workspaceId: string;
  dutyId: string;
  startDate: string;
}): Promise<{ startDate: string; days: PlanDay[] }> {
  await ensureDutiesAttendanceIndexes();
  const duty = await requireDuty(args.dutyId, {
    workspaceId: args.workspaceId,
  });
  assertDate(args.startDate, 'start date');

  const endDate = addCalendarDays(
    args.startDate,
    DUTIES_ATTENDANCE_PLAN_DAY_COUNT - 1
  );
  const range = { $gte: args.startDate, $lte: endDate };
  const today = todayInKarachi();

  await lockDays(duty, args.startDate, endDate);

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
    const locked = date <= today;
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

export async function setDutyAttendance(args: {
  workspaceId: string;
  dutyId: string;
  date: string;
  karkunId: string;
  status?: string | null;
  userId: string;
}) {
  requireUserId(args.userId);
  // Indexes are created outside the transaction, which can't create them.
  await ensureDutiesAttendanceIndexes();
  return runInTransaction(async () => {
    const duty = await requireDuty(args.dutyId, {
      workspaceId: args.workspaceId,
    });
    assertDate(args.date, 'date');
    if (args.date > todayInKarachi()) {
      throw dutiesAttendanceError(
        'BAD_USER_INPUT',
        'Attendance cannot be recorded for a future day.'
      );
    }

    const status = args.status || null;
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

    const selector = { _id: record._id, 'karkuns.karkunId': args.karkunId };
    if (status) {
      await DutiesAttendanceDayRecords.updateAsync(selector, {
        $set: {
          'karkuns.$.attendance': status,
          'karkuns.$.attendanceUpdatedAt': new Date(),
          'karkuns.$.attendanceUpdatedBy': args.userId,
          ...touch(args.userId),
        },
      });
    } else {
      await DutiesAttendanceDayRecords.updateAsync(selector, {
        $unset: {
          'karkuns.$.attendance': '',
          'karkuns.$.attendanceUpdatedAt': '',
          'karkuns.$.attendanceUpdatedBy': '',
        },
        $set: touch(args.userId),
      });
    }
    return true;
  });
}
