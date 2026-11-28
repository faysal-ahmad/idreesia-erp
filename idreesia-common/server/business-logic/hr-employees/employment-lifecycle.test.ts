import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  EmploymentEvents,
  JobShifts,
  Jobs,
} from 'meteor/idreesia-common/server/collections/hr';
import { SystemSettings } from 'meteor/idreesia-common/server/collections/admin';

import {
  changeEmployeeJob,
  confirmEmployee,
  exitEmployee,
  getEmploymentStatus,
  hireEmployee,
  rejoinEmployee,
} from './employment-lifecycle';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

const user = { _id: 'u1' };

beforeEach(async () => {
  await Jobs.insertAsync({ _id: 'j1', name: 'Cook' } as any);
  await Jobs.insertAsync({ _id: 'j2', name: 'Driver' } as any);
  await JobShifts.insertAsync({ _id: 's1', jobId: 'j1', name: 'Morning' } as any);
  await JobShifts.insertAsync({ _id: 's2', jobId: 'j2', name: 'Evening' } as any);
  await People.insertAsync({
    _id: 'k1',
    isKarkun: true,
    sharedData: { name: 'Zaid' },
  } as any);
});

afterEach(() => {
  vi.restoreAllMocks();
});

const person = async () => People.findOneAsync('k1') as Promise<any>;
const events = async () =>
  (await EmploymentEvents.find(
    { personId: 'k1' },
    { sort: { createdAt: 1 } }
  ).fetchAsync()) as any[];

const hire = (overrides = {}) =>
  hireEmployee(
    {
      personId: 'k1',
      jobId: 'j1',
      jobShiftId: 's1',
      startDate: '2026-01-15T00:00:00.000Z',
      onProbation: true,
      ...overrides,
    },
    user
  );

describe('hireEmployee', () => {
  it('hires on probation with the default 3 month probation and a joined event', async () => {
    await hire();
    const p = await person();
    expect(p.isEmployee).toBe(true);
    expect(p.isKarkun).toBe(true);
    expect(p.employeeData).toMatchObject({
      jobId: 'j1',
      jobShiftId: 's1',
      employmentStatus: 'probation',
    });
    expect(p.employeeData.probationEndDate.toISOString()).toBe(
      '2026-04-15T00:00:00.000Z'
    );
    expect(await events()).toMatchObject([
      { eventType: 'joined', details: { jobId: 'j1', onProbation: true } },
    ]);
  });

  it('uses the configured default probation length', async () => {
    await SystemSettings.insertAsync({
      _id: 'hr-employment',
      values: { defaultProbationMonths: 6 },
      updatedAt: new Date(),
      updatedBy: 'u1',
    });
    await hire();
    expect((await person()).employeeData.probationEndDate.toISOString()).toBe(
      '2026-07-15T00:00:00.000Z'
    );
  });

  it('hires straight to confirmed without probation', async () => {
    await hire({ onProbation: false });
    const p = await person();
    expect(p.employeeData.employmentStatus).toBe('confirmed');
    expect(p.employeeData.confirmationDate.toISOString()).toBe(
      '2026-01-15T00:00:00.000Z'
    );
  });

  it('accepts the epoch-millisecond dates the web app sends', async () => {
    await hire({ startDate: String(Date.UTC(2026, 0, 15)) });
    expect((await person()).employeeData.employmentStartDate.toISOString()).toBe(
      '2026-01-15T00:00:00.000Z'
    );
  });

  it("rejects another job's shift and changes nothing", async () => {
    await expect(hire({ jobShiftId: 's2' })).rejects.toThrow(
      "not one of the employee's job shifts"
    );
    expect((await person()).isEmployee).toBeUndefined();
    expect(await events()).toEqual([]);
  });

  it('refuses a current employee, and sends a former one to rejoin', async () => {
    await hire();
    await expect(hire()).rejects.toThrow('Cannot hire');
    await exitEmployee(
      { personId: 'k1', endDate: '2026-06-01', exitReason: 'resigned' },
      user
    );
    await expect(hire()).rejects.toThrow('Rejoin them instead');
  });

  it('rolls back the person update when the event cannot be written', async () => {
    vi.spyOn(EmploymentEvents, 'insertAsync').mockRejectedValueOnce(
      new Error('boom')
    );
    await expect(hire()).rejects.toThrow('boom');
    const p = await person();
    expect(p.isEmployee).toBeUndefined();
    expect(p.employeeData).toBeUndefined();
  });
});

describe('confirmEmployee', () => {
  it('ends probation', async () => {
    await hire();
    await confirmEmployee(
      { personId: 'k1', confirmationDate: '2026-04-15', remarks: 'Good work' },
      user
    );
    const p = await person();
    expect(p.employeeData.employmentStatus).toBe('confirmed');
    expect((await events()).map(e => e.eventType)).toEqual(['joined', 'confirmed']);
  });

  it('refuses a confirmed employee or a date before the start', async () => {
    await hire();
    await expect(
      confirmEmployee({ personId: 'k1', confirmationDate: '2025-12-01' }, user)
    ).rejects.toThrow('before the start date');
    await confirmEmployee({ personId: 'k1', confirmationDate: '2026-04-15' }, user);
    await expect(
      confirmEmployee({ personId: 'k1', confirmationDate: '2026-05-01' }, user)
    ).rejects.toThrow('Cannot confirm');
  });
});

describe('changeEmployeeJob', () => {
  it('changes the job, clears the old shift and records from and to', async () => {
    await hire();
    await changeEmployeeJob(
      { personId: 'k1', jobId: 'j2', effectiveDate: '2026-03-01' },
      user
    );
    const p = await person();
    expect(p.employeeData.jobId).toBe('j2');
    expect(p.employeeData.jobShiftId).toBeNull();
    expect((await events())[1]).toMatchObject({
      eventType: 'job-changed',
      details: {
        fromJobId: 'j1',
        toJobId: 'j2',
        fromJobShiftId: 's1',
        toJobShiftId: null,
      },
    });
  });

  it('takes a shift of the new job only', async () => {
    await hire();
    await expect(
      changeEmployeeJob(
        { personId: 'k1', jobId: 'j2', jobShiftId: 's1', effectiveDate: '2026-03-01' },
        user
      )
    ).rejects.toThrow("not one of the employee's job shifts");
    await changeEmployeeJob(
      { personId: 'k1', jobId: 'j2', jobShiftId: 's2', effectiveDate: '2026-03-01' },
      user
    );
    expect((await person()).employeeData.jobShiftId).toBe('s2');
  });

  it('refuses the same job', async () => {
    await hire();
    await expect(
      changeEmployeeJob({ personId: 'k1', jobId: 'j1', effectiveDate: '2026-03-01' }, user)
    ).rejects.toThrow('already has this job');
  });
});

describe('exitEmployee and rejoinEmployee', () => {
  it('exits, leaving the person a karkun, then rejoins with a new period', async () => {
    await hire();
    await exitEmployee(
      {
        personId: 'k1',
        endDate: '2026-06-30',
        exitReason: 'resigned',
        remarks: 'Moved',
      },
      user
    );
    let p = await person();
    expect(p.isEmployee).toBe(false);
    expect(p.isKarkun).toBe(true);
    expect(p.employeeData.employmentStatus).toBe('exited');
    expect(getEmploymentStatus(p)).toBe('exited');

    await expect(
      rejoinEmployee(
        { personId: 'k1', jobId: 'j2', startDate: '2026-05-01', onProbation: false },
        user
      )
    ).rejects.toThrow('before the previous end date');

    await rejoinEmployee(
      { personId: 'k1', jobId: 'j2', startDate: '2026-09-01T00:00:00.000Z', onProbation: false },
      user
    );
    p = await person();
    expect(p.isEmployee).toBe(true);
    expect(p.isKarkun).toBe(true);
    expect(p.employeeData).toMatchObject({
      jobId: 'j2',
      employmentStatus: 'confirmed',
      employmentEndDate: null,
    });
    expect((await events()).map(e => e.eventType)).toEqual([
      'joined',
      'exited',
      'rejoined',
    ]);
    expect((await events())[1]).toMatchObject({ exitReason: 'resigned' });
  });

  it('refuses an unknown exit reason or exiting twice', async () => {
    await hire();
    await expect(
      exitEmployee({ personId: 'k1', endDate: '2026-06-30', exitReason: 'bored' as any }, user)
    ).rejects.toThrow('reason for leaving');
    await exitEmployee(
      { personId: 'k1', endDate: '2026-06-30', exitReason: 'other' },
      user
    );
    await expect(
      exitEmployee({ personId: 'k1', endDate: '2026-07-30', exitReason: 'other' }, user)
    ).rejects.toThrow('Cannot exit');
  });
});

describe('getEmploymentStatus', () => {
  it('reads records from before the lifecycle existed', () => {
    expect(getEmploymentStatus({ _id: 'a', sharedData: {}, isEmployee: true })).toBe(
      'confirmed'
    );
    expect(
      getEmploymentStatus({
        _id: 'a',
        sharedData: {},
        isEmployee: false,
        employeeData: { employmentStartDate: new Date() },
      })
    ).toBe('exited');
    expect(getEmploymentStatus({ _id: 'a', sharedData: {} })).toBeNull();
  });
});
