import { EntityType, OperationType } from 'meteor/idreesia-common/constants/audit';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { JobShifts, Jobs } from 'meteor/idreesia-common/server/collections/hr';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';

import { createAuditLog } from '../common/audit-logs';
import { hrError } from '../hr-common/errors';

interface UserRef {
  _id: string;
}

interface JobShiftValues {
  name: string;
  jobId: string;
  startTime?: string | null;
  endTime?: string | null;
}

const requireName = (name: string) => {
  const trimmed = (name ?? '').trim();
  if (!trimmed) throw hrError('BAD_USER_INPUT', 'Please enter a shift name.');
  return trimmed;
};

/** How many people currently have this shift. */
export async function countJobShiftEmployees(jobShiftId: string) {
  return People.find({ 'employeeData.jobShiftId': jobShiftId }).countAsync();
}

/**
 * Checks that a shift belongs to a job. A missing shift is always fine:
 * employees don't need one.
 */
export async function assertShiftBelongsToJob(
  jobShiftId: string | null | undefined,
  jobId: string | null | undefined
) {
  if (!jobShiftId) return;
  const shift = await JobShifts.findOneAsync(jobShiftId);
  if (!shift || !jobId || shift.jobId !== jobId) {
    throw hrError(
      'BAD_USER_INPUT',
      "The selected shift is not one of the employee's job shifts."
    );
  }
}

export async function createJobShift(values: JobShiftValues, user: UserRef) {
  const name = requireName(values.name);
  return runInTransaction(async () => {
    if (!(await Jobs.findOneAsync(values.jobId))) {
      throw hrError('NOT_FOUND', 'Job not found.');
    }
    const date = new Date();
    const doc = {
      name,
      jobId: values.jobId,
      startTime: values.startTime ?? undefined,
      endTime: values.endTime ?? undefined,
    };
    const _id = await JobShifts.insertAsync({
      ...doc,
      createdAt: date,
      createdBy: user._id,
      updatedAt: date,
      updatedBy: user._id,
    });
    await createAuditLog({
      entityId: _id,
      entityType: EntityType.HR_JOB_SHIFT,
      operationType: OperationType.CREATE,
      operationBy: user._id,
      operationTime: date,
      auditValues: doc,
    });
    return JobShifts.findOneAsync(_id);
  });
}

/** Renames or re-times a shift. A shift can't move to another job. */
export async function updateJobShift(
  _id: string,
  values: Omit<JobShiftValues, 'jobId'>,
  user: UserRef
) {
  const name = requireName(values.name);
  return runInTransaction(async () => {
    const existing = await JobShifts.findOneAsync(_id);
    if (!existing) throw hrError('NOT_FOUND', 'Shift not found.');
    const date = new Date();
    const changes = {
      name,
      startTime: values.startTime ?? null,
      endTime: values.endTime ?? null,
    };
    await JobShifts.updateAsync(_id, {
      $set: { ...changes, updatedAt: date, updatedBy: user._id },
    });
    await createAuditLog(
      {
        entityId: _id,
        entityType: EntityType.HR_JOB_SHIFT,
        operationType: OperationType.UPDATE,
        operationBy: user._id,
        operationTime: date,
        auditValues: changes,
      },
      existing
    );
    return JobShifts.findOneAsync(_id);
  });
}

/** Removes a shift. Refused while any employee has it. */
export async function removeJobShift(_id: string, user: UserRef) {
  return runInTransaction(async () => {
    if ((await countJobShiftEmployees(_id)) > 0) {
      throw hrError(
        'CONFLICT',
        'This shift cannot be deleted as employees are assigned to it.'
      );
    }
    const removed = await JobShifts.removeAsync(_id);
    if (removed) {
      await createAuditLog({
        entityId: _id,
        entityType: EntityType.HR_JOB_SHIFT,
        operationType: OperationType.DELETE,
        operationBy: user._id,
        operationTime: new Date(),
      });
    }
    return removed;
  });
}
