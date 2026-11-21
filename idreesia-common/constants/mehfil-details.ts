/**
 * Constants for Mehfil Details, a feature of a location (a mehfil). The
 * permissions are stored, prefixed with the feature key
 * (`mehfil-details.update`), on the user's entry for the location (see
 * OrgLocationUsers). UPDATE implies VIEW.
 */
export const MehfilDetailsPermissions = {
  /** See the mehfil's details. Every other permission includes it. */
  VIEW: 'view',
  /** Change the mehfil's details (address, timings, map pin and so on). */
  UPDATE: 'update',
} as const;
export type MehfilDetailsPermission =
  (typeof MehfilDetailsPermissions)[keyof typeof MehfilDetailsPermissions];

export const MehfilDetailsPermissionValues: MehfilDetailsPermission[] =
  Object.values(MehfilDetailsPermissions);

export const MehfilDetailsPermissionInfos: Array<{
  key: MehfilDetailsPermission;
  name: string;
  description: string;
}> = [
  {
    key: MehfilDetailsPermissions.VIEW,
    name: 'View Mehfil Details',
    description: "See the mehfil's address, timings, facilities and map location.",
  },
  {
    key: MehfilDetailsPermissions.UPDATE,
    name: 'Update Mehfil Details',
    description:
      "Change the mehfil's address, timings, facilities and map location.",
  },
];
