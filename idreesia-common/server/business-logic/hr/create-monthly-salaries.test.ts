import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { People } from 'meteor/idreesia-common/server/collections/common';
import { Salaries } from 'meteor/idreesia-common/server/collections/hr';

import {
  createMonthlySalaries,
  getMonthlySalaryValues,
} from './create-monthly-salaries';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2024-03-15T10:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('getMonthlySalaryValues', () => {
  it('starts from zeros when there is no previous salary', () => {
    expect(getMonthlySalaryValues(null)).toEqual({
      salary: 0,
      openingLoan: 0,
      loanDeduction: 0,
      newLoan: 0,
      closingLoan: 0,
      otherDeduction: 0,
      netPayment: 0,
      arrears: 0,
      rashanMadad: 0,
    });
    expect(getMonthlySalaryValues(undefined).salary).toBe(0);
  });

  it.each([
    // salary, closingLoan, loanDeduction, expected opening/deduction/closing/net
    [10000, 3000, 1000, 3000, 1000, 2000, 9000],
    [10000, 500, 1000, 500, 500, 0, 9500],
    [10000, 0, 1000, 0, 0, 0, 10000],
    [10000, 3000, 0, 3000, 0, 3000, 10000],
  ])(
    'salary %i, loan %i, deduction %i',
    (salary, closing, deduction, opening, expDeduction, expClosing, expNet) => {
      const values = getMonthlySalaryValues({
        salary,
        closingLoan: closing,
        loanDeduction: deduction,
        rashanMadad: 250,
      });
      expect(values).toMatchObject({
        salary,
        openingLoan: opening,
        loanDeduction: expDeduction,
        closingLoan: expClosing,
        netPayment: expNet,
        newLoan: 0,
        otherDeduction: 0,
        arrears: 0,
        rashanMadad: 250,
      });
    }
  );
});

const employee = (id: string, employeeData: Record<string, unknown>, extra = {}) =>
  People.insertAsync({
    _id: id,
    isEmployee: true,
    sharedData: { name: id },
    employeeData,
    ...extra,
  } as any);

const run = () =>
  createMonthlySalaries('03-2024', '02-2024', { _id: 'u1' });

describe('createMonthlySalaries', () => {
  it('creates a salary carried over from the previous month', async () => {
    await employee('p1', { jobId: 'j1' });
    await Salaries.insertAsync({
      karkunId: 'p1',
      jobId: 'j1',
      month: '02-2024',
      salary: 20000,
      closingLoan: 5000,
      loanDeduction: 2000,
      rashanMadad: 100,
    } as any);

    expect(await run()).toBe(1);

    const created = await Salaries.findOneAsync({ karkunId: 'p1', month: '03-2024' });
    expect(created).toMatchObject({
      jobId: 'j1',
      createdBy: 'u1',
      salary: 20000,
      openingLoan: 5000,
      loanDeduction: 2000,
      closingLoan: 3000,
      netPayment: 18000,
      rashanMadad: 100,
    });
    expect(created?.createdAt).toEqual(new Date('2024-03-15T10:00:00Z'));
  });

  it('creates a zeroed salary when there is no previous month', async () => {
    await employee('p1', { jobId: 'j1' });
    expect(await run()).toBe(1);
    const created = await Salaries.findOneAsync({ karkunId: 'p1' });
    expect(created).toMatchObject({ salary: 0, netPayment: 0, month: '03-2024' });
  });

  it('is idempotent and never overwrites an existing salary', async () => {
    await employee('p1', { jobId: 'j1' });
    await Salaries.insertAsync({
      karkunId: 'p1',
      jobId: 'j1',
      month: '03-2024',
      salary: 777,
    } as any);
    expect(await run()).toBe(0);
    expect(await Salaries.find({}).countAsync()).toBe(1);
    expect((await Salaries.findOneAsync({}))?.salary).toBe(777);

    await employee('p2', { jobId: 'j2' });
    expect(await run()).toBe(1);
    expect(await run()).toBe(0);
  });

  it('skips people without a job, non-employees and deleted people', async () => {
    await employee('nojob', {});
    await employee('nulljob', { jobId: null });
    await employee('deleted', { jobId: 'j1' }, { deletedAt: new Date() });
    await People.insertAsync({
      _id: 'notemp',
      isEmployee: false,
      sharedData: { name: 'x' },
      employeeData: { jobId: 'j1' },
    } as any);
    await employee('ok', { jobId: 'j1' });

    expect(await run()).toBe(1);
    const all = await Salaries.find({}).fetchAsync();
    expect(all.map(s => s.karkunId)).toEqual(['ok']);
  });

  it.each([
    ['ended before this month', '2024-02-29T00:00:00Z', 0],
    ['ended on the first of this month', '2024-03-01T00:00:00Z', 1],
    ['ends later this month', '2024-03-20T00:00:00Z', 1],
  ])('employment %s', async (_label, endDate, expected) => {
    await employee('p1', { jobId: 'j1', employmentEndDate: new Date(endDate) });
    expect(await run()).toBe(expected);
  });

  it('reports progress per person', async () => {
    await employee('p1', { jobId: 'j1' });
    await employee('p2', { jobId: 'j1' });
    const progress = vi.fn(async (_fraction: number) => undefined);
    await createMonthlySalaries('03-2024', '02-2024', { _id: 'u1' }, progress);
    expect(progress.mock.calls.map(c => c[0])).toEqual([0.5, 1]);
  });
});
