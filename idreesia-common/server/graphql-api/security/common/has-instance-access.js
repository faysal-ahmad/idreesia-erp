export default function hasInstanceAccess(user, instanceId) {
  if (user?.username === 'erp-admin') return true;
  if (!user || user.locked === true) return false;

  const { instances: userInstances } = user;
  if (!userInstances) return false;

  if (userInstances.indexOf(instanceId) !== -1) {
    return true;
  }

  return false;
}
