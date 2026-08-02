interface UserWithInstances {
  username?: string;
  locked?: boolean;
  instances?: string[];
}

interface InstanceObject {
  _id: string;
  [key: string]: unknown;
}

export default function filterByInstanceAccess<TInstance extends InstanceObject>(
  user: UserWithInstances | null | undefined,
  instanceObjects: TInstance[]
) {
  if (user?.username === 'erp-admin') return instanceObjects;
  if (!user || user.locked) return [];

  const { instances: userInstances } = user;
  if (!userInstances) return [];

  const retVal: TInstance[] = [];
  instanceObjects.forEach(instanceObject => {
    if (userInstances.indexOf(instanceObject._id) !== -1) {
      retVal.push(instanceObject);
    }
  });

  return retVal;
}
