import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
  attendanceBarcodeId,
  createTodayDutyDayAttendances,
  ensureDutyDayAttendancesForTeam,
  getDutyAttendanceCards,
  getDutyAttendanceSheet,
  getDutyPlanDays,
  getDutyPlanWeek,
  getKarkunDutyAttendanceSheet,
  locationIsPlanned,
  setDutyAttendance,
  setDutyDayOverride,
  setDutyShiftTeam,
  shiftIsPlanned,
  teamIsAssigned,
} from './duty-planning';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

// 2024-01-10 is a Wednesday (Karachi time: 15:00).
const TODAY = '2024-01-10';
const user = { _id: 'u1' };

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2024-01-10T10:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const addKarkun = (id: string, name: string, extra = {}) =>
  People.insertAsync({
    _id: id,
    isKarkun: true,
    sharedData: { name },
    ...extra,
  } as any);

// duty d1 with location l1 and a morning/evening shift, one team t1.
const seed = async (
  members: Array<Record<string, unknown>> = [
    { karkunId: 'k1' },
    { karkunId: 'k2', daysOfWeek: ['Mon'] },
  ]
) => {
  await Duties.insertAsync({ _id: 'd1', name: 'Gate' } as any);
  await DutyLocations.insertAsync({ _id: 'l1', dutyId: 'd1', name: 'Main' } as any);
  await DutyShifts.insertAsync({
    _id: 'sh1',
    dutyId: 'd1',
    name: 'Morning',
    startTime: '2024-01-01T06:00:00Z',
  } as any);
  await DutyShifts.insertAsync({
    _id: 'sh2',
    dutyId: 'd1',
    name: 'Evening',
    startTime: '2024-01-01T16:00:00Z',
  } as any);
  await addKarkun('k1', 'Zaid');
  await addKarkun('k2', 'Ali');
  await addKarkun('k3', 'Bilal');
  await Teams.insertAsync({
    _id: 't1',
    name: 'Team A',
    color: 'red',
    dutyId: 'd1',
    members,
  } as any);
};

const assign = (startDate: string, shiftId = 'sh1', teamId = 't1') =>
  DutyTeamAssignments.insertAsync({
    dutyId: 'd1',
    locationId: 'l1',
    shiftId,
    teamId,
    startDate,
  } as any);

const planArgs = { dutyId: 'd1', locationId: 'l1', shiftId: 'sh1' };

interface DayRecord {
  date: string;
  shiftId: string;
  shiftName: string;
  updatedBy?: string;
  karkuns: Array<Record<string, any>>;
}

const record = async (date: string, shiftId = 'sh1') =>
  (await DutyDayAttendances.findOneAsync({
    dutyId: 'd1',
    locationId: 'l1',
    shiftId,
    date,
  })) as unknown as DayRecord | undefined;

const allRecords = async () =>
  (await DutyDayAttendances.find({}).fetchAsync()) as unknown as DayRecord[];

describe('setDutyShiftTeam', () => {
  it.each([
    ['an unknown duty', { dutyId: 'nope' }, 'Please select a valid duty.'],
    ['an unknown location', { locationId: 'nope' }, 'Please select a location for this duty.'],
    ['an unknown shift', { shiftId: 'nope' }, 'Please select a shift for this duty.'],
    ['an unknown team', { teamId: 'nope' }, 'Please select a team for this duty.'],
  ])('rejects %s', async (_label, override, message) => {
    await seed();
    await expect(
      setDutyShiftTeam({ ...planArgs, teamId: 't1', ...override, user })
    ).rejects.toThrow(message);
  });

  it('rejects a mehfil duty, a foreign location, a foreign shift and a foreign team', async () => {
    await seed();
    await Duties.insertAsync({ _id: 'mehfil', name: 'M', isMehfilDuty: true } as any);
    await Duties.insertAsync({ _id: 'd2', name: 'Other' } as any);
    await DutyLocations.insertAsync({ _id: 'l2', dutyId: 'd2', name: 'X' } as any);
    await DutyShifts.insertAsync({ _id: 'sh9', dutyId: 'd2', name: 'X' } as any);
    await Teams.insertAsync({ _id: 't9', name: 'X', dutyId: 'd2', members: [] } as any);

    await expect(
      setDutyShiftTeam({ ...planArgs, dutyId: 'mehfil', teamId: 't1', user })
    ).rejects.toThrow('Please select a valid duty.');
    await expect(
      setDutyShiftTeam({ ...planArgs, locationId: 'l2', teamId: 't1', user })
    ).rejects.toThrow('Please select a location for this duty.');
    await expect(
      setDutyShiftTeam({ ...planArgs, shiftId: 'sh9', teamId: 't1', user })
    ).rejects.toThrow('Please select a shift for this duty.');
    await expect(
      setDutyShiftTeam({ ...planArgs, teamId: 't9', user })
    ).rejects.toThrow('Please select a team for this duty.');
  });

  it('assigns a new team starting tomorrow', async () => {
    await seed();
    expect(await setDutyShiftTeam({ ...planArgs, teamId: 't1', user })).toBe(true);
    const assignment = await DutyTeamAssignments.findOneAsync({});
    expect(assignment).toMatchObject({
      ...planArgs,
      teamId: 't1',
      startDate: '2024-01-11',
      createdBy: 'u1',
    });
  });

  it('does nothing when the team is unchanged', async () => {
    await seed();
    await assign('2024-01-05');
    await setDutyShiftTeam({ ...planArgs, teamId: 't1', user });
    expect((await DutyTeamAssignments.findOneAsync({}))?.startDate).toBe('2024-01-05');
    expect(await DutyDayAttendances.find({}).countAsync()).toBe(0);
  });

  it('locks the days the old team covered before replacing it', async () => {
    await seed();
    await Teams.insertAsync({
      _id: 't2',
      name: 'Team B',
      dutyId: 'd1',
      members: [{ karkunId: 'k3' }],
    } as any);
    await assign('2024-01-08'); // Monday

    await setDutyShiftTeam({ ...planArgs, teamId: 't2', user });

    const records = await allRecords();
    expect(records.map(r => r.date).sort()).toEqual(['2024-01-08', '2024-01-09', '2024-01-10']);
    const monday = records.find(r => r.date === '2024-01-08');
    // k2 only works Mondays.
    expect(monday?.karkuns.map(k => k.name)).toEqual(['Ali', 'Zaid']);
    const tuesday = records.find(r => r.date === '2024-01-09');
    expect(tuesday?.karkuns.map(k => k.name)).toEqual(['Zaid']);
    expect(tuesday?.karkuns[0]).toMatchObject({
      teamId: 't1',
      teamName: 'Team A',
      addedForDay: false,
    });
    expect(tuesday?.shiftName).toBe('Morning');

    const assignments = await DutyTeamAssignments.find({}).fetchAsync();
    expect(assignments).toHaveLength(1);
    expect(assignments[0]).toMatchObject({ teamId: 't2', startDate: '2024-01-11' });
  });

  it('removes the assignment when the team is cleared', async () => {
    await seed();
    await assign('2024-01-09');
    await setDutyShiftTeam({ ...planArgs, teamId: null, user });
    expect(await DutyTeamAssignments.find({}).countAsync()).toBe(0);
    expect(await DutyDayAttendances.find({}).countAsync()).toBe(2);
  });

  it('rolls back the locked days and removal when the new assignment cannot be written', async () => {
    await seed();
    await Teams.insertAsync({ _id: 't2', name: 'B', dutyId: 'd1', members: [] } as any);
    await assign('2024-01-08');

    vi.spyOn(DutyTeamAssignments, 'insertAsync').mockRejectedValueOnce(
      new Error('insert failed')
    );
    await expect(
      setDutyShiftTeam({ ...planArgs, teamId: 't2', user })
    ).rejects.toThrow('insert failed');

    expect(await DutyDayAttendances.find({}).countAsync()).toBe(0);
    const assignments = await DutyTeamAssignments.find({}).fetchAsync();
    expect(assignments.map(a => a.teamId)).toEqual(['t1']);
  });
});

describe('setDutyDayOverride', () => {
  const override = (extra: Record<string, unknown> = {}) =>
    setDutyDayOverride({ ...planArgs, date: '2024-01-12', user, ...extra });

  it.each([
    ['an invalid date', '2024-02-30', 'Please select a valid date.'],
    ['today', TODAY, 'Only future days can be changed. The plan for today is locked.'],
    ['a past day', '2024-01-09', 'Only future days can be changed. The plan for today is locked.'],
  ])('rejects %s', async (_label, date, message) => {
    await seed();
    await expect(override({ date, addedKarkunIds: ['k3'] })).rejects.toThrow(message);
  });

  it('rejects people who are not karkuns', async () => {
    await seed();
    await People.insertAsync({ _id: 'v1', isVisitor: true } as any);
    await expect(override({ addedKarkunIds: ['v1'] })).rejects.toThrow(
      'Please select a valid karkun.'
    );
    await expect(override({ absentKarkunIds: ['ghost'] })).rejects.toThrow(
      'Please select a valid karkun.'
    );
  });

  it('creates, updates and clears an override', async () => {
    await seed();
    await override({ addedKarkunIds: ['k3', 'k3', null], absentKarkunIds: ['k1', 'k3'] });
    let stored = await DutyDayOverrides.findOneAsync({});
    // k3 is added, so it is not also absent; duplicates and nulls are dropped.
    expect(stored).toMatchObject({
      ...planArgs,
      date: '2024-01-12',
      addedKarkunIds: ['k3'],
      absentKarkunIds: ['k1'],
      createdBy: 'u1',
    });

    await override({ absentKarkunIds: ['k2'] });
    stored = await DutyDayOverrides.findOneAsync({});
    expect(await DutyDayOverrides.find({}).countAsync()).toBe(1);
    expect(stored).toMatchObject({ addedKarkunIds: [], absentKarkunIds: ['k2'] });

    await override({});
    expect(await DutyDayOverrides.find({}).countAsync()).toBe(0);
    // Clearing a missing override is fine.
    await expect(override({})).resolves.toBe(true);
  });
});

describe('setDutyAttendance', () => {
  const mark = (extra: Record<string, unknown> = {}) =>
    setDutyAttendance({ ...planArgs, date: TODAY, karkunId: 'k1', status: 'present', user, ...extra });

  it('rejects future days, bad dates and bad statuses', async () => {
    await seed();
    await assign('2024-01-08');
    await expect(mark({ date: '2024-01-11' })).rejects.toThrow(
      'Attendance cannot be recorded for a future day.'
    );
    await expect(mark({ date: 'soon' })).rejects.toThrow('Please select a valid date.');
    await expect(mark({ status: 'sleeping' })).rejects.toThrow(
      'Please select present, late, or absent.'
    );
  });

  it('rejects a karkun who is not on duty (including off weekdays)', async () => {
    await seed();
    await assign('2024-01-08');
    await expect(mark({ karkunId: 'k3' })).rejects.toThrow(
      'This karkun is not on duty for this shift.'
    );
    // k2 only works Mondays and today is Wednesday.
    await expect(mark({ karkunId: 'k2' })).rejects.toThrow(
      'This karkun is not on duty for this shift.'
    );
  });

  it('rejects a day nobody planned', async () => {
    await seed();
    await expect(mark()).rejects.toThrow('This karkun is not on duty for this shift.');
    expect(await DutyDayAttendances.find({}).countAsync()).toBe(0);
  });

  it.each(['present', 'late', 'absent'])('records %s and locks the day', async status => {
    await seed();
    await assign('2024-01-08');
    expect(await mark({ status })).toBe(true);

    const day = await record(TODAY);
    const karkun = day?.karkuns.find(k => k.karkunId === 'k1');
    expect(karkun).toMatchObject({
      attendance: status,
      attendanceUpdatedBy: 'u1',
    });
    expect(karkun?.attendanceUpdatedAt).toEqual(new Date('2024-01-10T10:00:00Z'));
    expect(day?.updatedBy).toBe('u1');
  });

  it('clears attendance when the status is empty', async () => {
    await seed();
    await assign('2024-01-08');
    await mark();
    await mark({ status: null });
    const karkun = (await record(TODAY))?.karkuns.find(k => k.karkunId === 'k1');
    expect(karkun?.attendance).toBeUndefined();
    expect(karkun?.attendanceUpdatedAt).toBeUndefined();
    expect(karkun?.attendanceUpdatedBy).toBeUndefined();
  });

  it('can mark people added for the day by an override', async () => {
    await seed();
    await DutyDayOverrides.insertAsync({
      ...planArgs,
      date: TODAY,
      addedKarkunIds: ['k3'],
      absentKarkunIds: [],
    } as any);
    await mark({ karkunId: 'k3', status: 'late' });
    const day = await record(TODAY);
    expect(day?.karkuns).toHaveLength(1);
    expect(day?.karkuns[0]).toMatchObject({
      karkunId: 'k3',
      addedForDay: true,
      attendance: 'late',
    });
    expect(day?.karkuns[0].teamId).toBeUndefined();
  });

  it('rolls back the locked day when the attendance update fails', async () => {
    await seed();
    await assign('2024-01-08');
    vi.spyOn(DutyDayAttendances, 'updateAsync').mockRejectedValueOnce(
      new Error('update failed')
    );
    await expect(mark()).rejects.toThrow('update failed');
    expect(await DutyDayAttendances.find({}).countAsync()).toBe(0);
  });
});

describe('ensureDutyDayAttendancesForTeam', () => {
  it('locks every started assignment of the team and skips future ones', async () => {
    await seed();
    await assign('2024-01-09');
    await assign('2024-01-11', 'sh2');

    await ensureDutyDayAttendancesForTeam('t1');

    const records = await allRecords();
    expect(records.map(r => `${r.shiftId}:${r.date}`).sort()).toEqual([
      'sh1:2024-01-09',
      'sh1:2024-01-10',
    ]);
  });

  it('does not duplicate days that are already locked', async () => {
    await seed();
    await assign('2024-01-09');
    await ensureDutyDayAttendancesForTeam('t1');
    await ensureDutyDayAttendancesForTeam('t1');
    expect(await DutyDayAttendances.find({}).countAsync()).toBe(2);
  });

  it('keeps an existing locked record untouched when the team changes later', async () => {
    await seed();
    await assign('2024-01-10');
    await ensureDutyDayAttendancesForTeam('t1');
    await Teams.updateAsync('t1', { $push: { members: { karkunId: 'k3' } } });
    await ensureDutyDayAttendancesForTeam('t1');
    expect((await record(TODAY))?.karkuns.map(k => k.karkunId)).toEqual(['k1']);
  });
});

describe('createTodayDutyDayAttendances', () => {
  it('locks today for every started assignment and today override', async () => {
    await seed();
    await assign('2024-01-05');
    await assign('2024-01-20', 'sh2'); // not started
    await DutyDayOverrides.insertAsync({
      ...planArgs,
      shiftId: 'sh2',
      date: TODAY,
      addedKarkunIds: ['k3'],
      absentKarkunIds: [],
    } as any);
    const progress = vi.fn(async (_fraction: number) => undefined);

    const count = await createTodayDutyDayAttendances(progress);

    expect(count).toBe(2);
    expect(progress.mock.calls.map(c => c[0])).toEqual([0.5, 1]);
    const records = await allRecords();
    expect(records.map(r => `${r.shiftId}:${r.date}`).sort()).toEqual([
      'sh1:2024-01-10',
      'sh2:2024-01-10',
    ]);
  });

  it('reports full progress and returns 0 when nothing is planned', async () => {
    const progress = vi.fn(async (_fraction: number) => undefined);
    expect(await createTodayDutyDayAttendances(progress)).toBe(0);
    expect(progress).toHaveBeenCalledWith(1);
  });

  it('is safe to run twice', async () => {
    await seed();
    await assign('2024-01-05');
    await createTodayDutyDayAttendances();
    await createTodayDutyDayAttendances();
    expect(await DutyDayAttendances.find({}).countAsync()).toBe(1);
  });
});

describe('planning predicates', () => {
  it('teamIsAssigned', async () => {
    await seed();
    expect(await teamIsAssigned('t1')).toBe(false);
    await assign('2024-01-05');
    expect(await teamIsAssigned('t1')).toBe(true);
  });

  it('shiftIsPlanned and locationIsPlanned count assignments and future overrides only', async () => {
    await seed();
    expect(await shiftIsPlanned('sh1')).toBe(false);
    expect(await locationIsPlanned('l1')).toBe(false);

    const base = { dutyId: 'd1', locationId: 'l1', addedKarkunIds: [], absentKarkunIds: [] };
    await DutyDayOverrides.insertAsync({ ...base, shiftId: 'sh1', date: TODAY } as any);
    expect(await shiftIsPlanned('sh1')).toBe(false);

    await DutyDayOverrides.insertAsync({ ...base, shiftId: 'sh1', date: '2024-01-11' } as any);
    expect(await shiftIsPlanned('sh1')).toBe(true);
    expect(await shiftIsPlanned('sh2')).toBe(false);
    expect(await locationIsPlanned('l1')).toBe(true);

    await assign('2024-01-05', 'sh2');
    expect(await shiftIsPlanned('sh2')).toBe(true);
  });
});

describe('getDutyPlanWeek', () => {
  it('returns shifts in start-time order with the slots that have a team', async () => {
    await seed();
    await assign('2024-01-11', 'sh2');
    const week = await getDutyPlanWeek('d1', 'l1');
    expect(week.shifts.map(s => s.name)).toEqual(['Morning', 'Evening']);
    expect(week.slots).toEqual([
      {
        shiftId: 'sh2',
        teamId: 't1',
        teamName: 'Team A',
        teamColor: 'red',
        startDate: '2024-01-11',
      },
    ]);
  });

  it('skips assignments whose team no longer exists', async () => {
    await seed();
    await assign('2024-01-11', 'sh1', 'gone');
    expect((await getDutyPlanWeek('d1', 'l1')).slots).toEqual([]);
  });

  it('validates the duty and location', async () => {
    await seed();
    await expect(getDutyPlanWeek('nope', 'l1')).rejects.toThrow('Please select a valid duty.');
    await expect(getDutyPlanWeek('d1', 'nope')).rejects.toThrow(
      'Please select a location for this duty.'
    );
  });
});

describe('getDutyPlanDays', () => {
  it('rejects an invalid start date', async () => {
    await seed();
    await expect(getDutyPlanDays('d1', 'l1', '2024-1-1')).rejects.toThrow(
      'Please select a valid start date.'
    );
  });

  it('returns seven days, locking past days and planning future ones', async () => {
    await seed();
    await assign('2024-01-09');
    await DutyDayOverrides.insertAsync({
      ...planArgs,
      date: '2024-01-12', // Friday
      addedKarkunIds: ['k3'],
      absentKarkunIds: ['k1'],
    } as any);

    const result = await getDutyPlanDays('d1', 'l1', '2024-01-08');

    expect(result.startDate).toBe('2024-01-08');
    expect(result.days.map(d => d.date)).toEqual([
      '2024-01-08',
      '2024-01-09',
      '2024-01-10',
      '2024-01-11',
      '2024-01-12',
      '2024-01-13',
      '2024-01-14',
    ]);
    expect(result.days.map(d => d.dayOfWeek)).toEqual([
      'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun',
    ]);
    expect(result.days.map(d => d.locked)).toEqual([
      true, true, true, false, false, false, false,
    ]);

    // Assignment started on the 9th: Monday has no plan, with both shifts listed.
    expect(result.days[0].slots.map(s => s.shiftName)).toEqual(['Morning', 'Evening']);
    expect(result.days[0].slots[0].teamKarkuns).toEqual([]);
    expect(result.days[0].slots[0].teamName).toBeNull();

    const tuesday = result.days[1].slots[0];
    expect(tuesday.teamName).toBe('Team A');
    expect(tuesday.teamKarkuns.map(k => k.name)).toEqual(['Zaid']);
    expect(tuesday.teamKarkuns[0]).toMatchObject({ off: false, attendance: null });

    // Thursday is still being planned and follows the team.
    expect(result.days[3].slots[0].teamKarkuns.map(k => k.name)).toEqual(['Zaid']);

    // Friday: k1 absent (shown as off), k3 added.
    const friday = result.days[4].slots[0];
    expect(friday.teamKarkuns).toEqual([
      expect.objectContaining({ karkunId: 'k1', name: 'Zaid', off: true, attendance: null }),
    ]);
    expect(friday.addedKarkuns.map(k => k.name)).toEqual(['Bilal']);
    expect(friday.addedKarkunIds).toEqual(['k3']);
    expect(friday.absentKarkunIds).toEqual(['k1']);
  });

  it('shows locked days from their record, not from the current team', async () => {
    await seed();
    await assign('2024-01-10');
    await getDutyPlanDays('d1', 'l1', '2024-01-10');
    await Teams.updateAsync('t1', { $push: { members: { karkunId: 'k3' } } });
    await setDutyAttendance({ ...planArgs, date: TODAY, karkunId: 'k1', status: 'late', user });

    const result = await getDutyPlanDays('d1', 'l1', '2024-01-10');
    const today = result.days[0].slots[0];
    expect(today.teamKarkuns.map(k => k.name)).toEqual(['Zaid']);
    expect(today.teamKarkuns[0].attendance).toBe('late');
  });

  it('does not list an absent person who is not available that weekday', async () => {
    await seed();
    await assign('2024-01-09');
    // k2 only works Mondays; absence on Friday 12th is irrelevant.
    await DutyDayOverrides.insertAsync({
      ...planArgs,
      date: '2024-01-12',
      addedKarkunIds: [],
      absentKarkunIds: ['k2'],
    } as any);
    const result = await getDutyPlanDays('d1', 'l1', '2024-01-12');
    expect(result.days[0].slots[0].teamKarkuns.map(k => k.karkunId)).toEqual(['k1']);
  });
});

describe('attendanceBarcodeId', () => {
  it('joins the karkun and the month without a dash', () => {
    expect(attendanceBarcodeId('k1', '01-2024')).toBe('k1-012024');
  });
});

describe('attendance sheet', () => {
  const day = (
    date: string,
    karkuns: Array<Record<string, unknown>>,
    extra: Record<string, unknown> = {}
  ) =>
    DutyDayAttendances.insertAsync({
      dutyId: 'd1',
      locationId: 'l1',
      shiftId: 'sh1',
      shiftName: 'Morning',
      date,
      karkuns,
      ...extra,
    } as any);

  const entry = (karkunId: string, name: string, attendance?: string) => ({
    karkunId,
    name,
    addedForDay: false,
    ...(attendance ? { attendance } : {}),
  });

  it.each(['2024-01', '13-2024', '00-2024', '1-2024', ''])(
    'rejects the month %s',
    async month => {
      await seed();
      await expect(getDutyAttendanceSheet({ month, dutyId: 'd1' })).rejects.toThrow(
        'Please select a valid month.'
      );
    }
  );

  it('validates the duty, location and shift', async () => {
    await seed();
    await expect(getDutyAttendanceSheet({ month: '01-2024', dutyId: 'x' })).rejects.toThrow(
      'Please select a valid duty.'
    );
    await expect(
      getDutyAttendanceSheet({ month: '01-2024', dutyId: 'd1', locationId: 'x' })
    ).rejects.toThrow('Please select a location for this duty.');
    await expect(
      getDutyAttendanceSheet({ month: '01-2024', dutyId: 'd1', shiftId: 'x' })
    ).rejects.toThrow('Please select a shift for this duty.');
  });

  it('totals present/late/absent/unmarked per karkun and computes the percentage', async () => {
    await seed();
    await day('2024-01-01', [entry('k1', 'Zaid', 'present'), entry('k2', 'Ali', 'absent')]);
    await day('2024-01-02', [entry('k1', 'Zaid', 'late'), entry('k2', 'Ali')]);
    await day('2024-01-03', [entry('k1', 'Zaid', 'absent'), entry('k2', 'Ali', 'present')]);
    await day('2024-01-04', [entry('k1', 'Zaid')]);
    await day('2024-02-01', [entry('k1', 'Zaid', 'present')]); // other month

    const rows = await getDutyAttendanceSheet({ month: '01-2024', dutyId: 'd1' });

    expect(rows.map(r => r.name)).toEqual(['Ali', 'Zaid']);
    expect(rows[1]).toMatchObject({
      _id: '01-2024|k1|l1|sh1',
      month: '01-2024',
      karkunId: 'k1',
      shiftName: 'Morning',
      daysOnDuty: 4,
      presentCount: 1,
      lateCount: 1,
      absentCount: 1,
      unmarkedCount: 1,
      percentage: 50,
      barcodeId: 'k1-012024',
    });
    expect(rows[0]).toMatchObject({ daysOnDuty: 3, presentCount: 1, absentCount: 1, unmarkedCount: 1, percentage: 33 });
  });

  it('uses the latest name and shift name, and filters by location and shift', async () => {
    await seed();
    await DutyLocations.insertAsync({ _id: 'l2', dutyId: 'd1', name: 'Back' } as any);
    await day('2024-01-01', [entry('k1', 'Old Name')], { shiftName: 'Old Shift' });
    await day('2024-01-02', [entry('k1', 'New Name')], { shiftName: 'New Shift' });
    await day('2024-01-03', [entry('k1', 'Zaid')], { locationId: 'l2' });
    await day('2024-01-03', [entry('k1', 'Zaid')], { shiftId: 'sh2', shiftName: 'Evening' });

    const rows = await getDutyAttendanceSheet({
      month: '01-2024',
      dutyId: 'd1',
      locationId: 'l1',
      shiftId: 'sh1',
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ name: 'New Name', shiftName: 'New Shift', daysOnDuty: 2 });

    const all = await getDutyAttendanceSheet({ month: '01-2024', dutyId: 'd1' });
    expect(all).toHaveLength(3);
  });

  it('locks planned past days of the month before summing', async () => {
    await seed();
    await assign('2024-01-08');
    const rows = await getDutyAttendanceSheet({ month: '01-2024', dutyId: 'd1' });
    // Mon 8th (k1 + k2), Tue 9th, Wed 10th (k1 only).
    const zaid = rows.find(r => r.name === 'Zaid');
    const ali = rows.find(r => r.name === 'Ali');
    expect(zaid).toMatchObject({ daysOnDuty: 3, unmarkedCount: 3, percentage: 0 });
    expect(ali).toMatchObject({ daysOnDuty: 1 });
  });

  it('builds one card per requested karkun with totals across shifts', async () => {
    await seed();
    await day('2024-01-01', [entry('k1', 'Zaid', 'present'), entry('k2', 'Ali', 'present')]);
    await day('2024-01-02', [entry('k1', 'Zaid', 'absent')], { shiftId: 'sh2', shiftName: 'Evening' });
    await day('2024-01-03', [entry('k1', 'Zaid', 'late')], { shiftId: 'sh2', shiftName: 'Evening' });

    const cards = await getDutyAttendanceCards({
      month: '01-2024',
      dutyId: 'd1',
      karkunIds: ['k1', 'unknown'],
    });

    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({
      _id: 'k1',
      name: 'Zaid',
      daysOnDuty: 3,
      presentCount: 1,
      lateCount: 1,
      absentCount: 1,
      unmarkedCount: 0,
      percentage: 67,
      barcodeId: 'k1-012024',
    });
    expect(cards[0].shiftNames.sort()).toEqual(['Evening', 'Morning']);
  });

  it("lists one karkun's months newest first, across duties", async () => {
    await day('2023-12-31', [entry('k1', 'Zaid', 'present'), entry('k2', 'Ali')]);
    await day('2024-01-05', [entry('k1', 'Zaid', 'absent')]);
    await day('2024-01-06', [entry('k1', 'Zaid', 'present')], {
      dutyId: 'd2',
      shiftId: 'sh9',
      shiftName: 'Night',
    });

    const rows = await getKarkunDutyAttendanceSheet('k1');

    expect(rows.map(r => `${r.month}|${r.dutyId}`)).toEqual([
      '01-2024|d1',
      '01-2024|d2',
      '12-2023|d1',
    ]);
    expect(rows.every(r => r.karkunId === 'k1')).toBe(true);
    expect(rows[0]).toMatchObject({ absentCount: 1, percentage: 0 });
    expect(rows[2]).toMatchObject({ presentCount: 1, percentage: 100 });
  });
});

describe('shift order', () => {
  it('lists shifts by the time of day they start, whatever date was saved', async () => {
    await seed();
    // Saved later, on another date, but starts earliest in the day (5am Karachi).
    await DutyShifts.insertAsync({
      _id: 'sh0',
      dutyId: 'd1',
      name: 'Zz Early',
      startTime: '2026-06-01T00:00:00Z',
    } as any);
    await DutyShifts.insertAsync({ _id: 'sh9', dutyId: 'd1', name: 'Aa No Time' } as any);

    const week = await getDutyPlanWeek('d1', 'l1');

    expect(week.shifts.map(shift => shift._id)).toEqual(['sh0', 'sh1', 'sh2', 'sh9']);
  });
});
