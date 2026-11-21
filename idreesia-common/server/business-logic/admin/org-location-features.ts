import { GraphQLError } from 'graphql';

import { DutiesAttendancePermissions } from 'meteor/idreesia-common/constants/duties-attendance';
import {
  OrgLocationFeatureAllowedTypes,
  OrgLocationFeatureKeys,
  OrgLocationFeatures,
  isOrgLocationFeatureKey,
  type OrgLocationFeatureKey,
  type OrgLocationFeaturePermission,
} from 'meteor/idreesia-common/constants/organization';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import {
  OrgLocations,
  Users,
  type OrgLocationDocument,
} from 'meteor/idreesia-common/server/collections/admin';
import { DutiesAttendanceWorkspaceUsers } from 'meteor/idreesia-common/server/collections/duties-attendance';
import {
  addDutiesAttendanceWorkspaceUser,
  createDutiesAttendanceWorkspace,
  deleteDutiesAttendanceWorkspace,
  ensureDutiesAttendanceIndexes,
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
  /** Ids of the feature's users, per permission key. */
  listUserIds(
    location: OrgLocationDocument
  ): Promise<Record<string, string[]>>;
  /** Gives the user the permission, making them a user of the feature if needed. */
  grantPermission(
    location: OrgLocationDocument,
    permissionKey: string,
    targetUserId: string,
    actorId: string
  ): Promise<void>;
  /** Takes the permission from the user. */
  revokePermission(
    location: OrgLocationDocument,
    permissionKey: string,
    targetUserId: string,
    actorId: string
  ): Promise<void>;
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

  async listUserIds(location) {
    const workspaceId = getLocationDutiesAttendanceWorkspaceId(location);
    const users = await DutiesAttendanceWorkspaceUsers.find({
      workspaceId,
    }).fetchAsync();
    const byPermission: Record<string, string[]> = {};
    users.forEach(user => {
      user.permissions.forEach(permission => {
        (byPermission[permission] ??= []).push(user.userId);
      });
    });
    return byPermission;
  },

  async grantPermission(location, permissionKey, targetUserId, actorId) {
    const workspaceId = getLocationDutiesAttendanceWorkspaceId(location);
    // Indexes are created outside the transaction, which can't create them.
    await ensureDutiesAttendanceIndexes();
    await runInTransaction(async () => {
      const existing = await DutiesAttendanceWorkspaceUsers.findOneAsync({
        workspaceId,
        userId: targetUserId,
      });
      if (!existing) {
        await addDutiesAttendanceWorkspaceUser(
          workspaceId,
          { userId: targetUserId, permissions: [permissionKey] },
          actorId
        );
      } else if (!existing.permissions.some(key => key === permissionKey)) {
        await updateDutiesAttendanceWorkspaceUserPermissions(
          workspaceId,
          targetUserId,
          [...existing.permissions, permissionKey],
          actorId
        );
      }
    });
  },

  async revokePermission(location, permissionKey, targetUserId, actorId) {
    const workspaceId = getLocationDutiesAttendanceWorkspaceId(location);
    await runInTransaction(async () => {
      const existing = await DutiesAttendanceWorkspaceUsers.findOneAsync({
        workspaceId,
        userId: targetUserId,
      });
      if (!existing || !existing.permissions.some(key => key === permissionKey)) {
        fail('NOT_FOUND', 'This user does not have this permission.');
      } else if (permissionKey === DutiesAttendancePermissions.VIEW) {
        // Every other permission implies View, so without View there is no user.
        await removeDutiesAttendanceWorkspaceUser(
          workspaceId,
          targetUserId,
          actorId
        );
      } else {
        await updateDutiesAttendanceWorkspaceUserPermissions(
          workspaceId,
          targetUserId,
          existing.permissions.filter(key => key !== permissionKey),
          actorId
        );
      }
    });
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
// Feature permissions: who may do what in each enabled feature of a location
// ---------------------------------------------------------------------------

export interface OrgLocationFeaturePermissionUsers
  extends OrgLocationFeaturePermission {
  userIds: string[];
}

export interface OrgLocationFeaturePermissions {
  featureKey: OrgLocationFeatureKey;
  featureName: string;
  permissions: OrgLocationFeaturePermissionUsers[];
}

/**
 * The enabled features of a location, each with its permissions and the ids
 * of the users holding each one.
 */
export const listOrgLocationFeaturePermissions = async (
  locationId: string
): Promise<OrgLocationFeaturePermissions[]> => {
  const location = await OrgLocations.findOneAsync({ _id: locationId });
  if (!location) return fail('NOT_FOUND', 'Location not found.');

  const enabled = OrgLocationFeatures.filter(feature =>
    location.features?.includes(feature.key)
  );
  return Promise.all(
    enabled.map(async feature => {
      const userIds = await featureHandlers[feature.key].listUserIds(location);
      return {
        featureKey: feature.key,
        featureName: feature.name,
        permissions: feature.permissions.map(permission => ({
          ...permission,
          userIds: userIds[permission.key] ?? [],
        })),
      };
    })
  );
};

// The location and handler of a feature that is enabled, for a permission the
// feature knows.
const loadFeaturePermission = async (
  locationId: string,
  featureKey: string,
  permissionKey: string
) => {
  const { location, handler } = await loadLocation(locationId, featureKey);
  const feature = OrgLocationFeatures.find(item => item.key === featureKey);
  if (!location.features?.includes(featureKey)) {
    return fail('NOT_FOUND', 'This feature is not enabled for this location.');
  }
  if (!feature?.permissions.some(item => item.key === permissionKey)) {
    return fail('BAD_USER_INPUT', `Unknown permission '${permissionKey}'.`);
  }
  return { location, handler };
};

/**
 * Gives a karkun a permission of a feature. Features are used through the
 * karkun's user account, so the karkun needs an unlocked one.
 */
export const addOrgLocationFeatureUser = async (
  locationId: string,
  featureKey: string,
  permissionKey: string,
  karkunId: string,
  userId: string
): Promise<true> => {
  const { location, handler } = await loadFeaturePermission(
    locationId,
    featureKey,
    permissionKey
  );
  const targetUser = await Users.findOneAsync({ personId: karkunId });
  if (!targetUser) {
    return fail('BAD_USER_INPUT', 'This karkun does not have a user account.');
  }
  if (targetUser.locked) {
    return fail('BAD_USER_INPUT', "This karkun's user account is locked.");
  }
  await handler.grantPermission(
    location,
    permissionKey,
    targetUser._id as string,
    userId
  );
  return true;
};

export const removeOrgLocationFeatureUser = async (
  locationId: string,
  featureKey: string,
  permissionKey: string,
  targetUserId: string,
  userId: string
): Promise<true> => {
  const { location, handler } = await loadFeaturePermission(
    locationId,
    featureKey,
    permissionKey
  );
  await handler.revokePermission(location, permissionKey, targetUserId, userId);
  return true;
};
