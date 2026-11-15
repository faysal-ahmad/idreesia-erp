import isSuperAdmin from './is-super-admin';

interface UserWithInstances {
  username?: string;
  locked?: boolean;
  isSuperAdmin?: boolean;
  instances?: string[];
}

export default function hasInstanceAccess(
  user: UserWithInstances | null | undefined,
  instanceId: string
) {
  if (!user || user.locked === true) return false;
  if (isSuperAdmin(user)) return true;

  const { instances: userInstances } = user;
  if (!userInstances) return false;

  if (userInstances.indexOf(instanceId) !== -1) {
    return true;
  }

  return false;
}
