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
} from 'meteor/idreesia-common/server/business-logic/hr/duty-planning-dates';
import { ensureKarkuns } from 'meteor/idreesia-common/server/business-logic/hr/ensure-karkuns';

import { dutiesAttendanceError } from './errors';
import {
  ensureDutiesAttendanceIndexes,
  normalizeName,
  normalizeText,
  requireDuty,
  requireUserId,
  requireWorkspace,
  stamp,
  touch,
} from './internal';
import { firstPlanningDate, lockDutyDaysThroughToday } from './planning';

export interface CreateDutyInput {
  name: string;
  description?: string;
}

async function assertNameAvailable(
  workspaceId: string,
  name: string,
  selfId?: string
) {
  const sameName = await DutiesAttendanceDuties.findOneAsync({
    workspaceId,
    name,
    ...(selfId ? { _id: { $ne: selfId } } : {}),
  });
  if (sameName) {
    throw dutiesAttendanceError(
      'CONFLICT',
      `A duty named '${name}' already exists`
    );
  }
}

export async function createDuty(
  workspaceId: string,
  input: CreateDutyInput,
  userId: string
): Promise<DutiesAttendanceDutyDocument> {
  return runInTransaction(async () => {
    requireUserId(userId);
    await requireWorkspace(workspaceId);
    const name = normalizeName(input.name, 'Duty name');
    const description = normalizeText(input.description, 'Description');
    await assertNameAvailable(workspaceId, name);

    const dutyId = await DutiesAttendanceDuties.insertAsync({
      workspaceId,
      name,
      ...(description ? { description } : {}),
      isActive: true,
      startDate: firstPlanningDate(),
      members: [],
      ...stamp(userId),
    });
    return requireDuty(dutyId);
  });
}

export interface UpdateDutyInput {
  name?: string;
  /** null clears it. */
  description?: string | null;
  isActive?: boolean;
}

export async function updateDuty(
  workspaceId: string,
  dutyId: string,
  changes: UpdateDutyInput,
  userId: string
): Promise<DutiesAttendanceDutyDocument> {
  // Indexes are created outside the transaction, which can't create them.
  await ensureDutiesAttendanceIndexes();
  return runInTransaction(async () => {
    requireUserId(userId);
    const duty = await requireDuty(dutyId, { workspaceId });

    const $set: Record<string, unknown> = { ...touch(userId) };
    const $unset: Record<string, 1> = {};

    if (changes.name !== undefined) {
      const name = normalizeName(changes.name, 'Duty name');
      await assertNameAvailable(workspaceId, name, dutyId);
      $set.name = name;
    }
    if (changes.description !== undefined) {
      const description = normalizeText(changes.description, 'Description');
      if (description) $set.description = description;
      else $unset.description = 1;
    }
    if (changes.isActive !== undefined && changes.isActive !== null) {
      const isActive = !!changes.isActive;
      if (isActive !== (duty.isActive !== false)) {
        // Days up to today are locked before the duty stops being planned.
        // When it starts again, it picks up from tomorrow: the days in
        // between never get a record.
        if (isActive) $set.startDate = firstPlanningDate();
        else await lockDutyDaysThroughToday(duty);
      }
      $set.isActive = isActive;
    }

    await DutiesAttendanceDuties.updateAsync(dutyId, {
      $set,
      ...(Object.keys($unset).length ? { $unset } : {}),
    });
    return requireDuty(dutyId);
  });
}

/**
 * Deletes a duty that has never had anybody on duty. A duty with attendance
 * history can only be made inactive.
 */
export async function removeDuty(
  workspaceId: string,
  dutyId: string,
  userId: string
): Promise<void> {
  return runInTransaction(async () => {
    requireUserId(userId);
    await requireDuty(dutyId, { workspaceId });
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
  workspaceId: string,
  dutyId: string,
  userId: string,
  change: (duty: DutiesAttendanceDutyDocument) => Promise<DutyMember[]>
) {
  // Indexes are created outside the transaction, which can't create them.
  await ensureDutiesAttendanceIndexes();
  return runInTransaction(async () => {
    requireUserId(userId);
    const duty = await requireDuty(dutyId, { workspaceId });
    await lockDutyDaysThroughToday(duty);
    const members = await change(duty);
    await DutiesAttendanceDuties.updateAsync(dutyId, {
      $set: { members, ...touch(userId) },
    });
    return requireDuty(dutyId);
  });
}

export async function addDutyMember(
  workspaceId: string,
  dutyId: string,
  input: DutyMemberInput,
  userId: string
) {
  await ensureKarkun(input.karkunId);
  const daysOfWeek = normalizeDays(input.daysOfWeek);
  return changeRoster(workspaceId, dutyId, userId, async duty => {
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
        ...(daysOfWeek.length ? { daysOfWeek } : {}),
      },
    ];
  });
}

export async function updateDutyMember(
  workspaceId: string,
  dutyId: string,
  input: DutyMemberInput,
  userId: string
) {
  const daysOfWeek = normalizeDays(input.daysOfWeek);
  return changeRoster(workspaceId, dutyId, userId, async duty => {
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
            ...(daysOfWeek.length ? { daysOfWeek } : {}),
          }
        : member
    );
  });
}

export async function removeDutyMember(
  workspaceId: string,
  dutyId: string,
  karkunId: string,
  userId: string
) {
  return changeRoster(workspaceId, dutyId, userId, async duty => {
    if (!duty.members.some(member => member.karkunId === karkunId)) {
      throw dutiesAttendanceError(
        'NOT_FOUND',
        'This person is not a member of the duty'
      );
    }
    return duty.members.filter(member => member.karkunId !== karkunId);
  });
}
