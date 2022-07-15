export default function filterByInstanceAccess(user, instanceObjects) {
  if (!user || user.locked) return [];
  if (user.username === 'erp-admin') return instanceObjects;

  const { instances: userInstances } = user;
  if (!userInstances) return [];

  const retVal = [];
  instanceObjects.forEach(instanceObject => {
    if (userInstances.indexOf(instanceObject._id) !== -1) {
      retVal.push(instanceObject);
    }
  });

  return retVal;
}
