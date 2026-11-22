import { useLoggedInUser } from 'meteor/idreesia-common/hooks/common';

/**
 * What the current user may do. The server enforces every permission; this
 * only decides which buttons to show.
 */
const usePurchasingAccess = () => {
  const { user, userLoading } = useLoggedInUser();
  const permissions = (user?.permissions ?? []) as string[];

  const can = (...needed: string[]) =>
    !!user?.isSuperAdmin || needed.some((p) => permissions.includes(p));

  return { can, userLoading };
};

export default usePurchasingAccess;
