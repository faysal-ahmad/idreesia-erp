import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OrgLocationTypes } from 'meteor/idreesia-common/constants/organization';
import { OrgLocations } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  LeaveRequests,
  LeaveTypes,
} from 'meteor/idreesia-common/server/collections/hr';

import {
  approveLeaveRequest,
  cancelLeaveRequest,
  countLeaveDays,
  createLeaveAdjustment,
  createLeaveRequest,
  getLeaveBalances,
  getLeaveRequestBalanceWarning,
  recordLeaveConfirmation,
  rejectLeaveRequest,
  removeLeaveType,
} from './leaves';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

const user = { _id: 'u1' };

beforeEach(async () => {
  await OrgLocations.insertAsync({
    _id: 'pk',
    name: 'Pakistan',
    type: OrgLocationTypes.COUNTRY,
    allParentIds: [],
  } as any);
  await OrgLocations.insertAsync({
    _id: 'mul',
    name: 'Multan',
    type: OrgLocationTypes.CITY,
    allParentIds: ['pk'],
  } as any);
  // Joined before 2026; works Mon-Thu.
  await People.insertAsync({
    _id: 'e1',
    isKarkun: true,
    isEmployee: true,
    sharedData: { name: 'Zaid' },
    karkunData: { cityLocationId: 'mul' },
    employeeData: {
      employmentStatus: 'confirmed',
      employmentStartDate: new Date('2024-03-01T00:00:00+05:00'),
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu'],
    },
  } as any);
  await People.insertAsync({
    _id: 'boss',
    isKarkun: true,
    sharedData: { name: 'Boss' },
    karkunData: { cityLocationId: 'mul' },
  } as any);
  await People.insertAsync({
    _id: 'far',
    isKarkun: true,
    sharedData: { name: 'Far' },
    karkunData: { cityLocationId: 'elsewhere' },
  } as any);
  await LeaveTypes.insertAsync({
    _id: 'casual',
    name: 'Casual',
    annualEntitlementDays: 10,
    isPaid: true,
    allowCarryForward: false,
    isActive: true,
  } as any);
  await LeaveTypes.insertAsync({
    _id: 'annual',
    name: 'Annual',
    annualEntitlementDays: 12,
    isPaid: true,
    allowCarryForward: true,
    maxCarryForwardDays: 5,
    isActive: true,
  } as any);
});

afterEach(() => {
  vi.restoreAllMocks();
});

const request = (overrides = {}) =>
  createLeaveRequest(
    {
      personId: 'e1',
      leaveTypeId: 'casual',
      // Mon 2 Mar to Sun 8 Mar 2026: Mon-Thu are working days.
      fromDate: '2026-03-02',
      toDate: '2026-03-08',
      ...overrides,
    },
    user
  );

const balanceOf = async (leaveTypeId: string, year = 2026, personId = 'e1') =>
  (await getLeaveBalances(personId, year)).find(
    b => b.leaveTypeId === leaveTypeId
  );

describe('countLeaveDays', () => {
  it('counts only working days, every day when none are set', () => {
    const monToThu = ['Mon', 'Tue', 'Wed', 'Thu'];
    expect(countLeaveDays(monToThu, '2026-03-02', '2026-03-08')).toBe(4);
    expect(countLeaveDays(null, '2026-03-02', '2026-03-08')).toBe(7);
    expect(countLeaveDays([], '2026-03-02', '2026-03-08')).toBe(7);
    // Friday only: not a working day.
    expect(countLeaveDays(monToThu, '2026-03-06', '2026-03-06')).toBe(0);
  });

  it('counts a half day on a single working day', () => {
    expect(countLeaveDays(null, '2026-03-02', '2026-03-02', true)).toBe(0.5);
    expect(() => countLeaveDays(null, '2026-03-02', '2026-03-03', true)).toThrow(
      'same day'
    );
  });

  it('counts across a month and a year boundary', () => {
    expect(countLeaveDays(null, '2025-12-30', '2026-01-02')).toBe(4);
    expect(countLeaveDays(null, '2026-02-27', '2026-03-02')).toBe(4);
  });

  it('rejects bad or reversed dates', () => {
    expect(() => countLeaveDays(null, '2026-3-2', '2026-03-08')).toThrow(
      'valid dates'
    );
    expect(() => countLeaveDays(null, '2026-03-08', '2026-03-02')).toThrow(
      'before the start date'
    );
  });
});

describe('createLeaveRequest', () => {
  it('records a submitted request with its working days', async () => {
    const created = (await request({ reason: ' Wedding ' })) as any;
    expect(created).toMatchObject({
      status: 'submitted',
      days: 4,
      halfDay: false,
      reason: 'Wedding',
      version: 1,
    });
  });

  it('refuses an overlap with a submitted or approved request', async () => {
    await request();
    await expect(
      request({ fromDate: '2026-03-05', toDate: '2026-03-10' })
    ).rejects.toThrow('overlaps another leave request');
  });

  it('allows the dates again once the earlier request is rejected', async () => {
    const first = (await request()) as any;
    await rejectLeaveRequest(first._id, 'No', user);
    await expect(request()).resolves.toBeTruthy();
  });

  it('refuses dates crossing into the next year, or with no working days', async () => {
    await expect(
      request({ fromDate: '2026-12-28', toDate: '2027-01-04' })
    ).rejects.toThrow('next year');
    await expect(
      request({ fromDate: '2026-03-06', toDate: '2026-03-08' })
    ).rejects.toThrow('no working days');
  });

  it('refuses former employees and inactive types', async () => {
    await People.updateAsync('e1', { $set: { isEmployee: false } });
    await expect(request()).rejects.toThrow('current employees');
    await People.updateAsync('e1', { $set: { isEmployee: true } });
    await LeaveTypes.updateAsync('casual', { $set: { isActive: false } });
    await expect(request()).rejects.toThrow('no longer in use');
  });
});

describe('status moves', () => {
  it('approves, then cancels, giving the days back', async () => {
    const created = (await request()) as any;
    await approveLeaveRequest(created._id, user);
    expect((await balanceOf('casual'))?.used).toBe(4);
    await cancelLeaveRequest(created._id, user);
    const balance = await balanceOf('casual');
    expect(balance?.used).toBe(0);
    expect((await LeaveRequests.findOneAsync(created._id))?.status).toBe(
      'cancelled'
    );
  });

  it('returns CONFLICT for a move from the wrong status', async () => {
    const created = (await request()) as any;
    await rejectLeaveRequest(created._id, null, user);
    await expect(approveLeaveRequest(created._id, user)).rejects.toMatchObject({
      extensions: { code: 'CONFLICT' },
    });
    await expect(cancelLeaveRequest(created._id, user)).rejects.toMatchObject({
      extensions: { code: 'CONFLICT' },
    });
  });
});

describe('recordLeaveConfirmation', () => {
  it('records whom HR checked with, without changing the status', async () => {
    const created = (await request()) as any;
    await recordLeaveConfirmation(
      created._id,
      1,
      { confirmedWithPersonId: 'boss', confirmationRemarks: 'OK by phone' },
      user
    );
    expect(await LeaveRequests.findOneAsync(created._id)).toMatchObject({
      status: 'submitted',
      confirmedWithPersonId: 'boss',
      confirmationRemarks: 'OK by phone',
      version: 2,
    });
  });

  it('refuses a stale version and karkuns outside Multan', async () => {
    const created = (await request()) as any;
    await expect(
      recordLeaveConfirmation(created._id, 1, { confirmedWithPersonId: 'far' }, user)
    ).rejects.toThrow('karkun of Multan');
    await expect(
      recordLeaveConfirmation(created._id, 7, { confirmedWithPersonId: 'boss' }, user)
    ).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });
  });
});

describe('getLeaveBalances', () => {
  it('pro-rates the entitlement in the joining year', async () => {
    // Joined 1 Mar 2024: 306 of 366 days left in the year.
    expect((await balanceOf('casual', 2024))?.entitlement).toBe(8.5);
    expect((await balanceOf('casual', 2026))?.entitlement).toBe(10);
    expect((await balanceOf('casual', 2023))?.entitlement).toBe(0);
  });

  it('gives the full year, without carry-forward, when there is no start date', async () => {
    await People.updateAsync('e1', {
      $unset: { 'employeeData.employmentStartDate': 1 },
    });
    expect(await balanceOf('annual', 2026)).toMatchObject({
      entitlement: 12,
      carriedForward: 0,
    });
  });

  it('carries unused days forward up to the limit, only where allowed', async () => {
    // 2025: 12 annual days unused, capped at 5.
    expect((await balanceOf('annual', 2026))?.carriedForward).toBe(5);
    expect((await balanceOf('annual', 2026))?.remaining).toBe(17);
    expect((await balanceOf('casual', 2026))?.carriedForward).toBe(0);
  });

  it('adds adjustments and keeps pending separate from used', async () => {
    await createLeaveAdjustment(
      { personId: 'e1', leaveTypeId: 'casual', year: 2026, days: 2, reason: 'Overtime' },
      user
    );
    await request();
    const balance = await balanceOf('casual');
    expect(balance).toMatchObject({
      entitlement: 10,
      adjustments: 2,
      used: 0,
      pending: 4,
      remaining: 12,
    });
  });

  it('pro-rates from the rejoin date and still counts earlier leave that year', async () => {
    const created = (await request()) as any;
    await approveLeaveRequest(created._id, user);
    await People.updateAsync('e1', {
      $set: {
        'employeeData.employmentStartDate': new Date('2026-07-02T00:00:00+05:00'),
      },
    });
    const balance = await balanceOf('casual');
    // 183 of 365 days left: 10 * 0.501 = 5 days, minus the 4 taken in March.
    expect(balance?.entitlement).toBe(5);
    expect(balance?.used).toBe(4);
    expect(balance?.remaining).toBe(1);
  });
});

describe('getLeaveRequestBalanceWarning', () => {
  it('warns, without blocking, when a paid type goes over', async () => {
    const created = (await request({ fromDate: '2026-03-02', toDate: '2026-03-29' })) as any;
    expect(created.days).toBe(16);
    expect(await getLeaveRequestBalanceWarning(created)).toContain(
      '6 day(s) over the Casual balance'
    );
    await approveLeaveRequest(created._id, user);
    expect((await balanceOf('casual'))?.remaining).toBe(-6);
  });

  it("doesn't warn for unpaid types or decided requests", async () => {
    await LeaveTypes.insertAsync({
      _id: 'unpaid',
      name: 'Unpaid',
      annualEntitlementDays: 0,
      isPaid: false,
      allowCarryForward: false,
      isActive: true,
    } as any);
    const created = (await request({ leaveTypeId: 'unpaid' })) as any;
    expect(await getLeaveRequestBalanceWarning(created)).toBeNull();
    expect(
      await getLeaveRequestBalanceWarning({ ...created, leaveTypeId: 'casual', days: 50, status: 'rejected' })
    ).toBeNull();
  });
});

describe('removeLeaveType', () => {
  it('refuses a type in use', async () => {
    await request();
    await expect(removeLeaveType('casual', user)).rejects.toThrow('in use');
    await expect(removeLeaveType('annual', user)).resolves.toBe(1);
  });
});
