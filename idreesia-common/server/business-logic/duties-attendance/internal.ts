import {
  DUTIES_ATTENDANCE_MAX_DESCRIPTION_LENGTH,
  DUTIES_ATTENDANCE_MAX_NAME_LENGTH,
} from 'meteor/idreesia-common/constants/duties-attendance';
import {
  DutiesAttendanceDayOverrides,
  DutiesAttendanceDayRecords,
  DutiesAttendanceDuties,
  DutiesAttendanceWorkspaces,
  DutiesAttendanceWorkspaceUsers,
  type DutiesAttendanceDutyDocument,
  type DutiesAttendanceMetadata,
  type DutiesAttendanceWorkspaceDocument,
} from 'meteor/idreesia-common/server/collections/duties-attendance';

import { dutiesAttendanceError } from './errors';

/** Every call names the acting user, for audit fields. */
export function requireUserId(userId: unknown): asserts userId is string {
  if (typeof userId !== 'string' || !userId) {
    throw dutiesAttendanceError('BAD_USER_INPUT', 'A user id is required');
  }
}

const hasControlCharacters = (value: string) =>
  [...value].some(char => {
    const code = char.charCodeAt(0);
    return code < 0x20 || code === 0x7f;
  });

/** Trims and checks a single-line name (workspace or duty). */
export function normalizeName(
  value: unknown,
  what = 'Name',
  maxLength = DUTIES_ATTENDANCE_MAX_NAME_LENGTH
): string {
  if (typeof value !== 'string') {
    throw dutiesAttendanceError('BAD_USER_INPUT', `${what} is required`);
  }
  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (!trimmed) {
    throw dutiesAttendanceError('BAD_USER_INPUT', `${what} is required`);
  }
  if (trimmed.length > maxLength) {
    throw dutiesAttendanceError(
      'BAD_USER_INPUT',
      `${what} must be at most ${maxLength} characters`
    );
  }
  if (hasControlCharacters(trimmed)) {
    throw dutiesAttendanceError(
      'BAD_USER_INPUT',
      `${what} contains invalid characters`
    );
  }
  return trimmed;
}

/** Trimmed multi-line text, or undefined when empty. */
export function normalizeText(
  value: unknown,
  what = 'Text',
  maxLength = DUTIES_ATTENDANCE_MAX_DESCRIPTION_LENGTH
): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') {
    throw dutiesAttendanceError('BAD_USER_INPUT', `${what} must be text`);
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw dutiesAttendanceError(
      'BAD_USER_INPUT',
      `${what} must be at most ${maxLength} characters`
    );
  }
  return trimmed || undefined;
}

/** Metadata keys are queryable as `metadata.<key>`, so they are restricted. */
const METADATA_KEY_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export function validateMetadata(
  metadata: unknown
): DutiesAttendanceMetadata | undefined {
  if (metadata === undefined || metadata === null) return undefined;
  if (
    typeof metadata !== 'object' ||
    Array.isArray(metadata) ||
    Object.getPrototypeOf(metadata) !== Object.prototype
  ) {
    throw dutiesAttendanceError(
      'BAD_USER_INPUT',
      'Metadata must be a plain object'
    );
  }
  const badKey = Object.keys(metadata).find(
    key => !METADATA_KEY_PATTERN.test(key)
  );
  if (badKey !== undefined) {
    throw dutiesAttendanceError(
      'BAD_USER_INPUT',
      `Invalid metadata key "${badKey}" (letters, digits, _ and - only)`
    );
  }
  return metadata as DutiesAttendanceMetadata;
}

export const uniqueIds = (
  ids: Array<string | null | undefined> | null | undefined
): string[] => [...new Set((ids ?? []).filter((id): id is string => !!id))];

export function isDuplicateKey(error: unknown) {
  const code = (error as { code?: number }).code;
  return (
    code === 11000 ||
    (error instanceof Error && error.message.includes('E11000'))
  );
}

export const stamp = (userId: string, date = new Date()) => ({
  createdAt: date,
  createdBy: userId,
  updatedAt: date,
  updatedBy: userId,
});

export const touch = (userId: string) => ({
  updatedAt: new Date(),
  updatedBy: userId,
});

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

export async function requireWorkspace(
  workspaceId: string,
  { includeDeleted = false }: { includeDeleted?: boolean } = {}
): Promise<DutiesAttendanceWorkspaceDocument> {
  const workspace = workspaceId
    ? await DutiesAttendanceWorkspaces.findOneAsync(workspaceId)
    : undefined;
  if (!workspace || (!includeDeleted && workspace.deletedAt)) {
    throw dutiesAttendanceError('NOT_FOUND', 'Workspace not found');
  }
  return workspace;
}

/** A duty in a live workspace (and in `workspaceId`, when given). */
export async function requireDuty(
  dutyId: string,
  { workspaceId }: { workspaceId?: string } = {}
): Promise<DutiesAttendanceDutyDocument> {
  const duty = dutyId
    ? await DutiesAttendanceDuties.findOneAsync(dutyId)
    : undefined;
  if (!duty || (workspaceId && duty.workspaceId !== workspaceId)) {
    throw dutiesAttendanceError('NOT_FOUND', 'Duty not found');
  }
  await requireWorkspace(duty.workspaceId).catch(() => {
    throw dutiesAttendanceError('NOT_FOUND', 'Duty not found');
  });
  return duty;
}

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

let indexesReady: Promise<void> | null = null;

/**
 * Creates the module's indexes once per process. Called outside any
 * transaction (which can't create them) before the functions that rely on the
 * unique indexes; the migration calls it too.
 */
export function ensureDutiesAttendanceIndexes() {
  if (!indexesReady) {
    indexesReady = createIndexes().catch(error => {
      indexesReady = null;
      throw error;
    });
  }
  return indexesReady;
}

async function createIndexes() {
  const workspaceUsers = DutiesAttendanceWorkspaceUsers.rawCollection();
  await workspaceUsers.createIndex(
    { workspaceId: 1, userId: 1 },
    { unique: true }
  );
  await workspaceUsers.createIndex({ userId: 1 });
  await DutiesAttendanceDuties.rawCollection().createIndex({
    workspaceId: 1,
    name: 1,
  });
  await DutiesAttendanceDayOverrides.rawCollection().createIndex(
    { dutyId: 1, date: 1 },
    { unique: true }
  );
  const records = DutiesAttendanceDayRecords.rawCollection();
  await records.createIndex({ dutyId: 1, date: 1 }, { unique: true });
  await records.createIndex({ workspaceId: 1, date: 1 });
  await records.createIndex({ 'karkuns.karkunId': 1, date: 1 });
}
