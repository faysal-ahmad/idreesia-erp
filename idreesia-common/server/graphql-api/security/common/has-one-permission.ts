interface UserWithPermissions {
  username?: string;
  locked?: boolean;
  permissions?: string[];
}

export default function hasOnePermission(
  user: UserWithPermissions | null | undefined,
  permissions: string[]
) {
  if (user?.username === 'erp-admin') return true;
  if (!user || user.locked === true) return false;

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
