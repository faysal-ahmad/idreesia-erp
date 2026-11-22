/**
 * Constants for Mehfil Karkuns, a feature of a location (a mehfil). The
 * permission is stored, prefixed with the feature key (`mehfil-karkuns.view`),
 * on the user's entry for the location (see OrgLocationUsers).
 */
export const MehfilKarkunsPermissions = {
  /** See the karkuns of the mehfil. */
  VIEW: 'view',
} as const;
export type MehfilKarkunsPermission =
  (typeof MehfilKarkunsPermissions)[keyof typeof MehfilKarkunsPermissions];

export const MehfilKarkunsPermissionValues: MehfilKarkunsPermission[] =
  Object.values(MehfilKarkunsPermissions);

export const MehfilKarkunsPermissionInfos: Array<{
  key: MehfilKarkunsPermission;
  name: string;
  description: string;
}> = [
  {
    key: MehfilKarkunsPermissions.VIEW,
    name: 'View Mehfil Karkuns',
    description: 'See the list of karkuns who belong to the mehfil.',
  },
];
