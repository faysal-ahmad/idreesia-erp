import { GraphQLError } from 'graphql';

import {
  DUTIES_ATTENDANCE_MAX_DESCRIPTION_LENGTH,
  DUTIES_ATTENDANCE_MAX_NAME_LENGTH,
} from 'meteor/idreesia-common/constants/duties-attendance';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { DutiesAttendanceDuties } from 'meteor/idreesia-common/server/collections/duties-attendance';
import {
  MehfilTemplateDuties,
  type MehfilTemplateDutyDocument,
} from 'meteor/idreesia-common/server/collections/admin';


type MehfilTemplatesErrorCode = 'NOT_FOUND' | 'CONFLICT' | 'BAD_USER_INPUT';

const mehfilTemplatesError = (code: MehfilTemplatesErrorCode, message: string) =>
  new GraphQLError(message, { extensions: { code } });

function normalizeName(value: unknown): string {
  const trimmed =
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
  if (!trimmed) {
    throw mehfilTemplatesError('BAD_USER_INPUT', 'Duty name is required');
  }
  if (trimmed.length > DUTIES_ATTENDANCE_MAX_NAME_LENGTH) {
    throw mehfilTemplatesError(
      'BAD_USER_INPUT',
      `Duty name must be at most ${DUTIES_ATTENDANCE_MAX_NAME_LENGTH} characters`
    );
  }
  return trimmed;
}

function normalizeDescription(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (trimmed.length > DUTIES_ATTENDANCE_MAX_DESCRIPTION_LENGTH) {
    throw mehfilTemplatesError(
      'BAD_USER_INPUT',
      `Description must be at most ${DUTIES_ATTENDANCE_MAX_DESCRIPTION_LENGTH} characters`
    );
  }
  return trimmed || undefined;
}

async function assertNameAvailable(name: string, selfId?: string) {
  // Names are compared ignoring case, so "Gate" and "gate" can't both exist.
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const sameName = await MehfilTemplateDuties.findOneAsync({
    name: { $regex: `^${escaped}$`, $options: 'i' },
    ...(selfId ? { _id: { $ne: selfId } } : {}),
  });
  if (sameName) {
    throw mehfilTemplatesError(
      'CONFLICT',
      `A duty named '${name}' already exists`
    );
  }
}

/** For validating a mehfil's choice of duty. */
export async function requireMehfilDuty(
  dutyId: string
): Promise<MehfilTemplateDutyDocument> {
  const duty = dutyId
    ? await MehfilTemplateDuties.findOneAsync(dutyId)
    : undefined;
  if (!duty) throw mehfilTemplatesError('NOT_FOUND', 'Duty not found');
  return duty;
}

export interface CreateMehfilDutyInput {
  name: string;
  description?: string;
}

export async function createMehfilDuty(
  input: CreateMehfilDutyInput,
  userId: string
): Promise<MehfilTemplateDutyDocument> {
  return runInTransaction(async () => {
    const name = normalizeName(input.name);
    const description = normalizeDescription(input.description);
    await assertNameAvailable(name);
    const now = new Date();
    const dutyId = await MehfilTemplateDuties.insertAsync({
      name,
      ...(description ? { description } : {}),
      createdAt: now,
      createdBy: userId,
      updatedAt: now,
      updatedBy: userId,
    });
    return requireMehfilDuty(dutyId);
  });
}

export interface UpdateMehfilDutyInput {
  name?: string;
  /** null clears it. */
  description?: string | null;
}

/** Mehfils read the name and description from here, so a change shows everywhere. */
export async function updateMehfilDuty(
  dutyId: string,
  changes: UpdateMehfilDutyInput,
  userId: string
): Promise<MehfilTemplateDutyDocument> {
  return runInTransaction(async () => {
    await requireMehfilDuty(dutyId);
    const $set: Record<string, unknown> = {
      updatedAt: new Date(),
      updatedBy: userId,
    };
    const $unset: Record<string, 1> = {};

    if (changes.name !== undefined && changes.name !== null) {
      const name = normalizeName(changes.name);
      await assertNameAvailable(name, dutyId);
      $set.name = name;
    }
    if (changes.description !== undefined) {
      const description = normalizeDescription(changes.description);
      if (description) $set.description = description;
      else $unset.description = 1;
    }

    await MehfilTemplateDuties.updateAsync(dutyId, {
      $set,
      ...(Object.keys($unset).length ? { $unset } : {}),
    });
    return requireMehfilDuty(dutyId);
  });
}

/** A duty that a mehfil uses can't be deleted. */
export async function removeMehfilDuty(dutyId: string): Promise<void> {
  return runInTransaction(async () => {
    await requireMehfilDuty(dutyId);
    const inUse = await DutiesAttendanceDuties.find({
      mehfilDutyId: dutyId,
    }).countAsync();
    if (inUse > 0) {
      throw mehfilTemplatesError(
        'CONFLICT',
        `This duty is used by ${inUse} mehfil duty record(s) and cannot be deleted.`
      );
    }
    await MehfilTemplateDuties.removeAsync(dutyId);
  });
}

