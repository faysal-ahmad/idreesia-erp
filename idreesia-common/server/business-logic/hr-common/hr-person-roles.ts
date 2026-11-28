/*
 * Karkun management and employee management are kept apart: each reaches only
 * its own people, under its own permissions. These say who each side's people
 * are. Every HR operation that takes a person id checks the person is one of
 * the operation's own people first (hr-people.ts), so holding one side's
 * permissions never opens a record through the other.
 */

export interface HrPersonFlags {
  isKarkun?: boolean | null;
  isEmployee?: boolean | null;
  employeeData?: { employmentStatus?: string | null } | null;
}

export type HrPersonRole = 'karkun' | 'employee';

/** People karkun management works with. */
export const HR_KARKUN_SELECTOR = { isKarkun: true };

/**
 * People employee management works with: current employees, and former ones
 * (exiting clears isEmployee but keeps the employment record).
 */
export const HR_EMPLOYEE_SELECTOR = {
  $or: [
    { isEmployee: true },
    { 'employeeData.employmentStatus': { $nin: [null, ''] } },
  ],
};

export const isHrKarkun = (person: HrPersonFlags | null | undefined) =>
  !!person?.isKarkun;

export const isHrEmployee = (person: HrPersonFlags | null | undefined) =>
  !!person?.isEmployee || !!person?.employeeData?.employmentStatus;
