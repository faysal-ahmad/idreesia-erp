import { GraphQLError } from 'graphql';

import { SystemSettings } from 'meteor/idreesia-common/server/collections/admin';

interface UserRef {
  _id: string;
}

const adminError = (message: string, code: string) =>
  new GraphQLError(message, { extensions: { code } });

// Generic helpers: one document per settings group, stored values merged over the group's defaults.
async function getSettingsGroup<T extends object>(
  groupId: string,
  defaults: T
): Promise<T & { updatedAt: Date | null; updatedBy: string | null }> {
  const doc = await SystemSettings.findOneAsync(groupId);
  return {
    ...defaults,
    ...((doc?.values ?? {}) as Partial<T>),
    updatedAt: doc?.updatedAt ?? null,
    updatedBy: doc?.updatedBy ?? null,
  };
}

async function setSettingsGroup(
  groupId: string,
  values: object,
  user: UserRef
) {
  await SystemSettings.updateAsync(
    groupId,
    { $set: { values: values as Record<string, unknown>, updatedAt: new Date(), updatedBy: user._id } },
    { upsert: true }
  );
}

interface Range {
  min: number;
  max: number;
  integer?: boolean;
}

// Checks every field against its range and returns just those fields.
function validateRanges<T extends object>(
  values: T,
  ranges: Record<keyof T, Range>
): T {
  const clean = {} as T;
  (Object.keys(ranges) as (keyof T & string)[]).forEach(key => {
    const { min, max, integer } = ranges[key];
    const value = values[key] as unknown;
    if (
      typeof value !== 'number' ||
      !Number.isFinite(value) ||
      value < min ||
      value > max ||
      (integer && !Number.isInteger(value))
    ) {
      throw adminError(
        `${key} must be ${integer ? 'a whole number ' : 'a number '}between ${min} and ${max}.`,
        'BAD_USER_INPUT'
      );
    }
    clean[key] = value as T[keyof T & string];
  });
  return clean;
}

// ---------------------------------------------------------------------------------------------
// Face recognition for the public self-attendance kiosk.
// ---------------------------------------------------------------------------------------------
const SELF_ATTENDANCE_FACE_GROUP = 'face-recognition-self-attendance';

export interface SelfAttendanceFaceSettings {
  /** Minimum raw cosine similarity for a face to count as a match. */
  matchThreshold: number;
  /** How far the best match must be ahead of the next-best different person. 0 turns it off. */
  minMatchMargin: number;
  /** Minimum face detection confidence. */
  minDetectionScore: number;
  /** Minimum size, in pixels, of the shorter side of the detected face. */
  minFacePixels: number;
  /** Minimum face sharpness, 0-100 (see face-sharpness.ts). 0 turns the check off. */
  minSharpness: number;
  /** Minimum frontal pose, 0-100 (see face-pose.ts): how directly the face looks at the camera. 0 turns the check off. */
  minFacePose: number;
}

// Match threshold and detection score equal the values hard-coded for the other face-recognition
// callers. The minimum face size is higher (96px, as security-server uses for live cameras): the
// kiosk is used at close range, and the floor keeps bystanders in the background out.
export const SELF_ATTENDANCE_FACE_DEFAULTS: SelfAttendanceFaceSettings = {
  matchThreshold: 0.5,
  minMatchMargin: 0.1,
  minDetectionScore: 0.6,
  minFacePixels: 96,
  minSharpness: 50,
  minFacePose: 60,
};

const SELF_ATTENDANCE_FACE_RANGES: Record<keyof SelfAttendanceFaceSettings, Range> = {
  matchThreshold: { min: 0.3, max: 0.95 },
  minMatchMargin: { min: 0, max: 0.5 },
  minDetectionScore: { min: 0.3, max: 0.99 },
  minFacePixels: { min: 20, max: 400, integer: true },
  minSharpness: { min: 0, max: 100, integer: true },
  minFacePose: { min: 0, max: 100, integer: true },
};

export async function getSelfAttendanceFaceSettings() {
  return getSettingsGroup(
    SELF_ATTENDANCE_FACE_GROUP,
    SELF_ATTENDANCE_FACE_DEFAULTS
  );
}

export async function updateSelfAttendanceFaceSettings(
  values: SelfAttendanceFaceSettings,
  user: UserRef
) {
  const clean = validateRanges(values, SELF_ATTENDANCE_FACE_RANGES);
  await setSettingsGroup(SELF_ATTENDANCE_FACE_GROUP, clean, user);
  return getSelfAttendanceFaceSettings();
}

// ---------------------------------------------------------------------------------------------
// Image quality for People Registration (the Security module's visitor photos). No face
// recognition is involved: these decide whether a registered photo is usable for face search later.
// ---------------------------------------------------------------------------------------------
const PEOPLE_REGISTRATION_IMAGE_GROUP = 'image-quality-people-registration';

export interface PeopleRegistrationImageSettings {
  /** Minimum face detection confidence. */
  minDetectionScore: number;
  /** Minimum size, in pixels, of the shorter side of the detected face. */
  minFacePixels: number;
  /** Minimum face sharpness, 0-100 (see face-sharpness.ts). 0 turns the check off. */
  minSharpness: number;
  /** Minimum frontal pose, 0-100 (see face-pose.ts): how directly the face looks at the camera. 0 turns the check off. */
  minFacePose: number;
}

// The detection score equals the value that was hard-coded before it became configurable. The
// minimum face size is 96px, as security-server uses for live cameras.
export const PEOPLE_REGISTRATION_IMAGE_DEFAULTS: PeopleRegistrationImageSettings = {
  minDetectionScore: 0.6,
  minFacePixels: 96,
  minSharpness: 50,
  minFacePose: 60,
};

const PEOPLE_REGISTRATION_IMAGE_RANGES: Record<
  keyof PeopleRegistrationImageSettings,
  Range
> = {
  minDetectionScore: { min: 0.3, max: 0.99 },
  minFacePixels: { min: 20, max: 400, integer: true },
  minSharpness: { min: 0, max: 100, integer: true },
  minFacePose: { min: 0, max: 100, integer: true },
};

export async function getPeopleRegistrationImageSettings() {
  return getSettingsGroup(
    PEOPLE_REGISTRATION_IMAGE_GROUP,
    PEOPLE_REGISTRATION_IMAGE_DEFAULTS
  );
}

export async function updatePeopleRegistrationImageSettings(
  values: PeopleRegistrationImageSettings,
  user: UserRef
) {
  const clean = validateRanges(values, PEOPLE_REGISTRATION_IMAGE_RANGES);
  await setSettingsGroup(PEOPLE_REGISTRATION_IMAGE_GROUP, clean, user);
  return getPeopleRegistrationImageSettings();
}

// ---------------------------------------------------------------------------------------------
// Face recognition for the People Search (the Security module's visitor search by photo).
// ---------------------------------------------------------------------------------------------
const PEOPLE_SEARCH_FACE_GROUP = 'face-recognition-people-search';

export interface PeopleSearchFaceSettings {
  /** Minimum raw cosine similarity for a stored visitor to be returned as a match. */
  matchThreshold: number;
  /** How far the best match must be ahead of the next-best different person. 0 turns it off. */
  minMatchMargin: number;
  /** Minimum face detection confidence. */
  minDetectionScore: number;
  /** Minimum size, in pixels, of the shorter side of the detected face. */
  minFacePixels: number;
  /** Minimum face sharpness, 0-100 (see face-sharpness.ts). 0 turns the check off. */
  minSharpness: number;
  /** Minimum frontal pose, 0-100 (see face-pose.ts): how directly the face looks at the camera. 0 turns the check off. */
  minFacePose: number;
}

// The match threshold and detection score equal the values that were hard-coded before they
// became configurable. The minimum face size is 96px, as security-server uses for live cameras.
export const PEOPLE_SEARCH_FACE_DEFAULTS: PeopleSearchFaceSettings = {
  matchThreshold: 0.5,
  minMatchMargin: 0,
  minDetectionScore: 0.6,
  minFacePixels: 96,
  minSharpness: 50,
  minFacePose: 60,
};

const PEOPLE_SEARCH_FACE_RANGES: Record<
  keyof PeopleSearchFaceSettings,
  Range
> = {
  matchThreshold: { min: 0.3, max: 0.95 },
  minMatchMargin: { min: 0, max: 0.5 },
  minDetectionScore: { min: 0.3, max: 0.99 },
  minFacePixels: { min: 20, max: 400, integer: true },
  minSharpness: { min: 0, max: 100, integer: true },
  minFacePose: { min: 0, max: 100, integer: true },
};

export async function getPeopleSearchFaceSettings() {
  return getSettingsGroup(
    PEOPLE_SEARCH_FACE_GROUP,
    PEOPLE_SEARCH_FACE_DEFAULTS
  );
}

export async function updatePeopleSearchFaceSettings(
  values: PeopleSearchFaceSettings,
  user: UserRef
) {
  const clean = validateRanges(values, PEOPLE_SEARCH_FACE_RANGES);
  await setSettingsGroup(PEOPLE_SEARCH_FACE_GROUP, clean, user);
  return getPeopleSearchFaceSettings();
}
