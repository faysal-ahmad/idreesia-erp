import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import {
  DutiesAttendanceDayOverrides,
  DutiesAttendanceDayRecords,
  DutiesAttendanceDuties,
  type DutiesAttendanceDutyDocument,
  type DutyMember,
} from 'meteor/idreesia-common/server/collections/duties-attendance';
import {
  isDayOfWeek,
} from 'meteor/idreesia-common/server/business-logic/hr-common/duty-planning-dates';
import { ensureKarkuns } from 'meteor/idreesia-common/server/business-logic/hr-karkuns/ensure-karkuns';
import { requireMehfilDuty } from 'meteor/idreesia-common/server/business-logic/admin/mehfil-template-duties';

import { dutiesAttendanceError } from './errors';
import {
  ensureDutiesAttendanceIndexes,
  requireDuty,
  requireUserId,
  requireLocation,
  stamp,
  touch,
} from './internal';
import { firstPlanningDate, lockDutyDaysThroughToday } from './planning';

export interface CreateDutyInput {
  /** The mehfil template duty to use. */
  mehfilDutyId: string;
}

export async function createDuty(
  locationId: string,
  input: CreateDutyInput,
  userId: string
): Promise<DutiesAttendanceDutyDocument> {
  return runInTransaction(async () => {
    requireUserId(userId);
    await requireLocation(locationId);
    // A location can't define duties of its own, only pick from the list.
    await requireMehfilDuty(input.mehfilDutyId).catch(() => {
      throw dutiesAttendanceError('BAD_USER_INPUT', 'Please select a valid duty.');
    });
    const existing = await DutiesAttendanceDuties.findOneAsync({
      locationId,
      mehfilDutyId: input.mehfilDutyId,
    });
    if (existing) {
      throw dutiesAttendanceError(
        'CONFLICT',
        'This duty has already been added'
      );
    }

    const dutyId = await DutiesAttendanceDuties.insertAsync({
      locationId,
      mehfilDutyId: input.mehfilDutyId,
      isActive: true,
      startDate: firstPlanningDate(),
      members: [],
      ...stamp(userId),
    });
    return requireDuty(dutyId);
  });
}

/** Adds several template duties to a location, all or none. */
export async function addDuties(
  locationId: string,
  mehfilDutyIds: string[],
  userId: string
): Promise<DutiesAttendanceDutyDocument[]> {
  const ids = [...new Set(mehfilDutyIds)];
  if (ids.length === 0) {
    throw dutiesAttendanceError('BAD_USER_INPUT', 'Please select a duty.');
  }
  return runInTransaction(async () => {
    const duties: DutiesAttendanceDutyDocument[] = [];
    for (const mehfilDutyId of ids) {
       
      duties.push(await createDuty(locationId, { mehfilDutyId }, userId));
    }
    return duties;
  });
}

export interface UpdateDutyInput {
  isActive?: boolean;
}

export async function updateDuty(
  locationId: string,
  dutyId: string,
  changes: UpdateDutyInput,
  userId: string
): Promise<DutiesAttendanceDutyDocument> {
  // Indexes are created outside the transaction, which can't create them.
  await ensureDutiesAttendanceIndexes();
  return runInTransaction(async () => {
    requireUserId(userId);
    const duty = await requireDuty(dutyId, { locationId });

    const $set: Record<string, unknown> = { ...touch(userId) };

    if (changes.isActive !== undefined && changes.isActive !== null) {
      const isActive = !!changes.isActive;
      if (isActive !== (duty.isActive !== false)) {
        // Days up to today are locked before the duty stops being planned.
        // When it starts again, it picks up from that day: the days in
        // between never get a record.
        if (isActive) $set.startDate = firstPlanningDate();
        else await lockDutyDaysThroughToday(duty);
      }
      $set.isActive = isActive;
    }

    await DutiesAttendanceDuties.updateAsync(dutyId, { $set });
    return requireDuty(dutyId);
  });
}

/**
 * Deletes a duty that has never had anybody on duty. A duty with attendance
 * history can only be made inactive.
 */
export async function removeDuty(
  locationId: string,
  dutyId: string,
  userId: string
): Promise<void> {
  return runInTransaction(async () => {
    requireUserId(userId);
    await requireDuty(dutyId, { locationId });
    const records = await DutiesAttendanceDayRecords.find({
      dutyId,
      'karkuns.0': { $exists: true },
    }).countAsync();
    if (records > 0) {
      throw dutiesAttendanceError(
        'CONFLICT',
        'This duty has attendance records and cannot be deleted. Mark it inactive instead.'
      );
    }
    await DutiesAttendanceDayRecords.removeAsync({ dutyId });
    await DutiesAttendanceDayOverrides.removeAsync({ dutyId });
    await DutiesAttendanceDuties.removeAsync(dutyId);
  });
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

export interface DutyMemberInput {
  karkunId: string;
  isCoordinator?: boolean | null;
  /** The member may mark their own attendance. On update, missing keeps it. */
  canMarkOwnAttendance?: boolean | null;
  /** Empty or missing: every day. */
  daysOfWeek?: string[] | null;
}

function normalizeDays(daysOfWeek: string[] | null | undefined) {
  const days = [...new Set(daysOfWeek ?? [])];
  const bad = days.find(day => !isDayOfWeek(day));
  if (bad !== undefined) {
    throw dutiesAttendanceError(
      'BAD_USER_INPUT',
      `"${bad}" is not a day of the week`
    );
  }
  return days;
}

async function ensureKarkun(karkunId: string) {
  try {
    await ensureKarkuns([karkunId]);
  } catch (error) {
    throw dutiesAttendanceError(
      'BAD_USER_INPUT',
      error instanceof Error ? error.message : 'Please select a valid karkun.'
    );
  }
}

// Runs a roster change on a duty. The days up to today are locked first, so
// the change only affects days that are still being planned.
async function changeRoster(
  locationId: string,
  dutyId: string,
  userId: string,
  change: (duty: DutiesAttendanceDutyDocument) => Promise<DutyMember[]>
) {
  // Indexes are created outside the transaction, which can't create them.
  await ensureDutiesAttendanceIndexes();
  return runInTransaction(async () => {
    requireUserId(userId);
    const duty = await requireDuty(dutyId, { locationId });
    await lockDutyDaysThroughToday(duty);
    const members = await change(duty);
    await DutiesAttendanceDuties.updateAsync(dutyId, {
      $set: { members, ...touch(userId) },
    });
    return requireDuty(dutyId);
  });
}

export async function addDutyMember(
  locationId: string,
  dutyId: string,
  input: DutyMemberInput,
  userId: string
) {
  await ensureKarkun(input.karkunId);
  const daysOfWeek = normalizeDays(input.daysOfWeek);
  return changeRoster(locationId, dutyId, userId, async duty => {
    if (duty.members.some(member => member.karkunId === input.karkunId)) {
      throw dutiesAttendanceError(
        'CONFLICT',
        'This person is already a member of the duty'
      );
    }
    return [
      ...duty.members,
      {
        karkunId: input.karkunId,
        ...(input.isCoordinator ? { isCoordinator: true } : {}),
        ...(input.canMarkOwnAttendance ? { canMarkOwnAttendance: true } : {}),
        ...(daysOfWeek.length ? { daysOfWeek } : {}),
      },
    ];
  });
}

export async function updateDutyMember(
  locationId: string,
  dutyId: string,
  input: DutyMemberInput,
  userId: string
) {
  const daysOfWeek = normalizeDays(input.daysOfWeek);
  return changeRoster(locationId, dutyId, userId, async duty => {
    if (!duty.members.some(member => member.karkunId === input.karkunId)) {
      throw dutiesAttendanceError(
        'NOT_FOUND',
        'This person is not a member of the duty'
      );
    }
    return duty.members.map(member =>
      member.karkunId === input.karkunId
        ? {
            karkunId: member.karkunId,
            ...(input.isCoordinator ? { isCoordinator: true } : {}),
            ...((input.canMarkOwnAttendance ?? member.canMarkOwnAttendance)
              ? { canMarkOwnAttendance: true }
              : {}),
            ...(daysOfWeek.length ? { daysOfWeek } : {}),
          }
        : member
    );
  });
}

export async function removeDutyMember(
  locationId: string,
  dutyId: string,
  karkunId: string,
  userId: string
) {
  return changeRoster(locationId, dutyId, userId, async duty => {
    if (!duty.members.some(member => member.karkunId === karkunId)) {
      throw dutiesAttendanceError(
        'NOT_FOUND',
        'This person is not a member of the duty'
      );
    }
    return duty.members.filter(member => member.karkunId !== karkunId);
  });
}
