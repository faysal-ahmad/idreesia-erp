import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  Duties,
  DutyDayAttendances,
  DutyLocations,
  DutyShifts,
  DutyTeamAssignments,
  Teams,
} from 'meteor/idreesia-common/server/collections/hr';

import {
  addTeamMember,
  removeTeamMember,
  updateTeamMember,
  updateTeamMemberDays,
} from './teams';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

// 2024-01-10 is a Wednesday in Karachi.
beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2024-01-10T10:00:00Z'));

  for (const [id, name] of [['k1', 'Zaid'], ['k2', 'Ali'], ['k3', 'Bilal']]) {
    await People.insertAsync({ _id: id, isKarkun: true, sharedData: { name } } as any);
  }
  await People.insertAsync({ _id: 'v1', isVisitor: true, sharedData: { name: 'V' } } as any);
  await Duties.insertAsync({ _id: 'd1', name: 'Gate' } as any);
  await DutyLocations.insertAsync({ _id: 'l1', dutyId: 'd1', name: 'Main' } as any);
  await DutyShifts.insertAsync({ _id: 'sh1', dutyId: 'd1', name: 'Morning' } as any);
  await Teams.insertAsync({
    _id: 't1',
    name: 'Team A',
    dutyId: 'd1',
    members: [{ karkunId: 'k1', daysOfWeek: ['Mon', 'Tue', 'Wed'] }],
  } as any);
  // Team A has been on the shift since Monday, so Mon-Wed are due for locking.
  await DutyTeamAssignments.insertAsync({
    dutyId: 'd1',
    locationId: 'l1',
    shiftId: 'sh1',
    teamId: 't1',
    startDate: '2024-01-08',
  } as any);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const members = async () =>
  (await Teams.findOneAsync('t1'))?.members as unknown as Array<Record<string, any>>;
const loadRecords = async () =>
  (await DutyDayAttendances.find({}).fetchAsync()) as unknown as Array<{
    date: string;
    karkuns: Array<{ karkunId: string }>;
  }>;
const lockedDates = async () => (await loadRecords()).map(r => r.date).sort();

describe('addTeamMember', () => {
  it('adds the member with their days in week order and locks past days first', async () => {
    await addTeamMember('t1', 'k2', ['Wed', 'Sat', 'Mon', 'Wed']);

    expect(await members()).toEqual([
      { karkunId: 'k1', daysOfWeek: ['Mon', 'Tue', 'Wed'] },
      { karkunId: 'k2', daysOfWeek: ['Sat', 'Mon', 'Wed'] },
    ]);
    expect(await lockedDates()).toEqual(['2024-01-08', '2024-01-09', '2024-01-10']);
    // The past days were locked without the new member.
    const records = await loadRecords();
    expect(records.every(r => r.karkuns.every(k => k.karkunId === 'k1'))).toBe(true);
  });

  it.each([
    ['no days', [], 'Please select at least one day.'],
    ['null days', null, 'Please select at least one day.'],
    ['an invalid day', ['Mon', 'Someday'], 'Please select valid days.'],
    ['a null day', ['Mon', null], 'Please select valid days.'],
    ['a lower-case day', ['mon'], 'Please select valid days.'],
  ])('rejects %s', async (_label, days, message) => {
    await expect(addTeamMember('t1', 'k2', days as any)).rejects.toThrow(message);
    expect(await members()).toHaveLength(1);
    expect(await lockedDates()).toEqual([]);
  });

  it('rejects an unknown team', async () => {
    await expect(addTeamMember('nope', 'k2', ['Mon'])).rejects.toThrow('Team not found.');
  });

  it.each([['a visitor', 'v1'], ['an unknown person', 'ghost']])(
    'rejects %s as a member and leaves nothing behind',
    async (_label, id) => {
      await expect(addTeamMember('t1', id, ['Mon'])).rejects.toThrow(
        'Please select a valid karkun.'
      );
      expect(await members()).toHaveLength(1);
      expect(await lockedDates()).toEqual([]);
    }
  );

  it('rejects someone who is already a member, rolling back the locked days', async () => {
    await expect(addTeamMember('t1', 'k1', ['Mon'])).rejects.toThrow(
      'This person is already a member of the team.'
    );
    expect(await members()).toHaveLength(1);
    expect(await lockedDates()).toEqual([]);
  });

  it('rolls back the locked days when the membership update fails', async () => {
    vi.spyOn(Teams, 'updateAsync').mockRejectedValueOnce(new Error('update failed'));
    await expect(addTeamMember('t1', 'k2', ['Mon'])).rejects.toThrow('update failed');
    expect(await members()).toHaveLength(1);
    expect(await lockedDates()).toEqual([]);
  });
});

describe('updateTeamMemberDays', () => {
  it('replaces the member days (sorted, deduplicated) and locks past days first', async () => {
    await updateTeamMemberDays('t1', 'k1', ['Fri', 'Sat', 'Fri']);
    expect(await members()).toEqual([{ karkunId: 'k1', daysOfWeek: ['Sat', 'Fri'] }]);
    expect(await lockedDates()).toEqual(['2024-01-08', '2024-01-09', '2024-01-10']);
    // Locked days keep the previous schedule: k1 was on duty Mon-Wed.
    const records = await loadRecords();
    expect(records.every(r => r.karkuns.length === 1)).toBe(true);
  });

  it('rejects a person who is not a member and rolls back', async () => {
    await expect(updateTeamMemberDays('t1', 'k3', ['Mon'])).rejects.toThrow(
      'This person is not a member of the team.'
    );
    expect(await lockedDates()).toEqual([]);
  });

  it('rejects invalid days before touching anything', async () => {
    await expect(updateTeamMemberDays('t1', 'k1', [])).rejects.toThrow(
      'Please select at least one day.'
    );
    await expect(updateTeamMemberDays('t1', 'k1', ['X'])).rejects.toThrow(
      'Please select valid days.'
    );
    expect((await members())?.[0].daysOfWeek).toEqual(['Mon', 'Tue', 'Wed']);
  });
});

describe('removeTeamMember', () => {
  it('removes the member and locks past days with them still on the team', async () => {
    await removeTeamMember('t1', 'k1');
    expect(await members()).toEqual([]);
    const records = await loadRecords();
    expect(records).toHaveLength(3);
    expect(records.every(r => r.karkuns.map(k => k.karkunId).join() === 'k1')).toBe(true);
  });

  it('rejects an unknown team', async () => {
    await expect(removeTeamMember('nope', 'k1')).rejects.toThrow('Team not found.');
  });

  it('rolls back the locked days when the removal fails', async () => {
    vi.spyOn(Teams, 'updateAsync').mockRejectedValueOnce(new Error('update failed'));
    await expect(removeTeamMember('t1', 'k1')).rejects.toThrow('update failed');
    expect(await members()).toHaveLength(1);
    expect(await lockedDates()).toEqual([]);
  });
});

describe('updateTeamMember', () => {
  it('applies the modifier to the matching member', async () => {
    await updateTeamMember('t1', 'k1', { $set: { 'members.$.isCoordinator': true } });
    expect((await members())?.[0]).toMatchObject({ karkunId: 'k1', isCoordinator: true });
  });

  it('fails when the karkun is not a member', async () => {
    await expect(
      updateTeamMember('t1', 'k2', { $set: { 'members.$.isCoordinator': true } })
    ).rejects.toThrow('This person is not a member of the team.');
  });
});
