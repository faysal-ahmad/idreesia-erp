import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { People } from 'meteor/idreesia-common/server/collections/common';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import {
  DutiesAttendanceDayRecords,
  DutiesAttendanceWorkspaces,
  DutiesAttendanceWorkspaceUsers,
} from 'meteor/idreesia-common/server/collections/duties-attendance';

import {
  addDutiesAttendanceWorkspaceUser,
  addDutyMember,
  createDuty,
  createDutiesAttendanceWorkspace,
  createTodayDayRecords,
  deleteDutiesAttendanceWorkspace,
  getAttendanceSheet,
  getDutyPlanDays,
  normalizePermissions,
  purgeDutiesAttendanceWorkspace,
  removeDuty,
  removeDutyMember,
  removeDutiesAttendanceWorkspaceUser,
  restoreDutiesAttendanceWorkspace,
  searchWorkspaceUserCandidates,
  setDutyAttendance,
  setDutyDayOverride,
  updateDuty,
  updateDutyMember,
  updateDutiesAttendanceWorkspaceUserPermissions,
} from './index';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

// 2024-01-10 is a Wednesday (Karachi time: 15:00).
const TODAY = '2024-01-10';
const TOMORROW = '2024-01-11';

const setNow = (iso: string) => vi.setSystemTime(new Date(iso));

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  setNow('2024-01-10T10:00:00Z');
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const addKarkun = (id: string, name: string) =>
  People.insertAsync({
    _id: id,
    isKarkun: true,
    sharedData: { name },
  } as any);

const seedKarkuns = async () => {
  await addKarkun('k1', 'Zaid');
  await addKarkun('k2', 'Ali');
  await addKarkun('k3', 'Bilal');
};

const seedWorkspace = async () => {
  const workspace = await createDutiesAttendanceWorkspace(
    { name: 'Mehfil Duties', metadata: { locationId: 'loc1' } },
    'admin'
  );
  return workspace._id;
};

const failsWith = (code: string) => ({ extensions: { code } });

describe('workspaces', () => {
  it('creates, soft-deletes, restores and purges a workspace with its data', async () => {
    const workspaceId = await seedWorkspace();
    const duty = await createDuty(workspaceId, { name: 'Gate' }, 'admin');
    await Users.insertAsync({ _id: 'u1' } as any);
    await addDutiesAttendanceWorkspaceUser(
      workspaceId,
      { userId: 'u1', permissions: ['view'] },
      'admin'
    );

    await deleteDutiesAttendanceWorkspace(workspaceId, 'admin');
    await expect(
      createDuty(workspaceId, { name: 'Other' }, 'admin')
    ).rejects.toMatchObject(failsWith('NOT_FOUND'));
    await expect(
      getDutyPlanDays({ workspaceId, dutyId: duty._id, startDate: TODAY })
    ).rejects.toMatchObject(failsWith('NOT_FOUND'));

    await restoreDutiesAttendanceWorkspace(workspaceId, 'admin');
    await expect(
      createDuty(workspaceId, { name: 'Other' }, 'admin')
    ).resolves.toBeTruthy();

    await expect(
      purgeDutiesAttendanceWorkspace(workspaceId, 'admin')
    ).rejects.toMatchObject(failsWith('CONFLICT'));
    await deleteDutiesAttendanceWorkspace(workspaceId, 'admin');
    await purgeDutiesAttendanceWorkspace(workspaceId, 'admin');
    expect(await DutiesAttendanceWorkspaces.findOneAsync(workspaceId)).toBeUndefined();
    expect(await DutiesAttendanceWorkspaceUsers.find({ workspaceId }).countAsync()).toBe(0);
  });
});

describe('workspace users', () => {
  it('always includes view and keeps a canonical order', () => {
    expect(normalizePermissions(['mark-attendance'])).toEqual([
      'view',
      'mark-attendance',
    ]);
    expect(
      normalizePermissions(['mark-attendance', 'manage-and-plan-duties'])
    ).toEqual(['view', 'manage-and-plan-duties', 'mark-attendance']);
  });

  it('rejects empty and unknown permissions', () => {
    expect(() => normalizePermissions([])).toThrow();
    expect(() => normalizePermissions(['fly'])).toThrow();
  });

  it('adds, updates and removes a user, refusing duplicates and unknown users', async () => {
    const workspaceId = await seedWorkspace();
    await Users.insertAsync({ _id: 'u1' } as any);

    const added = await addDutiesAttendanceWorkspaceUser(
      workspaceId,
      { userId: 'u1', permissions: ['mark-attendance'] },
      'admin'
    );
    expect(added.permissions).toEqual(['view', 'mark-attendance']);

    await expect(
      addDutiesAttendanceWorkspaceUser(
        workspaceId,
        { userId: 'u1', permissions: ['view'] },
        'admin'
      )
    ).rejects.toMatchObject(failsWith('CONFLICT'));
    await expect(
      addDutiesAttendanceWorkspaceUser(
        workspaceId,
        { userId: 'nobody', permissions: ['view'] },
        'admin'
      )
    ).rejects.toMatchObject(failsWith('NOT_FOUND'));

    const updated = await updateDutiesAttendanceWorkspaceUserPermissions(
      workspaceId,
      'u1',
      ['manage-and-plan-duties'],
      'admin'
    );
    expect(updated.permissions).toEqual(['view', 'manage-and-plan-duties']);

    await removeDutiesAttendanceWorkspaceUser(workspaceId, 'u1', 'admin');
    await expect(
      removeDutiesAttendanceWorkspaceUser(workspaceId, 'u1', 'admin')
    ).rejects.toMatchObject(failsWith('NOT_FOUND'));
    await expect(
      updateDutiesAttendanceWorkspaceUserPermissions(
        workspaceId,
        'u1',
        ['view'],
        'admin'
      )
    ).rejects.toMatchObject(failsWith('NOT_FOUND'));
  });
});

describe('searchWorkspaceUserCandidates', () => {
  it('finds unlocked, person-linked users by username or display name, ignoring case and regex characters', async () => {
    await Users.insertAsync({ _id: 'u1', username: 'faisal', displayName: 'Faisal Ahmad', personId: 'p1' } as any);
    await Users.insertAsync({ _id: 'u2', username: 'ali', displayName: 'Ali (Gate)', personId: 'p2' } as any);
    await Users.insertAsync({ _id: 'u3', username: 'faisal2', personId: 'p3', locked: true } as any);
    await Users.insertAsync({ _id: 'u4', username: 'faisal3' } as any);

    expect((await searchWorkspaceUserCandidates('FAIS')).map(user => user._id)).toEqual(['u1']);
    expect((await searchWorkspaceUserCandidates('(gate)')).map(user => user._id)).toEqual(['u2']);
    expect((await searchWorkspaceUserCandidates('.*')).length).toBe(0);
    expect((await searchWorkspaceUserCandidates(undefined)).map(user => user._id).sort()).toEqual(['u1', 'u2']);
  });
});

describe('duties and their members', () => {
  it('creates, renames and deactivates a duty, refusing a repeated name', async () => {
    const workspaceId = await seedWorkspace();
    const gate = await createDuty(workspaceId, { name: ' Gate  1 ' }, 'u1');
    expect(gate).toMatchObject({ name: 'Gate 1', isActive: true, members: [] });

    await expect(
      createDuty(workspaceId, { name: 'Gate 1' }, 'u1')
    ).rejects.toMatchObject(failsWith('CONFLICT'));
    await expect(
      createDuty(workspaceId, { name: '  ' }, 'u1')
    ).rejects.toMatchObject(failsWith('BAD_USER_INPUT'));

    const kitchen = await createDuty(workspaceId, { name: 'Kitchen' }, 'u1');
    await expect(
      updateDuty(workspaceId, kitchen._id, { name: 'Gate 1' }, 'u1')
    ).rejects.toMatchObject(failsWith('CONFLICT'));

    const updated = await updateDuty(
      workspaceId,
      kitchen._id,
      { name: 'Langar', description: 'Cooking', isActive: false },
      'u1'
    );
    expect(updated).toMatchObject({
      name: 'Langar',
      description: 'Cooking',
      isActive: false,
    });
  });

  it("doesn't reach a duty through another workspace", async () => {
    const workspaceId = await seedWorkspace();
    const other = await createDutiesAttendanceWorkspace({ name: 'Other' }, 'u1');
    const duty = await createDuty(workspaceId, { name: 'Gate' }, 'u1');

    await expect(
      updateDuty(other._id, duty._id, { name: 'X' }, 'u1')
    ).rejects.toMatchObject(failsWith('NOT_FOUND'));
  });

  it('adds, updates and removes members, validating them', async () => {
    await seedKarkuns();
    await People.insertAsync({ _id: 'p9', isKarkun: false } as any);
    const workspaceId = await seedWorkspace();
    const duty = await createDuty(workspaceId, { name: 'Gate' }, 'u1');

    const withMember = await addDutyMember(
      workspaceId,
      duty._id,
      { karkunId: 'k1', daysOfWeek: ['Mon', 'Mon', 'Tue'], isCoordinator: true },
      'u1'
    );
    expect(withMember.members).toEqual([
      { karkunId: 'k1', isCoordinator: true, daysOfWeek: ['Mon', 'Tue'] },
    ]);

    await expect(
      addDutyMember(workspaceId, duty._id, { karkunId: 'k1' }, 'u1')
    ).rejects.toMatchObject(failsWith('CONFLICT'));
    await expect(
      addDutyMember(workspaceId, duty._id, { karkunId: 'p9' }, 'u1')
    ).rejects.toMatchObject(failsWith('BAD_USER_INPUT'));
    await expect(
      addDutyMember(
        workspaceId,
        duty._id,
        { karkunId: 'k2', daysOfWeek: ['Funday'] },
        'u1'
      )
    ).rejects.toMatchObject(failsWith('BAD_USER_INPUT'));

    const changed = await updateDutyMember(
      workspaceId,
      duty._id,
      { karkunId: 'k1', daysOfWeek: [] },
      'u1'
    );
    expect(changed.members).toEqual([{ karkunId: 'k1' }]);

    await expect(
      updateDutyMember(workspaceId, duty._id, { karkunId: 'k3' }, 'u1')
    ).rejects.toMatchObject(failsWith('NOT_FOUND'));

    const emptied = await removeDutyMember(workspaceId, duty._id, 'k1', 'u1');
    expect(emptied.members).toEqual([]);
    await expect(
      removeDutyMember(workspaceId, duty._id, 'k1', 'u1')
    ).rejects.toMatchObject(failsWith('NOT_FOUND'));
  });

  it('only deletes a duty that never had anybody on duty', async () => {
    await seedKarkuns();
    setNow('2024-01-08T10:00:00Z');
    const workspaceId = await seedWorkspace();
    const unused = await createDuty(workspaceId, { name: 'Unused' }, 'u1');
    const used = await createDuty(workspaceId, { name: 'Used' }, 'u1');
    await addDutyMember(workspaceId, used._id, { karkunId: 'k1' }, 'u1');
    setNow('2024-01-10T10:00:00Z');
    // Reading the plan writes the (empty) records of the unused duty too.
    await getDutyPlanDays({ workspaceId, dutyId: unused._id, startDate: '2024-01-09' });
    await getDutyPlanDays({ workspaceId, dutyId: used._id, startDate: '2024-01-09' });

    await removeDuty(workspaceId, unused._id, 'u1');
    expect(
      await DutiesAttendanceDayRecords.find({ dutyId: unused._id }).countAsync()
    ).toBe(0);
    await expect(
      removeDuty(workspaceId, used._id, 'u1')
    ).rejects.toMatchObject(failsWith('CONFLICT'));
  });
});

// A duty created on Sunday the 7th, so it starts on Monday the 8th, with Zaid
// every day and Ali on Mondays.
const seedPlan = async () => {
  await seedKarkuns();
  setNow('2024-01-07T10:00:00Z'); // Sunday
  const workspaceId = await seedWorkspace();
  const duty = await createDuty(workspaceId, { name: 'Gate' }, 'u1');
  await addDutyMember(workspaceId, duty._id, { karkunId: 'k1' }, 'u1');
  await addDutyMember(
    workspaceId,
    duty._id,
    { karkunId: 'k2', daysOfWeek: ['Mon'] },
    'u1'
  );
  setNow('2024-01-10T10:00:00Z');
  return { workspaceId, dutyId: duty._id };
};

const planDays = async (
  workspaceId: string,
  dutyId: string,
  startDate = '2024-01-08'
) => (await getDutyPlanDays({ workspaceId, dutyId, startDate })).days;

const names = (day: { karkuns: Array<{ name: string }> }) =>
  day.karkuns.map(karkun => karkun.name);

describe('planning', () => {
  it('shows seven days: locked up to today, composed from the roster after', async () => {
    const { workspaceId, dutyId } = await seedPlan();

    const days = await planDays(workspaceId, dutyId);

    expect(days.map(day => day.date)).toEqual([
      '2024-01-08',
      '2024-01-09',
      '2024-01-10',
      '2024-01-11',
      '2024-01-12',
      '2024-01-13',
      '2024-01-14',
    ]);
    expect(days.map(day => day.locked)).toEqual([
      true,
      true,
      true,
      false,
      false,
      false,
      false,
    ]);
    expect(days[0].dayOfWeek).toBe('Mon');
    // Ali is only on duty on Mondays.
    expect(names(days[0])).toEqual(['Ali', 'Zaid']);
    expect(names(days[1])).toEqual(['Zaid']);
    expect(names(days[3])).toEqual(['Zaid']);
    expect(
      await DutiesAttendanceDayRecords.find({ dutyId }).countAsync()
    ).toBe(3);
  });

  it('keeps a locked day as it was when the roster changes later', async () => {
    const { workspaceId, dutyId } = await seedPlan();
    await planDays(workspaceId, dutyId);

    await addDutyMember(workspaceId, dutyId, { karkunId: 'k3' }, 'u1');
    await removeDutyMember(workspaceId, dutyId, 'k1', 'u1');

    const days = await planDays(workspaceId, dutyId);
    expect(names(days[2])).toEqual(['Zaid']); // today, locked
    expect(names(days[3])).toEqual(['Bilal']); // tomorrow, new roster
  });

  it('locks the days before a roster change even if nobody read them yet', async () => {
    const { workspaceId, dutyId } = await seedPlan();

    await removeDutyMember(workspaceId, dutyId, 'k1', 'u1');

    const days = await planDays(workspaceId, dutyId);
    expect(names(days[1])).toEqual(['Zaid']);
    expect(names(days[2])).toEqual(['Zaid']);
    expect(names(days[3])).toEqual([]);
  });

  it('adds people for a future day and takes members off it', async () => {
    const { workspaceId, dutyId } = await seedPlan();

    await setDutyDayOverride({
      workspaceId,
      dutyId,
      date: TOMORROW,
      addedKarkunIds: ['k3'],
      absentKarkunIds: ['k1'],
      userId: 'u1',
    });

    const day = (await planDays(workspaceId, dutyId))[3];
    expect(day.addedKarkunIds).toEqual(['k3']);
    expect(day.absentKarkunIds).toEqual(['k1']);
    expect(day.karkuns.map(k => [k.name, k.off, k.addedForDay])).toEqual([
      ['Bilal', false, true],
      ['Zaid', true, false],
    ]);

    // Clearing both lists removes the override.
    await setDutyDayOverride({
      workspaceId,
      dutyId,
      date: TOMORROW,
      userId: 'u1',
    });
    const cleared = (await planDays(workspaceId, dutyId))[3];
    expect(names(cleared)).toEqual(['Zaid']);
    expect(cleared.karkuns[0].off).toBe(false);
  });

  it('locks an override that was set for a day that has now come', async () => {
    const { workspaceId, dutyId } = await seedPlan();
    setNow('2024-01-09T10:00:00Z');
    await setDutyDayOverride({
      workspaceId,
      dutyId,
      date: TODAY,
      addedKarkunIds: ['k3'],
      userId: 'u1',
    });
    setNow('2024-01-10T10:00:00Z');

    const today = (await planDays(workspaceId, dutyId))[2];
    expect(names(today)).toEqual(['Bilal', 'Zaid']);
    expect(today.karkuns.find(k => k.name === 'Bilal')?.addedForDay).toBe(true);
  });

  it('refuses to plan today or the past, or with people who are not karkuns', async () => {
    const { workspaceId, dutyId } = await seedPlan();

    await expect(
      setDutyDayOverride({
        workspaceId,
        dutyId,
        date: TODAY,
        addedKarkunIds: ['k3'],
        userId: 'u1',
      })
    ).rejects.toMatchObject(failsWith('BAD_USER_INPUT'));
    await expect(
      setDutyDayOverride({
        workspaceId,
        dutyId,
        date: TOMORROW,
        addedKarkunIds: ['ghost'],
        userId: 'u1',
      })
    ).rejects.toMatchObject(failsWith('BAD_USER_INPUT'));
    await expect(
      setDutyDayOverride({
        workspaceId,
        dutyId,
        date: '2024-13-45',
        userId: 'u1',
      })
    ).rejects.toMatchObject(failsWith('BAD_USER_INPUT'));
  });

  it('starts a new duty tomorrow, so its roster can be set up first', async () => {
    await seedKarkuns();
    const workspaceId = await seedWorkspace();
    const duty = await createDuty(workspaceId, { name: 'New' }, 'u1');
    expect(duty.startDate).toBe(TOMORROW);

    await addDutyMember(workspaceId, duty._id, { karkunId: 'k1' }, 'u1');
    await addDutyMember(workspaceId, duty._id, { karkunId: 'k2' }, 'u1');

    const days = await planDays(workspaceId, duty._id, TODAY);
    expect(days[0].locked).toBe(true);
    expect(days[0].karkuns).toEqual([]);
    expect(names(days[1])).toEqual(['Ali', 'Zaid']);
    expect(
      await DutiesAttendanceDayRecords.find({ dutyId: duty._id }).countAsync()
    ).toBe(0);
  });

  it('never applies a roster to days that came before it', async () => {
    await seedKarkuns();
    setNow('2024-01-01T10:00:00Z');
    const workspaceId = await seedWorkspace();
    const duty = await createDuty(workspaceId, { name: 'Late roster' }, 'u1');
    setNow('2024-01-05T10:00:00Z');
    await addDutyMember(workspaceId, duty._id, { karkunId: 'k1' }, 'u1');
    setNow('2024-01-10T10:00:00Z');

    const days = await planDays(workspaceId, duty._id, '2024-01-04');

    // The 4th and 5th had nobody; Zaid joins from the 6th.
    expect(days.map(day => names(day).length)).toEqual([0, 0, 1, 1, 1, 1, 1]);
  });

  it('stops planning an inactive duty, and picks up from tomorrow when it is active again', async () => {
    const { workspaceId, dutyId } = await seedPlan();

    await updateDuty(workspaceId, dutyId, { isActive: false }, 'u1');
    // Days up to today were locked before it stopped.
    expect(
      await DutiesAttendanceDayRecords.find({ dutyId }).countAsync()
    ).toBe(3);

    setNow('2024-01-15T10:00:00Z');
    await planDays(workspaceId, dutyId, '2024-01-10');
    expect(
      await DutiesAttendanceDayRecords.find({ dutyId }).countAsync()
    ).toBe(3);

    const again = await updateDuty(workspaceId, dutyId, { isActive: true }, 'u1');
    expect(again.startDate).toBe('2024-01-16');
    // The 14th and 15th (today) were not planned; the 16th, a future day,
    // is composed from the roster again.
    const days = await planDays(workspaceId, dutyId, '2024-01-14');
    expect(days.map(day => names(day).length)).toEqual([0, 0, 1, 1, 1, 1, 1]);
  });

  it('writes the nightly record for active duties of live workspaces only', async () => {
    const { workspaceId, dutyId } = await seedPlan();
    const inactive = await createDuty(workspaceId, { name: 'Closed' }, 'u1');
    await addDutyMember(workspaceId, inactive._id, { karkunId: 'k3' }, 'u1');
    await updateDuty(workspaceId, inactive._id, { isActive: false }, 'u1');
    const gone = await createDutiesAttendanceWorkspace({ name: 'Gone' }, 'u1');
    const goneDuty = await createDuty(gone._id, { name: 'Old' }, 'u1');
    await addDutyMember(gone._id, goneDuty._id, { karkunId: 'k3' }, 'u1');
    await deleteDutiesAttendanceWorkspace(gone._id, 'u1');
    const progress = vi.fn();

    const processed = await createTodayDayRecords(progress);

    expect(processed).toBe(1);
    expect(progress).toHaveBeenLastCalledWith(1);
    expect(
      await DutiesAttendanceDayRecords.find({ dutyId, date: TODAY }).countAsync()
    ).toBe(1);
    expect(
      await DutiesAttendanceDayRecords.find({ dutyId: inactive._id }).countAsync()
    ).toBe(0);
    expect(
      await DutiesAttendanceDayRecords.find({ dutyId: goneDuty._id }).countAsync()
    ).toBe(0);
  });
});

describe('attendance', () => {
  it('marks, changes and clears attendance for today', async () => {
    const { workspaceId, dutyId } = await seedPlan();
    const mark = (karkunId: string, status?: string | null, date = TODAY) =>
      setDutyAttendance({
        workspaceId,
        dutyId,
        date,
        karkunId,
        status,
        userId: 'marker',
      });
    const today = async () => (await planDays(workspaceId, dutyId))[2];

    await mark('k1', 'present');
    expect((await today()).karkuns[0].attendance).toBe('present');
    const stored = await DutiesAttendanceDayRecords.findOneAsync({
      dutyId,
      date: TODAY,
    });
    expect(stored?.karkuns[0]).toMatchObject({
      karkunId: 'k1',
      attendance: 'present',
      attendanceUpdatedBy: 'marker',
    });

    await mark('k1', 'late');
    expect((await today()).karkuns[0].attendance).toBe('late');

    await mark('k1', null);
    expect((await today()).karkuns[0].attendance).toBeNull();
    const cleared = await DutiesAttendanceDayRecords.findOneAsync({
      dutyId,
      date: TODAY,
    });
    expect(cleared?.karkuns[0].attendanceUpdatedBy).toBeUndefined();
  });

  it('can mark a past day, and locks it first if nobody read it yet', async () => {
    const { workspaceId, dutyId } = await seedPlan();

    await setDutyAttendance({
      workspaceId,
      dutyId,
      date: '2024-01-08',
      karkunId: 'k2',
      status: 'absent',
      userId: 'marker',
    });

    expect((await planDays(workspaceId, dutyId))[0].karkuns[0]).toMatchObject({
      name: 'Ali',
      attendance: 'absent',
    });
  });

  it('refuses the future, bad statuses and people who are not on duty that day', async () => {
    const { workspaceId, dutyId } = await seedPlan();
    const mark = (karkunId: string, status: string, date: string) =>
      setDutyAttendance({
        workspaceId,
        dutyId,
        date,
        karkunId,
        status,
        userId: 'marker',
      });

    await expect(mark('k1', 'present', TOMORROW)).rejects.toMatchObject(
      failsWith('BAD_USER_INPUT')
    );
    await expect(mark('k1', 'sleeping', TODAY)).rejects.toMatchObject(
      failsWith('BAD_USER_INPUT')
    );
    // Ali is only on duty on Mondays; Bilal is not on the duty at all.
    await expect(mark('k2', 'present', TODAY)).rejects.toMatchObject(
      failsWith('BAD_USER_INPUT')
    );
    await expect(mark('k3', 'present', TODAY)).rejects.toMatchObject(
      failsWith('BAD_USER_INPUT')
    );
  });
});

describe('attendance sheet', () => {
  it('totals the month per karkun and duty', async () => {
    const { workspaceId, dutyId } = await seedPlan();
    const mark = (karkunId: string, status: string, date: string) =>
      setDutyAttendance({
        workspaceId,
        dutyId,
        date,
        karkunId,
        status,
        userId: 'marker',
      });
    await mark('k1', 'present', '2024-01-08');
    await mark('k1', 'late', '2024-01-09');
    await mark('k2', 'absent', '2024-01-08');

    const rows = await getAttendanceSheet({ workspaceId, month: '01-2024' });

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      name: 'Ali',
      dutyName: 'Gate',
      month: '01-2024',
      daysOnDuty: 1,
      absentCount: 1,
      percentage: 0,
    });
    expect(rows[1]).toMatchObject({
      name: 'Zaid',
      daysOnDuty: 3,
      presentCount: 1,
      lateCount: 1,
      unmarkedCount: 1,
      percentage: 67,
    });
  });

  it('narrows to one duty and rejects a bad month', async () => {
    const { workspaceId, dutyId } = await seedPlan();
    const other = await createDuty(workspaceId, { name: 'Kitchen' }, 'u1');

    expect(
      await getAttendanceSheet({ workspaceId, month: '01-2024', dutyId: other._id })
    ).toEqual([]);
    expect(
      (await getAttendanceSheet({ workspaceId, month: '01-2024', dutyId })).length
    ).toBeGreaterThan(0);
    await expect(
      getAttendanceSheet({ workspaceId, month: '2024-01' })
    ).rejects.toMatchObject(failsWith('BAD_USER_INPUT'));
  });
});
