export default function hasInstanceAccess(user, instanceId) {
  if (!user || user.locked) return false;

  if (user.username === 'erp-admin') return true;

  const { instances: userInstances } = user;
  if (!userInstances) return false;

  if (userInstances.indexOf(instanceId) !== -1) {
    return true;
  }

  return false;
}
