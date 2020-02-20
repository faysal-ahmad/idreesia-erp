import { get } from 'meteor/idreesia-common/utilities/lodash';

export function mapUser(user) {
  return {
    _id: user._id,
    username: user.username,
    email: get(user, 'emails.0.address', null),
    displayName: user.displayName,
    karkunId: user.karkunId,
    locked: user.locked,
    lastLoggedInAt: user.lastLoggedInAt,
    lastActiveAt: user.lastActiveAt,
    permissions: user.permissions,
    instances: user.instances,
  };
}

export function findOneUser(userId) {
  const user = Meteor.users.findOne(userId);
  return mapUser(user);
}
