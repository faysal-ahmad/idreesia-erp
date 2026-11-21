import {
  DUTIES_ATTENDANCE_MAX_DESCRIPTION_LENGTH,
  DUTIES_ATTENDANCE_MAX_NAME_LENGTH,
} from 'meteor/idreesia-common/constants/duties-attendance';
import {
  MehfilTemplateDuties,
  OrgLocations,
  type OrgLocationDocument,
} from 'meteor/idreesia-common/server/collections/admin';
import {
  DutiesAttendanceDayOverrides,
  DutiesAttendanceDayRecords,
  DutiesAttendanceDuties,
  type DutiesAttendanceDutyDocument,
} from 'meteor/idreesia-common/server/collections/duties-attendance';
import { hasOrgLocationFeatures } from 'meteor/idreesia-common/server/business-logic/admin/org-location-features';

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

/** Trims and checks a single-line name duty. */
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

/** A location that has Duties and Attendance (a mehfil). */
export async function requireLocation(
  locationId: string
): Promise<OrgLocationDocument> {
  const location = locationId
    ? await OrgLocations.findOneAsync(locationId)
    : undefined;
  if (!location || !hasOrgLocationFeatures(location)) {
    throw dutiesAttendanceError('NOT_FOUND', 'Location not found');
  }
  return location;
}

/** The names of duties, which they take from their mehfil template duty. */
export async function getDutyNames(
  duties: Array<{ _id: string; mehfilDutyId: string }>
): Promise<Map<string, string>> {
  const templates = await MehfilTemplateDuties.find({
    _id: { $in: duties.map(duty => duty.mehfilDutyId) },
  }).fetchAsync();
  const names = new Map(templates.map(template => [template._id, template.name]));
  return new Map(duties.map(duty => [duty._id, names.get(duty.mehfilDutyId) ?? '']));
}

/** A duty of a mehfil (and of `locationId`, when given). */
export async function requireDuty(
  dutyId: string,
  { locationId }: { locationId?: string } = {}
): Promise<DutiesAttendanceDutyDocument> {
  const duty = dutyId
    ? await DutiesAttendanceDuties.findOneAsync(dutyId)
    : undefined;
  if (!duty || (locationId && duty.locationId !== locationId)) {
    throw dutiesAttendanceError('NOT_FOUND', 'Duty not found');
  }
  await requireLocation(duty.locationId).catch(() => {
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
  const duties = DutiesAttendanceDuties.rawCollection();
  await duties.createIndex({ locationId: 1, mehfilDutyId: 1 });
  await duties.createIndex({ mehfilDutyId: 1 });
  await DutiesAttendanceDayOverrides.rawCollection().createIndex(
    { dutyId: 1, date: 1 },
    { unique: true }
  );
  const records = DutiesAttendanceDayRecords.rawCollection();
  await records.createIndex({ dutyId: 1, date: 1 }, { unique: true });
  await records.createIndex({ locationId: 1, date: 1 });
  await records.createIndex({ 'karkuns.karkunId': 1, date: 1 });
}
