import { findIndex } from 'lodash';

export default function hasAllPermission(userId, permissions) {
  const user = Meteor.users.findOne(userId);
  if (!user) return false;

  if (user.username === 'erp-admin') return true;

  const { permissions: userPermissions } = user;
  if (!userPermissions) return false;

  let retVal = true;
  permissions.forEach(permission => {
    if (findIndex(userPermissions, permission) === -1) {
      retVal = false;
      return false;
    }
    return true;
  });

  return retVal;
}
