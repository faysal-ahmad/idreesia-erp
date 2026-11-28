import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { People } from 'meteor/idreesia-common/server/collections/common';
import { JobShifts, Jobs } from 'meteor/idreesia-common/server/collections/hr';

import {
  assertShiftBelongsToJob,
  createJobShift,
  removeJobShift,
  updateJobShift,
} from './job-shifts';
import { removeJob } from './jobs';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

const user = { _id: 'u1' };

beforeEach(async () => {
  await Jobs.insertAsync({ _id: 'j1', name: 'Cook' } as any);
  await Jobs.insertAsync({ _id: 'j2', name: 'Driver' } as any);
  await JobShifts.insertAsync({ _id: 's1', jobId: 'j1', name: 'Morning' } as any);
  await JobShifts.insertAsync({ _id: 's2', jobId: 'j2', name: 'Evening' } as any);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createJobShift', () => {
  it('adds a shift to an existing job', async () => {
    const shift = await createJobShift(
      { jobId: 'j1', name: '  Night ', startTime: 'a', endTime: 'b' },
      user
    );
    expect(shift).toMatchObject({ jobId: 'j1', name: 'Night', createdBy: 'u1' });
  });

  it('refuses a missing job or a blank name', async () => {
    await expect(createJobShift({ jobId: 'nope', name: 'X' }, user)).rejects.toThrow(
      'Job not found.'
    );
    await expect(createJobShift({ jobId: 'j1', name: ' ' }, user)).rejects.toThrow(
      'Please enter a shift name.'
    );
  });
});

describe('updateJobShift', () => {
  it('renames the shift and keeps its job', async () => {
    await updateJobShift('s1', { name: 'Early' }, user);
    expect(await JobShifts.findOneAsync('s1')).toMatchObject({
      name: 'Early',
      jobId: 'j1',
    });
  });
});

describe('removeJobShift', () => {
  it('refuses a shift an employee has', async () => {
    await People.insertAsync({
      _id: 'p1',
      sharedData: { name: 'A' },
      employeeData: { jobId: 'j1', jobShiftId: 's1' },
    } as any);
    await expect(removeJobShift('s1', user)).rejects.toThrow(
      'employees are assigned to it'
    );
    expect(await JobShifts.findOneAsync('s1')).toBeTruthy();
  });

  it('removes an unused shift', async () => {
    expect(await removeJobShift('s1', user)).toBe(1);
    expect(await JobShifts.findOneAsync('s1')).toBeUndefined();
  });
});

describe('assertShiftBelongsToJob', () => {
  it('accepts no shift, or a shift of the job', async () => {
    await expect(assertShiftBelongsToJob(null, 'j1')).resolves.toBeUndefined();
    await expect(assertShiftBelongsToJob('s1', 'j1')).resolves.toBeUndefined();
  });

  it("rejects another job's shift", async () => {
    await expect(assertShiftBelongsToJob('s2', 'j1')).rejects.toThrow(
      "not one of the employee's job shifts"
    );
  });
});

describe('removeJob', () => {
  it('refuses a job anyone has', async () => {
    await People.insertAsync({
      _id: 'p1',
      sharedData: { name: 'A' },
      employeeData: { jobId: 'j1' },
    } as any);
    await expect(removeJob('j1')).rejects.toThrow('employees have it');
  });

  it('removes an unused job with its shifts', async () => {
    await removeJob('j1');
    expect(await Jobs.findOneAsync('j1')).toBeUndefined();
    expect(await JobShifts.find({ jobId: 'j1' }).countAsync()).toBe(0);
    expect(await JobShifts.findOneAsync('s2')).toBeTruthy();
  });
});
