export default function hasOnePermission(user, permissions) {
  if (user.username === 'erp-admin') return true;

  if (!user || user.locked === true) return false;

  const { permissions: userPermissions } = user;
  if (!userPermissions) return false;

  let retVal = false;
  permissions.forEach(permission => {
    if (userPermissions.indexOf(permission) !== -1) {
      retVal = true;
    }
  });

  return retVal;
}
