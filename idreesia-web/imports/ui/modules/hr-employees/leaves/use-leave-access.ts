import { useLoggedInUser } from 'meteor/idreesia-common/hooks/common';
import { Permissions } from 'meteor/idreesia-common/constants';

/**
 * Which leave actions to show. The server enforces every permission; this
 * only decides which buttons appear.
 */
const useLeaveAccess = () => {
  const { user } = useLoggedInUser();
  const permissions = (user?.permissions ?? []) as string[];
  const has = (permission: string) =>
    !!user?.isSuperAdmin || permissions.includes(permission);
  return {
    canManage: has(Permissions.HR_MANAGE_LEAVES),
    canApprove: has(Permissions.HR_APPROVE_LEAVES),
  };
};

export default useLeaveAccess;
