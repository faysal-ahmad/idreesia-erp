import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OrgLocationTypes } from 'meteor/idreesia-common/constants/organization';
import { OrgLocations } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { JobShifts } from 'meteor/idreesia-common/server/collections/hr';

import { normalizeWorkingDays, setEmployeeInfo } from './employee-info';

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
  await JobShifts.insertAsync({ _id: 's1', jobId: 'j1', name: 'Morning' } as any);
  await JobShifts.insertAsync({ _id: 's2', jobId: 'j2', name: 'Evening' } as any);
  await People.insertAsync({
    _id: 'e1',
    isKarkun: true,
    isEmployee: true,
    sharedData: { name: 'Zaid' },
    karkunData: { cityLocationId: 'mul' },
    employeeData: { jobId: 'j1', employmentStatus: 'confirmed' },
  } as any);
  await People.insertAsync({
    _id: 'boss',
    isKarkun: true,
    sharedData: { name: 'Boss' },
    karkunData: { cityLocationId: 'mul' },
  } as any);
  await People.insertAsync({
    _id: 'visitor',
    isVisitor: true,
    sharedData: { name: 'Visitor' },
  } as any);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('normalizeWorkingDays', () => {
  it('orders the days and stores every day as null', () => {
    expect(normalizeWorkingDays(['Thu', 'Mon', 'Mon'])).toEqual(['Mon', 'Thu']);
    expect(
      normalizeWorkingDays(['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
    ).toBeNull();
    expect(normalizeWorkingDays(null)).toBeNull();
  });

  it('rejects no days or unknown days', () => {
    expect(() => normalizeWorkingDays([])).toThrow('at least one');
    expect(() => normalizeWorkingDays(['Funday'])).toThrow('valid working days');
  });
});

describe('setEmployeeInfo', () => {
  it('saves the shift, working days and reports-to', async () => {
    await setEmployeeInfo(
      {
        _id: 'e1',
        jobShiftId: 's1',
        workingDays: ['Wed', 'Mon'],
        reportsToPersonId: 'boss',
      },
      user
    );
    expect((await People.findOneAsync('e1'))?.employeeData).toMatchObject({
      jobId: 'j1',
      jobShiftId: 's1',
      workingDays: ['Mon', 'Wed'],
      reportsToPersonId: 'boss',
    });
  });

  it("rejects another job's shift", async () => {
    await expect(setEmployeeInfo({ _id: 'e1', jobShiftId: 's2' }, user)).rejects.toThrow(
      "not one of the employee's job shifts"
    );
  });

  it('only reports to a Multan karkun other than the employee', async () => {
    await expect(
      setEmployeeInfo({ _id: 'e1', reportsToPersonId: 'e1' }, user)
    ).rejects.toThrow('report to themselves');
    await expect(
      setEmployeeInfo({ _id: 'e1', reportsToPersonId: 'visitor' }, user)
    ).rejects.toThrow('karkun of Multan');
  });

  it('clears the shift and reports-to', async () => {
    await setEmployeeInfo({ _id: 'e1', jobShiftId: 's1', reportsToPersonId: 'boss' }, user);
    await setEmployeeInfo({ _id: 'e1', jobShiftId: null, reportsToPersonId: null }, user);
    const employeeData = (await People.findOneAsync('e1'))?.employeeData;
    expect(employeeData?.jobShiftId ?? null).toBeNull();
    expect(employeeData?.reportsToPersonId ?? null).toBeNull();
  });

  it('refuses people who were never employed', async () => {
    await expect(setEmployeeInfo({ _id: 'boss', workingDays: ['Mon'] }, user)).rejects.toThrow(
      'not an employee'
    );
  });
});
