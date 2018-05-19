import { findIndex, forEach } from 'lodash';

export default function hasOnePermission(userId, permissions) {
  const user = Meteor.users.findOne(userId);
  if (!user) return false;

  const { permissions: userPermissions } = user;
  if (!userPermissions) return false;

  let retVal = false;
  permissions.forEach(permission => {
    if (findIndex(userPermissions, permission) !== -1) {
      retVal = true;
      return false;
    }
  });

  return retVal;
}
