import { GraphQLError } from 'graphql';

import {
  OrgLocationFeatureAllowedTypes,
  OrgLocationFeatureKeys,
  isOrgLocationFeatureKey,
  type OrgLocationFeatureKey,
} from 'meteor/idreesia-common/constants/organization';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import {
  OrgLocations,
  type OrgLocationDocument,
} from 'meteor/idreesia-common/server/collections/admin';
import {
  addDutiesAttendanceWorkspaceUser,
  createDutiesAttendanceWorkspace,
  deleteDutiesAttendanceWorkspace,
  getDutiesAttendanceWorkspace,
  removeDutiesAttendanceWorkspaceUser,
  restoreDutiesAttendanceWorkspace,
  updateDutiesAttendanceWorkspaceUserPermissions,
} from 'meteor/idreesia-common/server/business-logic/duties-attendance';

const fail = (code: string, message: string): never => {
  throw new GraphQLError(message, { extensions: { code } });
};

/**
 * Turns a location feature on or off. Each returns the extra fields to `$set`
 * on the location, if any.
 */
interface OrgLocationFeatureHandler {
  enable(
    location: OrgLocationDocument,
    userId: string
  ): Promise<Record<string, unknown> | void>;
  disable(
    location: OrgLocationDocument,
    userId: string
  ): Promise<Record<string, unknown> | void>;
}

// The location's workspace (deleted ones included), or null when it no
// longer exists, e.g. after being purged.
const findDutiesAttendanceWorkspace = async (workspaceId: string) => {
  try {
    return await getDutiesAttendanceWorkspace(workspaceId, {
      includeDeleted: true,
    });
  } catch (error) {
    if ((error as GraphQLError).extensions?.code === 'NOT_FOUND') return null;
    throw error;
  }
};

/**
 * Duties and Attendance: a workspace holds the location's duties.
 * - Enable restores the location's previous workspace when it still exists
 *   (with its duties, attendance and users), otherwise creates a new one.
 * - Disable soft-deletes the workspace, keeping everything for a later
 *   re-enable.
 */
const dutiesAttendanceHandler: OrgLocationFeatureHandler = {
  async enable(location, userId) {
    if (location.dutiesAttendanceWorkspaceId) {
      const existing = await findDutiesAttendanceWorkspace(
        location.dutiesAttendanceWorkspaceId
      );
      if (existing) {
        if (existing.deletedAt) {
          await restoreDutiesAttendanceWorkspace(existing._id, userId);
        }
        return { dutiesAttendanceWorkspaceId: existing._id };
      }
    }

    const workspace = await createDutiesAttendanceWorkspace(
      {
        name: `${location.name} Duties and Attendance`,
        metadata: { locationId: location._id },
      },
      userId
    );
    return { dutiesAttendanceWorkspaceId: workspace._id };
  },

  async disable(location, userId) {
    if (!location.dutiesAttendanceWorkspaceId) return;
    const existing = await findDutiesAttendanceWorkspace(
      location.dutiesAttendanceWorkspaceId
    );
    if (existing && !existing.deletedAt) {
      await deleteDutiesAttendanceWorkspace(existing._id, userId);
    }
  },
};

// Every feature needs a handler; the Record type makes a missing one a
// compile error when a feature is added to the constants.
const featureHandlers: Record<OrgLocationFeatureKey, OrgLocationFeatureHandler> =
  {
    [OrgLocationFeatureKeys.DUTIES_ATTENDANCE]: dutiesAttendanceHandler,
  };

const loadLocation = async (
  locationId: string,
  featureKey: string
): Promise<{
  location: OrgLocationDocument;
  handler: OrgLocationFeatureHandler;
}> => {
  if (!isOrgLocationFeatureKey(featureKey)) {
    return fail('BAD_USER_INPUT', `Unknown location feature '${featureKey}'.`);
  }

  const location = await OrgLocations.findOneAsync({ _id: locationId });
  if (!location) return fail('NOT_FOUND', 'Location not found.');

  if (!OrgLocationFeatureAllowedTypes.includes(location.type)) {
    return fail(
      'BAD_USER_INPUT',
      `Features can only be turned on or off for ${OrgLocationFeatureAllowedTypes.join(
        ', '
      )} locations.`
    );
  }

  return { location, handler: featureHandlers[featureKey] };
};

/**
 * Enables a feature for a location (mehfils only), setting it up first and
 * then recording it, and any data the feature keeps, on the location.
 * Enabling an enabled feature re-runs its setup, which is safe.
 */
export const enableOrgLocationFeature = (
  locationId: string,
  featureKey: string,
  userId: string
): Promise<true> =>
  runInTransaction(async () => {
    const { location, handler } = await loadLocation(locationId, featureKey);
    const featureData = (await handler.enable(location, userId)) ?? {};

    await OrgLocations.updateAsync(
      { _id: locationId },
      {
        $addToSet: { features: featureKey },
        $set: { ...featureData, updatedAt: new Date(), updatedBy: userId },
      }
    );
    return true as const;
  });

/**
 * Disables a feature for a location. The feature's stored data (e.g. the
 * workspace id) is kept so a later enable can pick up where it left off.
 */
export const disableOrgLocationFeature = (
  locationId: string,
  featureKey: string,
  userId: string
): Promise<true> =>
  runInTransaction(async () => {
    const { location, handler } = await loadLocation(locationId, featureKey);
    const featureData = (await handler.disable(location, userId)) ?? {};

    await OrgLocations.updateAsync(
      { _id: locationId },
      {
        $pull: { features: featureKey },
        $set: { ...featureData, updatedAt: new Date(), updatedBy: userId },
      }
    );
    return true as const;
  });

/**
 * The Duties and Attendance workspace of a location. Throws when the
 * location doesn't have the feature enabled.
 */
export const getLocationDutiesAttendanceWorkspaceId = (
  location: Pick<OrgLocationDocument, 'features' | 'dutiesAttendanceWorkspaceId'>
): string => {
  const enabled = location.features?.includes(
    OrgLocationFeatureKeys.DUTIES_ATTENDANCE
  );
  if (!enabled || !location.dutiesAttendanceWorkspaceId) {
    throw new GraphQLError(
      'Duties and Attendance is not enabled for this location.',
      { extensions: { code: 'NOT_FOUND' } }
    );
  }
  return location.dutiesAttendanceWorkspaceId;
};

// ---------------------------------------------------------------------------
// Duties and Attendance workspace users, managed from the location's admin page
// ---------------------------------------------------------------------------

const requireLocationWorkspaceId = async (locationId: string) => {
  const location = await OrgLocations.findOneAsync({ _id: locationId });
  if (!location) return fail('NOT_FOUND', 'Location not found.');
  return getLocationDutiesAttendanceWorkspaceId(location as OrgLocationDocument);
};

export const addOrgLocationDutiesAttendanceUser = async (
  locationId: string,
  input: { userId: string; permissions: string[] },
  userId: string
) =>
  addDutiesAttendanceWorkspaceUser(
    await requireLocationWorkspaceId(locationId),
    input,
    userId
  );

export const updateOrgLocationDutiesAttendanceUserPermissions = async (
  locationId: string,
  targetUserId: string,
  permissions: string[],
  userId: string
) =>
  updateDutiesAttendanceWorkspaceUserPermissions(
    await requireLocationWorkspaceId(locationId),
    targetUserId,
    permissions,
    userId
  );

export const removeOrgLocationDutiesAttendanceUser = async (
  locationId: string,
  targetUserId: string,
  userId: string
) =>
  removeDutiesAttendanceWorkspaceUser(
    await requireLocationWorkspaceId(locationId),
    targetUserId,
    userId
  );
