import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OrgLocationTypes } from 'meteor/idreesia-common/constants/organization';
import { OrgLocations } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';

import {
  HR_EMPLOYEE_SELECTOR,
  HR_KARKUN_SELECTOR,
  addHrPersonAttachment,
  assertHrPersonRole,
  searchHrEmployees,
  setHrPersonImage,
  updateHrPerson,
} from './hr-people';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

// Face recognition needs native OpenCV, which setPersonImage pulls in.
vi.mock('meteor/idreesia-common/server/business-logic/common/compute-image-vector-data', () => ({
  computeVectorFromImageBuffer: vi.fn(),
}));

const user = { _id: 'u1' };

const codeOf = async (promise: Promise<unknown>) => {
  try {
    await promise;
    return 'ok';
  } catch (error) {
    return (error as { extensions?: { code?: string } }).extensions?.code;
  }
};

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
  // A karkun who is not an employee.
  await People.insertAsync({
    _id: 'karkun',
    isKarkun: true,
    sharedData: { name: 'Karkun' },
    karkunData: { cityLocationId: 'mul' },
  } as any);
  // A current employee (employees are karkuns too).
  await People.insertAsync({
    _id: 'employee',
    isKarkun: true,
    isEmployee: true,
    sharedData: { name: 'Employee' },
    karkunData: { cityLocationId: 'mul' },
    employeeData: { jobId: 'j1', employmentStatus: 'confirmed' },
  } as any);
  // A former employee who is no longer a karkun.
  await People.insertAsync({
    _id: 'former',
    isEmployee: false,
    sharedData: { name: 'Former' },
    karkunData: { cityLocationId: 'mul' },
    employeeData: { jobId: 'j1', employmentStatus: 'exited' },
  } as any);
  await People.insertAsync({
    _id: 'visitor',
    isVisitor: true,
    sharedData: { name: 'Visitor' },
  } as any);
});

describe('assertHrPersonRole', () => {
  it('lets karkun management reach karkuns only', async () => {
    expect(await codeOf(assertHrPersonRole('karkun', 'karkun'))).toBe('ok');
    expect(await codeOf(assertHrPersonRole('employee', 'karkun'))).toBe('ok');
    expect(await codeOf(assertHrPersonRole('former', 'karkun'))).toBe('NOT_FOUND');
    expect(await codeOf(assertHrPersonRole('visitor', 'karkun'))).toBe('NOT_FOUND');
    expect(await codeOf(assertHrPersonRole('nobody', 'karkun'))).toBe('NOT_FOUND');
  });

  it('lets employee management reach current and former employees only', async () => {
    expect(await codeOf(assertHrPersonRole('employee', 'employee'))).toBe('ok');
    expect(await codeOf(assertHrPersonRole('former', 'employee'))).toBe('ok');
    expect(await codeOf(assertHrPersonRole('karkun', 'employee'))).toBe('NOT_FOUND');
    expect(await codeOf(assertHrPersonRole('visitor', 'employee'))).toBe('NOT_FOUND');
  });

  it('treats a deleted person as missing', async () => {
    await People.updateAsync('employee', { $set: { deletedAt: new Date() } } as any);
    expect(await codeOf(assertHrPersonRole('employee', 'employee'))).toBe('NOT_FOUND');
  });
});

describe('the role selectors', () => {
  it('match the same people as the role checks', async () => {
    const ids = async (selector: object) =>
      (await People.find(selector).fetchAsync()).map(p => p._id).sort();

    expect(await ids(HR_KARKUN_SELECTOR)).toEqual(['employee', 'karkun']);
    expect(await ids(HR_EMPLOYEE_SELECTOR)).toEqual(['employee', 'former']);
  });
});

describe('the role-checked writes', () => {
  it('refuse a person outside the role before changing anything', async () => {
    expect(
      await codeOf(updateHrPerson('employee', { _id: 'karkun', name: 'Changed' }, user))
    ).toBe('NOT_FOUND');
    expect((await People.findOneAsync('karkun'))?.sharedData?.name).toBe('Karkun');

    expect(await codeOf(setHrPersonImage('karkun', 'former', 'data', user))).toBe('NOT_FOUND');
    expect(
      await codeOf(addHrPersonAttachment('employee', { _id: 'karkun', attachmentId: 'a1' }, user))
    ).toBe('NOT_FOUND');
    expect((await People.findOneAsync('karkun'))?.karkunData?.attachmentIds).toBeUndefined();
  });

  it("save a person's general details through their own role", async () => {
    await updateHrPerson('karkun', { _id: 'karkun', name: 'Renamed' }, user);
    expect((await People.findOneAsync('karkun'))?.sharedData?.name).toBe('Renamed');
  });
});

describe('searchHrEmployees', () => {
  it('lists the current employees of Multan only', async () => {
    const result = await searchHrEmployees({});
    expect(result.totalResults).toBe(1);
    expect((result.data as { _id: string }[]).map(p => p._id)).toEqual(['employee']);
  });

  it('is empty when Multan is not set up', async () => {
    await OrgLocations.removeAsync({});
    expect(await searchHrEmployees({})).toEqual({ data: [], totalResults: 0 });
  });
});
