import { GraphQLError } from 'graphql';

import {
  MehfilPermissionsPermissionValues,
  type MehfilPermissionsPermission,
} from 'meteor/idreesia-common/constants/mehfil-permissions';
import {
  OrgLocationFeatureAllowedTypes,
  OrgLocationFeatureKeys,
  OrgLocationFeatures,
  OrgLocationGeneralGroupKey,
  OrgLocationGeneralPermissions,
  isOrgLocationFeatureKey,
  isOrgLocationGeneralGroupKey,
  orgLocationGroupPermissionKeys,
  toOrgLocationPermissionValue,
  type OrgLocationFeaturePermission,
  type OrgLocationType,
} from 'meteor/idreesia-common/constants/organization';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import {
  OrgLocations,
  OrgLocationUsers,
  Users,
} from 'meteor/idreesia-common/server/collections/admin';
import { getPersonImageUrls } from 'meteor/idreesia-common/server/business-logic/common/person-images';
import { searchPeople } from 'meteor/idreesia-common/server/business-logic/common/people/search-people';
import { isSuperAdmin } from 'meteor/idreesia-common/server/business-logic/admin/users/super-admin';

interface MehfilPermissionsUser {
  _id?: string;
  locked?: boolean;
  isSuperAdmin?: boolean;
}

const fail = (code: string, message: string): never => {
  throw new GraphQLError(message, { extensions: { code } });
};

const isDuplicateKey = (error: unknown) =>
  (error as { code?: number }).code === 11000 ||
  (error instanceof Error && error.message.includes('E11000'));

/** Only the locations of the types that have features (mehfils) qualify. */
const isMehfil = (location: { type: OrgLocationType }) =>
  OrgLocationFeatureAllowedTypes.includes(location.type);

// ---------------------------------------------------------------------------
// Access
// ---------------------------------------------------------------------------

const permissionsOfEntry = (storedPermissions: string[]) => {
  const stored = orgLocationGroupPermissionKeys(
    storedPermissions,
    OrgLocationFeatureKeys.MEHFIL_PERMISSIONS
  );
  return MehfilPermissionsPermissionValues.filter(permission =>
    stored.includes(permission)
  );
};

/**
 * What the user may do with a mehfil's permissions: the permissions set for
 * them on the location, or every permission for a super-admin. Throws
 * FORBIDDEN when they have none, or when the location is not a mehfil. A
 * location the caller has no part in answers the same, so its existence isn't
 * revealed.
 */
export async function loadMehfilPermissionsAccess(
  user: MehfilPermissionsUser | null | undefined,
  locationId: string
): Promise<MehfilPermissionsPermission[]> {
  const forbidden = () =>
    new GraphQLError('You do not have access to this location.', {
      extensions: { code: 'FORBIDDEN' },
    });
  if (!user?._id || user.locked) throw forbidden();

  const location = await OrgLocations.findOneAsync({ _id: locationId });
  if (!location || !isMehfil(location)) throw forbidden();
  if (isSuperAdmin(user)) return MehfilPermissionsPermissionValues;

  const entry = await OrgLocationUsers.findOneAsync({
    locationId,
    userId: user._id,
  });
  const permissions = entry ? permissionsOfEntry(entry.permissions) : [];
  if (permissions.length === 0) throw forbidden();
  return permissions;
}

export interface MyMehfilPermissionsLocation {
  locationId: string;
  name: string;
  type: string;
  parentId: string | null;
  /**
   * True for a location whose permissions the user can open. The others are
   * its ancestors, listed so the locations can be shown in their hierarchy.
   */
  hasWorkspace: boolean;
  permissions: MehfilPermissionsPermission[];
}

/**
 * The mehfils whose permissions the user can open: the ones where they hold a
 * Mehfil Permissions permission, or every one for a super-admin. Their
 * ancestors are listed too, without access.
 */
export async function listMyMehfilPermissionsLocations(
  user: MehfilPermissionsUser | null | undefined
): Promise<MyMehfilPermissionsLocation[]> {
  if (!user?._id || user.locked) return [];

  const superAdmin = isSuperAdmin(user);
  const permissionsByLocation = new Map<string, MehfilPermissionsPermission[]>();
  if (!superAdmin) {
    const entries = await OrgLocationUsers.find({
      userId: user._id,
    }).fetchAsync();
    entries.forEach(entry => {
      const permissions = permissionsOfEntry(entry.permissions);
      if (permissions.length > 0) {
        permissionsByLocation.set(entry.locationId, permissions);
      }
    });
    if (permissionsByLocation.size === 0) return [];
  }

  const locations = await OrgLocations.find({
    type: { $in: OrgLocationFeatureAllowedTypes },
    ...(superAdmin ? {} : { _id: { $in: [...permissionsByLocation.keys()] } }),
  }).fetchAsync();
  if (locations.length === 0) return [];

  const ancestorIds = new Set<string>();
  locations.forEach(location =>
    (location.allParentIds ?? []).forEach(id => ancestorIds.add(id))
  );
  const ancestors = ancestorIds.size
    ? await OrgLocations.find({ _id: { $in: [...ancestorIds] } }).fetchAsync()
    : [];

  const permissionsOf = (location: (typeof locations)[number]) =>
    superAdmin
      ? MehfilPermissionsPermissionValues
      : (permissionsByLocation.get(location._id as string) ?? []);

  const toItem = (
    location: (typeof locations)[number],
    hasWorkspace: boolean
  ): MyMehfilPermissionsLocation => ({
    locationId: location._id as string,
    name: location.name,
    type: location.type,
    parentId: location.parentId ?? null,
    hasWorkspace,
    permissions: hasWorkspace ? permissionsOf(location) : [],
  });

  const withWorkspace = new Set(locations.map(location => location._id));
  return [
    ...locations.map(location => toItem(location, true)),
    ...ancestors
      .filter(location => !withWorkspace.has(location._id))
      .map(location => toItem(location, false)),
  ].sort((left, right) => left.name.localeCompare(right.name));
}

// ---------------------------------------------------------------------------
// Who holds what
// ---------------------------------------------------------------------------

export interface MehfilPermissionUser {
  userId: string;
  /** The karkun the user account belongs to. */
  personId?: string;
  username?: string;
  displayName?: string;
}

export interface MehfilPermissionGroup {
  /** `location` for the General group, else a feature key. */
  featureKey: string;
  featureName: string;
  permissions: Array<
    OrgLocationFeaturePermission & { users: MehfilPermissionUser[] }
  >;
}

/**
 * The mehfil's permission groups (General, if it has permissions, and each
 * feature) with the users holding each permission.
 */
export async function listMehfilPermissions(
  locationId: string
): Promise<MehfilPermissionGroup[]> {
  const entries = await OrgLocationUsers.find({ locationId }).fetchAsync();
  const userIds = [...new Set(entries.map(entry => entry.userId))];
  const users = userIds.length
    ? await Users.find({ _id: { $in: userIds } }).fetchAsync()
    : [];
  const userById = new Map(users.map(user => [user._id as string, user]));

  const group = (
    featureKey: string,
    featureName: string,
    permissions: OrgLocationFeaturePermission[]
  ): MehfilPermissionGroup => ({
    featureKey,
    featureName,
    permissions: permissions.map(permission => {
      const value = toOrgLocationPermissionValue(featureKey, permission.key);
      return {
        ...permission,
        users: entries
          .filter(entry => entry.permissions.includes(value))
          .flatMap(entry => {
            const user = userById.get(entry.userId);
            return [
              {
                userId: entry.userId,
                personId: user?.personId,
                username: user?.username,
                displayName: user?.displayName,
              },
            ];
          }),
      };
    }),
  });

  return [
    ...(OrgLocationGeneralPermissions.length > 0
      ? [group(OrgLocationGeneralGroupKey, 'General', OrgLocationGeneralPermissions)]
      : []),
    ...OrgLocationFeatures.map(feature =>
      group(feature.key, feature.name, feature.permissions)
    ),
  ];
}

// The permission group and permission, both known; the group's base
// permission, if it has one.
const loadPermission = (groupKey: string, permissionKey: string) => {
  if (isOrgLocationGeneralGroupKey(groupKey)) {
    if (!OrgLocationGeneralPermissions.some(item => item.key === permissionKey)) {
      return fail('BAD_USER_INPUT', `Unknown permission '${permissionKey}'.`);
    }
    return { basePermissionKey: undefined };
  }
  if (!isOrgLocationFeatureKey(groupKey)) {
    return fail('BAD_USER_INPUT', `Unknown location feature '${groupKey}'.`);
  }
  const feature = OrgLocationFeatures.find(item => item.key === groupKey);
  if (!feature?.permissions.some(item => item.key === permissionKey)) {
    return fail('BAD_USER_INPUT', `Unknown permission '${permissionKey}'.`);
  }
  return { basePermissionKey: feature.basePermissionKey };
};

let indexesReady: Promise<void> | null = null;

// Created outside any transaction (which can't create them) before the writes
// that rely on the unique index.
const ensureIndexes = (): Promise<void> => {
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

/**
 * Gives a karkun a permission of the mehfil. The karkun is let in through
 * their user account, so they need an unlocked one. A feature's other
 * permissions come with its base permission (View).
 */
export async function addMehfilPermissionUser(
  locationId: string,
  groupKey: string,
  permissionKey: string,
  karkunId: string,
  actingUserId: string
): Promise<true> {
  const { basePermissionKey } = loadPermission(groupKey, permissionKey);
  const location = await OrgLocations.findOneAsync({ _id: locationId });
  if (!location || !isMehfil(location)) {
    return fail('NOT_FOUND', 'Location not found.');
  }

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

  await ensureIndexes();
  try {
    await runInTransaction(async () => {
      const existing = await OrgLocationUsers.findOneAsync({
        locationId,
        userId: targetUserId,
      });
      const now = new Date();
      if (!existing) {
        await OrgLocationUsers.insertAsync({
          locationId,
          userId: targetUserId,
          permissions: [...new Set(toAdd)],
          createdAt: now,
          createdBy: actingUserId,
          updatedAt: now,
          updatedBy: actingUserId,
        });
        return;
      }
      await OrgLocationUsers.updateAsync(
        { _id: existing._id },
        {
          $set: {
            permissions: [...new Set([...existing.permissions, ...toAdd])],
            updatedAt: now,
            updatedBy: actingUserId,
          },
        }
      );
    });
  } catch (error) {
    // A concurrent first grant to the same user: the other one won, retry.
    if (isDuplicateKey(error)) {
      return addMehfilPermissionUser(
        locationId,
        groupKey,
        permissionKey,
        karkunId,
        actingUserId
      );
    }
    throw error;
  }
  return true;
}

/**
 * Takes a permission from a user. Taking a feature's base permission (View)
 * takes all of the feature's permissions. A user left with no permissions is
 * removed from the location.
 */
export async function removeMehfilPermissionUser(
  locationId: string,
  groupKey: string,
  permissionKey: string,
  targetUserId: string,
  actingUserId: string
): Promise<true> {
  const { basePermissionKey } = loadPermission(groupKey, permissionKey);
  const location = await OrgLocations.findOneAsync({ _id: locationId });
  if (!location || !isMehfil(location)) {
    return fail('NOT_FOUND', 'Location not found.');
  }
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
            updatedBy: actingUserId,
          },
        }
      );
    }
  });
  return true;
}

// ---------------------------------------------------------------------------
// Karkuns to give permissions to
// ---------------------------------------------------------------------------

interface PersonDocument {
  _id: string;
  sharedData?: {
    name?: string;
    parentName?: string;
    cnicNumber?: string;
    contactNumber1?: string;
    imageKey?: string;
    imageThumbnailKey?: string;
  };
}

export interface MehfilPermissionsKarkunSearchParams {
  name?: string | null;
  cnicNumber?: string | null;
  phoneNumber?: string | null;
  pageIndex?: string | null;
  pageSize?: string | null;
}

/** Karkuns to choose from, with only the fields needed to pick a person. */
export async function searchMehfilPermissionsKarkuns(
  params: MehfilPermissionsKarkunSearchParams
) {
  const result = (await searchPeople(
    {
      name: params.name ?? undefined,
      cnicNumber: params.cnicNumber ?? undefined,
      phoneNumber: params.phoneNumber ?? undefined,
      pageIndex: params.pageIndex ?? undefined,
      pageSize: params.pageSize ?? undefined,
    },
    { includeKarkuns: true }
  )) as { data: PersonDocument[]; totalResults: number };

  return {
    data: result.data.map(person => ({
      _id: person._id,
      name: person.sharedData?.name,
      parentName: person.sharedData?.parentName,
      cnicNumber: person.sharedData?.cnicNumber,
      contactNumber1: person.sharedData?.contactNumber1,
      ...getPersonImageUrls(person.sharedData),
    })),
    totalResults: result.totalResults,
  };
}
