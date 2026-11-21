import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  OrgLocations,
} from 'meteor/idreesia-common/server/collections/admin';
import {
  DutiesAttendanceDayRecords,
  DutiesAttendanceDuties,
} from 'meteor/idreesia-common/server/collections/duties-attendance';

import { MehfilTemplateDuties } from 'meteor/idreesia-common/server/collections/admin';
import { createMehfilDuty } from 'meteor/idreesia-common/server/business-logic/admin/mehfil-template-duties';
import {
  addDuties,
  addDutyMember,
  createDuty,
  createTodayDayRecords,
  getDutyNames,
  getAttendanceSheet,
  getDutyPlanDays,
  removeDuty,
  removeDutyMember,
  setDutyAttendance,
  setDutyDayOverride,
  updateDuty,
  updateDutyMember,
} from './index';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

// 2024-01-10 is a Wednesday (Karachi time: 15:00).

// A location picks its duties from the mehfil template duties.
const createNamedDuty = async (
  locationId: string,
  name: string,
  userId: string
) => {
  const existing = await MehfilTemplateDuties.findOneAsync({ name });
  const mehfilDutyId =
    existing?._id ?? (await createMehfilDuty({ name }, userId))._id;
  return createDuty(locationId, { mehfilDutyId }, userId);
};

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

const seedWorkspace = async () =>
  (await OrgLocations.insertAsync({
    name: 'Gulshan Mehfil',
    type: 'mehfil',
  } as never)) as string;

const failsWith = (code: string) => ({ extensions: { code } });

describe('the location', () => {
  it('has to be a mehfil', async () => {
    const cityId = (await OrgLocations.insertAsync({
      name: 'Karachi',
      type: 'city',
    } as never)) as string;

    await expect(
      createNamedDuty(cityId, 'Gate', 'admin')
    ).rejects.toMatchObject(failsWith('NOT_FOUND'));
    await expect(
      createDuty('nowhere', { mehfilDutyId: 'x' }, 'admin')
    ).rejects.toMatchObject(failsWith('NOT_FOUND'));
  });
});

describe('duties and their members', () => {
  it('creates a duty from the template list and deactivates it, refusing a repeat', async () => {
    const locationId = await seedWorkspace();
    const gate = await createNamedDuty(locationId, ' Gate  1 ', 'u1');
    expect(gate).toMatchObject({ isActive: true, members: [] });
    // The name stays with the template duty; the duty keeps no copy.
    expect(gate).not.toHaveProperty('name');
    expect(gate).not.toHaveProperty('description');
    expect([...(await getDutyNames([gate])).values()]).toEqual(['Gate 1']);

    await expect(
      createNamedDuty(locationId, 'Gate 1', 'u1')
    ).rejects.toMatchObject(failsWith('CONFLICT'));
    // Only the template list can be used, not a name of its own.
    await expect(
      createDuty(locationId, { mehfilDutyId: 'nope' }, 'u1')
    ).rejects.toMatchObject(failsWith('BAD_USER_INPUT'));

    const kitchen = await createNamedDuty(locationId, 'Kitchen', 'u1');
    const updated = await updateDuty(
      locationId,
      kitchen._id,
      { isActive: false },
      'u1'
    );
    expect(updated).toMatchObject({ isActive: false });
  });

  it('adds several template duties at once, all or none', async () => {
    const locationId = await seedWorkspace();
    const a = await createMehfilDuty({ name: 'Gate' }, 'u1');
    const b = await createMehfilDuty({ name: 'Kitchen' }, 'u1');

    const added = await addDuties(locationId, [a._id, b._id, a._id], 'u1');
    expect(added).toHaveLength(2);

    const c = await createMehfilDuty({ name: 'Langar' }, 'u1');
    // One already there: nothing is added.
    await expect(
      addDuties(locationId, [c._id, a._id], 'u1')
    ).rejects.toMatchObject(failsWith('CONFLICT'));
    expect(
      await DutiesAttendanceDuties.find({ locationId }).countAsync()
    ).toBe(2);
    await expect(addDuties(locationId, [], 'u1')).rejects.toMatchObject(
      failsWith('BAD_USER_INPUT')
    );
  });

  it("doesn't reach a duty through another location", async () => {
    const locationId = await seedWorkspace();
    const other = { _id: await seedWorkspace() };
    const duty = await createNamedDuty(locationId, 'Gate', 'u1');

    await expect(
      updateDuty(other._id, duty._id, { isActive: false }, 'u1')
    ).rejects.toMatchObject(failsWith('NOT_FOUND'));
  });

  it('adds, updates and removes members, validating them', async () => {
    await seedKarkuns();
    await People.insertAsync({ _id: 'p9', isKarkun: false } as any);
    const locationId = await seedWorkspace();
    const duty = await createNamedDuty(locationId, 'Gate', 'u1');

    const withMember = await addDutyMember(
      locationId,
      duty._id,
      { karkunId: 'k1', daysOfWeek: ['Mon', 'Mon', 'Tue'], isCoordinator: true },
      'u1'
    );
    expect(withMember.members).toEqual([
      { karkunId: 'k1', isCoordinator: true, daysOfWeek: ['Mon', 'Tue'] },
    ]);

    await expect(
      addDutyMember(locationId, duty._id, { karkunId: 'k1' }, 'u1')
    ).rejects.toMatchObject(failsWith('CONFLICT'));
    await expect(
      addDutyMember(locationId, duty._id, { karkunId: 'p9' }, 'u1')
    ).rejects.toMatchObject(failsWith('BAD_USER_INPUT'));
    await expect(
      addDutyMember(
        locationId,
        duty._id,
        { karkunId: 'k2', daysOfWeek: ['Funday'] },
        'u1'
      )
    ).rejects.toMatchObject(failsWith('BAD_USER_INPUT'));

    const changed = await updateDutyMember(
      locationId,
      duty._id,
      { karkunId: 'k1', daysOfWeek: [] },
      'u1'
    );
    expect(changed.members).toEqual([{ karkunId: 'k1' }]);

    await expect(
      updateDutyMember(locationId, duty._id, { karkunId: 'k3' }, 'u1')
    ).rejects.toMatchObject(failsWith('NOT_FOUND'));

    const emptied = await removeDutyMember(locationId, duty._id, 'k1', 'u1');
    expect(emptied.members).toEqual([]);
    await expect(
      removeDutyMember(locationId, duty._id, 'k1', 'u1')
    ).rejects.toMatchObject(failsWith('NOT_FOUND'));
  });

  it('only deletes a duty that never had anybody on duty', async () => {
    await seedKarkuns();
    setNow('2024-01-08T10:00:00Z');
    const locationId = await seedWorkspace();
    const unused = await createNamedDuty(locationId, 'Unused', 'u1');
    const used = await createNamedDuty(locationId, 'Used', 'u1');
    await addDutyMember(locationId, used._id, { karkunId: 'k1' }, 'u1');
    setNow('2024-01-10T10:00:00Z');
    // Reading the plan writes the (empty) records of the unused duty too.
    await getDutyPlanDays({ locationId, dutyId: unused._id, startDate: '2024-01-09' });
    await getDutyPlanDays({ locationId, dutyId: used._id, startDate: '2024-01-09' });

    await removeDuty(locationId, unused._id, 'u1');
    expect(
      await DutiesAttendanceDayRecords.find({ dutyId: unused._id }).countAsync()
    ).toBe(0);
    await expect(
      removeDuty(locationId, used._id, 'u1')
    ).rejects.toMatchObject(failsWith('CONFLICT'));
  });
});

// A duty created on Sunday the 7th, so it starts on Monday the 8th, with Zaid
// every day and Ali on Mondays.
const seedPlan = async () => {
  await seedKarkuns();
  setNow('2024-01-07T10:00:00Z'); // Sunday
  const locationId = await seedWorkspace();
  const duty = await createNamedDuty(locationId, 'Gate', 'u1');
  await addDutyMember(locationId, duty._id, { karkunId: 'k1' }, 'u1');
  await addDutyMember(
    locationId,
    duty._id,
    { karkunId: 'k2', daysOfWeek: ['Mon'] },
    'u1'
  );
  setNow('2024-01-10T10:00:00Z');
  return { locationId, dutyId: duty._id };
};

const planDays = async (
  locationId: string,
  dutyId: string,
  startDate = '2024-01-08'
) => (await getDutyPlanDays({ locationId, dutyId, startDate })).days;

const names = (day: { karkuns: Array<{ name: string }> }) =>
  day.karkuns.map(karkun => karkun.name);

describe('planning', () => {
  it('shows seven days: locked up to today, composed from the roster after', async () => {
    const { locationId, dutyId } = await seedPlan();

    const days = await planDays(locationId, dutyId);

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
    const { locationId, dutyId } = await seedPlan();
    await planDays(locationId, dutyId);

    await addDutyMember(locationId, dutyId, { karkunId: 'k3' }, 'u1');
    await removeDutyMember(locationId, dutyId, 'k1', 'u1');

    const days = await planDays(locationId, dutyId);
    expect(names(days[2])).toEqual(['Zaid']); // today, locked
    expect(names(days[3])).toEqual(['Bilal']); // tomorrow, new roster
  });

  it('locks the days before a roster change even if nobody read them yet', async () => {
    const { locationId, dutyId } = await seedPlan();

    await removeDutyMember(locationId, dutyId, 'k1', 'u1');

    const days = await planDays(locationId, dutyId);
    expect(names(days[1])).toEqual(['Zaid']);
    expect(names(days[2])).toEqual(['Zaid']);
    expect(names(days[3])).toEqual([]);
  });

  it('adds people for a future day and takes members off it', async () => {
    const { locationId, dutyId } = await seedPlan();

    await setDutyDayOverride({
      locationId,
      dutyId,
      date: TOMORROW,
      addedKarkunIds: ['k3'],
      absentKarkunIds: ['k1'],
      userId: 'u1',
    });

    const day = (await planDays(locationId, dutyId))[3];
    expect(day.addedKarkunIds).toEqual(['k3']);
    expect(day.absentKarkunIds).toEqual(['k1']);
    expect(day.karkuns.map(k => [k.name, k.off, k.addedForDay])).toEqual([
      ['Bilal', false, true],
      ['Zaid', true, false],
    ]);

    // Clearing both lists removes the override.
    await setDutyDayOverride({
      locationId,
      dutyId,
      date: TOMORROW,
      userId: 'u1',
    });
    const cleared = (await planDays(locationId, dutyId))[3];
    expect(names(cleared)).toEqual(['Zaid']);
    expect(cleared.karkuns[0].off).toBe(false);
  });

  it('locks an override that was set for a day that has now come', async () => {
    const { locationId, dutyId } = await seedPlan();
    setNow('2024-01-09T10:00:00Z');
    await setDutyDayOverride({
      locationId,
      dutyId,
      date: TODAY,
      addedKarkunIds: ['k3'],
      userId: 'u1',
    });
    setNow('2024-01-10T10:00:00Z');

    const today = (await planDays(locationId, dutyId))[2];
    expect(names(today)).toEqual(['Bilal', 'Zaid']);
    expect(today.karkuns.find(k => k.name === 'Bilal')?.addedForDay).toBe(true);
  });

  it('refuses to plan today or the past, or with people who are not karkuns', async () => {
    const { locationId, dutyId } = await seedPlan();

    await expect(
      setDutyDayOverride({
        locationId,
        dutyId,
        date: TODAY,
        addedKarkunIds: ['k3'],
        userId: 'u1',
      })
    ).rejects.toMatchObject(failsWith('BAD_USER_INPUT'));
    await expect(
      setDutyDayOverride({
        locationId,
        dutyId,
        date: TOMORROW,
        addedKarkunIds: ['ghost'],
        userId: 'u1',
      })
    ).rejects.toMatchObject(failsWith('BAD_USER_INPUT'));
    await expect(
      setDutyDayOverride({
        locationId,
        dutyId,
        date: '2024-13-45',
        userId: 'u1',
      })
    ).rejects.toMatchObject(failsWith('BAD_USER_INPUT'));
  });

  it('starts a new duty tomorrow, so its roster can be set up first', async () => {
    await seedKarkuns();
    const locationId = await seedWorkspace();
    const duty = await createNamedDuty(locationId, 'New', 'u1');
    expect(duty.startDate).toBe(TOMORROW);

    await addDutyMember(locationId, duty._id, { karkunId: 'k1' }, 'u1');
    await addDutyMember(locationId, duty._id, { karkunId: 'k2' }, 'u1');

    const days = await planDays(locationId, duty._id, TODAY);
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
    const locationId = await seedWorkspace();
    const duty = await createNamedDuty(locationId, 'Late roster', 'u1');
    setNow('2024-01-05T10:00:00Z');
    await addDutyMember(locationId, duty._id, { karkunId: 'k1' }, 'u1');
    setNow('2024-01-10T10:00:00Z');

    const days = await planDays(locationId, duty._id, '2024-01-04');

    // The 4th and 5th had nobody; Zaid joins from the 6th.
    expect(days.map(day => names(day).length)).toEqual([0, 0, 1, 1, 1, 1, 1]);
  });

  it('stops planning an inactive duty, and picks up from tomorrow when it is active again', async () => {
    const { locationId, dutyId } = await seedPlan();

    await updateDuty(locationId, dutyId, { isActive: false }, 'u1');
    // Days up to today were locked before it stopped.
    expect(
      await DutiesAttendanceDayRecords.find({ dutyId }).countAsync()
    ).toBe(3);

    setNow('2024-01-15T10:00:00Z');
    await planDays(locationId, dutyId, '2024-01-10');
    expect(
      await DutiesAttendanceDayRecords.find({ dutyId }).countAsync()
    ).toBe(3);

    const again = await updateDuty(locationId, dutyId, { isActive: true }, 'u1');
    expect(again.startDate).toBe('2024-01-16');
    // The 14th and 15th (today) were not planned; the 16th, a future day,
    // is composed from the roster again.
    const days = await planDays(locationId, dutyId, '2024-01-14');
    expect(days.map(day => names(day).length)).toEqual([0, 0, 1, 1, 1, 1, 1]);
  });

  it('writes the nightly record for active duties of mehfils only', async () => {
    const { locationId, dutyId } = await seedPlan();
    const inactive = await createNamedDuty(locationId, 'Closed', 'u1');
    await addDutyMember(locationId, inactive._id, { karkunId: 'k3' }, 'u1');
    await updateDuty(locationId, inactive._id, { isActive: false }, 'u1');
    const gone = { _id: await seedWorkspace() };
    const goneDuty = await createNamedDuty(gone._id, 'Old', 'u1');
    await addDutyMember(gone._id, goneDuty._id, { karkunId: 'k3' }, 'u1');
    await OrgLocations.updateAsync(gone._id, { $set: { type: 'city' } });
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
    const { locationId, dutyId } = await seedPlan();
    const mark = (karkunId: string, status?: string | null, date = TODAY) =>
      setDutyAttendance({
        locationId,
        dutyId,
        date,
        karkunId,
        status,
        userId: 'marker',
      });
    const today = async () => (await planDays(locationId, dutyId))[2];

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

  it('keeps the source and location with a mark, replaces them with the next mark and clears them', async () => {
    const { locationId, dutyId } = await seedPlan();
    const mark = (extra: Record<string, unknown>) =>
      setDutyAttendance({
        locationId,
        dutyId,
        date: TODAY,
        karkunId: 'k1',
        userId: 'marker',
        ...extra,
      });
    const stored = async () =>
      (await DutiesAttendanceDayRecords.findOneAsync({ dutyId, date: TODAY }))
        ?.karkuns[0];

    await mark({
      status: 'present',
      source: ' kiosk ',
      geo: { latitude: 24.86, longitude: 67.01, accuracy: 12 },
    });
    expect(await stored()).toMatchObject({
      attendanceSource: 'kiosk',
      attendanceGeo: { latitude: 24.86, longitude: 67.01, accuracy: 12 },
    });

    // Both are optional: a mark without them drops the earlier ones.
    await mark({ status: 'late' });
    const plain = await stored();
    expect(plain?.attendance).toBe('late');
    expect(plain?.attendanceSource).toBeUndefined();
    expect(plain?.attendanceGeo).toBeUndefined();

    await mark({ status: 'present', source: 'manual' });
    expect((await stored())?.attendanceSource).toBe('manual');
    await mark({ status: null });
    expect((await stored())?.attendanceSource).toBeUndefined();
  });

  it('refuses an invalid location and an overlong source', async () => {
    const { locationId, dutyId } = await seedPlan();
    const mark = (extra: Record<string, unknown>) =>
      setDutyAttendance({
        locationId,
        dutyId,
        date: TODAY,
        karkunId: 'k1',
        status: 'present',
        userId: 'marker',
        ...extra,
      });

    await expect(
      mark({ geo: { latitude: 91, longitude: 0 } })
    ).rejects.toMatchObject(failsWith('BAD_USER_INPUT'));
    await expect(
      mark({ geo: { latitude: 0, longitude: 0, accuracy: -1 } })
    ).rejects.toMatchObject(failsWith('BAD_USER_INPUT'));
    await expect(mark({ source: 'x'.repeat(101) })).rejects.toMatchObject(
      failsWith('BAD_USER_INPUT')
    );
  });

  it('can mark a past day, and locks it first if nobody read it yet', async () => {
    const { locationId, dutyId } = await seedPlan();

    await setDutyAttendance({
      locationId,
      dutyId,
      date: '2024-01-08',
      karkunId: 'k2',
      status: 'absent',
      userId: 'marker',
    });

    expect((await planDays(locationId, dutyId))[0].karkuns[0]).toMatchObject({
      name: 'Ali',
      attendance: 'absent',
    });
  });

  it('refuses the future, bad statuses and people who are not on duty that day', async () => {
    const { locationId, dutyId } = await seedPlan();
    const mark = (karkunId: string, status: string, date: string) =>
      setDutyAttendance({
        locationId,
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
    const { locationId, dutyId } = await seedPlan();
    const mark = (karkunId: string, status: string, date: string) =>
      setDutyAttendance({
        locationId,
        dutyId,
        date,
        karkunId,
        status,
        userId: 'marker',
      });
    await mark('k1', 'present', '2024-01-08');
    await mark('k1', 'late', '2024-01-09');
    await mark('k2', 'absent', '2024-01-08');

    const rows = await getAttendanceSheet({ locationId, month: '01-2024' });

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
    const { locationId, dutyId } = await seedPlan();
    const other = await createNamedDuty(locationId, 'Kitchen', 'u1');

    expect(
      await getAttendanceSheet({ locationId, month: '01-2024', dutyId: other._id })
    ).toEqual([]);
    expect(
      (await getAttendanceSheet({ locationId, month: '01-2024', dutyId })).length
    ).toBeGreaterThan(0);
    await expect(
      getAttendanceSheet({ locationId, month: '2024-01' })
    ).rejects.toMatchObject(failsWith('BAD_USER_INPUT'));
  });
});
