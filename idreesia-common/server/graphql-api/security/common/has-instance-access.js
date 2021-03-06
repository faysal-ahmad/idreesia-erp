export default function hasInstanceAccess(userId, instanceId) {
  const user = Meteor.users.findOne(userId);
  if (!user) return false;

  if (user.username === 'erp-admin') return true;

  const { instances: userInstances } = user;
  if (!userInstances) return false;

  if (userInstances.indexOf(instanceId) !== -1) {
    return true;
  }

  return false;
}
