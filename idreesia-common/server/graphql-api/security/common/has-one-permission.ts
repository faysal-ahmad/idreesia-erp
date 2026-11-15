import isSuperAdmin from './is-super-admin';

interface UserWithPermissions {
  username?: string;
  locked?: boolean;
  isSuperAdmin?: boolean;
  permissions?: string[];
}

export default function hasOnePermission(
  user: UserWithPermissions | null | undefined,
  permissions: string[]
) {
  if (!user || user.locked === true) return false;
  if (isSuperAdmin(user)) return true;

  const { permissions: userPermissions } = user;
  if (!userPermissions) return false;

  let retVal = false;
  permissions.forEach((permission: string) => {
    if (userPermissions.indexOf(permission) !== -1) {
      retVal = true;
    }
  });

  return retVal;
}
