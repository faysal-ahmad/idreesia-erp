import { Random } from 'meteor/random';

import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  Duties,
  DutyLocations,
  DutyRosterAssignments,
  DutyRosterDayOverrides,
  DutyRosterDaySnapshots,
  DutyRosters,
  DutyShifts,
  Teams,
} from 'meteor/idreesia-common/server/collections/hr';

import {
  DAYS_OF_WEEK,
  addCalendarDays,
  datesMatchingWeekday,
  dayOfWeek,
  isCalendarDate,
  isDayOfWeek,
  todayInKarachi,
  type DayOfWeek,
} from './duty-roster-dates';
import { ensureKarkuns } from './ensure-karkuns';

interface Actor {
  _id: string;
}

interface RosterDocument {
  _id: string;
  dutyId: string;
  locationId: string;
  startDate: string;
  endDate?: string | null;
  status: 'active' | 'archived';
}

interface ShiftDocument {
  _id: string;
  dutyId: string;
  name: string;
  startTime?: string | null;
  endTime?: string | null;
}

interface AssignmentDocument {
  _id: string;
  rosterId: string;
  shiftId: string;
  dayOfWeek?: DayOfWeek | null;
  assigneeType: 'team' | 'karkun';
  teamId?: string | null;
  karkunId?: string | null;
}

interface TeamDocument {
  _id: string;
  name: string;
  color?: string | null;
  dutyId?: string | null;
  karkunIds?: string[] | null;
  memberSchedules?: Array<{
    karkunId?: string | null;
    daysOfWeek?: string[] | null;
  }> | null;
}

interface OverrideDocument {
  _id: string;
  rosterId: string;
  shiftId: string;
  date: string;
  addedKarkunIds?: string[] | null;
  absentKarkunIds?: string[] | null;
}

export interface ResolvedSource {
  type: 'team' | 'direct' | 'one-off';
  teamId?: string | null;
  teamName?: string | null;
}

export interface ResolvedKarkun {
  karkunId: string;
  name: string;
  sources: ResolvedSource[];
}

export interface WeekSlot {
  shiftId: string;
  teamId?: string | null;
  teamName?: string | null;
  teamColor?: string | null;
}

export interface DaySlot {
  shiftId: string;
  shiftName: string;
  startTime?: string | null;
  endTime?: string | null;
  karkuns: ResolvedKarkun[];
  addedKarkunIds: string[];
  absentKarkunIds: string[];
  absentKarkuns: Array<{ karkunId: string; name: string }>;
  fromSnapshot: boolean;
}

interface PersonDocument {
  _id: string;
  isKarkun?: boolean;
  sharedData?: { name?: string | null } | null;
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

export function ensureDutyRosterIndexes() {
  if (!indexesReady) {
    indexesReady = createDutyRosterIndexes().catch(error => {
      indexesReady = null;
      throw error;
    });
  }
  return indexesReady;
}

async function dropIndexIfPresent(
  collection: { dropIndex: (name: string) => Promise<unknown> },
  name: string
) {
  try {
    await collection.dropIndex(name);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const code =
      typeof error === 'object' && error && 'code' in error ? error.code : undefined;
    if (
      code !== 27 &&
      !message.includes('index not found') &&
      !message.includes('ns not found')
    ) {
      throw error;
    }
  }
}

async function collapseRecurringAssignments() {
  const rows = (await DutyRosterAssignments.find(
    {}
  ).fetchAsync()) as AssignmentDocument[];
  const byShift = new Map<string, AssignmentDocument[]>();
  rows.forEach(row => {
    const key = `${row.rosterId}:${row.shiftId}`;
    const group = byShift.get(key) ?? [];
    group.push(row);
    byShift.set(key, group);
  });

  for (const group of byShift.values()) {
    const teamRow = group.find(
      row => row.assigneeType === 'team' && row.teamId
    );
    for (const row of group) {
      if (row._id === teamRow?._id) continue;
      await DutyRosterAssignments.removeAsync(row._id);
    }
    if (teamRow?.dayOfWeek) {
      await DutyRosterAssignments.updateAsync(teamRow._id, {
        $unset: { dayOfWeek: '' },
      });
    }
  }
}

async function createDutyRosterIndexes() {
  await collapseRecurringAssignments();
  const assignments = DutyRosterAssignments.rawCollection();
  await DutyRosters.rawCollection().createIndex(
    { dutyId: 1, locationId: 1 },
    { unique: true, partialFilterExpression: { status: 'active' } }
  );
  await dropIndexIfPresent(assignments, 'rosterId_1_shiftId_1_dayOfWeek_1');
  await dropIndexIfPresent(
    assignments,
    'rosterId_1_shiftId_1_dayOfWeek_1_karkunId_1'
  );
  await assignments.createIndex(
    { rosterId: 1, shiftId: 1 },
    { unique: true, partialFilterExpression: { assigneeType: 'team' } }
  );
  await assignments.createIndex({ teamId: 1 });
  await DutyRosterDayOverrides.rawCollection().createIndex(
    { rosterId: 1, shiftId: 1, date: 1 },
    { unique: true }
  );
  await DutyRosterDaySnapshots.rawCollection().createIndex(
    { rosterId: 1, shiftId: 1, date: 1 },
    { unique: true }
  );
}

async function loadPeople(ids: string[]): Promise<Map<string, PersonDocument>> {
  const unique = uniqueIds(ids);
  const people = new Map<string, PersonDocument>();
  if (unique.length === 0) return people;

  const rows = (await People.find({
    _id: { $in: unique },
  }).fetchAsync()) as PersonDocument[];
  rows.forEach(person => people.set(person._id, person));
  return people;
}

function personName(people: Map<string, PersonDocument>, karkunId: string) {
  return people.get(karkunId)?.sharedData?.name || '';
}

async function requireDutyAndLocation(dutyId: string, locationId: string) {
  const duty = await Duties.findOneAsync(dutyId);
  if (!duty || duty.isMehfilDuty) {
    throw new Error('Please select a valid duty.');
  }
  const location = await DutyLocations.findOneAsync(locationId);
  if (!location || location.dutyId !== dutyId) {
    throw new Error('Please select a location for this duty.');
  }
}

async function requireRoster(rosterId: string): Promise<RosterDocument> {
  const roster = (await DutyRosters.findOneAsync(rosterId)) as
    | RosterDocument
    | undefined;
  if (!roster) throw new Error('Duty roster not found.');
  return roster;
}

async function requireActiveRoster(rosterId: string): Promise<RosterDocument> {
  const roster = await requireRoster(rosterId);
  if (roster.status !== 'active') {
    throw new Error('This roster is archived and cannot be changed.');
  }
  return roster;
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

function dateInRange(roster: RosterDocument, date: string) {
  if (date < roster.startDate) return false;
  if (roster.endDate && date > roster.endDate) return false;
  return true;
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

export async function teamIsAssignedOnRoster(teamId: string) {
  const count = await DutyRosterAssignments.find({
    teamId,
    assigneeType: 'team',
  }).countAsync();
  return count > 0;
}

export async function shiftUsedByActiveRoster(shiftId: string) {
  const assignments = (await DutyRosterAssignments.find({
    shiftId,
  }).fetchAsync()) as AssignmentDocument[];
  const rosterIds = uniqueIds(assignments.map(assignment => assignment.rosterId));
  if (rosterIds.length > 0) {
    const active = await DutyRosters.findOneAsync({
      _id: { $in: rosterIds },
      status: 'active',
    });
    if (active) return true;
  }

  const today = todayInKarachi();
  const overrides = (await DutyRosterDayOverrides.find({
    shiftId,
    date: { $gte: today },
  }).fetchAsync()) as OverrideDocument[];
  const overrideRosterIds = uniqueIds(overrides.map(override => override.rosterId));
  if (overrideRosterIds.length === 0) return false;

  const activeOverride = await DutyRosters.findOneAsync({
    _id: { $in: overrideRosterIds },
    status: 'active',
  });
  return !!activeOverride;
}

interface SnapshotDocument {
  shiftName?: string;
  karkuns?: ResolvedKarkun[];
}

async function findSnapshot(
  rosterId: string,
  shiftId: string,
  date: string
): Promise<SnapshotDocument | undefined> {
  return DutyRosterDaySnapshots.findOneAsync({
    rosterId,
    shiftId,
    date,
  }) as Promise<SnapshotDocument | undefined>;
}

function isDuplicateKey(error: unknown) {
  const code = (error as { code?: number }).code;
  return (
    code === 11000 ||
    (error instanceof Error && error.message.includes('E11000'))
  );
}

async function writeSnapshot(args: {
  roster: RosterDocument;
  shift: ShiftDocument;
  date: string;
  karkuns: ResolvedKarkun[];
}) {
  const { roster, shift, date, karkuns } = args;
  const existing = await findSnapshot(roster._id, shift._id, date);
  if (existing) return existing;

  try {
    await DutyRosterDaySnapshots.insertAsync({
      _id: Random.id(),
      rosterId: roster._id,
      dutyId: roster.dutyId,
      locationId: roster.locationId,
      shiftId: shift._id,
      shiftName: shift.name,
      date,
      karkuns,
      createdAt: new Date(),
    });
  } catch (error) {
    if (!isDuplicateKey(error)) throw error;
  }
  return (await findSnapshot(roster._id, shift._id, date)) ?? { karkuns };
}

function teamMemberAvailable(
  team: TeamDocument,
  karkunId: string,
  weekday: DayOfWeek
) {
  const schedule = (team.memberSchedules ?? []).find(
    item => item?.karkunId === karkunId
  );
  if (!schedule) return true;
  return (schedule.daysOfWeek ?? []).includes(weekday);
}

function composeKarkuns(args: {
  team?: TeamDocument;
  weekday: DayOfWeek;
  addedKarkunIds: string[];
  absentKarkunIds: string[];
  people: Map<string, PersonDocument>;
}): ResolvedKarkun[] {
  const { team, weekday, people } = args;
  const addedKarkunIds = uniqueIds(args.addedKarkunIds);
  const absentKarkunIds = uniqueIds(args.absentKarkunIds).filter(
    karkunId => !addedKarkunIds.includes(karkunId)
  );
  const byKarkun = new Map<string, ResolvedSource[]>();
  const addSource = (karkunId: string, source: ResolvedSource) => {
    const sources = byKarkun.get(karkunId) ?? [];
    const alreadyThere = sources.some(
      existing =>
        existing.type === source.type && existing.teamId === source.teamId
    );
    if (!alreadyThere) sources.push(source);
    byKarkun.set(karkunId, sources);
  };

  if (team) {
    uniqueIds(team.karkunIds).forEach(karkunId => {
      if (!teamMemberAvailable(team, karkunId, weekday)) return;
      addSource(karkunId, {
        type: 'team',
        teamId: team._id,
        teamName: team.name,
      });
    });
  }

  absentKarkunIds.forEach(karkunId => byKarkun.delete(karkunId));
  addedKarkunIds.forEach(karkunId => {
    addSource(karkunId, { type: 'one-off' });
  });

  const karkuns = [...byKarkun.entries()].map(([karkunId, sources]) => ({
    karkunId,
    name: personName(people, karkunId),
    sources,
  }));
  karkuns.sort((left, right) => left.name.localeCompare(right.name));
  return karkuns;
}

async function resolveLive(args: {
  roster: RosterDocument;
  shift: ShiftDocument;
  date: string;
  weekday: DayOfWeek;
}): Promise<{
  karkuns: ResolvedKarkun[];
  addedKarkunIds: string[];
  absentKarkunIds: string[];
}> {
  const { roster, shift, date, weekday } = args;
  const assignments = (await DutyRosterAssignments.find({
    rosterId: roster._id,
    shiftId: shift._id,
    assigneeType: 'team',
  }).fetchAsync()) as AssignmentDocument[];

  const teamAssignment = assignments.find(assignment => assignment.teamId);
  const team = teamAssignment?.teamId
    ? ((await Teams.findOneAsync(teamAssignment.teamId)) as TeamDocument | undefined)
    : undefined;

  const override = (await DutyRosterDayOverrides.findOneAsync({
    rosterId: roster._id,
    shiftId: shift._id,
    date,
  })) as OverrideDocument | undefined;
  const addedKarkunIds = uniqueIds(override?.addedKarkunIds);
  const absentKarkunIds = uniqueIds(override?.absentKarkunIds).filter(
    karkunId => !addedKarkunIds.includes(karkunId)
  );
  const people = await loadPeople([
    ...uniqueIds(team?.karkunIds),
    ...addedKarkunIds,
    ...absentKarkunIds,
  ]);
  const karkuns = composeKarkuns({
    team,
    weekday,
    addedKarkunIds,
    absentKarkunIds,
    people,
  });

  return { karkuns, addedKarkunIds, absentKarkunIds };
}

async function resolveShiftDate(args: {
  roster: RosterDocument;
  shift: ShiftDocument;
  date: string;
  writeIfPast: boolean;
}): Promise<DaySlot> {
  const { roster, shift, date, writeIfPast } = args;
  const today = todayInKarachi();
  const inRange = dateInRange(roster, date);
  const override = (await DutyRosterDayOverrides.findOneAsync({
    rosterId: roster._id,
    shiftId: shift._id,
    date,
  })) as OverrideDocument | undefined;
  const addedKarkunIds = uniqueIds(override?.addedKarkunIds);
  const absentKarkunIds = uniqueIds(override?.absentKarkunIds).filter(
    karkunId => !addedKarkunIds.includes(karkunId)
  );

  if (!inRange) {
    const people = await loadPeople(absentKarkunIds);
    return {
      shiftId: shift._id,
      shiftName: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      karkuns: [],
      addedKarkunIds,
      absentKarkunIds,
      absentKarkuns: absentKarkunIds.map(karkunId => ({
        karkunId,
        name: personName(people, karkunId),
      })),
      fromSnapshot: false,
    };
  }

  if (date < today) {
    const existing = await findSnapshot(roster._id, shift._id, date);
    if (existing) {
      const people = await loadPeople(absentKarkunIds);
      return {
        shiftId: shift._id,
        shiftName: existing.shiftName || shift.name,
        startTime: shift.startTime,
        endTime: shift.endTime,
        karkuns: existing.karkuns ?? [],
        addedKarkunIds,
        absentKarkunIds,
        absentKarkuns: absentKarkunIds.map(karkunId => ({
          karkunId,
          name: personName(people, karkunId),
        })),
        fromSnapshot: true,
      };
    }
  }

  const live = await resolveLive({
    roster,
    shift,
    date,
    weekday: dayOfWeek(date),
  });

  let fromSnapshot = false;
  let karkuns = live.karkuns;
  if (writeIfPast && date < today) {
    const snapshot = await writeSnapshot({
      roster,
      shift,
      date,
      karkuns: live.karkuns,
    });
    karkuns = snapshot?.karkuns ?? live.karkuns;
    fromSnapshot = true;
  }

  const people = await loadPeople(live.absentKarkunIds);
  return {
    shiftId: shift._id,
    shiftName: shift.name,
    startTime: shift.startTime,
    endTime: shift.endTime,
    karkuns,
    addedKarkunIds: live.addedKarkunIds,
    absentKarkunIds: live.absentKarkunIds,
    absentKarkuns: live.absentKarkunIds.map(karkunId => ({
      karkunId,
      name: personName(people, karkunId),
    })),
    fromSnapshot,
  };
}

async function snapshotWeekdayThrough(
  roster: RosterDocument,
  shiftId: string,
  weekday: DayOfWeek,
  endDate: string
) {
  const shift = (await DutyShifts.findOneAsync(shiftId)) as
    | ShiftDocument
    | undefined;
  if (!shift) return;

  const lastDate =
    roster.endDate && roster.endDate < endDate ? roster.endDate : endDate;
  const dates = datesMatchingWeekday(roster.startDate, lastDate, weekday);
  for (const date of dates) {
    const existing = await findSnapshot(roster._id, shift._id, date);
    if (existing) continue;
    await resolveShiftDate({ roster, shift, date, writeIfPast: true });
  }
}

export async function ensurePastSnapshotsForTeam(teamId: string) {
  await ensureDutyRosterIndexes();
  const assignments = (await DutyRosterAssignments.find({
    teamId,
    assigneeType: 'team',
  }).fetchAsync()) as AssignmentDocument[];
  const yesterday = addCalendarDays(todayInKarachi(), -1);

  for (const assignment of assignments) {
    const roster = (await DutyRosters.findOneAsync(assignment.rosterId)) as
      | RosterDocument
      | undefined;
    if (!roster) continue;
    const weekdays = isDayOfWeek(assignment.dayOfWeek)
      ? [assignment.dayOfWeek]
      : [...DAYS_OF_WEEK];
    for (const weekday of weekdays) {
      await snapshotWeekdayThrough(
        roster,
        assignment.shiftId,
        weekday,
        yesterday
      );
    }
  }
}

async function snapshotPastShift(roster: RosterDocument, shiftId: string) {
  const yesterday = addCalendarDays(todayInKarachi(), -1);
  for (const weekday of DAYS_OF_WEEK) {
    await snapshotWeekdayThrough(roster, shiftId, weekday, yesterday);
  }
}

export async function pagedDutyRosters(args: {
  dutyId?: string | null;
  locationId?: string | null;
  status?: string | null;
  pageIndex?: number | null;
  pageSize?: number | null;
}) {
  await ensureDutyRosterIndexes();
  const selector: Record<string, unknown> = {};
  if (args.dutyId) selector.dutyId = args.dutyId;
  if (args.locationId) selector.locationId = args.locationId;
  if (args.status === 'active' || args.status === 'archived') {
    selector.status = args.status;
  }

  const pageIndex = Math.max(0, args.pageIndex ?? 0);
  const pageSize = Math.max(1, args.pageSize ?? 20);
  const totalResults = await DutyRosters.find(selector).countAsync();
  const data = await DutyRosters.find(selector, {
    sort: { startDate: -1, createdAt: -1 },
    skip: pageIndex * pageSize,
    limit: pageSize,
  }).fetchAsync();

  return { totalResults, data };
}

export async function activeDutyRosters(args: {
  dutyId?: string | null;
  locationId?: string | null;
}) {
  await ensureDutyRosterIndexes();
  const selector: Record<string, unknown> = { status: 'active' };
  if (args.dutyId) selector.dutyId = args.dutyId;
  if (args.locationId) selector.locationId = args.locationId;

  return DutyRosters.find(selector, {
    sort: { startDate: -1, createdAt: -1 },
  }).fetchAsync();
}

export async function createDutyRoster(args: {
  dutyId: string;
  locationId: string;
  startDate: string;
  endDate?: string | null;
  user: Actor;
}) {
  await ensureDutyRosterIndexes();
  const { dutyId, locationId, user } = args;
  await requireDutyAndLocation(dutyId, locationId);
  assertDate(args.startDate, 'start date');
  if (args.endDate) assertDate(args.endDate, 'end date');

  const today = todayInKarachi();
  if (args.startDate < today) {
    throw new Error('The start date cannot be in the past.');
  }
  if (args.endDate && args.endDate < args.startDate) {
    throw new Error('The end date cannot be before the start date.');
  }

  const active = await DutyRosters.findOneAsync({
    dutyId,
    locationId,
    status: 'active',
  });
  if (active) {
    throw new Error(
      'Archive the current roster for this duty and location before creating a new one.'
    );
  }

  const previous = (await DutyRosters.find({
    dutyId,
    locationId,
  }).fetchAsync()) as RosterDocument[];
  let latestEnd: string | null = null;
  for (const roster of previous) {
    if (!roster.endDate) {
      throw new Error(
        'An existing roster for this duty and location has no end date.'
      );
    }
    if (!latestEnd || roster.endDate > latestEnd) latestEnd = roster.endDate;
  }
  if (latestEnd && args.startDate <= latestEnd) {
    throw new Error(`The start date must be after ${latestEnd}.`);
  }

  try {
    const rosterId = await DutyRosters.insertAsync({
      dutyId,
      locationId,
      startDate: args.startDate,
      ...(args.endDate ? { endDate: args.endDate } : {}),
      status: 'active',
      ...stamp(user._id),
    });
    return DutyRosters.findOneAsync(rosterId);
  } catch (error) {
    if (isDuplicateKey(error)) {
      throw new Error(
        'Archive the current roster for this duty and location before creating a new one.'
      );
    }
    throw error;
  }
}

export async function updateDutyRoster(args: {
  id: string;
  endDate?: string | null;
  user: Actor;
}) {
  await ensureDutyRosterIndexes();
  const roster = await requireActiveRoster(args.id);
  const today = todayInKarachi();
  const clearEndDate = args.endDate == null || args.endDate === '';

  if (!clearEndDate) {
    assertDate(args.endDate as string, 'end date');
    if ((args.endDate as string) < roster.startDate) {
      throw new Error('The end date cannot be before the start date.');
    }
    if ((args.endDate as string) < today) {
      throw new Error('The end date cannot be in the past.');
    }
  }

  if (clearEndDate) {
    await DutyRosters.updateAsync(roster._id, {
      $set: touch(args.user._id),
      $unset: { endDate: '' },
    });
  } else {
    await DutyRosters.updateAsync(roster._id, {
      $set: {
        endDate: args.endDate,
        ...touch(args.user._id),
      },
    });
  }

  return DutyRosters.findOneAsync(roster._id);
}

export async function archiveDutyRoster(args: { id: string; user: Actor }) {
  await ensureDutyRosterIndexes();
  const roster = await requireRoster(args.id);
  if (roster.status === 'archived') {
    throw new Error('This roster is already archived.');
  }

  const today = todayInKarachi();
  const yesterday = addCalendarDays(today, -1);
  await snapshotRosterDate(roster, yesterday);

  let endDate = roster.endDate || '';
  if (roster.startDate > today) {
    endDate = addCalendarDays(roster.startDate, -1);
  } else if (!endDate || endDate > today) {
    endDate = today;
  }

  await DutyRosters.updateAsync(roster._id, {
    $set: {
      status: 'archived',
      endDate,
      ...touch(args.user._id),
    },
  });
  return DutyRosters.findOneAsync(roster._id);
}

export async function setDutyRosterShiftTeam(args: {
  rosterId: string;
  shiftId: string;
  teamId?: string | null;
  user: Actor;
}) {
  await ensureDutyRosterIndexes();
  const roster = await requireActiveRoster(args.rosterId);
  await requireShift(roster.dutyId, args.shiftId);

  if (args.teamId) {
    const team = (await Teams.findOneAsync(args.teamId)) as
      | TeamDocument
      | undefined;
    if (!team || team.dutyId !== roster.dutyId) {
      throw new Error('Please select a team for this duty.');
    }
  }

  await snapshotPastShift(roster, args.shiftId);

  await DutyRosterAssignments.removeAsync({
    rosterId: roster._id,
    shiftId: args.shiftId,
  });

  if (args.teamId) {
    await DutyRosterAssignments.insertAsync({
      rosterId: roster._id,
      shiftId: args.shiftId,
      assigneeType: 'team',
      teamId: args.teamId,
      ...stamp(args.user._id),
    });
  }

  return getDutyRosterWeek(roster._id);
}

export async function setDutyRosterDayOverride(args: {
  rosterId: string;
  shiftId: string;
  date: string;
  addedKarkunIds?: Array<string | null> | null;
  absentKarkunIds?: Array<string | null> | null;
  user: Actor;
}) {
  await ensureDutyRosterIndexes();
  const roster = await requireActiveRoster(args.rosterId);
  await requireShift(roster.dutyId, args.shiftId);
  assertDate(args.date, 'date');

  const today = todayInKarachi();
  if (args.date < today) {
    throw new Error('A past day cannot be changed.');
  }
  if (!dateInRange(roster, args.date)) {
    throw new Error('This date is outside the roster.');
  }

  const addedKarkunIds = uniqueIds(args.addedKarkunIds);
  const absentKarkunIds = uniqueIds(args.absentKarkunIds).filter(
    karkunId => !addedKarkunIds.includes(karkunId)
  );
  await ensureKarkuns([...addedKarkunIds, ...absentKarkunIds]);

  const existing = (await DutyRosterDayOverrides.findOneAsync({
    rosterId: roster._id,
    shiftId: args.shiftId,
    date: args.date,
  })) as OverrideDocument | undefined;

  if (addedKarkunIds.length === 0 && absentKarkunIds.length === 0) {
    if (existing) await DutyRosterDayOverrides.removeAsync(existing._id);
  } else if (existing) {
    await DutyRosterDayOverrides.updateAsync(existing._id, {
      $set: {
        addedKarkunIds,
        absentKarkunIds,
        ...touch(args.user._id),
      },
    });
  } else {
    await DutyRosterDayOverrides.insertAsync({
      rosterId: roster._id,
      shiftId: args.shiftId,
      date: args.date,
      addedKarkunIds,
      absentKarkunIds,
      ...stamp(args.user._id),
    });
  }

  return getDutyRosterDay(roster._id, args.date);
}

export async function getDutyRosterWeek(rosterId: string) {
  await ensureDutyRosterIndexes();
  const roster = (await DutyRosters.findOneAsync(rosterId)) as
    | RosterDocument
    | undefined;
  if (!roster) return null;

  const shifts = await shiftsForDuty(roster.dutyId);
  const assignments = (await DutyRosterAssignments.find({
    rosterId,
    assigneeType: 'team',
  }).fetchAsync()) as AssignmentDocument[];
  const teamIds = uniqueIds(assignments.map(assignment => assignment.teamId));
  const teams = (await Teams.find({
    _id: { $in: teamIds },
  }).fetchAsync()) as TeamDocument[];
  const teamsById = new Map(teams.map(team => [team._id, team]));

  const slots: WeekSlot[] = [];
  for (const shift of shifts) {
    const teamAssignment = assignments.find(
      assignment => assignment.shiftId === shift._id && assignment.teamId
    );
    const team = teamAssignment?.teamId
      ? teamsById.get(teamAssignment.teamId)
      : undefined;
    if (!team) continue;
    slots.push({
      shiftId: shift._id,
      teamId: team._id,
      teamName: team.name,
      teamColor: team.color ?? null,
    });
  }

  return { roster, shifts, slots };
}

export async function getDutyRosterDay(rosterId: string, date: string) {
  await ensureDutyRosterIndexes();
  const roster = (await DutyRosters.findOneAsync(rosterId)) as
    | RosterDocument
    | undefined;
  if (!roster) return null;
  assertDate(date, 'date');

  const today = todayInKarachi();
  const shifts = await shiftsForDuty(roster.dutyId);
  const slots: DaySlot[] = [];
  for (const shift of shifts) {
    slots.push(
      await resolveShiftDate({
        roster,
        shift,
        date,
        writeIfPast: true,
      })
    );
  }

  return {
    date,
    dayOfWeek: dayOfWeek(date),
    inRange: dateInRange(roster, date),
    isPast: date < today,
    slots,
  };
}

export interface DaysKarkun {
  karkunId: string;
  name: string;
  off: boolean;
}

export interface DaysSlot {
  shiftId: string;
  shiftName: string;
  teamName?: string | null;
  teamKarkuns: DaysKarkun[];
  addedKarkuns: Array<{ karkunId: string; name: string }>;
  addedKarkunIds: string[];
  absentKarkunIds: string[];
}

export interface DaysDay {
  date: string;
  dayOfWeek: DayOfWeek;
  inRange: boolean;
  isPast: boolean;
  slots: DaysSlot[];
}

const ROSTER_DAY_COUNT = 7;

function byName<T extends { name: string }>(left: T, right: T) {
  return left.name.localeCompare(right.name);
}

function buildDaysSlot(args: {
  shiftId: string;
  shiftName: string;
  team?: TeamDocument;
  weekday: DayOfWeek;
  resolved: ResolvedKarkun[];
  addedKarkunIds: string[];
  absentKarkunIds: string[];
  people: Map<string, PersonDocument>;
}): DaysSlot {
  const teamKarkuns: DaysKarkun[] = [];
  const addedKarkuns: Array<{ karkunId: string; name: string }> = [];
  let snapshotTeamName: string | null = null;
  const listed = new Set<string>();

  args.resolved.forEach(karkun => {
    if (!karkun?.karkunId || listed.has(karkun.karkunId)) return;
    const sources = karkun.sources ?? [];
    const teamSource = sources.find(source => source.type === 'team');
    if (teamSource) {
      if (!snapshotTeamName && teamSource.teamName) {
        snapshotTeamName = teamSource.teamName;
      }
      listed.add(karkun.karkunId);
      teamKarkuns.push({
        karkunId: karkun.karkunId,
        name: karkun.name,
        off: false,
      });
      return;
    }
    if (
      sources.some(
        source => source.type === 'one-off' || source.type === 'direct'
      )
    ) {
      listed.add(karkun.karkunId);
      addedKarkuns.push({ karkunId: karkun.karkunId, name: karkun.name });
    }
  });

  args.absentKarkunIds.forEach(karkunId => {
    if (listed.has(karkunId)) return;
    const onTeam =
      !!args.team &&
      uniqueIds(args.team.karkunIds).includes(karkunId) &&
      teamMemberAvailable(args.team, karkunId, args.weekday);
    if (args.team && !onTeam) return;
    listed.add(karkunId);
    teamKarkuns.push({
      karkunId,
      name: personName(args.people, karkunId),
      off: true,
    });
  });

  return {
    shiftId: args.shiftId,
    shiftName: args.shiftName,
    teamName: snapshotTeamName || args.team?.name || null,
    teamKarkuns: teamKarkuns.sort(byName),
    addedKarkuns: addedKarkuns.sort(byName),
    addedKarkunIds: args.addedKarkunIds,
    absentKarkunIds: args.absentKarkunIds,
  };
}

function datesFrom(startDate: string, count: number): string[] {
  assertDate(startDate, 'start date');
  const dates: string[] = [];
  let cursor = startDate;
  for (let index = 0; index < count; index += 1) {
    dates.push(cursor);
    cursor = addCalendarDays(cursor, 1);
  }
  return dates;
}

export async function getDutyRosterDays(rosterId: string, startDate: string) {
  await ensureDutyRosterIndexes();
  const roster = (await DutyRosters.findOneAsync(rosterId)) as
    | RosterDocument
    | undefined;
  if (!roster) return null;

  const dates = datesFrom(startDate, ROSTER_DAY_COUNT);
  const start = dates[0];
  const end = dates[dates.length - 1];
  const today = todayInKarachi();
  const shifts = await shiftsForDuty(roster.dutyId);
  const assignments = (await DutyRosterAssignments.find({
    rosterId,
    assigneeType: 'team',
  }).fetchAsync()) as AssignmentDocument[];
  const teams = (await Teams.find({
    _id: { $in: uniqueIds(assignments.map(assignment => assignment.teamId)) },
  }).fetchAsync()) as TeamDocument[];
  const teamsById = new Map(teams.map(team => [team._id, team]));
  const teamByShift = new Map<string, TeamDocument>();
  assignments.forEach(assignment => {
    if (!assignment.teamId || teamByShift.has(assignment.shiftId)) return;
    const team = teamsById.get(assignment.teamId);
    if (team) teamByShift.set(assignment.shiftId, team);
  });

  const overrides = (await DutyRosterDayOverrides.find({
    rosterId,
    date: { $gte: start, $lte: end },
  }).fetchAsync()) as OverrideDocument[];
  const overrideByKey = new Map(
    overrides.map(override => [`${override.shiftId}:${override.date}`, override])
  );
  const snapshots = (await DutyRosterDaySnapshots.find({
    rosterId,
    date: { $gte: start, $lte: end },
  }).fetchAsync()) as Array<
    SnapshotDocument & { shiftId: string; date: string }
  >;
  const snapshotByKey = new Map(
    snapshots.map(snapshot => [`${snapshot.shiftId}:${snapshot.date}`, snapshot])
  );

  const peopleIds = [
    ...teams.flatMap(team => uniqueIds(team.karkunIds)),
    ...overrides.flatMap(override => [
      ...uniqueIds(override.addedKarkunIds),
      ...uniqueIds(override.absentKarkunIds),
    ]),
  ];
  const people = await loadPeople(peopleIds);

  const days: DaysDay[] = [];
  for (const date of dates) {
    const weekday = dayOfWeek(date);
    const inRange = dateInRange(roster, date);
    const isPast = date < today;
    const slots: DaysSlot[] = [];
    if (!inRange) {
      days.push({ date, dayOfWeek: weekday, inRange, isPast, slots });
      continue;
    }

    for (const shift of shifts) {
      if (isPast) {
        const snapshot = snapshotByKey.get(`${shift._id}:${date}`);
        if (snapshot) {
          const override = overrideByKey.get(`${shift._id}:${date}`);
          const addedKarkunIds = uniqueIds(override?.addedKarkunIds);
          const absentKarkunIds = uniqueIds(override?.absentKarkunIds).filter(
            karkunId => !addedKarkunIds.includes(karkunId)
          );
          slots.push(
            buildDaysSlot({
              shiftId: shift._id,
              shiftName: snapshot.shiftName || shift.name,
              team: teamByShift.get(shift._id),
              weekday,
              resolved: snapshot.karkuns ?? [],
              addedKarkunIds,
              absentKarkunIds,
              people,
            })
          );
          continue;
        }
      }

      const override = overrideByKey.get(`${shift._id}:${date}`);
      const addedKarkunIds = uniqueIds(override?.addedKarkunIds);
      const absentKarkunIds = uniqueIds(override?.absentKarkunIds).filter(
        karkunId => !addedKarkunIds.includes(karkunId)
      );
      const team = teamByShift.get(shift._id);
      const resolved = composeKarkuns({
        team,
        weekday,
        addedKarkunIds,
        absentKarkunIds,
        people,
      });
      if (isPast) {
        await writeSnapshot({
          roster,
          shift,
          date,
          karkuns: resolved,
        });
      }
      slots.push(
        buildDaysSlot({
          shiftId: shift._id,
          shiftName: shift.name,
          team,
          weekday,
          resolved,
          addedKarkunIds,
          absentKarkunIds,
          people,
        })
      );
    }

    days.push({ date, dayOfWeek: weekday, inRange, isPast, slots });
  }

  return { startDate, days };
}

async function snapshotRosterDate(roster: RosterDocument, date: string) {
  if (!dateInRange(roster, date)) return;
  if (date >= todayInKarachi()) return;
  const shifts = await shiftsForDuty(roster.dutyId);
  for (const shift of shifts) {
    await resolveShiftDate({ roster, shift, date, writeIfPast: true });
  }
}

export async function snapshotYesterdayDutyRosters(
  reportProgress?: (fraction: number) => Promise<void>
) {
  await ensureDutyRosterIndexes();
  const yesterday = addCalendarDays(todayInKarachi(), -1);
  const rosters = (await DutyRosters.find({
    startDate: { $lte: yesterday },
    $or: [{ endDate: { $exists: false } }, { endDate: { $gte: yesterday } }],
  }).fetchAsync()) as RosterDocument[];

  if (rosters.length === 0) {
    if (reportProgress) await reportProgress(1);
    return 0;
  }

  for (let index = 0; index < rosters.length; index += 1) {
    await snapshotRosterDate(rosters[index], yesterday);
    if (reportProgress) await reportProgress((index + 1) / rosters.length);
  }
  return rosters.length;
}
