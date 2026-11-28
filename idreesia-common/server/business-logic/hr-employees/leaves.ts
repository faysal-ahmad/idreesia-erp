import { EntityType, OperationType } from 'meteor/idreesia-common/constants/audit';
import {
  LeaveRequestStatus,
  type LeaveRequestStatusValue,
} from 'meteor/idreesia-common/constants/hr/employment';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import {
  People,
  type PersonDocument,
} from 'meteor/idreesia-common/server/collections/common';
import {
  LeaveAdjustments,
  LeaveRequests,
  LeaveTypes,
} from 'meteor/idreesia-common/server/collections/hr';

import { createAuditLog } from '../common/audit-logs';
import { moveStatus } from '../purchasing/internal';
import {
  addCalendarDays,
  dayOfWeek,
  formatKarachiDate,
  isCalendarDate,
} from '../hr-common/duty-planning-dates';
import { assertValidReportsTo } from './employee-info';
import { getEmploymentStatus } from './employment-lifecycle';
import { hrError } from '../hr-common/errors';
import { cleanText, parseHrDate, requireText } from '../hr-common/internal';

/*
 * Leave: types, manual balance adjustments, requests and balances.
 *
 * HR enters requests and approves them. Before deciding, HR may record whom
 * it checked with (by default the employee's reports-to karkun), but that is
 * never required. Balances are computed from the leave type, the employee's
 * joining date, adjustments and approved requests; nothing is stored.
 * Going over a balance is a warning, never a block. The leave year is the
 * calendar year, and leave counts only the employee's working days (the
 * organisation works every day of the year, so there are no holidays).
 */

interface UserRef {
  _id: string;
}

type LeaveTypeDoc = {
  _id: string;
  name: string;
  annualEntitlementDays: number;
  isPaid: boolean;
  allowCarryForward: boolean;
  maxCarryForwardDays?: number | null;
  isActive: boolean;
};

const ACTIVE_STATUSES: LeaveRequestStatusValue[] = [
  LeaveRequestStatus.SUBMITTED,
  LeaveRequestStatus.APPROVED,
];

const roundToHalf = (value: number) => Math.round(value * 2) / 2;

const yearOf = (calendarDate: string) => Number(calendarDate.slice(0, 4));

// ---------------------------------------------------------------------------
// Leave types
// ---------------------------------------------------------------------------

export interface LeaveTypeValues {
  name: string;
  annualEntitlementDays: number;
  isPaid: boolean;
  allowCarryForward: boolean;
  maxCarryForwardDays?: number | null;
  isActive: boolean;
}

function cleanLeaveType(values: LeaveTypeValues) {
  const name = requireText(values.name, 'Name');
  const days = Number(values.annualEntitlementDays);
  if (!Number.isFinite(days) || days < 0 || days > 366) {
    throw hrError(
      'BAD_USER_INPUT',
      'Days per year must be between 0 and 366.'
    );
  }
  let maxCarryForwardDays: number | null = null;
  if (values.allowCarryForward && values.maxCarryForwardDays != null) {
    maxCarryForwardDays = Number(values.maxCarryForwardDays);
    if (!Number.isFinite(maxCarryForwardDays) || maxCarryForwardDays < 0) {
      throw hrError(
        'BAD_USER_INPUT',
        'The carry-forward limit must be zero or more.'
      );
    }
  }
  return {
    name,
    annualEntitlementDays: days,
    isPaid: !!values.isPaid,
    allowCarryForward: !!values.allowCarryForward,
    maxCarryForwardDays,
    isActive: !!values.isActive,
  };
}

export async function createLeaveType(values: LeaveTypeValues, user: UserRef) {
  const doc = cleanLeaveType(values);
  return runInTransaction(async () => {
    const date = new Date();
    const _id = await LeaveTypes.insertAsync({
      ...doc,
      maxCarryForwardDays: doc.maxCarryForwardDays ?? undefined,
      createdAt: date,
      createdBy: user._id,
      updatedAt: date,
      updatedBy: user._id,
    });
    await createAuditLog({
      entityId: _id,
      entityType: EntityType.HR_LEAVE_TYPE,
      operationType: OperationType.CREATE,
      operationBy: user._id,
      operationTime: date,
      auditValues: doc,
    });
    return LeaveTypes.findOneAsync(_id);
  });
}

export async function updateLeaveType(
  _id: string,
  values: LeaveTypeValues,
  user: UserRef
) {
  const doc = cleanLeaveType(values);
  return runInTransaction(async () => {
    const existing = await LeaveTypes.findOneAsync(_id);
    if (!existing) throw hrError('NOT_FOUND', 'Leave type not found.');
    const date = new Date();
    await LeaveTypes.updateAsync(_id, {
      $set: { ...doc, updatedAt: date, updatedBy: user._id },
    });
    await createAuditLog(
      {
        entityId: _id,
        entityType: EntityType.HR_LEAVE_TYPE,
        operationType: OperationType.UPDATE,
        operationBy: user._id,
        operationTime: date,
        auditValues: doc,
      },
      existing
    );
    return LeaveTypes.findOneAsync(_id);
  });
}

/** How many requests and adjustments use a leave type. */
export async function countLeaveTypeUses(leaveTypeId: string) {
  const [requests, adjustments] = await Promise.all([
    LeaveRequests.find({ leaveTypeId }).countAsync(),
    LeaveAdjustments.find({ leaveTypeId }).countAsync(),
  ]);
  return requests + adjustments;
}

/** Removes an unused leave type. A used one can be made inactive instead. */
export async function removeLeaveType(_id: string, user: UserRef) {
  return runInTransaction(async () => {
    if ((await countLeaveTypeUses(_id)) > 0) {
      throw hrError(
        'CONFLICT',
        'This leave type is in use. Make it inactive instead.'
      );
    }
    const removed = await LeaveTypes.removeAsync(_id);
    if (removed) {
      await createAuditLog({
        entityId: _id,
        entityType: EntityType.HR_LEAVE_TYPE,
        operationType: OperationType.DELETE,
        operationBy: user._id,
        operationTime: new Date(),
      });
    }
    return removed;
  });
}

// ---------------------------------------------------------------------------
// Adjustments
// ---------------------------------------------------------------------------

export interface LeaveAdjustmentValues {
  personId: string;
  leaveTypeId: string;
  year: number;
  days: number;
  reason: string;
}

export async function createLeaveAdjustment(
  values: LeaveAdjustmentValues,
  user: UserRef
) {
  const reason = requireText(values.reason, 'Reason', 1000);
  const days = Number(values.days);
  if (!Number.isFinite(days) || days === 0 || roundToHalf(days) !== days) {
    throw hrError(
      'BAD_USER_INPUT',
      'Days must be a non-zero number of whole or half days.'
    );
  }
  const year = Number(values.year);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw hrError('BAD_USER_INPUT', 'Please enter a valid year.');
  }
  return runInTransaction(async () => {
    await requireEmployeeRecord(values.personId);
    await requireLeaveType(values.leaveTypeId);
    const date = new Date();
    const doc = {
      personId: values.personId,
      leaveTypeId: values.leaveTypeId,
      year,
      days,
      reason,
    };
    const _id = await LeaveAdjustments.insertAsync({
      ...doc,
      createdAt: date,
      createdBy: user._id,
      updatedAt: date,
      updatedBy: user._id,
    });
    await createAuditLog({
      entityId: _id,
      entityType: EntityType.HR_LEAVE_ADJUSTMENT,
      operationType: OperationType.CREATE,
      operationBy: user._id,
      operationTime: date,
      auditValues: doc,
    });
    return LeaveAdjustments.findOneAsync(_id);
  });
}

export async function removeLeaveAdjustment(_id: string, user: UserRef) {
  return runInTransaction(async () => {
    const removed = await LeaveAdjustments.removeAsync(_id);
    if (removed) {
      await createAuditLog({
        entityId: _id,
        entityType: EntityType.HR_LEAVE_ADJUSTMENT,
        operationType: OperationType.DELETE,
        operationBy: user._id,
        operationTime: new Date(),
      });
    }
    return removed;
  });
}

// ---------------------------------------------------------------------------
// Day counting and balances
// ---------------------------------------------------------------------------

/**
 * The leave days from `fromDate` to `toDate` (both included): only the days
 * the employee works count. No working days means every day. A half day is
 * only possible on a single day.
 */
export function countLeaveDays(
  workingDays: readonly string[] | null | undefined,
  fromDate: string,
  toDate: string,
  halfDay = false
) {
  if (!isCalendarDate(fromDate) || !isCalendarDate(toDate)) {
    throw hrError('BAD_USER_INPUT', 'Please enter valid dates.');
  }
  if (toDate < fromDate) {
    throw hrError('BAD_USER_INPUT', 'The end date is before the start date.');
  }
  if (halfDay && fromDate !== toDate) {
    throw hrError(
      'BAD_USER_INPUT',
      'A half day leave must start and end on the same day.'
    );
  }
  const works = workingDays?.length ? new Set(workingDays) : null;
  let days = 0;
  for (let date = fromDate; date <= toDate; date = addCalendarDays(date, 1)) {
    if (!works || works.has(dayOfWeek(date))) days += 1;
  }
  return halfDay ? days * 0.5 : days;
}

/** countLeaveDays for an employee, using their working days. */
export async function countPersonLeaveDays(
  personId: string,
  fromDate: string,
  toDate: string,
  halfDay = false
) {
  const person = await People.findOneAsync(personId);
  if (!person) throw hrError('NOT_FOUND', 'Person not found.');
  return countLeaveDays(
    person.employeeData?.workingDays,
    fromDate,
    toDate,
    halfDay
  );
}

/** The fraction of `year` from `startDate` to the year's end (0 to 1). */
function remainingYearFraction(year: number, startDate: string) {
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;
  if (startDate <= yearStart) return 1;
  if (startDate > yearEnd) return 0;
  const daysInYear =
    (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86400000;
  const [y, m, d] = startDate.split('-').map(Number);
  const remaining = (Date.UTC(year + 1, 0, 1) - Date.UTC(y, m - 1, d)) / 86400000;
  return remaining / daysInYear;
}

export interface LeaveBalance {
  leaveTypeId: string;
  leaveTypeName: string;
  isPaid: boolean;
  year: number;
  entitlement: number;
  carriedForward: number;
  adjustments: number;
  used: number;
  pending: number;
  remaining: number;
}

/**
 * One leave type's balance for a year. The entitlement is pro-rated in the
 * year the current employment period started (joining or rejoining), and
 * nothing is earned before it; with no start date on record it is the full
 * year. Approved leave anywhere in the year counts.
 */
async function computeBalance(
  personId: string,
  leaveType: LeaveTypeDoc,
  year: number,
  periodStart: string | null
): Promise<LeaveBalance> {
  const [requests, adjustments] = await Promise.all([
    LeaveRequests.find(
      {
        personId,
        leaveTypeId: leaveType._id,
        status: { $in: ACTIVE_STATUSES },
        fromDate: { $gte: `${year}-01-01`, $lte: `${year}-12-31` },
      },
      { fields: { status: 1, days: 1 } }
    ).fetchAsync(),
    LeaveAdjustments.find(
      { personId, leaveTypeId: leaveType._id, year },
      { fields: { days: 1 } }
    ).fetchAsync(),
  ]);

  const used = requests
    .filter(r => r.status === LeaveRequestStatus.APPROVED)
    .reduce((sum, r) => sum + Number(r.days), 0);
  const pending = requests
    .filter(r => r.status === LeaveRequestStatus.SUBMITTED)
    .reduce((sum, r) => sum + Number(r.days), 0);
  const adjustmentDays = adjustments.reduce(
    (sum, a) => sum + Number(a.days),
    0
  );

  // No start date on record (older employees): the full year, since there
  // is nothing to pro-rate from. Carry-forward needs a start year, so it
  // doesn't apply to them; HR can add an adjustment instead.
  const entitlement = periodStart
    ? roundToHalf(
        leaveType.annualEntitlementDays *
          remainingYearFraction(year, periodStart)
      )
    : leaveType.annualEntitlementDays;

  let carriedForward = 0;
  if (
    leaveType.allowCarryForward &&
    periodStart &&
    yearOf(periodStart) < year
  ) {
    const previous = await computeBalance(
      personId,
      leaveType,
      year - 1,
      periodStart
    );
    carriedForward = Math.max(0, previous.remaining);
    if (leaveType.maxCarryForwardDays != null) {
      carriedForward = Math.min(carriedForward, leaveType.maxCarryForwardDays);
    }
  }

  return {
    leaveTypeId: leaveType._id,
    leaveTypeName: leaveType.name,
    isPaid: leaveType.isPaid,
    year,
    entitlement,
    carriedForward,
    adjustments: adjustmentDays,
    used,
    pending,
    remaining: entitlement + carriedForward + adjustmentDays - used,
  };
}

const periodStartOf = (person: PersonDocument) => {
  const start = person.employeeData?.employmentStartDate;
  return start ? formatKarachiDate(new Date(start)) : null;
};

/** An employee's balance of every leave type for a calendar year. */
export async function getLeaveBalances(
  personId: string,
  year: number
): Promise<LeaveBalance[]> {
  const person = await People.findOneAsync(personId);
  if (!person) throw hrError('NOT_FOUND', 'Person not found.');
  const leaveTypes = (await LeaveTypes.find(
    {},
    { sort: { name: 1 } }
  ).fetchAsync()) as LeaveTypeDoc[];
  const periodStart = periodStartOf(person);
  return Promise.all(
    leaveTypes.map(leaveType =>
      computeBalance(personId, leaveType, year, periodStart)
    )
  );
}

/**
 * A warning when a request takes a paid leave type past the employee's
 * balance, or null. Pending requests count, so HR sees the total effect.
 */
export async function getLeaveRequestBalanceWarning(request: {
  _id?: string;
  personId: string;
  leaveTypeId: string;
  fromDate: string;
  days: number;
  status?: string;
}): Promise<string | null> {
  if (request.status && !ACTIVE_STATUSES.includes(request.status as LeaveRequestStatusValue)) {
    return null;
  }
  const leaveType = (await LeaveTypes.findOneAsync(
    request.leaveTypeId
  )) as LeaveTypeDoc | undefined;
  const person = await People.findOneAsync(request.personId);
  if (!leaveType || !leaveType.isPaid || !person) return null;

  const balance = await computeBalance(
    request.personId,
    leaveType,
    yearOf(request.fromDate),
    periodStartOf(person)
  );
  // The request itself is already in used or pending once it is saved.
  const alreadyCounted = request._id ? 0 : request.days;
  const afterRequest = balance.remaining - balance.pending - alreadyCounted;
  if (afterRequest >= 0) return null;
  return `This goes ${-afterRequest} day(s) over the ${leaveType.name} balance for ${balance.year} (including pending requests).`;
}

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

async function requireEmployeeRecord(personId: string) {
  const person = await People.findOneAsync(personId);
  if (!person || person.deletedAt) {
    throw hrError('NOT_FOUND', 'Person not found.');
  }
  if (!getEmploymentStatus(person)) {
    throw hrError('BAD_USER_INPUT', 'This person is not an employee.');
  }
  return person;
}

async function requireLeaveType(leaveTypeId: string) {
  const leaveType = await LeaveTypes.findOneAsync(leaveTypeId);
  if (!leaveType) throw hrError('BAD_USER_INPUT', 'Please select a leave type.');
  return leaveType as LeaveTypeDoc;
}

async function requireLeaveRequest(_id: string) {
  const request = await LeaveRequests.findOneAsync(_id);
  if (!request) throw hrError('NOT_FOUND', 'Leave request not found.');
  return request;
}

async function logRequestChange(
  _id: string,
  operationType: string,
  user: UserRef,
  auditValues: Record<string, unknown>
) {
  await createAuditLog({
    entityId: _id,
    entityType: EntityType.HR_LEAVE_REQUEST,
    operationType,
    operationBy: user._id,
    operationTime: new Date(),
    auditValues,
  });
}

export interface LeaveRequestValues {
  personId: string;
  leaveTypeId: string;
  fromDate: string;
  toDate: string;
  halfDay?: boolean | null;
  reason?: string | null;
}

/**
 * Records a leave request. Refused if it overlaps another submitted or
 * approved request of the employee; going over the balance only warns (see
 * getLeaveRequestBalanceWarning).
 */
export async function createLeaveRequest(
  values: LeaveRequestValues,
  user: UserRef
) {
  return runInTransaction(async () => {
    const person = await requireEmployeeRecord(values.personId);
    if (!person.isEmployee) {
      throw hrError(
        'BAD_USER_INPUT',
        'Leave can only be requested for current employees.'
      );
    }
    const leaveType = await requireLeaveType(values.leaveTypeId);
    if (!leaveType.isActive) {
      throw hrError('BAD_USER_INPUT', 'This leave type is no longer in use.');
    }
    const { fromDate, toDate } = values;
    const halfDay = !!values.halfDay;
    const days = countLeaveDays(
      person.employeeData?.workingDays,
      fromDate,
      toDate,
      halfDay
    );
    if (yearOf(fromDate) !== yearOf(toDate)) {
      throw hrError(
        'BAD_USER_INPUT',
        'A leave cannot cross into the next year. Enter one request for each year.'
      );
    }
    if (days === 0) {
      throw hrError(
        'BAD_USER_INPUT',
        'These dates have no working days for this employee.'
      );
    }

    const overlapping = await LeaveRequests.findOneAsync({
      personId: values.personId,
      status: { $in: ACTIVE_STATUSES },
      fromDate: { $lte: toDate },
      toDate: { $gte: fromDate },
    });
    if (overlapping) {
      throw hrError(
        'CONFLICT',
        `This overlaps another leave request (${overlapping.fromDate} to ${overlapping.toDate}).`
      );
    }

    const date = new Date();
    const doc = {
      personId: values.personId,
      leaveTypeId: values.leaveTypeId,
      fromDate,
      toDate,
      halfDay,
      days,
      reason: cleanText(values.reason),
      status: LeaveRequestStatus.SUBMITTED,
    };
    const _id = await LeaveRequests.insertAsync({
      ...doc,
      version: 1,
      createdAt: date,
      createdBy: user._id,
      updatedAt: date,
      updatedBy: user._id,
    });
    await logRequestChange(_id, OperationType.CREATE, user, doc);
    return LeaveRequests.findOneAsync(_id);
  });
}

export interface LeaveConfirmationValues {
  confirmedWithPersonId: string;
  confirmedOn?: string | Date | null;
  confirmationRemarks?: string | null;
}

/**
 * Records whom HR checked with about a submitted request. Optional; it
 * doesn't change the status.
 */
export async function recordLeaveConfirmation(
  _id: string,
  version: number,
  values: LeaveConfirmationValues,
  user: UserRef
) {
  return runInTransaction(async () => {
    const request = await requireLeaveRequest(_id);
    if (request.status !== LeaveRequestStatus.SUBMITTED) {
      throw hrError(
        'CONFLICT',
        'Only a submitted request can record a confirmation.'
      );
    }
    if (!values.confirmedWithPersonId) {
      throw hrError('BAD_USER_INPUT', 'Please select whom you checked with.');
    }
    await assertValidReportsTo(
      String(request.personId),
      values.confirmedWithPersonId
    );
    const fields = {
      confirmedWithPersonId: values.confirmedWithPersonId,
      confirmedOn: parseHrDate(values.confirmedOn ?? null) ?? new Date(),
      confirmationRemarks: cleanText(values.confirmationRemarks) ?? null,
    };
    const changed = await LeaveRequests.updateAsync(
      { _id: { $eq: _id }, version: { $eq: version } },
      {
        $set: { ...fields, updatedAt: new Date(), updatedBy: user._id },
        $inc: { version: 1 },
      }
    );
    if (!changed) {
      throw hrError(
        'CONFLICT',
        'This request was changed by someone else. Reload and try again.'
      );
    }
    await logRequestChange(_id, OperationType.UPDATE, user, fields);
    return LeaveRequests.findOneAsync(_id);
  });
}

async function moveLeaveRequest(
  _id: string,
  from: LeaveRequestStatusValue[],
  fields: Record<string, unknown>,
  user: UserRef
) {
  return runInTransaction(async () => {
    await requireLeaveRequest(_id);
    await moveStatus(LeaveRequests as never, _id, from, fields, user, 'This leave request');
    await logRequestChange(_id, OperationType.UPDATE, user, fields);
    return LeaveRequests.findOneAsync(_id);
  });
}

/** Approves a submitted request. Going over the balance doesn't block. */
export async function approveLeaveRequest(_id: string, user: UserRef) {
  return moveLeaveRequest(
    _id,
    [LeaveRequestStatus.SUBMITTED],
    {
      status: LeaveRequestStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: user._id,
    },
    user
  );
}

export async function rejectLeaveRequest(
  _id: string,
  rejectionReason: string | null | undefined,
  user: UserRef
) {
  return moveLeaveRequest(
    _id,
    [LeaveRequestStatus.SUBMITTED],
    {
      status: LeaveRequestStatus.REJECTED,
      rejectedAt: new Date(),
      rejectedBy: user._id,
      rejectionReason: cleanText(rejectionReason) ?? null,
    },
    user
  );
}

/** Cancels a submitted or approved request, giving the days back. */
export async function cancelLeaveRequest(_id: string, user: UserRef) {
  return moveLeaveRequest(
    _id,
    [LeaveRequestStatus.SUBMITTED, LeaveRequestStatus.APPROVED],
    {
      status: LeaveRequestStatus.CANCELLED,
      cancelledAt: new Date(),
      cancelledBy: user._id,
    },
    user
  );
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface LeaveRequestFilter {
  personId?: string | null;
  leaveTypeId?: string | null;
  statuses?: string[] | null;
  fromDate?: string | null;
  toDate?: string | null;
  pageIndex?: string | number | null;
  pageSize?: string | number | null;
}

/** Leave requests, newest first, with paging. */
export async function searchLeaveRequests(filter: LeaveRequestFilter = {}) {
  const selector: Record<string, unknown> = {};
  if (filter.personId) selector.personId = filter.personId;
  if (filter.leaveTypeId) selector.leaveTypeId = filter.leaveTypeId;
  if (filter.statuses?.length) selector.status = { $in: filter.statuses };
  // Requests that touch the range.
  if (filter.fromDate) selector.toDate = { $gte: filter.fromDate };
  if (filter.toDate) selector.fromDate = { $lte: filter.toDate };

  const pageIndex = Math.max(0, Number(filter.pageIndex ?? 0) || 0);
  const pageSize = Math.min(200, Math.max(1, Number(filter.pageSize ?? 20) || 20));
  const [data, totalResults] = await Promise.all([
    LeaveRequests.find(selector, {
      sort: { fromDate: -1, createdAt: -1 },
      skip: pageIndex * pageSize,
      limit: pageSize,
    }).fetchAsync(),
    LeaveRequests.find(selector).countAsync(),
  ]);
  return { data, totalResults };
}
