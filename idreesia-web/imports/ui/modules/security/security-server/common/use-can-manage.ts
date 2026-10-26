import { Permissions } from 'meteor/idreesia-common/constants';
import { useLoggedInUser } from 'meteor/idreesia-common/hooks/common';

/**
 * Whether the logged-in user may create, edit and delete security server
 * profiles and channels, and review alerts. Only decides what the UI offers -
 * the server enforces the same permission on every mutation.
 */
const useCanManage = () => {
  const { user } = useLoggedInUser();
  if (!user) return false;
  if (user.username === 'erp-admin') return true;
  return (user.permissions ?? []).includes(
    Permissions.SECURITY_MANAGE_SECURITY_SERVER_DATA
  );
};

export default useCanManage;
