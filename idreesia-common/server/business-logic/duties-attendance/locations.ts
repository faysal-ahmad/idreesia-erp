import {
  DutiesAttendancePermissions,
  DutiesAttendancePermissionValues,
  type DutiesAttendancePermission,
} from 'meteor/idreesia-common/constants/duties-attendance';
import { OrgLocationFeatureKeys } from 'meteor/idreesia-common/constants/organization';
import { OrgLocations } from 'meteor/idreesia-common/server/collections/admin';
import {
  DutiesAttendanceWorkspaces,
  DutiesAttendanceWorkspaceUsers,
} from 'meteor/idreesia-common/server/collections/duties-attendance';
import { isSuperAdmin } from 'meteor/idreesia-common/server/business-logic/admin/users/super-admin';

export interface MyDutiesAttendanceLocation {
  locationId: string;
  name: string;
  type: string;
  parentId: string | null;
  /**
   * True for a location whose workspace the user can open. The others are its
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
 * The locations whose Duties and Attendance workspace the user can open: the
 * ones where they are a workspace user, or every one for a super-admin. A
 * location counts only while the feature is enabled and its workspace exists.
 * Their ancestors are listed too, without a workspace.
 */
export async function listMyDutiesAttendanceLocations(
  user: LocationUser | null | undefined
): Promise<MyDutiesAttendanceLocation[]> {
  if (!user?._id || user.locked) return [];

  const permissionsByWorkspace = new Map<string, DutiesAttendancePermission[]>();
  if (!isSuperAdmin(user)) {
    const entries = await DutiesAttendanceWorkspaceUsers.find({
      userId: user._id,
    }).fetchAsync();
    if (entries.length === 0) return [];
    entries.forEach(entry =>
      permissionsByWorkspace.set(entry.workspaceId, entry.permissions)
    );
  }

  const liveWorkspaces = await DutiesAttendanceWorkspaces.find(
    {
      deletedAt: { $exists: false },
      ...(isSuperAdmin(user)
        ? {}
        : { _id: { $in: [...permissionsByWorkspace.keys()] } }),
    },
    { fields: { _id: 1 } }
  ).fetchAsync();

  const locations = await OrgLocations.find({
    features: OrgLocationFeatureKeys.DUTIES_ATTENDANCE,
    dutiesAttendanceWorkspaceId: { $in: liveWorkspaces.map(({ _id }) => _id) },
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
      permissionsByWorkspace.get(
        location.dutiesAttendanceWorkspaceId as string
      ) ?? [DutiesAttendancePermissions.VIEW]
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
