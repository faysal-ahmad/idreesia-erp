import { WORKING_DAYS } from 'meteor/idreesia-common/constants/hr/employment';
import { People } from 'meteor/idreesia-common/server/collections/common';

import { findMultanCityLocation } from '../common/people/picker-people';
import { updatePerson } from '../common/people/people-mutations';
import { hrError } from '../hr-common/errors';
import { parseHrDate } from '../hr-common/internal';
import { assertShiftBelongsToJob } from './job-shifts';

interface UserRef {
  _id: string;
}

/**
 * The employment fields HR edits directly. Status, job, and joining or
 * leaving are not here: they change only through the lifecycle functions
 * (employment-lifecycle.ts), which record each change as an event.
 */
export interface EmployeeInfoValues {
  _id: string;
  employmentStartDate?: string | Date | null;
  employmentEndDate?: string | Date | null;
  probationEndDate?: string | Date | null;
  confirmationDate?: string | Date | null;
  bankAccountDetails?: string | null;
  jobShiftId?: string | null;
  workingDays?: Array<string | null> | null;
  reportsToPersonId?: string | null;
}

/**
 * Normalizes working days to the week's order. Every day selected is stored
 * as null, which means the same and keeps the common case simple.
 */
export function normalizeWorkingDays(
  days: Array<string | null> | null | undefined
): string[] | null {
  if (days == null) return null;
  const selected = new Set<string>();
  for (const day of days) {
    if (!day || !(WORKING_DAYS as readonly string[]).includes(day)) {
      throw hrError('BAD_USER_INPUT', 'Please select valid working days.');
    }
    selected.add(day);
  }
  if (selected.size === 0) {
    throw hrError('BAD_USER_INPUT', 'Please select at least one working day.');
  }
  if (selected.size === WORKING_DAYS.length) return null;
  return WORKING_DAYS.filter(day => selected.has(day));
}

/**
 * Checks that `reportsToPersonId` names a Multan karkun other than the
 * employee. HR only deals with people in Multan.
 */
export async function assertValidReportsTo(
  personId: string,
  reportsToPersonId: string | null | undefined
) {
  if (!reportsToPersonId) return;
  if (reportsToPersonId === personId) {
    throw hrError('BAD_USER_INPUT', 'An employee cannot report to themselves.');
  }
  const multan = await findMultanCityLocation();
  const reportsTo = await People.findOneAsync(reportsToPersonId);
  if (
    !reportsTo ||
    reportsTo.deletedAt ||
    !reportsTo.isKarkun ||
    !multan ||
    reportsTo.karkunData?.cityLocationId !== multan._id
  ) {
    throw hrError(
      'BAD_USER_INPUT',
      'The person reported to must be a karkun of Multan.'
    );
  }
}

const toDate = (value: string | Date | null | undefined) =>
  value === undefined ? undefined : parseHrDate(value);

/** Saves the directly editable employment fields of an employee. */
export async function setEmployeeInfo(values: EmployeeInfoValues, user: UserRef) {
  const person = await People.findOneAsync(values._id);
  if (!person || person.deletedAt) {
    throw hrError('NOT_FOUND', 'Person not found.');
  }
  if (!person.isEmployee && !person.employeeData?.employmentStatus) {
    throw hrError('BAD_USER_INPUT', 'This person is not an employee.');
  }

  const jobId = person.employeeData?.jobId;
  if (values.jobShiftId !== undefined) {
    await assertShiftBelongsToJob(values.jobShiftId, jobId);
  }
  if (values.reportsToPersonId !== undefined) {
    await assertValidReportsTo(values._id, values.reportsToPersonId);
  }

  const employeeData: Record<string, unknown> = {
    employmentStartDate: toDate(values.employmentStartDate),
    employmentEndDate: toDate(values.employmentEndDate),
    probationEndDate: toDate(values.probationEndDate),
    confirmationDate: toDate(values.confirmationDate),
    bankAccountDetails: values.bankAccountDetails,
    jobShiftId: values.jobShiftId,
    reportsToPersonId: values.reportsToPersonId,
  };
  if (values.workingDays !== undefined) {
    employeeData.workingDays = normalizeWorkingDays(values.workingDays);
  }
  Object.keys(employeeData).forEach(key => {
    if (employeeData[key] === undefined) delete employeeData[key];
  });

  return updatePerson({ _id: values._id, employeeData }, user);
}
