import {
  DutiesAttendancePermissions,
  DutiesAttendancePermissionValues,
  type DutiesAttendancePermission,
} from 'meteor/idreesia-common/constants/duties-attendance';
import {
  OrgLocationFeatureAllowedTypes,
  OrgLocationFeatureKeys,
  orgLocationGroupPermissionKeys,
} from 'meteor/idreesia-common/constants/organization';
import {
  OrgLocations,
  OrgLocationUsers,
} from 'meteor/idreesia-common/server/collections/admin';
import { isSuperAdmin } from 'meteor/idreesia-common/server/business-logic/admin/users/super-admin';

export interface MyDutiesAttendanceLocation {
  locationId: string;
  name: string;
  type: string;
  parentId: string | null;
  /**
   * True for a location whose Duties and Attendance the user can open. The
   * others are its
   * ancestors, listed so the locations can be shown in their hierarchy.
   */
  hasWorkspace: boolean;
  /** What the user may do there; every permission for a super-admin. */
  permissions: DutiesAttendancePermission[];
}

interface LocationUser {
  _id?: string;
  locked?: boolean;
  isSuperAdmin?: boolean;
}

/**
 * The locations whose Duties and Attendance the user can open: the ones where
 * they hold a Duties and Attendance permission, or every one for a
 * super-admin. Only mehfils have it. Their
 * ancestors are listed too, without access.
 */
export async function listMyDutiesAttendanceLocations(
  user: LocationUser | null | undefined
): Promise<MyDutiesAttendanceLocation[]> {
  if (!user?._id || user.locked) return [];

  const permissionsByLocation = new Map<string, DutiesAttendancePermission[]>();
  if (!isSuperAdmin(user)) {
    const entries = await OrgLocationUsers.find({
      userId: user._id,
    }).fetchAsync();
    entries.forEach(entry => {
      // In the canonical order, whatever order they were stored in.
      const stored = orgLocationGroupPermissionKeys(
        entry.permissions,
        OrgLocationFeatureKeys.DUTIES_ATTENDANCE
      );
      const permissions = DutiesAttendancePermissionValues.filter(permission =>
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
    ...(isSuperAdmin(user)
      ? {}
      : { _id: { $in: [...permissionsByLocation.keys()] } }),
  }).fetchAsync();

  if (locations.length === 0) return [];

  const ancestorIds = new Set<string>();
  locations.forEach(location =>
    (location.allParentIds ?? []).forEach(id => ancestorIds.add(id))
  );
  const ancestors = ancestorIds.size
    ? await OrgLocations.find({ _id: { $in: [...ancestorIds] } }).fetchAsync()
    : [];

  const permissionsOf = (
    location: (typeof locations)[number]
  ): DutiesAttendancePermission[] => {
    if (isSuperAdmin(user)) return DutiesAttendancePermissionValues;
    return (
      permissionsByLocation.get(location._id as string) ?? [
        DutiesAttendancePermissions.VIEW,
      ]
    );
  };

  const toItem = (
    location: (typeof locations)[number],
    hasWorkspace: boolean
  ): MyDutiesAttendanceLocation => ({
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
