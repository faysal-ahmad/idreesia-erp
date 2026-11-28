import {
  EmploymentEventType,
  EmploymentStatus,
  ExitReason,
} from 'meteor/idreesia-common/constants/hr/employment';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  EmploymentEvents,
  JobShifts,
  LeaveAdjustments,
  LeaveRequests,
  LeaveTypes,
} from 'meteor/idreesia-common/server/collections/hr';

interface UserRef {
  _id: string;
}

/** Indexes for job shifts, employment history and leave. */
export async function ensureEmploymentIndexes() {
  await EmploymentEvents.rawCollection().createIndex({
    personId: 1,
    effectiveDate: 1,
  });
  await JobShifts.rawCollection().createIndex({ jobId: 1 });
  const people = People.rawCollection();
  await people.createIndex({ 'employeeData.employmentStatus': 1 });
  await people.createIndex({ 'employeeData.jobShiftId': 1 });
  await people.createIndex({ 'employeeData.reportsToPersonId': 1 });
}

export async function ensureLeaveIndexes() {
  const requests = LeaveRequests.rawCollection();
  await requests.createIndex({ personId: 1, fromDate: 1 });
  await requests.createIndex({ status: 1, fromDate: -1 });
  await requests.createIndex({ leaveTypeId: 1 });
  await LeaveAdjustments.rawCollection().createIndex({ personId: 1, year: 1 });
  await LeaveAdjustments.rawCollection().createIndex({ leaveTypeId: 1 });
}

/**
 * Gives people employed before the lifecycle existed a history and a
 * status: a `joined` event from their start date, an `exited` event where
 * they have an end date and are no longer employed, and the matching
 * status. People who already have events are skipped, so it can run again.
 * Earlier job changes and rehires are not known, so they aren't recreated.
 */
export async function backfillEmploymentHistory(user: UserRef) {
  const people = await People.find(
    {
      deletedAt: { $exists: false },
      $or: [
        { isEmployee: true },
        { 'employeeData.employmentStartDate': { $exists: true, $ne: null } },
      ],
    },
    { fields: { isEmployee: 1, employeeData: 1 } }
  ).fetchAsync();

  let updated = 0;
  for (const person of people) {
    // One transaction per person: each one stands alone.
    const done = await runInTransaction(async () => {
      if (await EmploymentEvents.findOneAsync({ personId: person._id })) {
        return false;
      }
      const date = new Date();
      const stamp = {
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      };
      const { employmentStartDate, employmentEndDate, jobId } =
        person.employeeData ?? {};

      if (employmentStartDate) {
        await EmploymentEvents.insertAsync({
          personId: person._id,
          eventType: EmploymentEventType.JOINED,
          effectiveDate: employmentStartDate,
          details: { jobId: jobId ?? null },
          remarks: 'Backfilled from the employment start date.',
          ...stamp,
        });
      }

      const exited = !person.isEmployee && !!employmentEndDate;
      if (exited) {
        await EmploymentEvents.insertAsync({
          personId: person._id,
          eventType: EmploymentEventType.EXITED,
          effectiveDate: employmentEndDate,
          exitReason: ExitReason.OTHER,
          details: { jobId: jobId ?? null },
          remarks: 'Backfilled from the employment end date.',
          ...stamp,
        });
      }

      let status: string | null = null;
      if (person.isEmployee) status = EmploymentStatus.CONFIRMED;
      else if (exited || employmentStartDate) status = EmploymentStatus.EXITED;
      if (status) {
        await People.updateAsync(person._id, {
          $set: { 'employeeData.employmentStatus': status },
        });
      }
      return true;
    });
    if (done) updated += 1;
  }
  return updated;
}

const DEFAULT_LEAVE_TYPES = [
  { name: 'Casual', isPaid: true, allowCarryForward: false },
  { name: 'Sick', isPaid: true, allowCarryForward: false },
  { name: 'Annual', isPaid: true, allowCarryForward: true },
  { name: 'Unpaid', isPaid: false, allowCarryForward: false },
];

/**
 * Seeds the usual leave types with 0 days a year: HR sets the
 * organisation's numbers on the Leave Types page. Existing names are kept.
 */
export async function seedDefaultLeaveTypes(user: UserRef) {
  const date = new Date();
  for (const leaveType of DEFAULT_LEAVE_TYPES) {
    if (await LeaveTypes.findOneAsync({ name: leaveType.name })) continue;
    await LeaveTypes.insertAsync({
      ...leaveType,
      annualEntitlementDays: 0,
      isActive: true,
      createdAt: date,
      createdBy: user._id,
      updatedAt: date,
      updatedBy: user._id,
    });
  }
}
