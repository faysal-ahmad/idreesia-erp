import { GraphQLError } from 'graphql';

import {
  OrgLocationFeatureAllowedTypes,
  OrgLocationFeatures,
  OrgLocationGeneralGroupKey,
  OrgLocationGeneralPermissions,
  isOrgLocationFeatureKey,
  isOrgLocationGeneralGroupKey,
  orgLocationGroupPermissionKeys,
  toOrgLocationPermissionValue,
  type OrgLocationFeaturePermission,
} from 'meteor/idreesia-common/constants/organization';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import {
  OrgLocations,
  OrgLocationUsers,
  Users,
  type OrgLocationDocument,
} from 'meteor/idreesia-common/server/collections/admin';

const fail = (code: string, message: string): never => {
  throw new GraphQLError(message, { extensions: { code } });
};

const isDuplicateKey = (error: unknown) =>
  (error as { code?: number }).code === 11000 ||
  (error instanceof Error && error.message.includes('E11000'));

let indexesReady: Promise<void> | null = null;

/**
 * Creates the indexes of the location users once per process. Called outside
 * any transaction (which can't create them) before the writes that rely on
 * the unique index; the migration calls it too.
 */
export const ensureOrgLocationUserIndexes = (): Promise<void> => {
  if (!indexesReady) {
    const users = OrgLocationUsers.rawCollection();
    indexesReady = users
      .createIndex({ locationId: 1, userId: 1 }, { unique: true })
      .then(() => users.createIndex({ userId: 1 }))
      .then(() => undefined)
      .catch(error => {
        indexesReady = null;
        throw error;
      });
  }
  return indexesReady;
};

// ---------------------------------------------------------------------------
// Features: always available on the locations of the allowed types (mehfils)
// ---------------------------------------------------------------------------

/** True when the location has the features (it is a mehfil). */
export const hasOrgLocationFeatures = (
  location: Pick<OrgLocationDocument, 'type'>
): boolean => OrgLocationFeatureAllowedTypes.includes(location.type);

// ---------------------------------------------------------------------------
// Permissions: who may do what on a location. One store (OrgLocationUsers) for
// the location's own permissions ("General") and those of its features.
// ---------------------------------------------------------------------------

export interface OrgLocationFeaturePermissionUsers
  extends OrgLocationFeaturePermission {
  userIds: string[];
}

/** A group of permissions: the General one or an enabled feature. */
export interface OrgLocationFeaturePermissions {
  /** `location` for the General group, else a feature key. */
  featureKey: string;
  featureName: string;
  permissions: OrgLocationFeaturePermissionUsers[];
}

/**
 * The stored permissions of a user on a location that belong to a group
 * (`location` or a feature key), without the group prefix.
 */
export const getOrgLocationUserPermissions = async (
  userId: string,
  locationId: string,
  groupKey: string
): Promise<string[]> => {
  const entry = await OrgLocationUsers.findOneAsync({ locationId, userId });
  return entry ? orgLocationGroupPermissionKeys(entry.permissions, groupKey) : [];
};

/** True when the user holds the permission of the group on the location. */
export const hasOrgLocationPermission = async (
  userId: string,
  locationId: string,
  groupKey: string,
  permissionKey: string
): Promise<boolean> =>
  (await getOrgLocationUserPermissions(userId, locationId, groupKey)).includes(
    permissionKey
  );

/**
 * The General permissions of a location and, for a mehfil, those of each
 * feature, each with the ids of the users holding it. The General group is
 * left out while there are no general permissions.
 */
export const listOrgLocationFeaturePermissions = async (
  locationId: string
): Promise<OrgLocationFeaturePermissions[]> => {
  const location = await OrgLocations.findOneAsync({ _id: locationId });
  if (!location) return fail('NOT_FOUND', 'Location not found.');

  const entries = await OrgLocationUsers.find({ locationId }).fetchAsync();
  const group = (
    featureKey: string,
    featureName: string,
    permissions: OrgLocationFeaturePermission[]
  ): OrgLocationFeaturePermissions => ({
    featureKey,
    featureName,
    permissions: permissions.map(permission => {
      const value = toOrgLocationPermissionValue(featureKey, permission.key);
      return {
        ...permission,
        userIds: entries
          .filter(entry => entry.permissions.includes(value))
          .map(entry => entry.userId),
      };
    }),
  });

  return [
    ...(OrgLocationGeneralPermissions.length > 0
      ? [group(OrgLocationGeneralGroupKey, 'General', OrgLocationGeneralPermissions)]
      : []),
    ...(hasOrgLocationFeatures(location)
      ? OrgLocationFeatures.map(feature =>
          group(feature.key, feature.name, feature.permissions)
        )
      : []),
  ];
};

// The permission group (General or a feature of the location) and the
// permission, both known.
const loadPermission = async (
  locationId: string,
  groupKey: string,
  permissionKey: string
) => {
  if (isOrgLocationGeneralGroupKey(groupKey)) {
    const location = await OrgLocations.findOneAsync({ _id: locationId });
    if (!location) return fail('NOT_FOUND', 'Location not found.');
    if (!OrgLocationGeneralPermissions.some(item => item.key === permissionKey)) {
      return fail('BAD_USER_INPUT', `Unknown permission '${permissionKey}'.`);
    }
    return { basePermissionKey: undefined };
  }

  if (!isOrgLocationFeatureKey(groupKey)) {
    return fail('BAD_USER_INPUT', `Unknown location feature '${groupKey}'.`);
  }
  const location = await OrgLocations.findOneAsync({ _id: locationId });
  if (!location) return fail('NOT_FOUND', 'Location not found.');
  if (!hasOrgLocationFeatures(location)) {
    return fail(
      'BAD_USER_INPUT',
      `Features are only available for ${OrgLocationFeatureAllowedTypes.join(
        ', '
      )} locations.`
    );
  }
  const feature = OrgLocationFeatures.find(item => item.key === groupKey);
  if (!feature?.permissions.some(item => item.key === permissionKey)) {
    return fail('BAD_USER_INPUT', `Unknown permission '${permissionKey}'.`);
  }
  return { basePermissionKey: feature.basePermissionKey };
};

/**
 * Gives a karkun a permission of a group (General or a feature of a mehfil). Locations
 * are used through the karkun's user account, so the karkun needs an unlocked
 * one. A feature's other permissions come with its base permission (View).
 */
export const addOrgLocationFeatureUser = async (
  locationId: string,
  groupKey: string,
  permissionKey: string,
  karkunId: string,
  userId: string
): Promise<true> => {
  const { basePermissionKey } = await loadPermission(
    locationId,
    groupKey,
    permissionKey
  );
  const targetUser = await Users.findOneAsync({ personId: karkunId });
  if (!targetUser) {
    return fail('BAD_USER_INPUT', 'This karkun does not have a user account.');
  }
  if (targetUser.locked) {
    return fail('BAD_USER_INPUT', "This karkun's user account is locked.");
  }
  const targetUserId = targetUser._id as string;

  const toAdd = [
    toOrgLocationPermissionValue(groupKey, permissionKey),
    ...(basePermissionKey
      ? [toOrgLocationPermissionValue(groupKey, basePermissionKey)]
      : []),
  ];

  // Indexes are created outside the transaction, which can't create them.
  await ensureOrgLocationUserIndexes();
  try {
    await runInTransaction(async () => {
      const existing = await OrgLocationUsers.findOneAsync({
        locationId,
        userId: targetUserId,
      });
      if (!existing) {
        const now = new Date();
        await OrgLocationUsers.insertAsync({
          locationId,
          userId: targetUserId,
          permissions: [...new Set(toAdd)],
          createdAt: now,
          createdBy: userId,
          updatedAt: now,
          updatedBy: userId,
        });
        return;
      }
      await OrgLocationUsers.updateAsync(
        { _id: existing._id },
        {
          $set: {
            permissions: [...new Set([...existing.permissions, ...toAdd])],
            updatedAt: new Date(),
            updatedBy: userId,
          },
        }
      );
    });
  } catch (error) {
    // A concurrent first grant to the same user: the other one won, retry.
    if (isDuplicateKey(error)) {
      return addOrgLocationFeatureUser(
        locationId,
        groupKey,
        permissionKey,
        karkunId,
        userId
      );
    }
    throw error;
  }
  return true;
};

/**
 * Takes a permission from a user. Taking a feature's base permission (View)
 * takes all of the feature's permissions. A user left with no permissions is
 * removed from the location.
 */
export const removeOrgLocationFeatureUser = async (
  locationId: string,
  groupKey: string,
  permissionKey: string,
  targetUserId: string,
  userId: string
): Promise<true> => {
  const { basePermissionKey } = await loadPermission(
    locationId,
    groupKey,
    permissionKey
  );
  const value = toOrgLocationPermissionValue(groupKey, permissionKey);

  await runInTransaction(async () => {
    const existing = await OrgLocationUsers.findOneAsync({
      locationId,
      userId: targetUserId,
    });
    if (!existing || !existing.permissions.includes(value)) {
      fail('NOT_FOUND', 'This user does not have this permission.');
      return;
    }

    const prefix = `${groupKey}.`;
    const remaining = existing.permissions.filter(item =>
      permissionKey === basePermissionKey
        ? !item.startsWith(prefix)
        : item !== value
    );
    if (remaining.length === 0) {
      await OrgLocationUsers.removeAsync({ _id: existing._id });
    } else {
      await OrgLocationUsers.updateAsync(
        { _id: existing._id },
        {
          $set: {
            permissions: remaining,
            updatedAt: new Date(),
            updatedBy: userId,
          },
        }
      );
    }
  });
  return true;
};
