import { DutiesAttendancePermissionInfos } from '../duties-attendance';
import { OrgLocationTypes, type OrgLocationType } from './org-location-types';

export const OrgLocationFeatureKeys = {
  DUTIES_ATTENDANCE: 'duties-attendance',
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
}

// The features that can be enabled per location. They are fixed at build
// time; add entries here to make them available on the location edit page.
// Features can only be enabled on locations of the types in
// OrgLocationFeatureAllowedTypes.
export const OrgLocationFeatures: OrgLocationFeature[] = [
  {
    key: OrgLocationFeatureKeys.DUTIES_ATTENDANCE,
    name: 'Duties and Attendance',
    description:
      'Define duties, plan who is on each duty each day and mark their attendance.',
    permissions: DutiesAttendancePermissionInfos,
  },
];

export const isOrgLocationFeatureKey = (
  value: string
): value is OrgLocationFeatureKey =>
  OrgLocationFeatures.some(feature => feature.key === value);

/** The location types a feature can be enabled on. */
export const OrgLocationFeatureAllowedTypes: OrgLocationType[] = [
  OrgLocationTypes.MEHFIL,
];
