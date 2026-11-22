import { GraphQLError } from 'graphql';

import {
  MehfilDetailsPermissionValues,
  type MehfilDetailsPermission,
} from 'meteor/idreesia-common/constants/mehfil-details';
import {
  OrgLocationFeatureAllowedTypes,
  OrgLocationFeatureKeys,
  orgLocationGroupPermissionKeys,
  type OrgLocationType,
} from 'meteor/idreesia-common/constants/organization';
import {
  OrgLocations,
  OrgLocationUsers,
  type OrgLocationMehfilDetails,
} from 'meteor/idreesia-common/server/collections/admin';
import { isSuperAdmin } from 'meteor/idreesia-common/server/business-logic/admin/users/super-admin';

interface MehfilDetailsUser {
  _id?: string;
  locked?: boolean;
  isSuperAdmin?: boolean;
}

/** Only the locations of the types that have features (mehfils) have details. */
const isMehfil = (location: { type: OrgLocationType }) =>
  OrgLocationFeatureAllowedTypes.includes(location.type);

const forbidden = (message: string) =>
  new GraphQLError(message, { extensions: { code: 'FORBIDDEN' } });

/**
 * What the user may do with a mehfil's details: the permissions set for them
 * on the location, or every permission for a super-admin. Throws FORBIDDEN
 * when they have none, or when the location is not a mehfil. A location the
 * caller has no part in answers the same, so its existence isn't revealed.
 */
export async function loadMehfilDetailsAccess(
  user: MehfilDetailsUser | null | undefined,
  locationId: string
): Promise<MehfilDetailsPermission[]> {
  if (!user?._id || user.locked) {
    throw forbidden('You do not have access to this location.');
  }

  const location = await OrgLocations.findOneAsync({ _id: locationId });
  if (!location || !isMehfil(location)) {
    throw forbidden('You do not have access to this location.');
  }
  if (isSuperAdmin(user)) return MehfilDetailsPermissionValues;

  const entry = await OrgLocationUsers.findOneAsync({
    locationId,
    userId: user._id,
  });
  const stored = entry
    ? orgLocationGroupPermissionKeys(
        entry.permissions,
        OrgLocationFeatureKeys.MEHFIL_DETAILS
      )
    : [];
  const permissions = MehfilDetailsPermissionValues.filter(permission =>
    stored.includes(permission)
  );
  if (permissions.length === 0) {
    throw forbidden('You do not have access to this location.');
  }
  return permissions;
}

export interface MyMehfilDetailsLocation {
  locationId: string;
  name: string;
  type: string;
  parentId: string | null;
  /**
   * True for a location whose details the user can edit. The others are its
   * ancestors, listed so the locations can be shown in their hierarchy.
   */
  hasWorkspace: boolean;
  permissions: MehfilDetailsPermission[];
}

/**
 * The mehfils whose details the user can change: the ones where they hold a
 * Mehfil Details permission, or every one for a super-admin. Their ancestors
 * are listed too, without access.
 */
export async function listMyMehfilDetailsLocations(
  user: MehfilDetailsUser | null | undefined
): Promise<MyMehfilDetailsLocation[]> {
  if (!user?._id || user.locked) return [];

  const superAdmin = isSuperAdmin(user);
  const permissionsByLocation = new Map<string, MehfilDetailsPermission[]>();
  if (!superAdmin) {
    const entries = await OrgLocationUsers.find({
      userId: user._id,
    }).fetchAsync();
    entries.forEach(entry => {
      const stored = orgLocationGroupPermissionKeys(
        entry.permissions,
        OrgLocationFeatureKeys.MEHFIL_DETAILS
      );
      const permissions = MehfilDetailsPermissionValues.filter(permission =>
        stored.includes(permission)
      );
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
      ? MehfilDetailsPermissionValues
      : (permissionsByLocation.get(location._id as string) ?? []);

  const toItem = (
    location: (typeof locations)[number],
    hasWorkspace: boolean
  ): MyMehfilDetailsLocation => ({
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

/**
 * Saves the details of a mehfil. Only the details change; the name and
 * place in the hierarchy stay Admin's to manage.
 */
export async function updateMehfilDetails(
  locationId: string,
  mehfilDetails: OrgLocationMehfilDetails,
  user: { _id: string }
) {
  const location = await OrgLocations.findOneAsync({ _id: locationId });
  if (!location || !isMehfil(location)) {
    throw new GraphQLError('Location not found.', {
      extensions: { code: 'NOT_FOUND' },
    });
  }

  // Attendance Geofencing is Admin's to set: keep what is stored, whatever the
  // caller sent, and drop it if the location is being cleared.
  const hasLocation =
    mehfilDetails.latitude != null && mehfilDetails.longitude != null;
  const attendanceGeofenceMeters = hasLocation
    ? location.mehfilDetails?.attendanceGeofenceMeters
    : undefined;

  const { attendanceGeofenceMeters: _ignored, ...callerDetails } = mehfilDetails;

  await OrgLocations.updateAsync(
    { _id: locationId },
    {
      $set: {
        mehfilDetails: {
          ...callerDetails,
          ...(attendanceGeofenceMeters ? { attendanceGeofenceMeters } : {}),
        },
        updatedAt: new Date(),
        updatedBy: user._id,
      },
    }
  );
  return OrgLocations.findOneAsync({ _id: locationId });
}
