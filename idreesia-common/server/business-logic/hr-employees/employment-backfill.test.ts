import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  EmploymentEvents,
  LeaveTypes,
} from 'meteor/idreesia-common/server/collections/hr';

import {
  backfillEmploymentHistory,
  seedDefaultLeaveTypes,
} from './employment-backfill';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

const user = { _id: 'system' };
const start = new Date('2020-01-01T00:00:00Z');
const end = new Date('2023-06-30T00:00:00Z');

beforeEach(async () => {
  await People.insertAsync({
    _id: 'current',
    isKarkun: true,
    isEmployee: true,
    sharedData: { name: 'Current' },
    employeeData: { jobId: 'j1', employmentStartDate: start },
  } as any);
  await People.insertAsync({
    _id: 'past',
    isKarkun: true,
    isEmployee: false,
    sharedData: { name: 'Past' },
    employeeData: { jobId: 'j1', employmentStartDate: start, employmentEndDate: end },
  } as any);
  await People.insertAsync({
    _id: 'karkun',
    isKarkun: true,
    sharedData: { name: 'Karkun' },
  } as any);
});

afterEach(() => {
  vi.restoreAllMocks();
});

const eventsOf = async (personId: string) =>
  (await EmploymentEvents.find({ personId }, { sort: { effectiveDate: 1 } }).fetchAsync()) as any[];

describe('backfillEmploymentHistory', () => {
  it('creates joined and exited events and sets the status', async () => {
    expect(await backfillEmploymentHistory(user)).toBe(2);

    expect(await eventsOf('current')).toMatchObject([
      { eventType: 'joined', effectiveDate: start, details: { jobId: 'j1' } },
    ]);
    expect(await eventsOf('past')).toMatchObject([
      { eventType: 'joined', effectiveDate: start },
      { eventType: 'exited', effectiveDate: end, exitReason: 'other' },
    ]);
    expect(await eventsOf('karkun')).toEqual([]);

    expect((await People.findOneAsync('current'))?.employeeData?.employmentStatus).toBe(
      'confirmed'
    );
    expect((await People.findOneAsync('past'))?.employeeData?.employmentStatus).toBe(
      'exited'
    );
    // Karkun flags are untouched.
    expect((await People.findOneAsync('past'))?.isKarkun).toBe(true);
  });

  it('skips people who already have history, so it can run again', async () => {
    await backfillEmploymentHistory(user);
    expect(await backfillEmploymentHistory(user)).toBe(0);
    expect(await EmploymentEvents.find({}).countAsync()).toBe(3);
  });
});

describe('seedDefaultLeaveTypes', () => {
  it('adds the usual types with 0 days, keeping existing names', async () => {
    await LeaveTypes.insertAsync({
      name: 'Casual',
      annualEntitlementDays: 12,
      isPaid: true,
      allowCarryForward: false,
      isActive: true,
    } as any);
    await seedDefaultLeaveTypes(user);
    await seedDefaultLeaveTypes(user);
    const types = (await LeaveTypes.find({}, { sort: { name: 1 } }).fetchAsync()) as any[];
    expect(types.map(t => [t.name, t.annualEntitlementDays])).toEqual([
      ['Annual', 0],
      ['Casual', 12],
      ['Sick', 0],
      ['Unpaid', 0],
    ]);
  });
});
