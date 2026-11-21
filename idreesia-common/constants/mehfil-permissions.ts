/**
 * Constants for Mehfil Permissions, a feature of a location (a mehfil): who
 * may see and manage the permissions of the mehfil's users from Workspaces.
 * The permissions are stored, prefixed with the feature key
 * (`mehfil-permissions.manage`), on the user's entry for the location (see
 * OrgLocationUsers). MANAGE implies VIEW.
 */
export const MehfilPermissionsPermissions = {
  /** See who holds which permission on the mehfil. */
  VIEW: 'view',
  /** Give users permissions on the mehfil and take them away. */
  MANAGE: 'manage',
} as const;
export type MehfilPermissionsPermission =
  (typeof MehfilPermissionsPermissions)[keyof typeof MehfilPermissionsPermissions];

export const MehfilPermissionsPermissionValues: MehfilPermissionsPermission[] =
  Object.values(MehfilPermissionsPermissions);

export const MehfilPermissionsPermissionInfos: Array<{
  key: MehfilPermissionsPermission;
  name: string;
  description: string;
}> = [
  {
    key: MehfilPermissionsPermissions.VIEW,
    name: 'View Mehfil Permissions',
    description: 'See who holds which permission on the mehfil.',
  },
  {
    key: MehfilPermissionsPermissions.MANAGE,
    name: 'Manage Mehfil Permissions',
    description:
      'Give users permissions on the mehfil and take them away, for every feature.',
  },
];
