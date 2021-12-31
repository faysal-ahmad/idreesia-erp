export default function hasOnePermission(user, permissions) {
  if (!user || user.locked) return false;

  if (user.username === 'erp-admin') return true;

  const { permissions: userPermissions } = user;
  if (!userPermissions) return false;

  let retVal = false;
  permissions.forEach(permission => {
    if (userPermissions.indexOf(permission) !== -1) {
      retVal = true;
      return false;
    }
    return true;
  });

  return retVal;
}
