import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  Duties,
  DutyDayAttendances,
  DutyDayOverrides,
  DutyLocations,
  DutyShifts,
  DutyTeamAssignments,
  Teams,
} from 'meteor/idreesia-common/server/collections/hr';

import {
  addCalendarDays,
  dayOfWeek,
  isCalendarDate,
  todayInKarachi,
  type DayOfWeek,
} from './duty-planning-dates';
import { ensureKarkuns } from './ensure-karkuns';

// Duty planning works on a duty location. Future days are planned with a
// team per shift (DutyTeamAssignments) and per-day changes (DutyDayOverrides).
// At the start of each day the plan for that day is written to
// DutyDayAttendances and locked; from then on only attendance can change.

interface Actor {
  _id: string;
}

export interface PlanKey {
  dutyId: string;
  locationId: string;
}

interface ShiftDocument {
  _id: string;
  dutyId: string;
  name: string;
  startTime?: string | null;
  endTime?: string | null;
}

interface TeamAssignmentDocument {
  _id: string;
  dutyId: string;
  locationId: string;
  shiftId: string;
  teamId: string;
  startDate: string;
}

interface TeamMember {
  karkunId: string;
  isCoordinator?: boolean | null;
  daysOfWeek?: string[] | null;
}

interface TeamDocument {
  _id: string;
  name: string;
  color?: string | null;
  dutyId?: string | null;
  members?: TeamMember[] | null;
}

interface OverrideDocument {
  _id: string;
  shiftId: string;
  date: string;
  addedKarkunIds?: string[] | null;
  absentKarkunIds?: string[] | null;
}

export type DutyAttendanceStatus = 'present' | 'late' | 'absent';

const DUTY_ATTENDANCE_STATUSES: readonly DutyAttendanceStatus[] = [
  'present',
  'late',
  'absent',
];

export interface DayKarkun {
  karkunId: string;
  name: string;
  teamId?: string | null;
  teamName?: string | null;
  addedForDay: boolean;
  attendance?: DutyAttendanceStatus | null;
  attendanceUpdatedAt?: Date | null;
  attendanceUpdatedBy?: string | null;
}

interface DayAttendanceDocument {
  _id: string;
  shiftId: string;
  shiftName: string;
  date: string;
  karkuns: DayKarkun[];
}

interface PersonDocument {
  _id: string;
  sharedData?: {
    name?: string | null;
    imageId?: string | null;
    imageThumbnailId?: string | null;
  } | null;
}

export interface WeekSlot {
  shiftId: string;
  teamId: string;
  teamName: string;
  teamColor?: string | null;
  startDate: string;
}

const stamp = (userId: string, date = new Date()) => ({
  createdAt: date,
  createdBy: userId,
  updatedAt: date,
  updatedBy: userId,
});

const touch = (userId: string) => ({
  updatedAt: new Date(),
  updatedBy: userId,
});

const uniqueIds = (ids: Array<string | null | undefined> | null | undefined) => [
  ...new Set((ids ?? []).filter((id): id is string => !!id)),
];

let indexesReady: Promise<void> | null = null;

export function ensureDutyPlanIndexes() {
  if (!indexesReady) {
    indexesReady = createDutyPlanIndexes().catch(error => {
      indexesReady = null;
      throw error;
    });
  }
  return indexesReady;
}

async function createDutyPlanIndexes() {
  const assignments = DutyTeamAssignments.rawCollection();
  await assignments.createIndex(
    { dutyId: 1, locationId: 1, shiftId: 1 },
    { unique: true }
  );
  await assignments.createIndex({ teamId: 1 });
  await DutyDayOverrides.rawCollection().createIndex(
    { dutyId: 1, locationId: 1, shiftId: 1, date: 1 },
    { unique: true }
  );
  const attendances = DutyDayAttendances.rawCollection();
  await attendances.createIndex(
    { dutyId: 1, locationId: 1, shiftId: 1, date: 1 },
    { unique: true }
  );
  await attendances.createIndex({ 'karkuns.karkunId': 1, date: 1 });
}

async function loadPeople(ids: string[]): Promise<Map<string, PersonDocument>> {
  const unique = uniqueIds(ids);
  if (unique.length === 0) return new Map();
  const people = (await People.find({
    _id: { $in: unique },
  }).fetchAsync()) as PersonDocument[];
  return new Map(people.map(person => [person._id, person]));
}

function personName(people: Map<string, PersonDocument>, karkunId: string) {
  return people.get(karkunId)?.sharedData?.name || '';
}

function personImages(people: Map<string, PersonDocument>, karkunId: string) {
  const shared = people.get(karkunId)?.sharedData;
  return {
    imageId: shared?.imageId || null,
    imageThumbnailId: shared?.imageThumbnailId || null,
  };
}

async function requireDutyAndLocation(
  dutyId: string,
  locationId: string
): Promise<PlanKey> {
  const duty = await Duties.findOneAsync(dutyId);
  if (!duty || duty.isMehfilDuty) {
    throw new Error('Please select a valid duty.');
  }
  const location = await DutyLocations.findOneAsync(locationId);
  if (!location || location.dutyId !== dutyId) {
    throw new Error('Please select a location for this duty.');
  }
  return { dutyId, locationId };
}

async function requireShift(
  dutyId: string,
  shiftId: string
): Promise<ShiftDocument> {
  const shift = (await DutyShifts.findOneAsync(shiftId)) as
    | ShiftDocument
    | undefined;
  if (!shift || shift.dutyId !== dutyId) {
    throw new Error('Please select a shift for this duty.');
  }
  return shift;
}

function assertDate(value: string, label: string) {
  if (!isCalendarDate(value)) {
    throw new Error(`Please select a valid ${label}.`);
  }
}

function datesBetween(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  for (let cursor = startDate; cursor <= endDate; cursor = addCalendarDays(cursor, 1)) {
    dates.push(cursor);
  }
  return dates;
}

async function shiftsForDuty(dutyId: string): Promise<ShiftDocument[]> {
  const shifts = (await DutyShifts.find({ dutyId }).fetchAsync()) as ShiftDocument[];
  return shifts.sort((left, right) => {
    const leftTime = left.startTime ? Date.parse(left.startTime) : Number.MAX_SAFE_INTEGER;
    const rightTime = right.startTime ? Date.parse(right.startTime) : Number.MAX_SAFE_INTEGER;
    if (leftTime !== rightTime) return leftTime - rightTime;
    return left.name.localeCompare(right.name);
  });
}

function isDuplicateKey(error: unknown) {
  const code = (error as { code?: number }).code;
  return (
    code === 11000 ||
    (error instanceof Error && error.message.includes('E11000'))
  );
}

function teamMemberAvailable(member: TeamMember, weekday: DayOfWeek) {
  const days = member.daysOfWeek ?? [];
  return days.length === 0 || days.includes(weekday);
}

function memberIds(team: TeamDocument | undefined) {
  return uniqueIds((team?.members ?? []).map(member => member?.karkunId));
}

function overrideIds(override: OverrideDocument | undefined) {
  const addedKarkunIds = uniqueIds(override?.addedKarkunIds);
  const absentKarkunIds = uniqueIds(override?.absentKarkunIds).filter(
    karkunId => !addedKarkunIds.includes(karkunId)
  );
  return { addedKarkunIds, absentKarkunIds };
}

// The team covering a shift on a date, if its assignment has started by then.
function teamOnDate(
  assignment: TeamAssignmentDocument | undefined,
  team: TeamDocument | undefined,
  date: string
) {
  if (!assignment || assignment.startDate > date) return undefined;
  return team;
}

function byName<T extends { name: string }>(left: T, right: T) {
  return left.name.localeCompare(right.name);
}

function composeKarkuns(args: {
  team?: TeamDocument;
  weekday: DayOfWeek;
  override?: OverrideDocument;
  people: Map<string, PersonDocument>;
}): DayKarkun[] {
  const { team, weekday, people } = args;
  const { addedKarkunIds, absentKarkunIds } = overrideIds(args.override);
  const byKarkun = new Map<string, DayKarkun>();

  if (team) {
    (team.members ?? []).forEach(member => {
      if (!member?.karkunId || byKarkun.has(member.karkunId)) return;
      if (!teamMemberAvailable(member, weekday)) return;
      if (absentKarkunIds.includes(member.karkunId)) return;
      byKarkun.set(member.karkunId, {
        karkunId: member.karkunId,
        name: personName(people, member.karkunId),
        teamId: team._id,
        teamName: team.name,
        addedForDay: false,
      });
    });
  }

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

  return [...byKarkun.values()].sort(byName);
}

// Writes the locked day record for every date in the range that has a plan
// (a started team assignment or an override) and no record yet. Dates after
// today are ignored: they are still being planned.
async function lockDays(
  key: PlanKey,
  shift: ShiftDocument,
  fromDate: string,
  toDate: string
) {
  const today = todayInKarachi();
  const lastDate = toDate > today ? today : toDate;
  if (fromDate > lastDate) return;

  const shiftKey = { ...key, shiftId: shift._id };
  const range = { $gte: fromDate, $lte: lastDate };
  const existing = (await DutyDayAttendances.find(
    { ...shiftKey, date: range },
    { fields: { date: 1 } }
  ).fetchAsync()) as Array<{ date: string }>;
  const lockedDates = new Set(existing.map(record => record.date));

  const assignment = (await DutyTeamAssignments.findOneAsync(shiftKey)) as
    | TeamAssignmentDocument
    | undefined;
  const team = assignment
    ? ((await Teams.findOneAsync(assignment.teamId)) as TeamDocument | undefined)
    : undefined;
  const overrides = (await DutyDayOverrides.find({
    ...shiftKey,
    date: range,
  }).fetchAsync()) as OverrideDocument[];
  const overrideByDate = new Map(overrides.map(override => [override.date, override]));

  const pending = datesBetween(fromDate, lastDate).filter(
    date =>
      !lockedDates.has(date) &&
      (teamOnDate(assignment, team, date) || overrideByDate.has(date))
  );
  if (pending.length === 0) return;

  const people = await loadPeople([
    ...memberIds(team),
    ...overrides.flatMap(override => uniqueIds(override.addedKarkunIds)),
  ]);

  for (const date of pending) {
    const karkuns = composeKarkuns({
      team: teamOnDate(assignment, team, date),
      weekday: dayOfWeek(date),
      override: overrideByDate.get(date),
      people,
    });
    try {
      await DutyDayAttendances.insertAsync({
        ...shiftKey,
        shiftName: shift.name,
        date,
        karkuns,
        createdAt: new Date(),
      });
    } catch (error) {
      if (!isDuplicateKey(error)) throw error;
    }
  }
}

async function findDayAttendance(key: PlanKey, shiftId: string, date: string) {
  return (await DutyDayAttendances.findOneAsync({
    ...key,
    shiftId,
    date,
  })) as DayAttendanceDocument | undefined;
}

// Locks every past and current day a team covers, so that a change to the
// team only affects days that are still being planned.
export async function ensureDutyDayAttendancesForTeam(teamId: string) {
  await ensureDutyPlanIndexes();
  const assignments = (await DutyTeamAssignments.find({
    teamId,
  }).fetchAsync()) as TeamAssignmentDocument[];
  const today = todayInKarachi();

  for (const assignment of assignments) {
    if (assignment.startDate > today) continue;
    const shift = (await DutyShifts.findOneAsync(assignment.shiftId)) as
      | ShiftDocument
      | undefined;
    if (!shift) continue;
    await lockDays(
      { dutyId: assignment.dutyId, locationId: assignment.locationId },
      shift,
      assignment.startDate,
      today
    );
  }
}

export async function createTodayDutyDayAttendances(
  reportProgress?: (fraction: number) => Promise<void>
) {
  await ensureDutyPlanIndexes();
  const today = todayInKarachi();
  const assignments = (await DutyTeamAssignments.find({
    startDate: { $lte: today },
  }).fetchAsync()) as TeamAssignmentDocument[];
  const overrides = (await DutyDayOverrides.find({
    date: today,
  }).fetchAsync()) as Array<OverrideDocument & PlanKey>;

  const shiftsToLock = new Map<string, { key: PlanKey; shiftId: string }>();
  [...assignments, ...overrides].forEach(row => {
    shiftsToLock.set(`${row.locationId}:${row.shiftId}`, {
      key: { dutyId: row.dutyId, locationId: row.locationId },
      shiftId: row.shiftId,
    });
  });

  const entries = [...shiftsToLock.values()];
  if (entries.length === 0) {
    if (reportProgress) await reportProgress(1);
    return 0;
  }

  for (let index = 0; index < entries.length; index += 1) {
    const { key, shiftId } = entries[index];
    const shift = (await DutyShifts.findOneAsync(shiftId)) as
      | ShiftDocument
      | undefined;
    if (shift) await lockDays(key, shift, today, today);
    if (reportProgress) await reportProgress((index + 1) / entries.length);
  }
  return entries.length;
}

export async function teamIsAssigned(teamId: string) {
  const count = await DutyTeamAssignments.find({ teamId }).countAsync();
  return count > 0;
}

async function isPlanned(selector: { shiftId: string } | { locationId: string }) {
  const assignments = await DutyTeamAssignments.find(selector).countAsync();
  if (assignments > 0) return true;
  const overrides = await DutyDayOverrides.find({
    ...selector,
    date: { $gt: todayInKarachi() },
  }).countAsync();
  return overrides > 0;
}

export async function shiftIsPlanned(shiftId: string) {
  return isPlanned({ shiftId });
}

export async function locationIsPlanned(locationId: string) {
  return isPlanned({ locationId });
}

export async function setDutyShiftTeam(args: {
  dutyId: string;
  locationId: string;
  shiftId: string;
  teamId?: string | null;
  user: Actor;
}) {
  await ensureDutyPlanIndexes();
  const key = await requireDutyAndLocation(args.dutyId, args.locationId);
  const shift = await requireShift(key.dutyId, args.shiftId);
  const teamId = args.teamId || null;

  if (teamId) {
    const team = (await Teams.findOneAsync(teamId)) as TeamDocument | undefined;
    if (!team || team.dutyId !== key.dutyId) {
      throw new Error('Please select a team for this duty.');
    }
  }

  const shiftKey = { ...key, shiftId: shift._id };
  const existing = (await DutyTeamAssignments.findOneAsync(shiftKey)) as
    | TeamAssignmentDocument
    | undefined;
  if ((existing?.teamId ?? null) === teamId) return true;

  // Today is already locked, so a new team starts tomorrow. Lock the days the
  // old team covered before it goes.
  const today = todayInKarachi();
  if (existing && existing.startDate <= today) {
    await lockDays(key, shift, existing.startDate, today);
  }

  await DutyTeamAssignments.removeAsync(shiftKey);
  if (teamId) {
    await DutyTeamAssignments.insertAsync({
      ...shiftKey,
      teamId,
      startDate: addCalendarDays(today, 1),
      ...stamp(args.user._id),
    });
  }
  return true;
}

export async function setDutyDayOverride(args: {
  dutyId: string;
  locationId: string;
  shiftId: string;
  date: string;
  addedKarkunIds?: Array<string | null> | null;
  absentKarkunIds?: Array<string | null> | null;
  user: Actor;
}) {
  await ensureDutyPlanIndexes();
  const key = await requireDutyAndLocation(args.dutyId, args.locationId);
  await requireShift(key.dutyId, args.shiftId);
  assertDate(args.date, 'date');
  if (args.date <= todayInKarachi()) {
    throw new Error('Only future days can be changed. The plan for today is locked.');
  }

  const addedKarkunIds = uniqueIds(args.addedKarkunIds);
  const absentKarkunIds = uniqueIds(args.absentKarkunIds).filter(
    karkunId => !addedKarkunIds.includes(karkunId)
  );
  await ensureKarkuns([...addedKarkunIds, ...absentKarkunIds]);

  const selector = { ...key, shiftId: args.shiftId, date: args.date };
  const existing = (await DutyDayOverrides.findOneAsync(selector)) as
    | OverrideDocument
    | undefined;

  if (addedKarkunIds.length === 0 && absentKarkunIds.length === 0) {
    if (existing) await DutyDayOverrides.removeAsync(existing._id);
  } else if (existing) {
    await DutyDayOverrides.updateAsync(existing._id, {
      $set: {
        addedKarkunIds,
        absentKarkunIds,
        ...touch(args.user._id),
      },
    });
  } else {
    await DutyDayOverrides.insertAsync({
      ...selector,
      addedKarkunIds,
      absentKarkunIds,
      ...stamp(args.user._id),
    });
  }
  return true;
}

export async function setDutyAttendance(args: {
  dutyId: string;
  locationId: string;
  shiftId: string;
  date: string;
  karkunId: string;
  status?: string | null;
  user: Actor;
}) {
  await ensureDutyPlanIndexes();
  const key = await requireDutyAndLocation(args.dutyId, args.locationId);
  const shift = await requireShift(key.dutyId, args.shiftId);
  assertDate(args.date, 'date');
  if (args.date > todayInKarachi()) {
    throw new Error('Attendance cannot be recorded for a future day.');
  }

  const status = args.status || null;
  if (status && !DUTY_ATTENDANCE_STATUSES.includes(status as DutyAttendanceStatus)) {
    throw new Error('Please select present, late, or absent.');
  }

  await lockDays(key, shift, args.date, args.date);
  const record = await findDayAttendance(key, shift._id, args.date);
  if (!record?.karkuns.some(karkun => karkun.karkunId === args.karkunId)) {
    throw new Error('This karkun is not on duty for this shift.');
  }

  const selector = { _id: record._id, 'karkuns.karkunId': args.karkunId };
  if (status) {
    await DutyDayAttendances.updateAsync(selector, {
      $set: {
        'karkuns.$.attendance': status,
        'karkuns.$.attendanceUpdatedAt': new Date(),
        'karkuns.$.attendanceUpdatedBy': args.user._id,
        ...touch(args.user._id),
      },
    });
  } else {
    await DutyDayAttendances.updateAsync(selector, {
      $unset: {
        'karkuns.$.attendance': '',
        'karkuns.$.attendanceUpdatedAt': '',
        'karkuns.$.attendanceUpdatedBy': '',
      },
      $set: touch(args.user._id),
    });
  }
  return true;
}

export async function getDutyPlanWeek(dutyId: string, locationId: string) {
  await ensureDutyPlanIndexes();
  const key = await requireDutyAndLocation(dutyId, locationId);
  const shifts = await shiftsForDuty(key.dutyId);
  const assignments = (await DutyTeamAssignments.find(
    key
  ).fetchAsync()) as TeamAssignmentDocument[];
  const teams = (await Teams.find({
    _id: { $in: uniqueIds(assignments.map(assignment => assignment.teamId)) },
  }).fetchAsync()) as TeamDocument[];
  const teamsById = new Map(teams.map(team => [team._id, team]));

  const slots: WeekSlot[] = [];
  for (const shift of shifts) {
    const assignment = assignments.find(row => row.shiftId === shift._id);
    const team = assignment ? teamsById.get(assignment.teamId) : undefined;
    if (!assignment || !team) continue;
    slots.push({
      shiftId: shift._id,
      teamId: team._id,
      teamName: team.name,
      teamColor: team.color ?? null,
      startDate: assignment.startDate,
    });
  }

  return { shifts, slots };
}

export interface DaysKarkun {
  karkunId: string;
  name: string;
  off: boolean;
  imageId: string | null;
  imageThumbnailId: string | null;
  attendance: DutyAttendanceStatus | null;
}

export interface DaysSlot {
  shiftId: string;
  shiftName: string;
  teamName?: string | null;
  teamKarkuns: DaysKarkun[];
  addedKarkuns: DaysKarkun[];
  addedKarkunIds: string[];
  absentKarkunIds: string[];
}

export interface DaysDay {
  date: string;
  dayOfWeek: DayOfWeek;
  locked: boolean;
  slots: DaysSlot[];
}

const PLAN_DAY_COUNT = 7;

function buildDaysSlot(args: {
  shiftId: string;
  shiftName: string;
  team?: TeamDocument;
  weekday: DayOfWeek;
  karkuns: DayKarkun[];
  override?: OverrideDocument;
  people: Map<string, PersonDocument>;
}): DaysSlot {
  const { addedKarkunIds, absentKarkunIds } = overrideIds(args.override);
  const teamKarkuns: DaysKarkun[] = [];
  const addedKarkuns: DaysKarkun[] = [];
  const listed = new Set<string>();
  let teamName: string | null = null;

  args.karkuns.forEach(karkun => {
    if (!karkun?.karkunId || listed.has(karkun.karkunId)) return;
    listed.add(karkun.karkunId);
    const row: DaysKarkun = {
      karkunId: karkun.karkunId,
      name: karkun.name,
      off: false,
      attendance: karkun.attendance ?? null,
      ...personImages(args.people, karkun.karkunId),
    };
    if (karkun.teamId) {
      if (!teamName && karkun.teamName) teamName = karkun.teamName;
      teamKarkuns.push(row);
    } else {
      addedKarkuns.push(row);
    }
  });

  // Team members marked absent for the day are listed as off.
  absentKarkunIds.forEach(karkunId => {
    if (listed.has(karkunId)) return;
    const member = (args.team?.members ?? []).find(
      item => item?.karkunId === karkunId
    );
    if (!member || !teamMemberAvailable(member, args.weekday)) return;
    listed.add(karkunId);
    teamKarkuns.push({
      karkunId,
      name: personName(args.people, karkunId),
      off: true,
      attendance: null,
      ...personImages(args.people, karkunId),
    });
  });

  return {
    shiftId: args.shiftId,
    shiftName: args.shiftName,
    teamName: teamName || args.team?.name || null,
    teamKarkuns: teamKarkuns.sort(byName),
    addedKarkuns: addedKarkuns.sort(byName),
    addedKarkunIds,
    absentKarkunIds,
  };
}

export async function getDutyPlanDays(
  dutyId: string,
  locationId: string,
  startDate: string
) {
  await ensureDutyPlanIndexes();
  const key = await requireDutyAndLocation(dutyId, locationId);
  assertDate(startDate, 'start date');

  const endDate = addCalendarDays(startDate, PLAN_DAY_COUNT - 1);
  const dates = datesBetween(startDate, endDate);
  const range = { $gte: startDate, $lte: endDate };
  const today = todayInKarachi();
  const shifts = await shiftsForDuty(key.dutyId);

  for (const shift of shifts) {
    await lockDays(key, shift, startDate, endDate);
  }

  const assignments = (await DutyTeamAssignments.find(
    key
  ).fetchAsync()) as TeamAssignmentDocument[];
  const teams = (await Teams.find({
    _id: { $in: uniqueIds(assignments.map(assignment => assignment.teamId)) },
  }).fetchAsync()) as TeamDocument[];
  const teamsById = new Map(teams.map(team => [team._id, team]));
  const assignmentByShift = new Map(
    assignments.map(assignment => [assignment.shiftId, assignment])
  );

  const overrides = (await DutyDayOverrides.find({
    ...key,
    date: range,
  }).fetchAsync()) as OverrideDocument[];
  const overrideByKey = new Map(
    overrides.map(override => [`${override.shiftId}:${override.date}`, override])
  );
  const records = (await DutyDayAttendances.find({
    ...key,
    date: range,
  }).fetchAsync()) as DayAttendanceDocument[];
  const recordByKey = new Map(
    records.map(record => [`${record.shiftId}:${record.date}`, record])
  );

  const people = await loadPeople([
    ...teams.flatMap(team => memberIds(team)),
    ...overrides.flatMap(override => [
      ...uniqueIds(override.addedKarkunIds),
      ...uniqueIds(override.absentKarkunIds),
    ]),
    ...records.flatMap(record => record.karkuns.map(karkun => karkun.karkunId)),
  ]);

  const days: DaysDay[] = dates.map(date => {
    const weekday = dayOfWeek(date);
    const locked = date <= today;
    const slots = shifts.map(shift => {
      const slotKey = `${shift._id}:${date}`;
      const assignment = assignmentByShift.get(shift._id);
      const team = teamOnDate(
        assignment,
        assignment ? teamsById.get(assignment.teamId) : undefined,
        date
      );
      const override = overrideByKey.get(slotKey);
      const record = locked ? recordByKey.get(slotKey) : undefined;
      const karkuns = locked
        ? record?.karkuns ?? []
        : composeKarkuns({ team, weekday, override, people });
      return buildDaysSlot({
        shiftId: shift._id,
        shiftName: record?.shiftName || shift.name,
        team,
        weekday,
        karkuns,
        override,
        people,
      });
    });
    return { date, dayOfWeek: weekday, locked, slots };
  });

  return { startDate, days };
}
