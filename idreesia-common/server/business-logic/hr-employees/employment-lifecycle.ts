import { addMonths } from 'date-fns';

import {
  EXIT_REASONS,
  EmploymentEventType,
  type EmploymentEventTypeValue,
  EmploymentStatus,
  type EmploymentStatusValue,
  type ExitReasonValue,
} from 'meteor/idreesia-common/constants/hr/employment';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import {
  People,
  type PersonDocument,
} from 'meteor/idreesia-common/server/collections/common';
import {
  EmploymentEvents,
  Jobs,
} from 'meteor/idreesia-common/server/collections/hr';

import { getHrEmploymentSettings } from '../admin/system-settings';
import { updatePerson } from '../common/people/people-mutations';
import { hrError } from '../hr-common/errors';
import { parseHrDate, requireHrDate } from '../hr-common/internal';
import { assertShiftBelongsToJob } from './job-shifts';

/*
 * Employment lifecycle: hiring, confirming, changing job, exiting and
 * rejoining. Each one updates the person and appends an event to
 * hr-employment-events in one transaction, so the history always matches the
 * employee record. These are the only way to change an employee's status or
 * job.
 *
 * An employee is always a karkun too (so other modules that filter on
 * isKarkun include them). Exiting clears isEmployee only.
 */

interface UserRef {
  _id: string;
}

type DateInput = string | Date;

/**
 * The employee's status. Records from before the lifecycle existed have no
 * status: a current employee counts as confirmed, a past one as exited.
 */
export function getEmploymentStatus(
  person: PersonDocument
): EmploymentStatusValue | null {
  const status = person.employeeData?.employmentStatus;
  if (status) return status;
  if (person.isEmployee) return EmploymentStatus.CONFIRMED;
  if (person.employeeData?.employmentStartDate) return EmploymentStatus.EXITED;
  return null;
}

const requireDate = (value: DateInput | null | undefined, label: string) =>
  requireHrDate(value, label);

const optionalDate = (value: DateInput | null | undefined) =>
  parseHrDate(value);

async function requirePerson(personId: string) {
  const person = await People.findOneAsync(personId);
  if (!person || person.deletedAt) {
    throw hrError('NOT_FOUND', 'Person not found.');
  }
  return person;
}

async function requireJob(jobId: string | null | undefined) {
  const job = jobId ? await Jobs.findOneAsync(jobId) : null;
  if (!job) throw hrError('BAD_USER_INPUT', 'Please select a valid job.');
  return job;
}

function assertStatus(
  person: PersonDocument,
  allowed: Array<EmploymentStatusValue | null>,
  action: string
) {
  const status = getEmploymentStatus(person);
  if (!allowed.includes(status)) {
    throw hrError(
      'CONFLICT',
      `Cannot ${action}: the employee is ${status ?? 'not employed'}.`
    );
  }
  return status;
}

async function addEvent(
  personId: string,
  eventType: EmploymentEventTypeValue,
  effectiveDate: Date,
  user: UserRef,
  extra: {
    details?: Record<string, unknown>;
    remarks?: string | null;
    exitReason?: ExitReasonValue;
  } = {}
) {
  const date = new Date();
  return EmploymentEvents.insertAsync({
    personId,
    eventType,
    effectiveDate,
    details: extra.details,
    remarks: extra.remarks || undefined,
    exitReason: extra.exitReason,
    createdAt: date,
    createdBy: user._id,
    updatedAt: date,
    updatedBy: user._id,
  });
}

export interface HireEmployeeValues {
  personId: string;
  jobId: string;
  jobShiftId?: string | null;
  startDate: DateInput;
  onProbation: boolean;
  /** Defaults to the start date plus the HR default probation length. */
  probationEndDate?: DateInput | null;
  remarks?: string | null;
}

async function startEmployment(
  values: HireEmployeeValues,
  eventType: EmploymentEventTypeValue,
  user: UserRef
) {
  const startDate = requireDate(values.startDate, 'start date');
  await requireJob(values.jobId);
  await assertShiftBelongsToJob(values.jobShiftId, values.jobId);

  let probationEndDate: Date | null = null;
  if (values.onProbation) {
    probationEndDate = optionalDate(values.probationEndDate);
    if (!probationEndDate) {
      const { defaultProbationMonths } = await getHrEmploymentSettings();
      probationEndDate = addMonths(startDate, defaultProbationMonths);
    }
    if (probationEndDate <= startDate) {
      throw hrError(
        'BAD_USER_INPUT',
        'The probation end must be after the start date.'
      );
    }
  }

  await updatePerson(
    {
      _id: values.personId,
      isEmployee: true,
      isKarkun: true,
      employeeData: {
        jobId: values.jobId,
        jobShiftId: values.jobShiftId || null,
        employmentStatus: values.onProbation
          ? EmploymentStatus.PROBATION
          : EmploymentStatus.CONFIRMED,
        employmentStartDate: startDate,
        employmentEndDate: null,
        probationEndDate,
        confirmationDate: values.onProbation ? null : startDate,
      },
    },
    user
  );

  await addEvent(values.personId, eventType, startDate, user, {
    details: {
      jobId: values.jobId,
      jobShiftId: values.jobShiftId || null,
      onProbation: values.onProbation,
      probationEndDate,
    },
    remarks: values.remarks,
  });

  return People.findOneAsync(values.personId);
}

/** Makes a karkun who has never been employed an employee. */
export async function hireEmployee(values: HireEmployeeValues, user: UserRef) {
  return runInTransaction(async () => {
    const person = await requirePerson(values.personId);
    const status = getEmploymentStatus(person);
    if (status === EmploymentStatus.EXITED) {
      throw hrError(
        'CONFLICT',
        'This person was employed before. Rejoin them instead.'
      );
    }
    assertStatus(person, [null], 'hire');
    return startEmployment(values, EmploymentEventType.JOINED, user);
  });
}

/** Re-employs a former employee, starting a new employment period. */
export async function rejoinEmployee(values: HireEmployeeValues, user: UserRef) {
  return runInTransaction(async () => {
    const person = await requirePerson(values.personId);
    assertStatus(person, [EmploymentStatus.EXITED], 'rejoin');
    const endDate = person.employeeData?.employmentEndDate;
    if (endDate && requireDate(values.startDate, 'start date') < endDate) {
      throw hrError(
        'BAD_USER_INPUT',
        'The rejoining date cannot be before the previous end date.'
      );
    }
    return startEmployment(values, EmploymentEventType.REJOINED, user);
  });
}

export interface ConfirmEmployeeValues {
  personId: string;
  confirmationDate: DateInput;
  remarks?: string | null;
}

/** Ends an employee's probation. */
export async function confirmEmployee(
  values: ConfirmEmployeeValues,
  user: UserRef
) {
  return runInTransaction(async () => {
    const person = await requirePerson(values.personId);
    assertStatus(person, [EmploymentStatus.PROBATION], 'confirm');
    const confirmationDate = requireDate(
      values.confirmationDate,
      'confirmation date'
    );
    const startDate = person.employeeData?.employmentStartDate;
    if (startDate && confirmationDate < startDate) {
      throw hrError(
        'BAD_USER_INPUT',
        'The confirmation date cannot be before the start date.'
      );
    }

    await updatePerson(
      {
        _id: values.personId,
        employeeData: {
          employmentStatus: EmploymentStatus.CONFIRMED,
          confirmationDate,
        },
      },
      user
    );
    await addEvent(
      values.personId,
      EmploymentEventType.CONFIRMED,
      confirmationDate,
      user,
      { remarks: values.remarks }
    );
    return People.findOneAsync(values.personId);
  });
}

export interface ChangeEmployeeJobValues {
  personId: string;
  jobId: string;
  /** A shift of the new job; none clears the employee's shift. */
  jobShiftId?: string | null;
  effectiveDate: DateInput;
  remarks?: string | null;
}

/** Moves an employee to another job (and one of its shifts, if any). */
export async function changeEmployeeJob(
  values: ChangeEmployeeJobValues,
  user: UserRef
) {
  return runInTransaction(async () => {
    const person = await requirePerson(values.personId);
    assertStatus(
      person,
      [EmploymentStatus.PROBATION, EmploymentStatus.CONFIRMED],
      'change the job'
    );
    const effectiveDate = requireDate(values.effectiveDate, 'effective date');
    await requireJob(values.jobId);
    const fromJobId = person.employeeData?.jobId ?? null;
    if (fromJobId === values.jobId) {
      throw hrError('BAD_USER_INPUT', 'The employee already has this job.');
    }
    await assertShiftBelongsToJob(values.jobShiftId, values.jobId);

    await updatePerson(
      {
        _id: values.personId,
        employeeData: {
          jobId: values.jobId,
          jobShiftId: values.jobShiftId || null,
        },
      },
      user
    );
    await addEvent(
      values.personId,
      EmploymentEventType.JOB_CHANGED,
      effectiveDate,
      user,
      {
        details: {
          fromJobId,
          toJobId: values.jobId,
          fromJobShiftId: person.employeeData?.jobShiftId ?? null,
          toJobShiftId: values.jobShiftId || null,
        },
        remarks: values.remarks,
      }
    );
    return People.findOneAsync(values.personId);
  });
}

export interface ExitEmployeeValues {
  personId: string;
  endDate: DateInput;
  exitReason: ExitReasonValue;
  remarks?: string | null;
}

/** Ends an employee's employment. They remain a karkun. */
export async function exitEmployee(values: ExitEmployeeValues, user: UserRef) {
  return runInTransaction(async () => {
    const person = await requirePerson(values.personId);
    assertStatus(
      person,
      [EmploymentStatus.PROBATION, EmploymentStatus.CONFIRMED],
      'exit'
    );
    const endDate = requireDate(values.endDate, 'end date');
    if (!(EXIT_REASONS as readonly string[]).includes(values.exitReason)) {
      throw hrError('BAD_USER_INPUT', 'Please select the reason for leaving.');
    }
    const startDate = person.employeeData?.employmentStartDate;
    if (startDate && endDate < startDate) {
      throw hrError(
        'BAD_USER_INPUT',
        'The end date cannot be before the start date.'
      );
    }

    await updatePerson(
      {
        _id: values.personId,
        isEmployee: false,
        employeeData: {
          employmentStatus: EmploymentStatus.EXITED,
          employmentEndDate: endDate,
        },
      },
      user
    );
    await addEvent(values.personId, EmploymentEventType.EXITED, endDate, user, {
      exitReason: values.exitReason,
      details: { jobId: person.employeeData?.jobId ?? null },
      remarks: values.remarks,
    });
    return People.findOneAsync(values.personId);
  });
}
