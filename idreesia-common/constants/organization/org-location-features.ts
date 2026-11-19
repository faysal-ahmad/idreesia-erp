import { OrgLocationTypes, type OrgLocationType } from './org-location-types';

export const OrgLocationFeatureKeys = {
  DUTIES_ATTENDANCE: 'duties-attendance',
} as const;

export type OrgLocationFeatureKey =
  (typeof OrgLocationFeatureKeys)[keyof typeof OrgLocationFeatureKeys];

export interface OrgLocationFeature {
  key: OrgLocationFeatureKey;
  name: string;
  description: string;
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
