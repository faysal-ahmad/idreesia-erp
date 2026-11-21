import {
  DutiesAttendancePermissionInfos,
  DutiesAttendancePermissions,
} from '../duties-attendance';
import {
  MehfilDetailsPermissionInfos,
  MehfilDetailsPermissions,
} from '../mehfil-details';
import {
  MehfilPermissionsPermissionInfos,
  MehfilPermissionsPermissions,
} from '../mehfil-permissions';
import { OrgLocationTypes, type OrgLocationType } from './org-location-types';

export const OrgLocationFeatureKeys = {
  DUTIES_ATTENDANCE: 'duties-attendance',
  MEHFIL_DETAILS: 'mehfil-details',
  MEHFIL_PERMISSIONS: 'mehfil-permissions',
} as const;

export type OrgLocationFeatureKey =
  (typeof OrgLocationFeatureKeys)[keyof typeof OrgLocationFeatureKeys];

/** What a user of a feature may be given, one by one, on the location. */
export interface OrgLocationFeaturePermission {
  key: string;
  name: string;
  description: string;
}

export interface OrgLocationFeature {
  key: OrgLocationFeatureKey;
  name: string;
  description: string;
  /** The permissions users of the feature can hold. */
  permissions: OrgLocationFeaturePermission[];
  /**
   * A permission every other permission of the feature implies. A user always
   * has it, and without it has none of the feature's permissions.
   */
  basePermissionKey?: string;
}

// The features every location of the types in OrgLocationFeatureAllowedTypes
// has. They are fixed at build time; add entries here to make a new feature
// available (and its permissions assignable on the location edit page).
export const OrgLocationFeatures: OrgLocationFeature[] = [
  {
    key: OrgLocationFeatureKeys.DUTIES_ATTENDANCE,
    name: 'Duties and Attendance',
    description:
      'Define duties, plan who is on each duty each day and mark their attendance.',
    permissions: DutiesAttendancePermissionInfos,
    basePermissionKey: DutiesAttendancePermissions.VIEW,
  },
  {
    key: OrgLocationFeatureKeys.MEHFIL_DETAILS,
    name: 'Mehfil Details',
    description:
      "Update the mehfil's address, timings, facilities and map location.",
    permissions: MehfilDetailsPermissionInfos,
    basePermissionKey: MehfilDetailsPermissions.VIEW,
  },
  {
    key: OrgLocationFeatureKeys.MEHFIL_PERMISSIONS,
    name: 'Mehfil Permissions',
    description:
      "See and manage who holds which permission on the mehfil, from Workspaces.",
    permissions: MehfilPermissionsPermissionInfos,
    basePermissionKey: MehfilPermissionsPermissions.VIEW,
  },
];

/**
 * Permissions that are about the location itself, not about a feature. Add
 * entries here as they are needed; they show up on the location's permissions
 * list as the "General" group.
 */
export const OrgLocationGeneralGroupKey = 'location';

export const OrgLocationGeneralPermissions: OrgLocationFeaturePermission[] = [];

export const isOrgLocationGeneralGroupKey = (value: string): boolean =>
  value === OrgLocationGeneralGroupKey;

/**
 * The stored form of a permission: the group key (a feature key or
 * `location`) and the permission key, e.g. `duties-attendance.view`. Every
 * permission of a location's users lives in one list in this form.
 */
export const toOrgLocationPermissionValue = (
  groupKey: string,
  permissionKey: string
): string => `${groupKey}.${permissionKey}`;

/** The permission keys stored for a group, without the group prefix. */
export const orgLocationGroupPermissionKeys = (
  storedPermissions: string[],
  groupKey: string
): string[] => {
  const prefix = `${groupKey}.`;
  return storedPermissions
    .filter(value => value.startsWith(prefix))
    .map(value => value.slice(prefix.length));
};

export const isOrgLocationFeatureKey = (
  value: string
): value is OrgLocationFeatureKey =>
  OrgLocationFeatures.some(feature => feature.key === value);

/** The location types the features are available on. */
export const OrgLocationFeatureAllowedTypes: OrgLocationType[] = [
  OrgLocationTypes.MEHFIL,
];
